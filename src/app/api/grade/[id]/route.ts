import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// Settlement constants (test-mode tunables)
const SELLER_TAKE = 0.8     // seller gets 80% of pick price on win
const PLATFORM_TAKE = 0.2   // platform keeps 20%

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: pickId } = await context.params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { result, actualOutcome } = await request.json()
    if (!['won', 'lost', 'void'].includes(result)) {
      return NextResponse.json({ error: 'Invalid result' }, { status: 400 })
    }

    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Authorize: pick owner or admin
    const { data: pick } = await service
      .from('picks')
      .select('*')
      .eq('id', pickId)
      .single()
    if (!pick) return NextResponse.json({ error: 'Pick not found' }, { status: 404 })

    const { data: profile } = await service
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (pick.seller_id !== user.id && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (pick.status === 'graded' || pick.status === 'void') {
      return NextResponse.json({ error: 'Pick already settled' }, { status: 409 })
    }

    // Mark graded
    await service.from('picks').update({
      status: result === 'void' ? 'void' : 'graded',
      result,
      actual_outcome: actualOutcome,
      graded_at: new Date().toISOString(),
    }).eq('id', pickId)

    // Get all pending purchases for this pick
    const { data: purchases } = await service
      .from('purchases')
      .select('*')
      .eq('pick_id', pickId)
      .eq('status', 'pending')

    if (!purchases?.length) {
      return NextResponse.json({ success: true, settled: 0 })
    }

    let refundsIssued = 0
    let refundTotal = 0
    let sellerEarnings = 0
    let platformTake = 0

    for (const p of purchases) {
      const price = Number(p.amount_paid)
      const premium = Number(p.insurance_premium ?? 0)
      const insured = p.insured

      if (result === 'won') {
        // Seller paid, platform take, escrow drained, premium kept
        const sellerCut = Math.round(price * SELLER_TAKE * 100) / 100
        const platformCut = price - sellerCut

        await service.rpc('move_pool', { p_pool: 'escrow', p_delta: -price })
        await service.rpc('move_balance', {
          p_user_id: pick.seller_id,
          p_field: 'available_balance',
          p_delta: sellerCut,
        })
        await service.rpc('move_pool', { p_pool: 'platform_take', p_delta: platformCut })

        await service.from('purchases')
          .update({ status: 'won', settled_at: new Date().toISOString() })
          .eq('id', p.id)

        await service.from('ledger_entries').insert([
          {
            user_id: pick.seller_id,
            type: 'seller_payout',
            amount: sellerCut,
            related_pick_id: pickId,
            related_purchase_id: p.id,
            note: `Pick won: ${pick.tag}`,
          },
          {
            user_id: null,
            type: 'platform_take',
            amount: platformCut,
            pool: 'platform_take',
            related_pick_id: pickId,
            related_purchase_id: p.id,
          },
        ])

        sellerEarnings += sellerCut
        platformTake += platformCut
      }

      else if (result === 'lost') {
        if (insured) {
          // Refund buyer the pick price; insurance pool keeps premium
          await service.rpc('move_pool', { p_pool: 'escrow', p_delta: -price })
          await service.rpc('move_balance', {
            p_user_id: p.buyer_id,
            p_field: 'available_balance',
            p_delta: price,
          })

          await service.from('purchases').update({
            status: 'refunded',
            refund_amount: price,
            settled_at: new Date().toISOString(),
          }).eq('id', p.id)

          await service.from('ledger_entries').insert([
            {
              user_id: p.buyer_id,
              type: 'pick_refund',
              amount: price,
              related_pick_id: pickId,
              related_purchase_id: p.id,
              note: `Insured loss refund: ${pick.tag}`,
            },
            {
              user_id: null,
              type: 'insurance_payout',
              amount: -price,
              pool: 'insurance',
              related_pick_id: pickId,
              related_purchase_id: p.id,
            },
          ])

          refundsIssued++
          refundTotal += price
        } else {
          // Uninsured loss: seller gets paid, buyer gets nothing
          const sellerCut = Math.round(price * SELLER_TAKE * 100) / 100
          const platformCut = price - sellerCut

          await service.rpc('move_pool', { p_pool: 'escrow', p_delta: -price })
          await service.rpc('move_balance', {
            p_user_id: pick.seller_id,
            p_field: 'available_balance',
            p_delta: sellerCut,
          })
          await service.rpc('move_pool', { p_pool: 'platform_take', p_delta: platformCut })

          await service.from('purchases').update({
            status: 'lost',
            settled_at: new Date().toISOString(),
          }).eq('id', p.id)

          await service.from('ledger_entries').insert([{
            user_id: pick.seller_id,
            type: 'seller_payout',
            amount: sellerCut,
            related_pick_id: pickId,
            related_purchase_id: p.id,
            note: `Uninsured pick paid: ${pick.tag}`,
          }])

          sellerEarnings += sellerCut
          platformTake += platformCut
        }
      }

      else if (result === 'void') {
        // Full refund: pick price + premium back to buyer
        const refund = price + premium
        await service.rpc('move_pool', { p_pool: 'escrow', p_delta: -price })
        if (premium > 0) {
          await service.rpc('move_pool', { p_pool: 'insurance', p_delta: -premium })
        }
        await service.rpc('move_balance', {
          p_user_id: p.buyer_id,
          p_field: 'available_balance',
          p_delta: refund,
        })

        await service.from('purchases').update({
          status: 'void',
          refund_amount: refund,
          settled_at: new Date().toISOString(),
        }).eq('id', p.id)

        await service.from('ledger_entries').insert([{
          user_id: p.buyer_id,
          type: 'pick_refund',
          amount: refund,
          related_pick_id: pickId,
          related_purchase_id: p.id,
          note: `Voided pick: ${pick.tag}`,
        }])

        refundsIssued++
        refundTotal += refund
      }
    }

    return NextResponse.json({
      success: true,
      result,
      settled: purchases.length,
      refundsIssued,
      refundTotal,
      sellerEarnings,
      platformTake,
    })
  } catch (err) {
    console.error('Grade error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
