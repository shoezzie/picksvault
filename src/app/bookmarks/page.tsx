'use client'

import { useState } from 'react'
import { Bookmark, DollarSign, RotateCcw, TrendingUp } from 'lucide-react'
import PickCard from '@/components/PickCard'
import ResultCard from '@/components/ResultCard'
import BuyModal from '@/components/BuyModal'
import AuthGuard from '@/components/AuthGuard'
import { SEED_PICKS } from '@/lib/seed-data'
import type { PickCardData } from '@/components/PickCard'
import type { PurchaseResult } from '@/components/ResultCard'

const SETTLED_BOOKMARKS: PurchaseResult[] = [
  { id: 's1', pick: 'Shohei Ohtani', line: 'O 1.5 TB', sportKey: 'mlb', sport: 'MLB', seller: '@firstpitch', verified: true, game: 'LAD vs SF', time: 'Yesterday', paid: 12, status: 'won', result: '3 TB', payout: '+$11.40', odds: '+105' },
  { id: 's2', pick: 'Ronald Acuña', line: '1+ SB', sportKey: 'mlb', sport: 'MLB', seller: '@firstpitch', verified: true, game: 'ATL vs MIA', time: '2 days ago', paid: 10, status: 'refunded', result: '0 SB', refund: '$9.50', odds: '+140' },
]

const TABS = ['Active', 'Settled']

export default function BookmarksPage() {
  const [tab, setTab] = useState('Active')
  const [bookmarks, setBookmarks] = useState<Set<number | string>>(new Set([1, 3, 6]))
  const [buyPick, setBuyPick] = useState<PickCardData | null>(null)

  const activePicks = SEED_PICKS.filter(p => bookmarks.has(p.id))

  function toggleBookmark(id: number | string) {
    setBookmarks(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="section-hero mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Bookmark size={18} style={{ color: 'var(--accent)' }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--accent)' }}>Saved picks</span>
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>Bookmarks</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Picks you&apos;ve saved to track and purchase later</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Saved', value: `${bookmarks.size}`, icon: Bookmark, accent: '#22c55e' },
            { label: 'Purchased', value: `${SETTLED_BOOKMARKS.length}`, icon: DollarSign, accent: '#3b82f6' },
            { label: 'Refunded', value: '$9.50', icon: RotateCcw, accent: '#f59e0b' },
          ].map(tile => (
            <div key={tile.label} className="stat-tile" style={{ '--tile-accent': tile.accent } as React.CSSProperties}>
              <div className="flex items-center justify-between mb-1">
                <div className="stat-tile-label">{tile.label}</div>
                <tile.icon size={14} style={{ color: tile.accent, opacity: 0.7 }} />
              </div>
              <div className="stat-tile-value" style={{ color: 'var(--text)' }}>{tile.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 border-b mb-6" style={{ borderColor: 'var(--border)' }}>
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all ${tab === t ? 'tab-active' : 'tab-inactive'}`}
            >
              {t}
              <span className="nav-count ml-2">{t === 'Active' ? activePicks.length : SETTLED_BOOKMARKS.length}</span>
            </button>
          ))}
        </div>

        {tab === 'Active' && (
          activePicks.length === 0 ? (
            <div className="text-center py-16">
              <Bookmark size={32} className="mx-auto mb-3 opacity-20" />
              <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>No bookmarks yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Click the bookmark icon on any pick to save it here</p>
              <a href="/" className="btn-primary mt-4 px-6 py-2.5 rounded-lg text-sm font-semibold inline-block">Browse picks</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activePicks.map(pick => (
                <PickCard
                  key={pick.id}
                  pick={pick as PickCardData}
                  isBookmarked={bookmarks.has(pick.id)}
                  onBookmarkToggle={toggleBookmark}
                  onUnlock={setBuyPick}
                />
              ))}
            </div>
          )
        )}

        {tab === 'Settled' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SETTLED_BOOKMARKS.map(p => <ResultCard key={p.id} p={p} />)}
          </div>
        )}

        <BuyModal pick={buyPick} onClose={() => setBuyPick(null)} />
      </div>
    </AuthGuard>
  )
}
