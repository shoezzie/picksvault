import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2026-04-22.dahlia',
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { pickId } = await request.json()

    // Get pick details
    const { data: pick, error: pickError } = await supabase
      .from('picks')
      .select('*')
      .eq('id', pickId)
      .eq('status', 'active')
      .single()

    if (pickError || !pick) {
      return NextResponse.json({ error: 'Pick not found or no longer active' }, { status: 404 })
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('pick_id', pickId)
      .eq('buyer_id', user.id)
      .single()

    if (existingPurchase) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 409 })
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, username')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id
    if (!customerId && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabaseUserId: user.id, username: profile?.username ?? '' },
      })
      customerId = customer.id
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      // Demo mode — skip Stripe
      const { data: purchase } = await supabase
        .from('purchases')
        .insert({
          pick_id: pickId,
          buyer_id: user.id,
          amount_paid: pick.price,
          status: 'pending',
          stripe_payment_intent_id: `demo_${Date.now()}`,
        })
        .select()
        .single()

      return NextResponse.json({
        checkoutUrl: `${appUrl}/picks/${pickId}?purchased=true`,
        demo: true,
        purchase,
      })
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${pick.sport} Pick by ${pick.seller_id}`,
              description: `${pick.tag} — ${pick.game}`,
            },
            unit_amount: Math.round(pick.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/picks/${pickId}?purchased=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/picks/${pickId}`,
      metadata: {
        pickId,
        buyerId: user.id,
      },
    })

    // Create pending purchase record
    await supabase.from('purchases').insert({
      pick_id: pickId,
      buyer_id: user.id,
      amount_paid: pick.price,
      status: 'pending',
      stripe_payment_intent_id: session.payment_intent as string,
    })

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (err) {
    console.error('Purchase error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
