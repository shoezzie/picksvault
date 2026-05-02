import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('available_balance, pending_balance')
    .eq('id', user.id)
    .single()

  return NextResponse.json({
    available: Number(profile?.available_balance ?? 0),
    pending: Number(profile?.pending_balance ?? 0),
  })
}
