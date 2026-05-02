'use client'

import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  handle: string
  sport: string
  picks: number
  hit: string
  roi: string
  units: string
  price: string
  verified: boolean
}

export default function LeaderboardCard({ entry }: { entry: LeaderboardEntry }) {
  const rankCls =
    entry.rank === 1 ? 'lb-rank-gold' :
    entry.rank === 2 ? 'lb-rank-silver' :
    entry.rank === 3 ? 'lb-rank-bronze' : ''
  const isTop = entry.rank <= 3

  const sportGradient = entry.sport === 'MLB' ? 'gradient-mlb' :
    entry.sport === 'NBA' ? 'gradient-nba' :
    entry.sport === 'NFL' ? 'gradient-nfl' :
    entry.sport === 'NHL' ? 'gradient-nhl' : 'gradient-mlb'

  const avatarLetter = entry.handle.replace('@', '')[0]?.toUpperCase() ?? 'S'

  return (
    <div className={`lb-card ${isTop ? 'lb-card-top' : ''}`}>
      {/* Banner */}
      <div className={`lb-banner ${sportGradient}`}>
        <div className={`lb-rank ${rankCls}`}>#{entry.rank}</div>
      </div>

      {/* Body */}
      <div className="lb-body">
        <div
          className="lb-avatar text-lg font-bold"
          style={{ color: '#04130a' }}
        >
          {avatarLetter}
        </div>
        <div className="flex-1 ml-3 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{entry.handle}</span>
            {entry.verified && <CheckCircle2 size={13} style={{ color: 'var(--accent)' }} />}
          </div>
          <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{entry.sport} · {entry.picks} picks</div>
        </div>
        <div className="text-right">
          <div className="stat-num text-sm" style={{ color: 'var(--accent)' }}>{entry.roi}</div>
          <div className="text-[10px]" style={{ color: 'var(--muted)' }}>ROI</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="lb-stats">
        <div className="text-center">
          <div className="stat-num text-sm">{entry.hit}</div>
          <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Hit Rate</div>
        </div>
        <div className="text-center">
          <div className="stat-num text-sm" style={{ color: 'var(--accent)' }}>{entry.units}u</div>
          <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Units</div>
        </div>
        <div className="text-center">
          <div className="stat-num text-sm">{entry.price}</div>
          <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Price</div>
        </div>
        <div className="lb-action">
          <Link
            href={`/seller/${entry.handle.replace('@', '')}`}
            className="btn-ghost p-2 rounded-lg flex items-center justify-center"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
