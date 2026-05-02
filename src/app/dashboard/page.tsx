'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Wallet, RotateCcw, Plus, CheckCircle2, XCircle, ShieldOff, Gavel } from 'lucide-react'
import PostPickModal from '@/components/PostPickModal'
import AuthGuard from '@/components/AuthGuard'
import { createClient } from '@/lib/supabase/client'

interface DashboardData {
  balance: number
  sellerStats: {
    hit_rate: number
    roi: number
    total_picks: number
    units_won: number
    followers_count: number
  } | null
  activePicks: Array<{
    id: string
    game: string
    tag: string
    price: number
    buyers_count: number
    lock_time: string
    sport: string
  }>
  recentResults: Array<{
    id: string
    tag: string
    game: string
    result: 'won' | 'lost' | 'void' | null
    graded_at: string | null
    earnings: number
    refundsCount: number
  }>
  totalEarnings30d: number
  refundsPaid30d: number
}

function formatLocksIn(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'Started'
  const m = Math.floor(ms / 60000)
  if (m < 60) return `${m}m`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

export default function DashboardPage() {
  const [showPostModal, setShowPostModal] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)
  const [grading, setGrading] = useState<string | null>(null)
  const supabase = createClient()

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [balanceRes, sellerRes, picksRes] = await Promise.all([
      fetch('/api/balance').then(r => r.json()).catch(() => ({ available: 0 })),
      supabase.from('seller_profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('picks').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
    ])

    const allPicks = picksRes.data ?? []
    const activePicks = allPicks.filter(p => p.status === 'active' || p.status === 'locked')
    const settledPicks = allPicks.filter(p => ['graded', 'void'].includes(p.status)).slice(0, 10)

    // Compute earnings from ledger
    const { data: ledger } = await supabase
      .from('ledger_entries')
      .select('type, amount, created_at')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const earnings30d = (ledger ?? [])
      .filter(e => e.type === 'seller_payout')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    // Refunds paid via this seller's losing picks
    const losingPicks = allPicks.filter(p => p.result === 'lost').map(p => p.id)
    const refundsPaid30d = losingPicks.length > 0
      ? Number(((await supabase
          .from('purchases')
          .select('refund_amount')
          .in('pick_id', losingPicks)
          .eq('insured', true)
          .gte('settled_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        ).data ?? []).reduce((s, p) => s + Number(p.refund_amount ?? 0), 0).toFixed(2))
      : 0

    // Per-pick recent results — earnings + refunds count
    const recentResults = await Promise.all(settledPicks.map(async (p) => {
      const { data: purchases } = await supabase
        .from('purchases')
        .select('status, refund_amount, amount_paid, insured')
        .eq('pick_id', p.id)
      const earnings = (purchases ?? [])
        .filter(pu =>
          (p.result === 'won' && pu.status === 'won')
          || (p.result === 'lost' && !pu.insured && pu.status === 'lost')
        )
        .reduce((s, pu) => s + Number(pu.amount_paid) * 0.8, 0)
      const refundsCount = (purchases ?? []).filter(pu => pu.status === 'refunded').length
      return {
        id: p.id,
        tag: p.tag,
        game: p.game,
        result: p.result as 'won' | 'lost' | 'void' | null,
        graded_at: p.graded_at,
        earnings,
        refundsCount,
      }
    }))

    setData({
      balance: balanceRes.available ?? 0,
      sellerStats: sellerRes.data,
      activePicks: activePicks.map(p => ({
        id: p.id, game: p.game, tag: p.tag, price: Number(p.price),
        buyers_count: p.buyers_count, lock_time: p.lock_time, sport: p.sport,
      })),
      recentResults,
      totalEarnings30d: earnings30d,
      refundsPaid30d,
    })
  }

  useEffect(() => { load() }, [])

  async function gradePick(pickId: string, result: 'won' | 'lost' | 'void') {
    setGrading(pickId)
    try {
      const res = await fetch(`/api/grade/${pickId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? 'Grading failed')
        return
      }
      await load()
    } finally {
      setGrading(null)
    }
  }

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="section-hero mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--accent)' }}>Seller Dashboard</div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Welcome back</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Your picks, earnings, and account balance.</p>
            </div>
            <button
              onClick={() => setShowPostModal(true)}
              className="btn-primary px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
            >
              <Plus size={16} />Post a pick
            </button>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Account balance', value: `$${data?.balance.toFixed(2) ?? '—'}`, sub: 'Available + earnings', accent: '#22c55e', icon: Wallet },
            { label: 'Earnings · 30d', value: `+$${data?.totalEarnings30d.toFixed(2) ?? '0.00'}`, sub: `From ${data?.recentResults.filter(r => r.result === 'won').length ?? 0} winning picks`, accent: '#3b82f6', icon: DollarSign },
            { label: 'Hit rate', value: data?.sellerStats ? `${Number(data.sellerStats.hit_rate).toFixed(1)}%` : '—', sub: `${data?.sellerStats?.total_picks ?? 0} total picks`, accent: '#a855f7', icon: TrendingUp },
            { label: 'Refunds via you · 30d', value: `$${data?.refundsPaid30d.toFixed(2) ?? '0.00'}`, sub: 'Paid by protection pool', accent: '#f59e0b', icon: RotateCcw },
          ].map(tile => (
            <div key={tile.label} className="stat-tile" style={{ '--tile-accent': tile.accent } as React.CSSProperties}>
              <div className="flex items-center justify-between mb-1">
                <div className="stat-tile-label">{tile.label}</div>
                <tile.icon size={14} style={{ color: tile.accent, opacity: 0.7 }} />
              </div>
              <div className="stat-tile-value" style={{ color: 'var(--text)' }}>{tile.value}</div>
              <div className="stat-tile-sub">{tile.sub}</div>
            </div>
          ))}
        </div>

        {/* Active picks */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="accent-bar" />
            <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>Active picks</h2>
            <span className="nav-count">{data?.activePicks.length ?? 0}</span>
            <span className="text-[10px] ml-2" style={{ color: 'var(--muted)' }}>Tap a result button to settle</span>
          </div>
          {!data?.activePicks.length ? (
            <div className="card rounded-xl p-8 text-center" style={{ color: 'var(--muted)' }}>
              <ShieldOff size={28} className="mx-auto mb-2 opacity-50" />
              No active picks. Post your first pick above.
            </div>
          ) : (
            <div className="space-y-2">
              {data.activePicks.map(pick => (
                <div key={pick.id} className="ap-card" style={{ gridTemplateColumns: '1.4fr 1fr 0.7fr 0.7fr 1fr 1.4fr' }}>
                  <div>
                    <div className="ap-label">Game</div>
                    <div className="ap-val text-sm">{pick.game}</div>
                  </div>
                  <div>
                    <div className="ap-label">Tag</div>
                    <div className="text-xs" style={{ color: 'var(--text)' }}>{pick.tag}</div>
                  </div>
                  <div>
                    <div className="ap-label">Price</div>
                    <div className="ap-val">${pick.price.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="ap-label">Buyers</div>
                    <div className="ap-val">{pick.buyers_count}</div>
                  </div>
                  <div>
                    <div className="ap-label">Locks in</div>
                    <div className="countdown inline-flex">{formatLocksIn(pick.lock_time)}</div>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => gradePick(pick.id, 'won')}
                      disabled={grading === pick.id}
                      className="px-2.5 py-1.5 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 transition-all disabled:opacity-50"
                      style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.4)' }}
                    >
                      <CheckCircle2 size={11} />HIT
                    </button>
                    <button
                      onClick={() => gradePick(pick.id, 'lost')}
                      disabled={grading === pick.id}
                      className="px-2.5 py-1.5 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 transition-all disabled:opacity-50"
                      style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' }}
                    >
                      <XCircle size={11} />MISS
                    </button>
                    <button
                      onClick={() => gradePick(pick.id, 'void')}
                      disabled={grading === pick.id}
                      className="px-2.5 py-1.5 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 transition-all disabled:opacity-50"
                      style={{ background: 'rgba(161,161,170,0.12)', color: '#a1a1aa', border: '1px solid rgba(161,161,170,0.3)' }}
                    >
                      <Gavel size={11} />VOID
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent results */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="accent-bar" />
            <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>Recent results</h2>
          </div>
          {!data?.recentResults.length ? (
            <div className="card rounded-xl p-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
              No graded picks yet. Post one and grade it to see results here.
            </div>
          ) : (
            <div className="card rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Pick', 'Game', 'Result', 'Earnings', 'Refunds', 'Settled'].map(h => (
                      <th key={h} className="text-left p-4 text-[11px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentResults.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-medium" style={{ color: 'var(--text)' }}>{r.tag}</td>
                      <td className="p-4 text-xs" style={{ color: 'var(--muted)' }}>{r.game}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                          r.result === 'won' ? 'text-green-400' :
                          r.result === 'lost' ? 'text-red-400' : 'text-zinc-400'
                        }`}>
                          {r.result === 'won' ? <CheckCircle2 size={12} /> : r.result === 'lost' ? <XCircle size={12} /> : <Gavel size={12} />}
                          {(r.result ?? 'pending').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-semibold" style={{ color: r.earnings > 0 ? '#4ade80' : 'var(--muted)' }}>
                        {r.earnings > 0 ? `+$${r.earnings.toFixed(2)}` : '$0.00'}
                      </td>
                      <td className="p-4 text-xs" style={{ color: 'var(--muted)' }}>{r.refundsCount} buyer{r.refundsCount === 1 ? '' : 's'}</td>
                      <td className="p-4 text-xs" style={{ color: 'var(--muted)' }}>
                        {r.graded_at ? new Date(r.graded_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showPostModal && <PostPickModal onClose={() => { setShowPostModal(false); load() }} />}
      </div>
    </AuthGuard>
  )
}
