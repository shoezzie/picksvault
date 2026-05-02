import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia',
})

// Use service role client for webhook handler (no auth context)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const { pickId, buyerId } = session.metadata ?? {}

      if (pickId && buyerId) {
        await supabase
          .from('purchases')
          .update({ status: 'pending' })
          .eq('pick_id', pickId)
          .eq('buyer_id', buyerId)

        // Increment buyer count on pick
        const { data: pick } = await supabase
          .from('picks')
          .select('buyers_count')
          .eq('id', pickId)
          .single()

        if (pick) {
          await supabase
            .from('picks')
            .update({ buyers_count: (pick.buyers_count ?? 0) + 1 })
            .eq('id', pickId)
        }
      }
      break
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await supabase
        .from('purchases')
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq('stripe_payment_intent_id', paymentIntent.id)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
