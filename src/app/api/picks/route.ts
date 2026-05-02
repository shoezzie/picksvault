import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SEED_PICKS } from '@/lib/seed-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport')
  const tier = searchParams.get('tier')
  const seller = searchParams.get('seller')

  try {
    const supabase = await createClient()
    let query = supabase
      .from('picks')
      .select(`*, seller:profiles(username, avatar_letter, role, seller_profiles(hit_rate, roi, verified, badge))`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (sport) query = query.eq('sport_key', sport)
    if (tier) query = query.eq('tier', tier)
    if (seller) query = query.eq('seller_id', seller)

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      // Fall back to seed data
      let picks = SEED_PICKS
      if (sport) picks = picks.filter(p => p.sportKey === sport)
      if (tier) picks = picks.filter(p => p.tier === tier)
      return NextResponse.json({ picks, source: 'seed' })
    }

    return NextResponse.json({ picks: data, source: 'db' })
  } catch {
    return NextResponse.json({ picks: SEED_PICKS, source: 'seed' })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sport, sportKey, tag, game, lockTime, price, stake, tier, description, reasoning, oddsRange, signals, confidence } = body

    if (!sport || !tag || !game || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('picks')
      .insert({
        seller_id: user.id,
        sport,
        sport_key: sportKey ?? sport.toLowerCase(),
        tag,
        game,
        lock_time: lockTime ?? new Date(Date.now() + 3600000).toISOString(),
        price: parseFloat(price),
        stake: parseFloat(stake ?? '0'),
        tier: tier ?? 'insured',
        description,
        reasoning,
        odds_range: oddsRange,
        signals: signals ?? [],
        confidence: confidence ?? 1,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ pick: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
