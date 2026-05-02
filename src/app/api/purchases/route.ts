import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// Insurance pricing rule (test mode):
//   premium = max($1, 50% of pick price)
function calcInsurancePremium(price: number) {
  return Math.max(1, Math.round(price * 0.5 * 100) / 100)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { pickId, insured = false } = await request.json()

    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Get pick
    const { data: pick, error: pickError } = await service
      .from('picks')
      .select('*')
      .eq('id', pickId)
      .eq('status', 'active')
      .single()
    if (pickError || !pick) {
      return NextResponse.json({ error: 'Pick not found or no longer active' }, { status: 404 })
    }

    // Already purchased?
    const { data: existing } = await service
      .from('purchases')
      .select('id')
      .eq('pick_id', pickId)
      .eq('buyer_id', user.id)
      .maybeSingle()
    if (existing) return NextResponse.json({ error: 'Already purchased' }, { status: 409 })

    // Get buyer balance
    const { data: profile } = await service
      .from('profiles')
      .select('available_balance')
      .eq('id', user.id)
      .single()
    const buyerBalance = Number(profile?.available_balance ?? 0)

    const price = Number(pick.price)
    const premium = insured ? calcInsurancePremium(price) : 0
    const total = price + premium

    if (buyerBalance < total) {
      return NextResponse.json({
        error: 'Insufficient balance',
        balance: buyerBalance,
        required: total,
      }, { status: 402 })
    }

    // 1. Deduct buyer balance (price + premium)
    await service.rpc('move_balance', {
      p_user_id: user.id,
      p_field: 'available_balance',
      p_delta: -total,
    })

    // 2. Move price to escrow pool
    await service.rpc('move_pool', { p_pool: 'escrow', p_delta: price })

    // 3. Move premium to insurance pool (if insured)
    if (premium > 0) {
      await service.rpc('move_pool', { p_pool: 'insurance', p_delta: premium })
    }

    // 4. Create purchase record
    const { data: purchase, error: purchaseError } = await service
      .from('purchases')
      .insert({
        pick_id: pickId,
        buyer_id: user.id,
        amount_paid: price,
        insured,
        insurance_premium: premium,
        status: 'pending',
        stripe_payment_intent_id: `bal_${Date.now()}`,
      })
      .select()
      .single()
    if (purchaseError) throw purchaseError

    // 5. Bump buyers_count on the pick
    await service.from('picks')
      .update({ buyers_count: (pick.buyers_count ?? 0) + 1 })
      .eq('id', pickId)

    // 6. Ledger entries
    const ledgerEntries = [
      {
        user_id: user.id,
        type: 'pick_purchase',
        amount: -price,
        related_pick_id: pickId,
        related_purchase_id: purchase.id,
        note: `Bought pick: ${pick.tag}`,
      },
    ]
    if (premium > 0) {
      ledgerEntries.push({
        user_id: user.id,
        type: 'insurance_premium',
        amount: -premium,
        related_pick_id: pickId,
        related_purchase_id: purchase.id,
        note: `Pick Protection: ${pick.tag}`,
      })
    }
    await service.from('ledger_entries').insert(ledgerEntries)

    // Updated buyer balance
    const newBalance = buyerBalance - total

    return NextResponse.json({
      success: true,
      purchase,
      balance: newBalance,
      checkoutUrl: `/picks/${pickId}?purchased=true`,
    })
  } catch (err) {
    console.error('Purchase error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
