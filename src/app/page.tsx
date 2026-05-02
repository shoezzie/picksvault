'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp, Shield, Zap, Gift
} from 'lucide-react'
import PickCard from '@/components/PickCard'
import SellerCard from '@/components/SellerCard'
import BuyModal from '@/components/BuyModal'
import OnboardingModal from '@/components/OnboardingModal'
import { SEED_PICKS, SEED_SELLERS, type SeedPick } from '@/lib/seed-data'
import type { PickCardData } from '@/components/PickCard'

const TICKER_ITEMS = [
  { seller: '@strikezone', pick: 'Cole O7.5K', result: 'HIT ✓', time: '2m ago' },
  { seller: '@firstpitch', pick: 'Judge O1.5TB', result: 'HIT ✓', time: '14m ago' },
  { seller: '@hoopsedge', pick: 'Tatum O28.5P', result: 'HIT ✓', time: '1h ago' },
  { seller: '@bombsquad', pick: 'Stanton HR', result: 'MISS → REFUNDED', time: '2h ago' },
  { seller: '@icecold', pick: 'McDavid G', result: 'HIT ✓', time: '3h ago' },
  { seller: '@gridironguru', pick: 'BAL -3', result: 'MISS → REFUNDED', time: '5h ago' },
]

const SPORT_FILTERS = ['All', 'Following', 'Insured only', 'Verified only', 'MLB', 'NBA', 'NFL', 'NHL']

