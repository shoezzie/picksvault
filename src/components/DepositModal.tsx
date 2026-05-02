'use client'

import { useState } from 'react'
import { X, Wallet, Plus, Banknote, ArrowDownToLine, Info } from 'lucide-react'

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

  async function submit() {
    setError(null)
    const dollars = Number(amount)
    if (!dollars || dollars <= 0) { setError('Enter an amount'); return }
    if (mode === 'withdraw' && dollars > currentBalance) { setError('More than your balance'); return }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: dollars }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      onSuccess(typeof data.balance === 'number' ? data.balance : currentBalance + (mode === 'deposit' ? dollars : -dollars))
    } catch {
      setError('Network error. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] modal-bg flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="card rounded-xl max-w-md w-full overflow-hidden relative" style={{ borderColor: 'rgba(34,197,94,0.25)' }}>
        <div className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="accent-bar" />
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                {mode === 'deposit' ? 'Deposit' : 'Withdraw'}
              </h2>
            </div>
            <button onClick={onClose} style={{ color: 'var(--muted)' }} className="hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Mode tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
            <button
              onClick={() => setMode('deposit')}
              className="py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
              style={{
                background: mode === 'deposit' ? 'var(--accent)' : 'transparent',
                color: mode === 'deposit' ? '#04130a' : 'var(--muted)',
              }}
            >
              <Plus size={14} />Deposit
            </button>
            <button
              onClick={() => setMode('withdraw')}
              className="py-2 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
              style={{
                background: mode === 'withdraw' ? 'var(--accent)' : 'transparent',
                color: mode === 'withdraw' ? '#04130a' : 'var(--muted)',
              }}
            >
              <ArrowDownToLine size={14} />Withdraw
            </button>
          </div>

          {/* Current balance */}
          <div className="flex items-center justify-between rounded-lg p-3 mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
              <Wallet size={13} />Current balance
            </div>
            <div className="stat-num text-base">${currentBalance.toFixed(2)}</div>
          </div>

          {/* Amount input */}
          <div className="mb-3">
            <label className="text-[10px] uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--muted)' }}>
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl font-mono" style={{ color: 'var(--muted)' }}>$</span>
              <input
                type="number"
                min={1}
                step={1}
                value={amount}
                onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full pl-8 pr-3 py-3 rounded-lg text-2xl font-mono"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)' }}
                placeholder="25"
              />
            </div>
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {QUICK_AMOUNTS.map(v => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className="py-2 rounded-md text-sm font-mono transition-all"
                style={{
                  background: amount === v ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${amount === v ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
                  color: amount === v ? 'var(--accent)' : 'var(--text)',
                }}
              >
                ${v}
              </button>
            ))}
          </div>

          {error && (
            <div className="rounded-md p-3 text-[11px] mb-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          <div className="rounded-md p-3 text-[11px] mb-5 flex items-start gap-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
            <Info size={13} style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />
            <span>Test mode — no real money. Card processing &amp; bank withdrawals plug in once we wire Stripe.</span>
          </div>

          <button
            onClick={submit}
            disabled={submitting || !amount}
            className="btn-primary w-full py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Banknote size={14} />
            {submitting ? 'Processing…' : mode === 'deposit' ? `Deposit $${amount || 0}` : `Withdraw $${amount || 0}`}
          </button>
        </div>
      </div>
    </div>
  )
}
