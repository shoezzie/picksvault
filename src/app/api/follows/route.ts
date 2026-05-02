import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { followingId } = await request.json()

    if (followingId === user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .single()

    if (existing) {
      // Unfollow
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', followingId)
      // Decrement followers count
      await supabase.rpc('decrement_followers', { seller_id: followingId })
      return NextResponse.json({ following: false })
    } else {
      // Follow
      await supabase.from('follows').insert({ follower_id: user.id, following_id: followingId })
      // Increment followers count
      await supabase.rpc('increment_followers', { seller_id: followingId })
      return NextResponse.json({ following: true })
    }
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
