import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// Test-mode deposit: just credits the user's balance.
// Production: this would integrate with Stripe / BaaS partner.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { amount } = await request.json()
    const dollars = Number(amount)
    if (!dollars || dollars <= 0 || dollars > 1000) {
      return NextResponse.json({ error: 'Amount must be between $1 and $1000' }, { status: 400 })
    }

    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const newBalance = await service.rpc('move_balance', {
      p_user_id: user.id,
      p_field: 'available_balance',
      p_delta: dollars,
    })

    await service.from('ledger_entries').insert({
      user_id: user.id,
      type: 'deposit',
      amount: dollars,
      balance_after: newBalance.data,
      note: 'Test-mode deposit',
    })

    return NextResponse.json({
      success: true,
      balance: newBalance.data,
      deposited: dollars,
    })
  } catch (err) {
    console.error('Deposit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
