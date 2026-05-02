/**
 * Seed script for PicksVault
 * Run with: npm run db:seed
 *
 * This script seeds the Supabase database with demo picks and sellers.
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be set.
 */

import { createClient } from '@supabase/supabase-js'
import { SEED_PICKS, SEED_SELLERS } from './seed-data'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function seed() {
  console.log('🌱 Starting seed...')

  // Create demo seller users via auth admin API
  for (const seller of SEED_SELLERS) {
    const email = `${seller.handle.replace('@', '')}@demo.picksvault.com`
    const username = seller.handle.replace('@', '')

    console.log(`Creating seller: ${seller.handle}`)

    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: 'Demo1234!',
      email_confirm: true,
      user_metadata: { username },
    })

    if (authError && !authError.message.includes('already registered')) {
      console.error(`Auth error for ${seller.handle}:`, authError.message)
      continue
    }

    const userId = authUser?.user?.id
    if (!userId) {
      // User might already exist, try to find them
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => u.email === email)
      if (!existingUser) {
        console.warn(`Could not find/create user for ${seller.handle}`)
        continue
      }
    }

    const uid = authUser?.user?.id ?? (await (async () => {
      const { data } = await supabase.auth.admin.listUsers()
      return data?.users?.find(u => u.email === email)?.id
    })())

    if (!uid) continue

    // Upsert profile
    await supabase.from('profiles').upsert({
      id: uid,
      username,
      role: 'seller',
      avatar_letter: seller.avatar,
    }, { onConflict: 'id' })

    // Upsert seller profile
    await supabase.from('seller_profiles').upsert({
      id: uid,
      stake_balance: seller.stakeBalance,
      hit_rate: parseFloat(seller.hit),
      roi: parseFloat(seller.roi.replace('+', '')),
      total_picks: seller.picks,
      verified: seller.verified,
      badge: seller.badge,
      followers_count: seller.followers ?? 0,
    }, { onConflict: 'id' })

    // Insert picks for this seller
    const sellerPicks = SEED_PICKS.filter(p => p.seller === seller.handle)
    for (const pick of sellerPicks) {
      const lockTime = new Date(Date.now() + pick.lockMins * 60 * 1000)

      await supabase.from('picks').upsert({
        seller_id: uid,
        sport: pick.sport,
        sport_key: pick.sportKey,
        tag: pick.tag,
        game: pick.game,
        lock_time: lockTime.toISOString(),
        price: pick.price,
        stake: pick.stake,
        tier: pick.tier,
        description: pick.description,
        reasoning: pick.reasoning,
        odds_range: pick.oddsRange,
        signals: pick.signals,
        confidence: pick.confidence,
        buyers_count: pick.buyers,
        status: 'active',
      })
    }
  }

  console.log('✅ Seed complete!')
}

seed().catch(console.error)
