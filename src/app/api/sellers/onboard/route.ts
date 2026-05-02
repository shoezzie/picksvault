import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-04-22.dahlia',
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      return NextResponse.json({
        onboardingUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard`,
        demo: true,
        message: 'Configure STRIPE_SECRET_KEY to enable real Stripe Connect onboarding',
      })
    }

    // Check if seller already has a Stripe account
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single()

    let accountId = profile?.stripe_account_id

    if (!accountId) {
      // Create Express account
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: { supabaseUserId: user.id },
      })
      accountId = account.id

      // Save account ID
      await supabase.from('profiles').update({ stripe_account_id: accountId }).eq('id', user.id)

      // Create seller_profile if not exists
      await supabase.from('seller_profiles').upsert({ id: user.id }, { onConflict: 'id' })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/dashboard?onboard=refresh`,
      return_url: `${appUrl}/dashboard?onboard=complete`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ onboardingUrl: accountLink.url })
  } catch (err) {
    console.error('Seller onboard error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
