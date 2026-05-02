'use client'

import { useState } from 'react'
import { Trophy } from 'lucide-react'
import LeaderboardCard from '@/components/LeaderboardCard'
import { SEED_LEADERBOARD } from '@/lib/seed-data'

const SPORT_FILTERS = ['All sports', 'MLB', 'NBA', 'NFL', 'NHL']
const TIME_FILTERS = ['7d', '30d', '90d', 'All-time']

export default function LeaderboardPage() {
  const [sport, setSport] = useState('All sports')
  const [timeframe, setTimeframe] = useState('30d')

  const filtered = SEED_LEADERBOARD.filter(e =>
    sport === 'All sports' || e.sport === sport
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero */}
      <div className="section-hero mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Trophy size={20} style={{ color: 'var(--accent)' }} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--accent)' }}>Rankings</span>
        </div>
        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>Leaderboard</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Top-performing sellers ranked by ROI, hit rate, and units won</p>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto scroll-hide">
          {SPORT_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setSport(f)}
              className={`btn-ghost px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${sport === f ? 'filter-active' : ''}`}
              style={{ color: sport === f ? '#04130a' : 'var(--muted)' }}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
          {TIME_FILTERS.map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
              style={{
                background: timeframe === t ? 'var(--accent)' : 'transparent',
                color: timeframe === t ? '#04130a' : 'var(--muted)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(entry => (
          <LeaderboardCard key={entry.rank} entry={entry} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <Trophy size={40} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>No sellers in this sport yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Try a different sport filter</p>
        </div>
      )}
    </div>
  )
}
