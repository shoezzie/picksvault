'use client'

import Link from 'next/link'
import { CheckCircle2, UserPlus } from 'lucide-react'

interface SellerCardData {
  handle: string
  name?: string
  avatar?: string
  sport: string
  hit: string
  roi: string
  picks: number
  followers?: number
  verified: boolean
  badge?: string
  stakeBalance?: number
}

interface SellerCardProps {
  seller: SellerCardData
  isFollowing?: boolean
  onFollowToggle?: (handle: string) => void
}

function sportGradient(sport: string): string {
  const s = sport.toLowerCase()
  if (s.includes('nba') || s.includes('basketball') || s.includes('hoops')) return 'gradient-nba'
  if (s.includes('nfl') || s.includes('football') || s.includes('gridiron')) return 'gradient-nfl'
  if (s.includes('nhl') || s.includes('hockey') || s.includes('ice')) return 'gradient-nhl'
  if (s.includes('soccer') || s.includes('mls')) return 'gradient-soccer'
  return 'gradient-mlb'
}

function sportLabel(sport: string): string {
  const s = sport.toLowerCase()
  if (s.includes('nba') || s.includes('basketball') || s.includes('hoops')) return 'NBA'
  if (s.includes('nfl') || s.includes('football') || s.includes('gridiron')) return 'NFL'
  if (s.includes('nhl') || s.includes('hockey') || s.includes('ice')) return 'NHL'
  if (s.includes('soccer') || s.includes('mls')) return 'SOC'
  return 'MLB'
}

export default function SellerCard({ seller, isFollowing, onFollowToggle }: SellerCardProps) {
  const avatarLetter = seller.avatar ?? seller.handle[1]?.toUpperCase() ?? 'S'
  const gradientClass = sportGradient(seller.sport)
  const label = sportLabel(seller.sport)

  return (
    <div className="card rounded-2xl overflow-hidden tilt">
      {/* Banner */}
      <div className={`${gradientClass} relative h-20`}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.55) 100%)' }} />
        <span
          className="absolute bottom-2 right-3 text-[11px] font-bold tracking-[0.15em] uppercase"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          {label}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 pb-4">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 -mt-8 mb-2"
          style={{ background: 'linear-gradient(135deg, #22c55e, #3b82f6)', color: '#04130a', borderColor: 'var(--panel)' }}
        >
          {avatarLetter}
        </div>

        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{seller.handle}</span>
              {seller.verified && <CheckCircle2 size={13} style={{ color: 'var(--accent)' }} />}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{seller.sport}</div>
          </div>
          <button
            onClick={() => onFollowToggle?.(seller.handle)}
            className={`follow-btn text-xs font-semibold px-3 py-1.5 rounded-md ${isFollowing ? 'active' : ''}`}
          >
            <UserPlus size={12} />
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        {seller.badge && (
          <div className="text-[10px] mb-3" style={{ color: 'var(--accent)' }}>{seller.badge}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center py-2 border-t border-b mb-3" style={{ borderColor: 'var(--border)' }}>
          <div>
            <div className="stat-num text-sm" style={{ color: 'var(--accent)' }}>{seller.roi}</div>
            <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>ROI</div>
          </div>
          <div>
            <div className="stat-num text-sm">{seller.hit}</div>
            <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Hit Rate</div>
          </div>
          <div>
            <div className="stat-num text-sm">{seller.picks}</div>
            <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Picks</div>
          </div>
        </div>

        <Link
          href={`/seller/${seller.handle.replace('@', '')}`}
          className="btn-ghost w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium"
          style={{ color: 'var(--text)' }}
        >
          View profile
        </Link>
      </div>
    </div>
  )
}
