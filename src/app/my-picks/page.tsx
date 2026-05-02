'use client'

import { useState } from 'react'
import { DollarSign, RotateCcw, TrendingUp, BarChart2 } from 'lucide-react'
import ResultCard from '@/components/ResultCard'
import AuthGuard from '@/components/AuthGuard'
import type { PurchaseResult } from '@/components/ResultCard'

const MY_PICKS: PurchaseResult[] = [
  { id: '1', pick: 'Aaron Judge', line: 'O 1.5 TB', sportKey: 'mlb', sport: 'MLB', seller: '@firstpitch', verified: true, game: 'NYY vs BOS', time: '2h 14m', paid: 12, status: 'pending', book: 'DraftKings', odds: '+115' },
  { id: '2', pick: 'Jayson Tatum', line: 'O 28.5 PTS', sportKey: 'nba', sport: 'NBA', seller: '@hoopsedge', verified: true, game: 'BOS vs PHI', time: '7:30 PM', paid: 15, status: 'pending', book: 'FanDuel', odds: '-110' },
  { id: '3', pick: 'Gerrit Cole', line: 'O 7.5 K', sportKey: 'mlb', sport: 'MLB', seller: '@strikezone', verified: true, game: 'NYY vs BOS', time: '2h 14m', paid: 10, status: 'pending', book: 'DraftKings', odds: '-118' },
  { id: '4', pick: 'Shohei Ohtani', line: 'O 1.5 TB', sportKey: 'mlb', sport: 'MLB', seller: '@firstpitch', verified: true, game: 'LAD vs SF', time: 'Yesterday', paid: 12, status: 'won', result: '3 TB', payout: '+$11.40', odds: '+105' },
  { id: '5', pick: 'Ronald Acuña', line: '1+ SB', sportKey: 'mlb', sport: 'MLB', seller: '@firstpitch', verified: true, game: 'ATL vs MIA', time: 'Yesterday', paid: 10, status: 'refunded', result: '0 SB', refund: '$9.50', odds: '+140' },
  { id: '6', pick: 'Connor McDavid', line: 'O 0.5 G', sportKey: 'nhl', sport: 'NHL', seller: '@icecold', verified: true, game: 'EDM vs CGY', time: '2 days ago', paid: 8, status: 'void', result: 'scratched', refund: '$8.00', odds: '+125' },
]

const TABS = ['All', 'Pending', 'Won', 'Lost + Refunded']

export default function MyPicksPage() {
  const [tab, setTab] = useState('All')

  const filtered = MY_PICKS.filter(p => {
    if (tab === 'Pending') return p.status === 'pending'
    if (tab === 'Won') return p.status === 'won'
    if (tab === 'Lost + Refunded') return p.status === 'lost' || p.status === 'refunded' || p.status === 'void'
    return true
  })

  const totalSpent = MY_PICKS.reduce((s, p) => s + p.paid, 0)
  const refunded = MY_PICKS.filter(p => p.status === 'refunded' || p.status === 'void').reduce((s, p) => s + parseFloat(p.refund?.replace('$', '') ?? '0'), 0)
  const won = MY_PICKS.filter(p => p.status === 'won').length
  const total = MY_PICKS.filter(p => p.status !== 'pending').length

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="section-hero mb-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--accent)' }}>My Activity</div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>My Picks</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Track all your purchased picks and auto-refunds</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total spent', value: `$${totalSpent}`, icon: DollarSign, accent: '#22c55e' },
            { label: 'Auto-refunded', value: `$${refunded.toFixed(2)}`, icon: RotateCcw, accent: '#3b82f6' },
            { label: 'Hit rate', value: total > 0 ? `${Math.round((won / total) * 100)}%` : '—', icon: TrendingUp, accent: '#f59e0b' },
            { label: 'Net cost', value: `$${(totalSpent - refunded).toFixed(2)}`, icon: BarChart2, accent: '#a855f7' },
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

        {/* Tabs */}
        <div className="flex items-center gap-0 border-b mb-6 overflow-x-auto scroll-hide" style={{ borderColor: 'var(--border)' }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all ${tab === t ? 'tab-active' : 'tab-inactive'}`}
            >
              {t}
              {t === 'Pending' && (
                <span className="nav-count ml-2">{MY_PICKS.filter(p => p.status === 'pending').length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>No picks in this category</p>
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
