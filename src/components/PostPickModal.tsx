'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface PostPickModalProps {
  onClose: () => void
}

export default function PostPickModal({ onClose }: PostPickModalProps) {
  const [tier, setTier] = useState<'insured' | 'verified'>('insured')
  const [price, setPrice] = useState('12')
  const [stake, setStake] = useState('30')

  return (
    <div className="fixed inset-0 z-50 modal-bg flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="card rounded-xl p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Post a new pick</h2>
          <button onClick={onClose} style={{ color: 'var(--muted)' }} className="hover:text-white">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>Stake your own money — your reputation depends on it.</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Sport / Game</label>
            <select className="w-full px-3 py-2 rounded-md text-sm">
              <option>MLB · NYY vs BOS · 7:05 PM ET</option>
              <option>NBA · BOS vs PHI · 7:30 PM ET</option>
              <option>NFL · BAL vs CIN · Sun 1:00 PM</option>
              <option>NHL · EDM vs CGY · 9:00 PM ET</option>
            </select>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Pick description</label>
            <input className="w-full px-3 py-2 rounded-md text-sm" placeholder="e.g. Aaron Judge over 1.5 total bases" defaultValue="Aaron Judge O1.5 TB" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Price ($)</label>
              <input className="w-full px-3 py-2 rounded-md text-sm" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Your stake ($)</label>
              <input className="w-full px-3 py-2 rounded-md text-sm" value={stake} onChange={e => setStake(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs block mb-2" style={{ color: 'var(--muted)' }}>Listing tier</label>
            <div className="grid grid-cols-2 gap-2">
              <div
                className="card rounded-xl p-3 cursor-pointer"
                style={{ borderColor: tier === 'insured' ? 'rgba(34,197,94,0.5)' : undefined }}
                onClick={() => setTier('insured')}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span>🛡️</span><span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Insured</span>
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>Stake required. Buyers get 95% refund on loss. Higher trust → higher price.</div>
              </div>
              <div
                className="card rounded-xl p-3 cursor-pointer"
                style={{ borderColor: tier === 'verified' ? 'rgba(168,85,247,0.5)' : undefined }}
                onClick={() => setTier('verified')}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span>✦</span><span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Verified-only</span>
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>No stake, no refund. Just your tracked record. Cheaper, lower trust.</div>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Reasoning (unlocks for buyers)</label>
            <textarea className="w-full px-3 py-2 rounded-md h-24 text-sm" placeholder="Why this hits..." />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Odds range</label>
            <input className="w-full px-3 py-2 rounded-md text-sm" placeholder="+105 / +130" />
          </div>
        </div>

        <div className="rounded-md p-3 text-xs mt-4" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--text)' }}>
          💰 You&apos;re staking <strong>${stake}</strong>. If the pick loses, ${stake} is slashed and used to refund buyers. Your stake balance: $2,400 → ${2400 - parseInt(stake || '0')} if posted.
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="btn-ghost px-4 py-2.5 rounded-md flex-1 text-sm">Cancel</button>
          <button onClick={onClose} className="btn-primary px-4 py-2.5 rounded-md flex-1 text-sm">Post pick</button>
        </div>
      </div>
    </div>
  )
}
