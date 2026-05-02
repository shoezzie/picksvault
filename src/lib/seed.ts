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

    // Upsert profile (with seed earnings on the new balance system)
    await supabase.from('profiles').upsert({
      id: uid,
      username,
      role: 'seller',
      avatar_letter: seller.avatar,
      available_balance: seller.stakeBalance ?? 0,
    }, { onConflict: 'id' })

    // Upsert seller profile (no longer using stake_balance)
    await supabase.from('seller_profiles').upsert({
      id: uid,
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
        stake: 0, // legacy column — required not-null until next migration
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

  // ─── Demo buyer account ─────────────────────────────────────
  console.log('Creating demo buyer: buyer@demo.picksvault.com')
  const buyerEmail = 'buyer@demo.picksvault.com'
  const { data: buyerAuth, error: buyerErr } = await supabase.auth.admin.createUser({
    email: buyerEmail,
    password: 'Demo1234!',
    email_confirm: true,
    user_metadata: { username: 'demobuyer' },
  })
  if (buyerErr && !buyerErr.message.includes('already registered')) {
    console.error('Buyer auth error:', buyerErr.message)
  }
  let buyerId = buyerAuth?.user?.id
  if (!buyerId) {
    const { data: list } = await supabase.auth.admin.listUsers()
    buyerId = list?.users?.find(u => u.email === buyerEmail)?.id
  }
  if (buyerId) {
    await supabase.from('profiles').upsert({
      id: buyerId,
      username: 'demobuyer',
      role: 'buyer',
      avatar_letter: 'D',
      available_balance: 100,
    }, { onConflict: 'id' })

    // Seed a starting deposit ledger entry so /transactions has content
    const { data: existingLedger } = await supabase.from('ledger_entries')
      .select('id').eq('user_id', buyerId).eq('type', 'deposit').limit(1)
    if (!existingLedger?.length) {
      await supabase.from('ledger_entries').insert({
        user_id: buyerId,
        type: 'deposit',
        amount: 100,
        balance_after: 100,
        note: 'Welcome deposit (demo account)',
      })
    }
    console.log('  -> demo buyer ready ($100 balance)')
  }

  console.log('✅ Seed complete!')
  console.log('')
  console.log('  Demo buyer login:  buyer@demo.picksvault.com / Demo1234!')
  console.log('  Demo seller login: firstpitch@demo.picksvault.com / Demo1234!')
}

seed().catch(console.error)
