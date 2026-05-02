'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Lock, Unlock, Play, CheckCircle2, XCircle, RotateCcw, Brain, User, Signal, Shield, DollarSign, Info, Wallet } from 'lucide-react'
import type { PickCardData } from './PickCard'

interface BuyModalProps {
  pick: PickCardData | null
  onClose: () => void
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
function scrambleText(length: number) {
  return Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
}

// Same rule as server-side
function calcInsurancePremium(price: number) {
  return Math.max(1, Math.round(price * 0.5 * 100) / 100)
}

export default function BuyModal({ pick, onClose }: BuyModalProps) {
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [decryptText, setDecryptText] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [result, setResult] = useState<'won' | 'lost' | null>(null)
  const [insured, setInsured] = useState(true)
  const [balance, setBalance] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (pick) {
      setStep(1)
      setProgress(0)
      setDecryptText('')
      setRevealed(false)
      setResult(null)
      setError(null)
      // Fetch balance
      fetch('/api/balance')
        .then(r => r.json())
        .then(d => setBalance(typeof d.available === 'number' ? d.available : null))
        .catch(() => setBalance(null))
    }
  }, [pick])

  const runDecrypt = useCallback(() => {
    let p = 0
    const interval = setInterval(() => {
      p += 2
      setProgress(p)
      setDecryptText(scrambleText(14))
      if (p >= 100) {
        clearInterval(interval)
        setTimeout(() => setRevealed(true), 200)
      }
    }, 40)
  }, [])

  async function handleUnlock() {
    if (!pick) return
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickId: pick.id, insured }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 402) {
          setError(`Need $${(data.required ?? 0).toFixed(2)}, you have $${(data.balance ?? 0).toFixed(2)}. Top up your balance.`)
        } else if (res.status === 401) {
          setError('Sign in to buy this pick.')
        } else if (res.status === 409) {
          setError('You already bought this pick.')
        } else {
          setError(data.error ?? 'Something went wrong')
        }
        setSubmitting(false)
        return
      }
      if (typeof data.balance === 'number') setBalance(data.balance)
      setStep(2)
      setTimeout(runDecrypt, 300)
    } catch {
      setError('Network error. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function simulateResult() {
    const won = Math.random() > 0.45
    setResult(won ? 'won' : 'lost')
    setStep(3)
    if (won) launchConfetti()
  }

  function launchConfetti() {
    const colors = ['#22c55e', '#4ade80', '#fde047', '#60a5fa', '#f472b6']
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div')
      el.className = 'confetti'
      el.style.left = Math.random() * 100 + 'vw'
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      el.style.animationDelay = Math.random() * 0.8 + 's'
      el.style.transform = `rotate(${Math.random() * 360}deg)`
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 2500)
    }
  }

  if (!pick) return null

  const price = Number(pick.price)
  const premium = insured ? calcInsurancePremium(price) : 0
  const total = price + premium
  const insufficient = balance != null && balance < total
  const sportGradient = `gradient-${pick.sportKey}`

  return (
    <div className="fixed inset-0 z-50 modal-bg flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="card rounded-xl max-w-md w-full overflow-hidden relative" style={{ borderColor: 'rgba(34,197,94,0.25)' }}>
        <div className="holo-border" style={{ opacity: 0.5 }} />

        {/* Step 1 */}
        {step === 1 && (
          <div className="p-6 relative">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="accent-bar" />
                <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Confirm unlock</h2>
              </div>
              <button onClick={onClose} style={{ color: 'var(--muted)' }} className="hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs mb-5 ml-4" style={{ color: 'var(--muted)' }}>Paid from your PicksVault balance.</p>

            {/* Locked preview */}
            <div className={`relative ${sportGradient} lock-grid rounded-lg p-4 mb-5 overflow-hidden`}>
              <div className="data-stream">
                <span style={{ '--x': '15%', '--d': '2.4s', '--del': '0s' } as React.CSSProperties} />
                <span style={{ '--x': '35%', '--d': '3s', '--del': '0.4s' } as React.CSSProperties} />
                <span style={{ '--x': '60%', '--d': '2.7s', '--del': '0.8s' } as React.CSSProperties} />
                <span style={{ '--x': '85%', '--d': '3.2s', '--del': '0.2s' } as React.CSSProperties} />
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="lock-cube"><Lock size={22} /></div>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/55 font-semibold mb-1">{pick.sport} · {pick.tag}</div>
                  <div className="decrypt-text">
                    {'X X X X X X X X X X X X X X'.split(' ').map((c, i) => (
                      <span key={i}>{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pick Protection toggle */}
            <button
              type="button"
              onClick={() => setInsured(v => !v)}
              className="w-full rounded-lg p-3.5 mb-4 flex items-center gap-3 text-left transition-all"
              style={{
                background: insured ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${insured ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
              }}
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                style={{
                  background: insured ? 'var(--accent)' : 'transparent',
                  border: `1.5px solid ${insured ? 'var(--accent)' : 'var(--border-hover)'}`,
                }}
              >
                {insured && <CheckCircle2 size={14} style={{ color: '#04130a' }} strokeWidth={3} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: insured ? 'var(--accent)' : 'var(--text)' }}>
                  <Shield size={13} />Pick Protection
                  <span className="ml-auto stat-num text-xs" style={{ color: insured ? 'var(--accent)' : 'var(--muted)' }}>
                    +${premium.toFixed(2)}
                  </span>
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                  Auto-refund the full ${price.toFixed(2)} if this pick loses.
                </div>
              </div>
            </button>

            <div className="space-y-2.5 text-sm mb-5">
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5" style={{ color: 'var(--muted)' }}><User size={13} />Seller</span>
                <span className="flex items-center gap-1">{pick.seller}{pick.verified && <CheckCircle2 size={12} style={{ color: 'var(--accent)' }} />}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5" style={{ color: 'var(--muted)' }}><Signal size={13} />Odds range</span>
                <span className="font-mono">{pick.oddsRange ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5" style={{ color: 'var(--muted)' }}><DollarSign size={13} />Pick price</span>
                <span className="stat-num">${price.toFixed(2)}</span>
              </div>
              {insured && (
                <div className="flex justify-between" style={{ color: 'var(--accent)' }}>
                  <span className="flex items-center gap-1.5"><Shield size={13} />Pick Protection</span>
                  <span className="stat-num">+${premium.toFixed(2)}</span>
                </div>
              )}
              <hr style={{ borderColor: 'var(--border)' }} />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="stat-num text-gradient">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
                  <Wallet size={12} />Your balance
                </span>
                <span className="stat-num" style={{ color: insufficient ? '#f87171' : 'var(--muted)' }}>
                  {balance == null ? '—' : `$${balance.toFixed(2)}`}
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-md p-3 text-[11px] mb-4 flex items-start gap-2" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                <XCircle size={13} style={{ color: '#f87171', marginTop: 1, flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="rounded-md p-3 text-[11px] mb-5 flex items-start gap-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
              <Info size={13} style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />
              <span>{insured
                ? 'If the pick loses, you get the full pick price back instantly to your balance. Auto-graded by official box scores.'
                : 'No refund if the pick loses. Pick is auto-graded by official box scores; voided games refund automatically regardless.'}
              </span>
            </div>

            <div className="flex gap-2">
              <button onClick={onClose} className="btn-ghost px-4 py-3 rounded-md flex-1 text-sm">Cancel</button>
              <button
                onClick={handleUnlock}
                disabled={submitting || insufficient}
                className="btn-primary unlock-btn px-4 py-3 rounded-md flex-1 flex items-center justify-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Unlock size={14} />{submitting ? 'Unlocking…' : `Unlock for $${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="p-6 relative">
            <div className={`relative h-44 rounded-lg ${sportGradient} lock-grid scan-line overflow-hidden mb-5 flex items-center justify-center`}>
              <div className="data-stream">
                {[...Array(6)].map((_, i) => (
                  <span key={i} style={{ '--x': `${15 + i * 14}%`, '--d': `${2 + i * 0.3}s`, '--del': `${i * 0.15}s` } as React.CSSProperties} />
                ))}
              </div>
              <div className="corner-bracket tl" /><div className="corner-bracket tr" />
              <div className="corner-bracket bl" /><div className="corner-bracket br" />
              <div
                className="lock-cube z-10 transition-all duration-500 flex items-center justify-center"
                style={{ width: 64, height: 64, borderRadius: 14, transform: revealed ? 'scale(1.15)' : 'scale(1)' }}
              >
                {revealed ? <Unlock size={32} /> : <Lock size={32} />}
              </div>
              <div
                className="absolute bottom-0 left-0 h-0.5 transition-all duration-300"
                style={{ width: `${progress}%`, background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }}
              />
            </div>

            <div className="text-center mb-4">
              <div className="text-[10px] uppercase tracking-[0.2em] mb-1 font-semibold" style={{ color: 'var(--accent)' }}>
                {revealed ? 'Pick revealed' : 'Verifying payment…'}
              </div>
              <h2 className="text-2xl font-bold mb-1 text-gradient">
                {revealed ? 'Unlocked!' : 'Decrypting pick'}
              </h2>
              {!revealed && (
                <div className="decrypt-text justify-center">
                  {decryptText.split('').map((c, i) => <span key={i}>{c}</span>)}
                </div>
              )}
            </div>

            {revealed && (
              <div>
                <div className="rounded-lg p-4 border mb-4 space-y-3" style={{ background: 'var(--panel2)', borderColor: 'rgba(34,197,94,0.3)' }}>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--accent)' }}>The pick</div>
                    {insured && (
                      <span className="pill text-[9px]" style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--accent)', border: '1px solid rgba(34,197,94,0.3)' }}>
                        <Shield size={10} className="inline mr-1" />PROTECTED
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-bold leading-snug">{pick.description ?? 'Pick details revealed'}</div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div>
                      <div className="text-[9px] uppercase" style={{ color: 'var(--muted)' }}>Best book</div>
                      <div className="text-xs font-semibold mt-0.5">DraftKings</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase" style={{ color: 'var(--muted)' }}>Odds</div>
                      <div className="text-xs font-mono mt-0.5">{pick.oddsRange?.split('/')[0]?.trim() ?? '+100'}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase" style={{ color: 'var(--muted)' }}>Stake</div>
                      <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--accent)' }}>3u</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-md p-3 mb-4 border" style={{ background: 'var(--panel2)', borderColor: 'var(--border)' }}>
                  <div className="text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
                    <Brain size={13} style={{ color: 'var(--accent)' }} />Reasoning
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-300">
                    {(pick as PickCardData & { reasoning?: string }).reasoning ?? 'Full analysis unlocked. Check the pick details page for complete reasoning.'}
                  </p>
                </div>
                <button onClick={simulateResult} className="btn-primary w-full py-3 rounded-md flex items-center justify-center gap-2">
                  <Play size={14} />Simulate game result
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && result && (
          <div className="p-6 text-center relative">
            <button onClick={onClose} className="absolute top-4 right-4" style={{ color: 'var(--muted)' }}>
              <X size={18} />
            </button>
            <div
              className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-5"
              style={{
                background: result === 'won' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${result === 'won' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
                boxShadow: `0 0 40px ${result === 'won' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
              }}
            >
              {result === 'won' ? <CheckCircle2 size={40} style={{ color: '#4ade80' }} /> : <XCircle size={40} style={{ color: '#f87171' }} />}
            </div>
            <h2 className={`text-2xl font-bold mb-3 ${result === 'won' ? 'text-gradient-accent' : 'text-red-400'}`}>
              {result === 'won' ? '🎉 Pick Hit!' : 'Pick Missed'}
            </h2>
            <div className="text-sm text-left rounded-md p-4 border mb-6" style={{ background: 'var(--panel2)', borderColor: 'var(--border)', color: 'var(--text)' }}>
              {result === 'won' ? (
                <p>Pick won. {insured ? <>Your <strong>${premium.toFixed(2)}</strong> Pick Protection premium was retained, but no refund needed since the pick hit.</> : 'Nice call.'}</p>
              ) : insured ? (
                <p>The pick lost — but you had <strong>Pick Protection</strong>, so <strong>${price.toFixed(2)}</strong> is back in your balance instantly. The $1 premium funds the protection pool.</p>
              ) : (
                <p className="flex items-start gap-2"><RotateCcw size={14} className="mt-0.5 flex-shrink-0" />Pick lost. No protection was added, so no refund. Tap Pick Protection next time to insure your buy.</p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-ghost px-4 py-3 rounded-md flex-1">Close</button>
              <button onClick={onClose} className="btn-primary px-4 py-3 rounded-md flex-1">Browse more picks</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