export default function MarketplacePage() {
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [picks] = useState<SeedPick[]>(SEED_PICKS)
  const [bookmarks, setBookmarks] = useState<Set<number | string>>(new Set([1, 3, 6]))
  const [following, setFollowing] = useState<Set<string>>(new Set(['@firstpitch', '@strikezone']))
  const [buyPick, setBuyPick] = useState<PickCardData | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [refundCount, setRefundCount] = useState(1847293)

  useEffect(() => {
    const interval = setInterval(() => {
      setRefundCount(prev => prev + Math.floor(Math.random() * 3))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  function toggleBookmark(id: number | string) {
    setBookmarks(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleFollow(handle: string) {
    setFollowing(prev => {
      const next = new Set(prev)
      if (next.has(handle)) next.delete(handle)
      else next.add(handle)
      return next
    })
  }

  const filteredPicks = picks.filter(p => {
    if (filter === 'Following') return following.has(p.seller)
    if (filter === 'Insured only') return p.tier === 'insured'
    if (filter === 'Verified only') return p.tier === 'verified'
    if (filter === 'MLB') return p.sportKey === 'mlb'
    if (filter === 'NBA') return p.sportKey === 'nba'
    if (filter === 'NFL') return p.sportKey === 'nfl'
    if (filter === 'NHL') return p.sportKey === 'nhl'
    return true
  })

  const sortedPicks = [...filteredPicks].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    if (sortBy === 'roi') return parseFloat(b.roi) - parseFloat(a.roi)
    if (sortBy === 'buyers') return (b.buyers ?? 0) - (a.buyers ?? 0)
    return b.id - a.id
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero */}
      <div className="mesh-hero text-center py-16 px-4 mb-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="live-dot live-dot-green" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>
            Picks marketplace · auto-refunds
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient">
          Picks with a refund<br />if they don&apos;t hit.
        </h1>
        <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: 'var(--muted)' }}>
          Buy any pick, add Pick Protection at checkout. If it loses —
          <span style={{ color: 'var(--accent)' }}> the price is back in your balance, instantly.</span>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold stat-num text-gradient-accent">
              ${refundCount.toLocaleString()}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>auto-refunded to buyers</div>
          </div>
          <div className="w-px h-10 hidden sm:block" style={{ background: 'var(--border)' }} />
          <div className="text-center">
            <div className="text-3xl font-bold stat-num">2,847</div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>picks graded this month</div>
          </div>
          <div className="w-px h-10 hidden sm:block" style={{ background: 'var(--border)' }} />
          <div className="text-center">
            <div className="text-3xl font-bold stat-num">57.4%</div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>avg hit rate (verified sellers)</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => document.getElementById('picks-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <TrendingUp size={16} />
            Browse picks
          </button>
          <button
            onClick={() => setShowOnboarding(true)}
            className="btn-ghost px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
            style={{ color: 'var(--text)' }}
          >
            <Shield size={16} />
            Become a seller
          </button>
        </div>
      </div>

      {/* First pick free banner */}
      <div className="rounded-xl p-4 mb-8 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(59,130,246,0.08))', border: '1px solid rgba(34,197,94,0.25)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
          <Gift size={20} style={{ color: '#04130a' }} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>🎁 First pick is free — no credit card needed</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Try any insured pick on us. If it loses, you get 100% back.</div>
        </div>
        <a href="/auth/signup" className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold flex-shrink-0">Claim offer</a>
      </div>

      {/* Live activity ticker */}
      <div className="overflow-hidden rounded-xl mb-8" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
          <div className="live-dot" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>Live activity</span>
        </div>
        <div className="py-2 overflow-hidden">
          <div className="ticker-track flex gap-8 whitespace-nowrap px-4">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <div key={i} className="inline-flex items-center gap-2 text-xs flex-shrink-0">
                <span className="font-semibold" style={{ color: 'var(--text)' }}>{item.seller}</span>
                <span style={{ color: 'var(--muted)' }}>{item.pick}</span>
                <span style={{ color: item.result.includes('HIT') ? '#4ade80' : 'var(--accent)' }}>
                  {item.result}
                </span>
                <span className="text-zinc-600">·</span>
                <span style={{ color: 'var(--muted)' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto scroll-hide pb-1">
          {SPORT_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn-ghost px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filter === f ? 'filter-active' : ''}`}
              style={{ color: filter === f ? '#04130a' : 'var(--text)' }}
            >
              {f === 'Following' && (
                <span className="nav-count mr-1">{following.size}</span>
              )}
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="roi">Best ROI</option>
            <option value="buyers">Most Buyers</option>
          </select>
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="accent-bar" />
        <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Active picks</h2>
        <span className="nav-count">{sortedPicks.length}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="live-dot live-dot-green" />
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Updates live</span>
        </div>
      </div>

      {/* Picks grid */}
      {sortedPicks.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>No picks match your filters</p>
          <p className="text-sm mt-1 mb-4" style={{ color: 'var(--muted)' }}>Try adjusting your filters or check back later</p>
          <button onClick={() => setFilter('All')} className="btn-primary px-6 py-2.5 rounded-lg text-sm font-semibold">
            Show all picks
          </button>
        </div>
      ) : (
        <div id="picks-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-14">
          {sortedPicks.map(pick => (
            <PickCard
              key={pick.id}
              pick={pick as PickCardData}
              isBookmarked={bookmarks.has(pick.id)}
              onBookmarkToggle={toggleBookmark}
              onUnlock={setBuyPick}
            />
          ))}
        </div>
      )}

      {/* Top sellers section */}
      <div className="flex items-center gap-2 mb-5">
        <span className="accent-bar" />
        <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Top sellers</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {SEED_SELLERS.slice(0, 4).map(seller => (
          <SellerCard
            key={seller.handle}
            seller={seller}
            isFollowing={following.has(seller.handle)}
            onFollowToggle={toggleFollow}
          />
        ))}
      </div>

      {/* How it works teaser */}
      <div className="rounded-2xl p-8 text-center mb-8" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.05))', border: '1px solid rgba(34,197,94,0.2)' }}>
        <div className="text-3xl mb-3">🛡️</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>How Pick Protection works</h3>
        <p className="text-sm max-w-md mx-auto mb-4" style={{ color: 'var(--muted)' }}>
          Toggle Pick Protection at checkout. If your pick loses, the price is refunded to your balance instantly — funded by a marketplace-wide protection pool.
        </p>
        <a href="/how" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2">
          <Zap size={14} />Learn more
        </a>
      </div>

      {/* Modals */}
      <BuyModal pick={buyPick} onClose={() => setBuyPick(null)} />
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </div>
  )
}
