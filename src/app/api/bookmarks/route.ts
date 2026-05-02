import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('bookmarks')
      .select(`pick:picks(*)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ bookmarks: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { pickId } = await request.json()

    // Check if bookmark exists
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('pick_id')
      .eq('user_id', user.id)
      .eq('pick_id', pickId)
      .single()

    if (existing) {
      // Remove bookmark
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('pick_id', pickId)
      return NextResponse.json({ bookmarked: false })
    } else {
      // Add bookmark
      await supabase.from('bookmarks').insert({ user_id: user.id, pick_id: pickId })
      return NextResponse.json({ bookmarked: true })
    }
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
