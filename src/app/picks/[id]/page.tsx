'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Lock, Unlock, CheckCircle2, Shield, Eye, Users, Brain, Signal } from 'lucide-react'
import BuyModal from '@/components/BuyModal'
import { SEED_PICKS, SEED_SELLERS, SIGNAL_META } from '@/lib/seed-data'
import { Flame, TrendingUp, Zap, Target, ShieldAlert } from 'lucide-react'
import type { PickCardData } from '@/components/PickCard'

const SIGNAL_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  hot: Flame, sharp: TrendingUp, fresh: Zap, pocket: Target, fade: ShieldAlert,
}

export default function PickDetailPage() {
  const params = useParams()
  const id = parseInt(params.id as string)
  const pick = SEED_PICKS.find(p => p.id === id) ?? SEED_PICKS[0]
  const seller = SEED_SELLERS.find(s => s.handle === pick.seller) ?? SEED_SELLERS[0]
  const [purchased, setPurchased] = useState(false)
  const [buyModal, setBuyModal] = useState(false)

  const sportGradient = `gradient-${pick.sportKey}`

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pick banner */}
          <div className={`${sportGradient} lock-grid rounded-2xl relative overflow-hidden`} style={{ minHeight: 200 }}>
            <div className="data-stream">
              {[...Array(6)].map((_, i) => (
                <span key={i} style={{ '--x': `${10 + i * 15}%`, '--d': `${2 + i * 0.3}s`, '--del': `${i * 0.2}s` } as React.CSSProperties} />
              ))}
            </div>
            <div className="corner-bracket tl" /><div className="corner-bracket tr" />
            <div className="corner-bracket bl" /><div className="corner-bracket br" />
            <div className="relative z-10 p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="pill" style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>{pick.sport}</span>
                <span className="text-[10px] text-white/60 font-semibold tracking-widest uppercase">{pick.tag}</span>
                {pick.tier === 'insured' ? (
                  <span className="pill" style={{ background: 'rgba(34,197,94,0.2)', color: '#86efac', border: '1px solid rgba(34,197,94,0.4)', fontSize: '9px' }}>🛡 INSURED</span>
                ) : (
                  <span className="pill" style={{ background: 'rgba(168,85,247,0.2)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.4)', fontSize: '9px' }}>✦ VERIFIED</span>
                )}
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="lock-cube" style={{ width: 56, height: 56, borderRadius: 12 }}>
                  {purchased ? <Unlock size={28} /> : <Lock size={28} />}
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{purchased ? pick.description : '████ █████ O1.5 ██'}</div>
                  <div className="text-white/60 text-sm mt-1">{pick.game} · {pick.time}</div>
                </div>
              </div>
              {/* Signals */}
              <div className="flex flex-wrap gap-2">
                {pick.signals.map(sig => {
                  const meta = SIGNAL_META[sig]
                  if (!meta) return null
                  const Icon = SIGNAL_ICONS[sig]
                  return (
                    <span key={sig} className={`signal ${meta.cls}`}>
                      {Icon && <Icon size={11} />}{meta.label}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Signal panel */}
          <div className="card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="accent-bar" />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Pick signals</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-center mb-1"><Eye size={16} style={{ color: 'var(--accent)' }} /></div>
                <div className="stat-num text-lg">{pick.viewers}</div>
                <div className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>Viewers</div>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-center mb-1"><Users size={16} style={{ color: 'var(--accent)' }} /></div>
                <div className="stat-num text-lg">{pick.buyers}</div>
                <div className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>Buyers</div>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <div className="flex items-center justify-center mb-1"><Shield size={16} style={{ color: 'var(--accent)' }} /></div>
                <div className="stat-num text-lg" style={{ color: 'var(--accent)' }}>Available</div>
                <div className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>Pick Protection</div>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-center mb-1"><Signal size={16} style={{ color: 'var(--accent)' }} /></div>
                <div className="stat-num text-lg">{pick.oddsRange?.split('/')[0]?.trim()}</div>
                <div className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>Odds</div>
              </div>
            </div>
          </div>

          {/* Reasoning (blurred unless purchased) */}
          <div className="card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={16} style={{ color: 'var(--accent)' }} />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Full analysis & reasoning</h3>
            </div>
            {purchased ? (
              <div>
                <div className="text-xl font-bold mb-3" style={{ color: 'var(--text)' }}>{pick.description}</div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <div className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>Best Book</div>
                    <div className="text-sm font-bold mt-1">DraftKings</div>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <div className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>Odds</div>
                    <div className="text-sm font-mono font-bold mt-1">{pick.oddsRange?.split('/')[0]?.trim()}</div>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <div className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>Stake</div>
                    <div className="text-sm font-mono font-bold mt-1" style={{ color: 'var(--accent)' }}>3u</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{pick.reasoning}</p>
              </div>
            ) : (
              <div className="relative">
                <div className="text-sm leading-relaxed blur-sm select-none" style={{ color: 'var(--text)' }}>
                  {pick.reasoning ?? 'Full analysis and reasoning is hidden until you unlock this pick. This seller has provided detailed statistical analysis, model projections, and line movement data to support this pick.'}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: 'rgba(7,8,10,0.7)', borderRadius: 12 }}>
                  <Lock size={24} style={{ color: 'var(--muted)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Unlock to see full reasoning</span>
                  <button onClick={() => setBuyModal(true)} className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                    <Unlock size={14} />Unlock for ${pick.price}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Seller track record */}
          <div className="card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="accent-bar" />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Seller track record</h3>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #22c55e, #3b82f6)', color: '#04130a' }}>
                {seller.avatar}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>{seller.handle}</span>
                  {seller.verified && <CheckCircle2 size={14} style={{ color: 'var(--accent)' }} />}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{seller.sport}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--accent)' }}>{seller.badge}</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { label: 'ROI', value: seller.roi, color: 'var(--accent)' },
                { label: 'Hit Rate', value: seller.hit, color: 'var(--text)' },
                { label: 'Units', value: seller.units, color: 'var(--text)' },
                { label: 'Picks', value: `${seller.picks}`, color: 'var(--text)' },
              ].map(stat => (
                <div key={stat.label} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  <div className="stat-num text-sm" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-[9px] uppercase tracking-wide mt-0.5" style={{ color: 'var(--muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Buy sidebar */}
          <div className="card rounded-2xl p-5 sticky top-24">
            {pick.tier === 'insured' ? (
              <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <Shield size={16} style={{ color: 'var(--accent)' }} />
                <div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Insured pick</div>
                  <div className="text-[10px]" style={{ color: 'var(--muted)' }}>95% refund if loses</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
                <CheckCircle2 size={16} style={{ color: '#d8b4fe' }} />
                <div>
                  <div className="text-xs font-semibold text-purple-300">Verified pick</div>
                  <div className="text-[10px]" style={{ color: 'var(--muted)' }}>On-chain verified record</div>
                </div>
              </div>
            )}

            <div className="text-4xl font-bold stat-num mb-1" style={{ color: 'var(--text)' }}>${pick.price}</div>
            <div className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
              {pick.tier === 'insured' ? (
                <>Add Pick Protection at checkout for <span style={{ color: 'var(--accent)' }}>full refund if it loses</span></>
              ) : 'No refund guarantee available'}
            </div>

            {/* Pick Protection availability */}
            {pick.tier === 'insured' && (
              <div className="mb-4 rounded-md p-2.5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
                    <Shield size={11} style={{ color: 'var(--accent)' }} />Pick Protection
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>
                    +${Math.max(1, Math.round(pick.price * 0.5 * 100) / 100).toFixed(2)} at checkout
                  </span>
                </div>
              </div>
            )}

            {/* Confidence */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px]" style={{ color: 'var(--muted)' }}>Confidence</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map(i => (
                  <span key={i} className={`conf-dot ${i <= (pick.confidence ?? 1) ? 'conf-on' : 'conf-off'}`} />
                ))}
              </div>
            </div>

            {purchased ? (
              <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <CheckCircle2 size={20} className="mx-auto mb-1" style={{ color: '#4ade80' }} />
                <div className="text-sm font-semibold" style={{ color: '#4ade80' }}>Unlocked</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Full pick visible above</div>
              </div>
            ) : (
              <button onClick={() => setBuyModal(true)} className="btn-primary unlock-btn w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                <Unlock size={16} />Unlock pick for ${pick.price}
              </button>
            )}

            {/* Odds range */}
            <div className="mt-4 p-3 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Odds range</div>
              <div className="font-mono font-semibold text-sm" style={{ color: 'var(--text)' }}>{pick.oddsRange}</div>
            </div>
          </div>
        </div>
      </div>

      <BuyModal pick={purchased ? null : buyModal ? (pick as unknown as PickCardData) : null} onClose={() => setBuyModal(false)} />
    </div>
  )
}
