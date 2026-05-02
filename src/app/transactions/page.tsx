'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, ShoppingBag, RotateCcw, Shield, Wallet, Coins } from 'lucide-react'
import AuthGuard from '@/components/AuthGuard'

interface LedgerEntry {
  id: string
  type: string
  amount: number
  related_pick_id: string | null
  related_purchase_id: string | null
  pool: string | null
  note: string | null
  balance_after: number | null
  created_at: string
}

const TYPE_META: Record<string, { label: string; icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; color: string }> = {
  deposit: { label: 'Deposit', icon: ArrowDown, color: '#22c55e' },
  withdrawal: { label: 'Withdrawal', icon: ArrowUp, color: '#3b82f6' },
  pick_purchase: { label: 'Pick purchase', icon: ShoppingBag, color: '#a855f7' },
  pick_refund: { label: 'Pick refund', icon: RotateCcw, color: '#22c55e' },
  insurance_premium: { label: 'Pick Protection', icon: Shield, color: '#f59e0b' },
  seller_payout: { label: 'Seller payout', icon: Coins, color: '#22c55e' },
  insurance_payout: { label: 'Pool payout', icon: Shield, color: '#a855f7' },
  platform_take: { label: 'Platform fee', icon: Wallet, color: '#71717a' },
  admin_adjust: { label: 'Adjustment', icon: Wallet, color: '#71717a' },
}

export default function TransactionsPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/ledger').then(r => r.json()),
      fetch('/api/balance').then(r => r.json()),
    ]).then(([l, b]) => {
      setEntries(l.entries ?? [])
      setBalance(typeof b.available === 'number' ? b.available : null)
      setLoading(false)
    })
  }, [])

  const totalIn = entries.filter(e => e.amount > 0).reduce((s, e) => s + Number(e.amount), 0)
  const totalOut = entries.filter(e => e.amount < 0).reduce((s, e) => s + Number(e.amount), 0)

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="section-hero mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--accent)' }}>Account</div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Transactions</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Every deposit, purchase, refund, and payout in one place.</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Current balance</div>
              <div className="stat-num text-3xl" style={{ color: 'var(--accent)' }}>
                ${balance == null ? '—' : balance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="stat-tile" style={{ '--tile-accent': '#22c55e' } as React.CSSProperties}>
            <div className="stat-tile-label">Total in</div>
            <div className="stat-tile-value" style={{ color: '#4ade80' }}>+${totalIn.toFixed(2)}</div>
            <div className="stat-tile-sub">{entries.filter(e => e.amount > 0).length} entries</div>
          </div>
          <div className="stat-tile" style={{ '--tile-accent': '#3b82f6' } as React.CSSProperties}>
            <div className="stat-tile-label">Total out</div>
            <div className="stat-tile-value" style={{ color: '#f87171' }}>-${Math.abs(totalOut).toFixed(2)}</div>
            <div className="stat-tile-sub">{entries.filter(e => e.amount < 0).length} entries</div>
          </div>
          <div className="stat-tile" style={{ '--tile-accent': '#a855f7' } as React.CSSProperties}>
            <div className="stat-tile-label">Last 100 entries</div>
            <div className="stat-tile-value">{entries.length}</div>
            <div className="stat-tile-sub">Across all activity</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="accent-bar" />
          <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>Recent activity</h2>
        </div>

        {loading ? (
          <div className="card rounded-xl p-12 text-center text-sm" style={{ color: 'var(--muted)' }}>Loading…</div>
        ) : entries.length === 0 ? (
          <div className="card rounded-xl p-12 text-center" style={{ color: 'var(--muted)' }}>
            <Wallet size={32} className="mx-auto mb-3 opacity-50" />
            <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>No transactions yet</div>
            <div className="text-xs mt-1">Top up your balance from the wallet button in the nav to get started.</div>
          </div>
        ) : (
          <div className="card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Type', 'Note', 'Amount', 'Date'].map(h => (
                    <th key={h} className="text-left p-4 text-[11px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(e => {
                  const meta = TYPE_META[e.type] ?? { label: e.type, icon: Wallet, color: '#71717a' }
                  const Icon = meta.icon
                  const positive = Number(e.amount) > 0
                  return (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-white/[0.02]">
                      <td className="p-4">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `${meta.color}1a`, border: `1px solid ${meta.color}40` }}>
                            <Icon size={13} style={{ color: meta.color }} />
                          </span>
                          <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{meta.label}</span>
                        </span>
                      </td>
                      <td className="p-4 text-xs" style={{ color: 'var(--muted)' }}>
                        {e.note ?? '—'}
                      </td>
                      <td className="p-4 font-mono font-semibold" style={{ color: positive ? '#4ade80' : '#f87171' }}>
                        {positive ? '+' : ''}${Math.abs(Number(e.amount)).toFixed(2)}
                      </td>
                      <td className="p-4 text-xs" style={{ color: 'var(--muted)' }}>
                        {new Date(e.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
