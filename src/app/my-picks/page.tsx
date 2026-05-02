'use client'

import { useEffect, useState } from 'react'
import { DollarSign, RotateCcw, TrendingUp, BarChart2, Shield } from 'lucide-react'
import ResultCard from '@/components/ResultCard'
import AuthGuard from '@/components/AuthGuard'
import type { PurchaseResult } from '@/components/ResultCard'
import { createClient } from '@/lib/supabase/client'

const TABS = ['All', 'Pending', 'Won', 'Lost + Refunded']

interface PurchaseRow {
  id: string
  amount_paid: number
  insured: boolean
  insurance_premium: number
  status: 'pending' | 'won' | 'lost' | 'refunded' | 'void'
  refund_amount: number | null
  settled_at: string | null
  created_at: string
  pick: {
    id: string
    sport: string
    sport_key: string
    tag: string
    game: string
    description: string | null
    odds_range: string | null
    lock_time: string
    seller: { username: string; seller_profiles: { verified: boolean }[] | { verified: boolean } | null } | null
  } | null
}

function rowToResult(row: PurchaseRow): PurchaseResult | null {
  if (!row.pick) return null
  const sellerObj = Array.isArray(row.pick.seller?.seller_profiles)
    ? row.pick.seller.seller_profiles[0]
    : row.pick.seller?.seller_profiles ?? null
  const verified = !!sellerObj?.verified
  const odds = row.pick.odds_range?.split('/')[0]?.trim() ?? '—'
  const lockMs = new Date(row.pick.lock_time).getTime() - Date.now()
  const time = lockMs > 0
    ? `${Math.floor(lockMs / 3600000)}h ${Math.floor((lockMs % 3600000) / 60000)}m`
    : (row.settled_at ? new Date(row.settled_at).toLocaleDateString() : 'Locked')

  const base: PurchaseResult = {
    id: row.id,
    pick: row.pick.description?.split(' ').slice(0, 2).join(' ') ?? row.pick.tag,
    line: row.pick.description ?? row.pick.tag,
    sportKey: row.pick.sport_key,
    sport: row.pick.sport,
    seller: '@' + (row.pick.seller?.username ?? 'unknown'),
    verified,
    game: row.pick.game,
    time,
    paid: Number(row.amount_paid) + Number(row.insurance_premium ?? 0),
    status: row.status,
    book: 'DraftKings',
    odds,
  }
  if (row.status === 'won') {
    base.result = 'HIT'
    base.payout = `+$${(Number(row.amount_paid) * 0.8).toFixed(2)}`
  }
  if (row.status === 'lost') {
    base.result = 'MISS'
  }
  if (row.status === 'refunded' || row.status === 'void') {
    base.refund = `$${Number(row.refund_amount ?? 0).toFixed(2)}`
    base.result = row.status === 'void' ? 'VOID' : 'REFUNDED'
  }
  return base
}

export default function MyPicksPage() {
  const [tab, setTab] = useState('All')
  const [purchases, setPurchases] = useState<PurchaseRow[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('purchases')
        .select(`
          id, amount_paid, insured, insurance_premium, status, refund_amount, settled_at, created_at,
          pick:picks(id, sport, sport_key, tag, game, description, odds_range, lock_time,
            seller:profiles(username, seller_profiles(verified))
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      setPurchases((data ?? []) as unknown as PurchaseRow[])
      setLoading(false)
    }
    load()
  }, [])

  const results = purchases.map(rowToResult).filter(Boolean) as PurchaseResult[]
  const filtered = results.filter(p => {
    if (tab === 'Pending') return p.status === 'pending'
    if (tab === 'Won') return p.status === 'won'
    if (tab === 'Lost + Refunded') return ['lost', 'refunded', 'void'].includes(p.status)
    return true
  })

  const totalSpent = results.reduce((s, p) => s + p.paid, 0)
  const refunded = purchases
    .filter(p => p.status === 'refunded' || p.status === 'void')
    .reduce((s, p) => s + Number(p.refund_amount ?? 0), 0)
  const insuredCount = purchases.filter(p => p.insured).length
  const won = results.filter(p => p.status === 'won').length
  const settledCount = results.filter(p => p.status !== 'pending').length

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="section-hero mb-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--accent)' }}>My Activity</div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>My Picks</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Every pick you&apos;ve bought, with refunds processed automatically.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total spent', value: `$${totalSpent.toFixed(2)}`, icon: DollarSign, accent: '#22c55e' },
            { label: 'Auto-refunded', value: `$${refunded.toFixed(2)}`, icon: RotateCcw, accent: '#3b82f6' },
            { label: 'Pick Protection', value: `${insuredCount} of ${purchases.length}`, icon: Shield, accent: '#f59e0b' },
            { label: 'Hit rate', value: settledCount > 0 ? `${Math.round((won / settledCount) * 100)}%` : '—', icon: TrendingUp, accent: '#a855f7' },
          ].map(tile => (
            <div key={tile.label} className="stat-tile" style={{ '--tile-accent': tile.accent } as React.CSSProperties}>
              <div className="flex items-center justify-between mb-1">
                <div className="stat-tile-label">{tile.label}</div>
                <tile.icon size={14} style={{ color: tile.accent, opacity: 0.7 }} />
              </div>
              <div className="stat-tile-value" style={{ color: 'var(--text)' }}>{tile.value}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-0 border-b mb-6 overflow-x-auto scroll-hide" style={{ borderColor: 'var(--border)' }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all ${tab === t ? 'tab-active' : 'tab-inactive'}`}
            >
              {t}
              {t === 'Pending' && (
                <span className="nav-count ml-2">{results.filter(p => p.status === 'pending').length}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm" style={{ color: 'var(--muted)' }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BarChart2 size={32} className="mx-auto mb-3 opacity-50" style={{ color: 'var(--muted)' }} />
            <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
              {results.length === 0 ? 'No picks bought yet' : 'No picks in this category'}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Browse the marketplace to find picks</p>
            <a href="/" className="btn-primary mt-4 px-6 py-2.5 rounded-lg text-sm font-semibold inline-block">Browse picks</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => <ResultCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
