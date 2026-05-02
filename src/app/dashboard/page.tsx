'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, Shield, RotateCcw, Plus, Activity, CheckCircle2, XCircle } from 'lucide-react'
import PostPickModal from '@/components/PostPickModal'
import AuthGuard from '@/components/AuthGuard'

const ACTIVE_PICKS = [
  { game: 'NYY vs BOS', tag: 'Hitter Prop', price: 5, stake: 120, buyers: 38, locksIn: '42m', sport: 'MLB' },
  { game: 'NYY vs BOS', tag: 'Pitcher Prop', price: 4, stake: 200, buyers: 52, locksIn: '42m', sport: 'MLB' },
  { game: 'NYY vs BOS', tag: '3-Leg Parlay', price: 7, stake: 90, buyers: 14, locksIn: '42m', sport: 'MLB' },
]

const RECENT_RESULTS = [
  { pick: 'Judge O1.5TB', result: 'won', payout: '+$190', date: '2 days ago' },
  { pick: 'Cole O7.5K', result: 'won', payout: '+$208', date: '3 days ago' },
  { pick: 'Stanton HR', result: 'lost', refunded: '$47.50', date: '4 days ago' },
]

export default function DashboardPage() {
  const [showPostModal, setShowPostModal] = useState(false)

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="section-hero mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--accent)' }}>Seller Dashboard</div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Welcome back</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Your picks are live. Monitor performance and post new picks.</p>
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
            { label: 'Total earnings', value: '$2,847', sub: '+$340 this week', accent: '#22c55e', icon: DollarSign },
            { label: 'Hit rate', value: '58.1%', sub: 'Last 30 picks', accent: '#3b82f6', icon: TrendingUp },
            { label: 'Stake balance', value: '$2,400', sub: '$120 at risk today', accent: '#f59e0b', icon: Shield },
            { label: 'Refunds paid', value: '$284', sub: '6 picks this month', accent: '#ef4444', icon: RotateCcw },
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
            <span className="nav-count">{ACTIVE_PICKS.length}</span>
          </div>
          <div className="space-y-2">
            {/* Header */}
            <div className="ap-card hidden md:grid" style={{ background: 'transparent', border: 'none', paddingTop: 0, paddingBottom: 4 }}>
              {['Game', 'Tag', 'Price', 'Stake', 'Buyers', 'Locks in'].map(h => (
                <div key={h} className="ap-label">{h}</div>
              ))}
            </div>
            {ACTIVE_PICKS.map((pick, i) => (
              <div key={i} className="ap-card">
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
                  <div className="ap-val">${pick.price}</div>
                </div>
                <div>
                  <div className="ap-label">Stake</div>
                  <div className="ap-val" style={{ color: 'var(--accent)' }}>${pick.stake}</div>
                </div>
                <div>
                  <div className="ap-label">Buyers</div>
                  <div className="ap-val">{pick.buyers}</div>
                </div>
                <div>
                  <div className="ap-label">Locks in</div>
                  <div className="countdown inline-flex">{pick.locksIn}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent results */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="accent-bar" />
            <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>Recent results</h2>
          </div>
          <div className="card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Pick', 'Result', 'P&L', 'Date'].map(h => (
                    <th key={h} className="text-left p-4 text-[11px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_RESULTS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-medium" style={{ color: 'var(--text)' }}>{r.pick}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${r.result === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                        {r.result === 'won' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {r.result === 'won' ? 'HIT' : 'MISS'}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-semibold" style={{ color: r.result === 'won' ? '#4ade80' : '#f87171' }}>
                      {r.result === 'won' ? r.payout : `-${r.refunded} refunded`}
                    </td>
                    <td className="p-4 text-xs" style={{ color: 'var(--muted)' }}>{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showPostModal && <PostPickModal onClose={() => setShowPostModal(false)} />}
      </div>
    </AuthGuard>
  )
}
