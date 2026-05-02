import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia',
})

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: pickId } = await context.params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { result, actualOutcome } = await request.json()

    if (!['won', 'lost', 'void'].includes(result)) {
      return NextResponse.json({ error: 'Invalid result. Must be won, lost, or void' }, { status: 400 })
    }

    // Verify user owns this pick or is admin
    const { data: pick } = await supabase
      .from('picks')
      .select('*, seller:profiles!picks_seller_id_fkey(id, role)')
      .eq('id', pickId)
      .single()

    if (!pick) return NextResponse.json({ error: 'Pick not found' }, { status: 404 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (pick.seller_id !== user.id && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use service client for bulk updates
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Update pick status
    await serviceClient.from('picks').update({
      status: 'graded',
      result,
      actual_outcome: actualOutcome,
      graded_at: new Date().toISOString(),
    }).eq('id', pickId)

    const refunds: string[] = []
    let refundTotal = 0

    if (result === 'lost' || result === 'void') {
      // Get all pending purchases for this pick
      const { data: purchases } = await serviceClient
        .from('purchases')
        .select('*')
        .eq('pick_id', pickId)
        .eq('status', 'pending')

      if (purchases && purchases.length > 0) {
        for (const purchase of purchases) {
          const refundAmountCents = result === 'void'
            ? Math.round(purchase.amount_paid * 100)
            : Math.round(purchase.amount_paid * 0.95 * 100)

          const refundAmount = refundAmountCents / 100

          let stripeRefundId: string | undefined
          if (
            purchase.stripe_payment_intent_id &&
            !purchase.stripe_payment_intent_id.startsWith('demo_') &&
            process.env.STRIPE_SECRET_KEY &&
            !process.env.STRIPE_SECRET_KEY.includes('placeholder')
          ) {
            try {
              const stripeRefund = await stripe.refunds.create({
                payment_intent: purchase.stripe_payment_intent_id,
                amount: refundAmountCents,
              })
              stripeRefundId = stripeRefund.id
            } catch (stripeErr) {
              console.error('Stripe refund error for purchase', purchase.id, stripeErr)
            }
          }

          await serviceClient.from('purchases').update({
            status: result === 'void' ? 'void' : 'refunded',
            refund_amount: refundAmount,
            stripe_refund_id: stripeRefundId,
            settled_at: new Date().toISOString(),
          }).eq('id', purchase.id)

          refunds.push(purchase.id)
          refundTotal += refundAmount
        }
      }
    } else if (result === 'won') {
      await serviceClient.from('purchases')
        .update({ status: 'won', settled_at: new Date().toISOString() })
        .eq('pick_id', pickId)
        .eq('status', 'pending')
    }

    return NextResponse.json({
      success: true,
      result,
      pickId,
      refundsProcessed: refunds.length,
      refundTotal,
    })
  } catch (err) {
    console.error('Grade error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
