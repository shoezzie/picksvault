'use client'

import { useState } from 'react'
import { X, Wallet, Plus, ArrowDownToLine, Banknote, TrendingDown } from 'lucide-react'

interface DepositModalProps {
  currentBalance: number
  onClose: () => void
  onSuccess: (newBalance: number) => void
}

const QUICK_AMOUNTS = [10, 25, 50, 100]

export default function DepositModal({ currentBalance, onClose, onSuccess }: DepositModalProps) {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState<number | ''>(25)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [newBal, setNewBal] = useState(currentBalance)

  async function submit() {
    setError(null)
    const dollars = Number(amount)
    if (!dollars || dollars <= 0) { setError('Enter a valid amount'); return }
    if (mode === 'withdraw' && dollars > currentBalance) { setError(`Max withdrawal is $${currentBalance.toFixed(2)}`); return }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: dollars }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      const updated = typeof data.balance === 'number' ? data.balance : currentBalance + (mode === 'deposit' ? dollars : -dollars)
      setNewBal(updated)
      setDone(true)
      setTimeout(() => { onSuccess(updated) }, 1400)
    } catch {
      setError('Network error — try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const isDeposit = mode === 'deposit'
  const numAmount = Number(amount) || 0

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg,#0f1117,#090b0e)',
          border: '1px solid rgba(34,197,94,0.22)',
          boxShadow: '0 24px 64px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <Wallet size={15} color="#22c55e" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#22c55e' }}>Balance</div>
              <div className="font-bold text-white text-sm leading-tight" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                ${currentBalance.toFixed(2)}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: '#71717a' }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5">
          {done ? (
            /* ── Success state ── */
            <div className="text-center py-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', boxShadow: '0 0 40px rgba(34,197,94,0.25)' }}
              >
                {isDeposit
                  ? <Plus size={28} color="#22c55e" strokeWidth={2.5} />
                  : <TrendingDown size={28} color="#22c55e" strokeWidth={2.5} />}
              </div>
              <div className="font-bold text-white text-lg mb-1">
                {isDeposit ? 'Deposited' : 'Withdrawn'} ${numAmount}
              </div>
              <div className="text-sm" style={{ color: '#71717a' }}>
                New balance: <span className="text-white font-semibold" style={{ fontFamily: 'monospace' }}>${newBal.toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <>
              {/* ── Mode tabs ── */}
              <div
                className="grid grid-cols-2 gap-1 p-1 rounded-xl mb-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {(['deposit', 'withdraw'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(null) }}
                    className="py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    style={{
                      background: mode === m ? (m === 'deposit' ? '#22c55e' : 'rgba(255,255,255,0.08)') : 'transparent',
                      color: mode === m ? (m === 'deposit' ? '#04130a' : '#ffffff') : '#71717a',
                    }}
                  >
                    {m === 'deposit' ? <Plus size={12} strokeWidth={2.5} /> : <ArrowDownToLine size={12} />}
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>

              {/* ── Amount display ── */}
              <div
                className="rounded-xl p-4 mb-3 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span className="text-2xl font-bold" style={{ color: '#52525b', fontFamily: "'JetBrains Mono', monospace" }}>$</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={amount}
                  onChange={e => { setAmount(e.target.value === '' ? '' : Number(e.target.value)); setError(null) }}
                  className="flex-1 bg-transparent outline-none text-3xl font-bold text-white"
                  style={{ fontFamily: "'JetBrains Mono', monospace", minWidth: 0 }}
                  placeholder="0"
                  autoFocus
                />
                <span className="text-xs font-semibold rounded-md px-2 py-1" style={{ background: 'rgba(255,255,255,0.06)', color: '#71717a' }}>USD</span>
              </div>

              {/* ── Quick amounts ── */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {QUICK_AMOUNTS.map(v => {
                  const sel = amount === v
                  return (
                    <button
                      key={v}
                      onClick={() => { setAmount(v); setError(null) }}
                      className="py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: sel ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${sel ? 'rgba(34,197,94,0.45)' : 'rgba(255,255,255,0.07)'}`,
                        color: sel ? '#4ade80' : '#a1a1aa',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      ${v}
                    </button>
                  )
                })}
              </div>

              {/* ── After deposit preview ── */}
              {numAmount > 0 && (
                <div
                  className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between text-sm"
                  style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)' }}
                >
                  <span style={{ color: '#71717a' }}>
                    {isDeposit ? 'Balance after deposit' : 'Balance after withdrawal'}
                  </span>
                  <span
                    className="font-bold"
                    style={{
                      color: isDeposit
                        ? '#4ade80'
                        : (currentBalance - numAmount < 0 ? '#f87171' : '#a1a1aa'),
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    ${Math.max(0, isDeposit ? currentBalance + numAmount : currentBalance - numAmount).toFixed(2)}
                  </span>
                </div>
              )}

              {/* ── Error ── */}
              {error && (
                <div
                  className="rounded-lg px-4 py-2.5 text-xs mb-4 flex items-center gap-2"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.28)', color: '#fca5a5' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {error}
                </div>
              )}

              {/* ── Test mode notice ── */}
              <div
                className="rounded-lg px-3 py-2.5 text-[10.5px] mb-4 flex items-start gap-2"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', color: '#52525b' }}
              >
                <span className="shrink-0 mt-px">🧪</span>
                <span>Test mode — no real money moves. Stripe wires in at launch.</span>
              </div>

              {/* ── CTA button ── */}
              <button
                onClick={submit}
                disabled={submitting || !numAmount}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: isDeposit
                    ? 'linear-gradient(180deg,#2dd47a,#16a34a)'
                    : 'linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05))',
                  color: isDeposit ? '#04130a' : '#ffffff',
                  border: isDeposit ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  boxShadow: isDeposit && numAmount ? '0 0 0 1px rgba(34,197,94,0.5), 0 8px 24px -8px rgba(34,197,94,0.5)' : 'none',
                }}
              >
                <Banknote size={15} />
                {submitting
                  ? 'Processing…'
                  : isDeposit
                    ? `Deposit $${numAmount}`
                    : `Withdraw $${numAmount}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
