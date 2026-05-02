import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// Test-mode withdrawal: just debits the user's balance.
// Production: this would initiate a Stripe payout / ACH to user's bank.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { amount } = await request.json()
    const dollars = Number(amount)
    if (!dollars || dollars <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: profile } = await service
      .from('profiles')
      .select('available_balance')
      .eq('id', user.id)
      .single()

    const balance = Number(profile?.available_balance ?? 0)
    if (balance < dollars) {
      return NextResponse.json({
        error: 'Insufficient balance',
        balance,
      }, { status: 402 })
    }

    const result = await service.rpc('move_balance', {
      p_user_id: user.id,
      p_field: 'available_balance',
      p_delta: -dollars,
    })

    await service.from('ledger_entries').insert({
      user_id: user.id,
      type: 'withdrawal',
      amount: -dollars,
      balance_after: result.data,
      note: 'Test-mode withdrawal',
    })

    return NextResponse.json({
      success: true,
      balance: result.data,
      withdrawn: dollars,
    })
  } catch (err) {
    console.error('Withdraw error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
