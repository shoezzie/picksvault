import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SEED_PICKS } from '@/lib/seed-data'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: pick, error } = await supabase
      .from('picks')
      .select(`*, seller:profiles(id, username, avatar_letter, seller_profiles(hit_rate, roi, verified, badge, stake_balance))`)
      .eq('id', id)
      .single()

    if (error || !pick) {
      const seedPick = SEED_PICKS.find(p => p.id === parseInt(id))
      if (!seedPick) return NextResponse.json({ error: 'Pick not found' }, { status: 404 })
      return NextResponse.json({ pick: seedPick, purchased: false, source: 'seed' })
    }

    let purchased = false
    if (user) {
      const { data: purchase } = await supabase
        .from('purchases')
        .select('id, status')
        .eq('pick_id', id)
        .eq('buyer_id', user.id)
        .single()
      purchased = !!purchase
    }

    const responseData = purchased ? pick : {
      ...pick,
      reasoning: null,
      best_book: null,
      actual_outcome: null,
    }

    return NextResponse.json({ pick: responseData, purchased })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { status, result, actualOutcome } = body

    const { data: pick } = await supabase
      .from('picks')
      .select('seller_id')
      .eq('id', id)
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

    const { data, error } = await supabase
      .from('picks')
      .update({
        status,
        result,
        actual_outcome: actualOutcome,
        graded_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ pick: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
