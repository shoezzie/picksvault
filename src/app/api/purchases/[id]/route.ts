import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: purchase, error } = await supabase
      .from('purchases')
      .select(`*, pick:picks(sport, tag, game, description)`)
      .eq('id', id)
      .eq('buyer_id', user.id)
      .single()

    if (error || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    return NextResponse.json({ purchase })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
