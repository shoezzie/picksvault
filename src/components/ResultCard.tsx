'use client'

import { Timer, CheckCircle2, XCircle, RotateCcw, ShieldOff, Activity } from 'lucide-react'
import Link from 'next/link'

export interface PurchaseResult {
  id: string
  pick: string
  line: string
  sportKey: string
  sport: string
  seller: string
  verified?: boolean
  game: string
  time: string
  paid: number
  status: 'pending' | 'won' | 'lost' | 'refunded' | 'void'
  book?: string
  odds?: string
  result?: string
  payout?: string
  refund?: string
}

const STATUS_META = {
  pending:  { label: 'PENDING',  cls: 'rc-pending', icon: Timer,         color: '#93c5fd' },
  won:      { label: 'HIT',      cls: 'rc-won',     icon: CheckCircle2,  color: '#86efac' },
  lost:     { label: 'MISS',     cls: 'rc-lost',    icon: XCircle,       color: '#fca5a5' },
  refunded: { label: 'REFUNDED', cls: 'rc-won',     icon: RotateCcw,     color: '#86efac' },
  void:     { label: 'VOID',     cls: 'rc-void',    icon: ShieldOff,     color: '#d4d4d8' },
}

export default function ResultCard({ p }: { p: PurchaseResult }) {
  const meta = STATUS_META[p.status] ?? STATUS_META.pending
  const Icon = meta.icon
  const isPending = p.status === 'pending'
  const isWon = p.status === 'won'
  const isLost = p.status === 'lost'
  const isRefund = p.status === 'refunded' || p.status === 'void'

  let bigNum = '', bigLbl = '', bigCls = ''
  if (isPending)     { bigNum = `$${p.paid}`; bigLbl = 'Paid · awaiting result'; bigCls = 'text-white' }
  else if (isWon)    { bigNum = p.payout ?? `+$${p.paid}`; bigLbl = `Result: ${p.result ?? 'WON'}`; bigCls = 'text-accent' }
  else if (isLost)   { bigNum = `-$${p.paid}`; bigLbl = `Result: ${p.result ?? 'MISS'}`; bigCls = 'text-danger' }
  else if (isRefund) { bigNum = p.refund ?? `$${p.paid}`; bigLbl = `Auto-refunded · ${p.result ?? ''}`.trim(); bigCls = 'text-accent' }

  const sportGradient = `gradient-${p.sportKey}`

  return (
    <div className={`result-card ${meta.cls}`}>
      {/* Banner */}
      <div className={`rc-banner ${sportGradient} relative`}>
        <div className="rc-scan" />
        <div className="rc-corner tl" />
        <div className="rc-corner tr" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span className="pill bg-black/50 text-white border border-white/10 backdrop-blur" style={{ fontSize: '10px' }}>{p.sport}</span>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <span className={`rc-status-pill ${meta.cls} flex items-center gap-1`}>
            <Icon size={11} />
            {meta.label}
          </span>
        </div>
        <div className="rc-pick-name">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/55 font-semibold mb-1">{p.book ?? 'Pick'} · {p.odds ?? ''}</div>
          <div className="font-bold text-lg leading-tight text-white">{p.pick}</div>
          <div className="font-mono text-sm text-white/85">{p.line}</div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
            {p.game}
          </div>
          <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{p.time}</span>
        </div>

        <div className="seller-chip rounded-full inline-flex items-center gap-2 pl-1 pr-3 py-1 mb-3">
          <div className="w-6 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, #22c55e, #3b82f6)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{p.seller}</span>
          {p.verified && <CheckCircle2 size={12} style={{ color: 'var(--accent)' }} />}
        </div>

        {/* Progress */}
        <div className="rc-progress mb-3">
          {isPending && <div className="rc-progress-fill rc-progress-live" />}
          {(isWon || isRefund) && <div className="rc-progress-fill rc-progress-win" />}
          {isLost && <div className="rc-progress-fill rc-progress-lose" />}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className={`stat-num text-2xl ${bigCls}`}>{bigNum}</div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{bigLbl}</div>
          </div>
          <div>
            {isPending ? (
              <Link
                href="/grading/1"
                className="btn-primary px-3 py-1.5 rounded-md text-xs flex items-center gap-1"
              >
                <Activity size={12} />Track live
              </Link>
            ) : isWon ? (
              <span className="rc-badge rc-won flex items-center gap-1">
                <CheckCircle2 size={12} />HIT
              </span>
            ) : isLost ? (
              <span className="rc-badge rc-lost flex items-center gap-1">
                <XCircle size={12} />MISS
              </span>
            ) : (
              <span className="rc-badge rc-won flex items-center gap-1">
                <RotateCcw size={12} />REFUNDED
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
