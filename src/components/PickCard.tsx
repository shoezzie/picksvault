'use client'

import { useRef, useCallback } from 'react'
import Link from 'next/link'
import { Lock, CheckCircle2, Flame, TrendingUp, Zap, Target, ShieldAlert, Eye, Unlock, Bookmark } from 'lucide-react'
import { SIGNAL_META } from '@/lib/seed-data'

export interface PickCardData {
  id: number | string
  sportKey: string
  sport: string
  tag: string
  game: string
  time: string
  lockMins?: number
  price: number
  tier: 'insured' | 'verified'
  seller: string
  verified: boolean
  hit?: string
  roi?: string
  confidence?: number
  buyers?: number
  viewers?: number
  stake?: number
  oddsRange?: string
  signals?: string[]
  streak?: string[]
  description?: string
  status?: string
}

interface PickCardProps {
  pick: PickCardData
  isBookmarked?: boolean
  onBookmarkToggle?: (id: number | string) => void
  onUnlock?: (pick: PickCardData) => void
}

const SIGNAL_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  hot: Flame,
  sharp: TrendingUp,
  fresh: Zap,
  pocket: Target,
  fade: ShieldAlert,
}

export default function PickCard({ pick, isBookmarked, onBookmarkToggle, onUnlock }: PickCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rx = ((y - cy) / cy) * -4
    const ry = ((x - cx) / cx) * 4
    const mx = (x / rect.width) * 100
    const my = (y / rect.height) * 100
    card.style.setProperty('--rx', `${rx}deg`)
    card.style.setProperty('--ry', `${ry}deg`)
    card.style.setProperty('--mx', `${mx}%`)
    card.style.setProperty('--my', `${my}%`)
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.setProperty('--rx', '0deg')
    card.style.setProperty('--ry', '0deg')
    card.style.setProperty('--mx', '50%')
    card.style.setProperty('--my', '50%')
  }, [])

  const sportGradient = `gradient-${pick.sportKey}`
  const isInsured = pick.tier === 'insured'
  const lockMins = pick.lockMins ?? 60
  const hours = Math.floor(lockMins / 60)
  const mins = lockMins % 60
  const lockDisplay = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

  return (
    <div
      ref={cardRef}
      className="pick-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Holo border */}
      <div className="holo-border" />
      {/* Glint */}
      <div className="glint" />
      {/* Spotlight */}
      <div
        className="spotlight"
        style={{ background: 'radial-gradient(circle 280px at var(--mx) var(--my), rgba(34,197,94,0.18), transparent 65%)' }}
      />

      {/* Bookmark btn */}
      <button
        onClick={(e) => { e.preventDefault(); onBookmarkToggle?.(pick.id) }}
        className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
        aria-label="Bookmark"
      >
        <Bookmark size={14} fill={isBookmarked ? '#22c55e' : 'none'} />
      </button>

      {/* Banner */}
      <div className={`${sportGradient} lock-grid scan-line relative`} style={{ height: 112 }}>
        <div className="data-stream">
          <span style={{ '--x': '15%', '--d': '2.4s', '--del': '0s' } as React.CSSProperties} />
          <span style={{ '--x': '35%', '--d': '3s', '--del': '0.4s' } as React.CSSProperties} />
          <span style={{ '--x': '60%', '--d': '2.7s', '--del': '0.8s' } as React.CSSProperties} />
          <span style={{ '--x': '85%', '--d': '3.2s', '--del': '0.2s' } as React.CSSProperties} />
        </div>
        <div className="corner-bracket tl" />
        <div className="corner-bracket tr" />
        <div className="corner-bracket bl" />
        <div className="corner-bracket br" />

        {/* Sport label + tier */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          <span className="pill bg-black/50 text-white border border-white/10 backdrop-blur">{pick.sport}</span>
          <span className="text-[10px] text-white/60 font-semibold tracking-widest uppercase">{pick.tag}</span>
        </div>

        {/* Tier badge */}
        <div className="absolute top-3 right-10 z-10">
          {isInsured ? (
            <span className="pill" style={{ background: 'rgba(34,197,94,0.2)', color: '#86efac', border: '1px solid rgba(34,197,94,0.4)', fontSize: '9px', letterSpacing: '0.12em' }}>
              🛡 INSURED
            </span>
          ) : (
            <span className="pill" style={{ background: 'rgba(168,85,247,0.2)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.4)', fontSize: '9px', letterSpacing: '0.12em' }}>
              ✦ VERIFIED
            </span>
          )}
        </div>

        {/* Center lock */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="lock-cube">
            <Lock size={22} />
          </div>
        </div>

        {/* Countdown */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="countdown">⏱ {lockDisplay}</span>
        </div>

        {/* Viewers */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="view-pulse">
            <span className="view-pulse-dot" />
            <Eye size={10} />
            {pick.viewers ?? 0}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 pb-3">
        {/* Game */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{pick.game}</div>
          <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{pick.time}</div>
        </div>

        {/* Seller chip */}
        <div className="seller-hover-wrap relative inline-block mb-3">
          <div className="seller-chip rounded-full inline-flex items-center gap-2 pl-1 pr-3 py-1 cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #22c55e, #3b82f6)', color: '#04130a' }}>
              {pick.seller[1]?.toUpperCase() ?? 'S'}
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{pick.seller}</span>
            {pick.verified && <CheckCircle2 size={12} className="text-accent" style={{ color: 'var(--accent)' }} />}
          </div>
          {/* Seller popover */}
          <div className="seller-popover">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: 'linear-gradient(135deg, #22c55e, #3b82f6)', color: '#04130a' }}>
                {pick.seller[1]?.toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{pick.seller}</div>
                <div className="text-[10px]" style={{ color: 'var(--accent)' }}>{pick.hit} hit rate</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div>
                <div className="stat-num text-sm" style={{ color: 'var(--accent)' }}>{pick.roi ?? '+0%'}</div>
                <div className="text-[9px] uppercase" style={{ color: 'var(--muted)' }}>ROI</div>
              </div>
              <div>
                <div className="stat-num text-sm">{pick.hit ?? '—'}</div>
                <div className="text-[9px] uppercase" style={{ color: 'var(--muted)' }}>Hit</div>
              </div>
              <div>
                <div className="stat-num text-sm">{pick.buyers ?? 0}</div>
                <div className="text-[9px] uppercase" style={{ color: 'var(--muted)' }}>Buyers</div>
              </div>
            </div>
            <Link
              href={`/seller/${pick.seller.replace('@', '')}`}
              className="btn-ghost text-xs px-3 py-1.5 rounded-md w-full flex items-center justify-center"
            >
              View profile
            </Link>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2 mb-3">
          <div className="streak-dots">
            {(pick.streak ?? []).map((s, i) => (
              <span key={i} className={`streak-dot streak-${s}`} />
            ))}
          </div>
          <span className="text-[10px]" style={{ color: 'var(--muted)' }}>Last {pick.streak?.length ?? 0}</span>
        </div>

        {/* Signals */}
        {pick.signals && pick.signals.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {pick.signals.map(sig => {
              const meta = SIGNAL_META[sig]
              if (!meta) return null
              const Icon = SIGNAL_ICONS[sig]
              return (
                <span key={sig} className={`signal ${meta.cls}`}>
                  {Icon && <Icon size={11} />}
                  {meta.label}
                </span>
              )
            })}
          </div>
        )}

        {/* Stake bar */}
        {isInsured && pick.stake && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px]" style={{ color: 'var(--muted)' }}>Seller stake</span>
              <span className="stake-pill">
                <Lock size={10} />${pick.stake}
              </span>
            </div>
            <div className="stake-bar">
              <div className="stake-bar-fill" style={{ width: `${Math.min((pick.stake / 250) * 100, 100)}%` }} />
            </div>
          </div>
        )}

        {/* Footer: price + confidence + buyers + unlock */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div>
              <span className="price-num text-xl font-bold stat-num" style={{ color: 'var(--text)' }}>${pick.price}</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(i => (
                <span key={i} className={`conf-dot ${i <= (pick.confidence ?? 1) ? 'conf-on' : 'conf-off'}`} />
              ))}
            </div>
            <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{pick.buyers ?? 0} buyers</span>
          </div>
          <button
            onClick={() => onUnlock?.(pick)}
            className="unlock-btn btn-primary flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold"
          >
            <Unlock size={12} />
            Unlock
          </button>
        </div>
      </div>
    </div>
  )
}
