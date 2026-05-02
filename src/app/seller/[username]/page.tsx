'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle2, UserPlus, UserCheck, BarChart2, Clock, Star, TrendingUp } from 'lucide-react'
import PickCard from '@/components/PickCard'
import BuyModal from '@/components/BuyModal'
import { SEED_PICKS, SEED_SELLERS } from '@/lib/seed-data'
import type { PickCardData } from '@/components/PickCard'

const TABS = ['Active picks', 'History', 'Performance', 'Reviews']

export default function SellerProfilePage() {
  const params = useParams()
  const username = params.username as string
  const handle = `@${username}`
  const seller = SEED_SELLERS.find(s => s.handle === handle) ?? SEED_SELLERS[0]
  const sellerPicks = SEED_PICKS.filter(p => p.seller === seller.handle)

  const [tab, setTab] = useState('Active picks')
  const [following, setFollowing] = useState(false)
  const [buyPick, setBuyPick] = useState<PickCardData | null>(null)
  const [bookmarks, setBookmarks] = useState<Set<number | string>>(new Set())

  const perfBars = [
    { month: 'Dec', hits: 12, total: 18 },
    { month: 'Jan', hits: 15, total: 22 },
    { month: 'Feb', hits: 8, total: 14 },
    { month: 'Mar', hits: 19, total: 28 },
    { month: 'Apr', hits: 11, total: 16 },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Profile hero */}
      <div className="profile-hero mb-6">
        <div className={`profile-banner gradient-${sellerPicks[0]?.sportKey ?? 'mlb'}`} />
        <div className="profile-body">
          <div className="profile-avatar">{seller.avatar}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{seller.name}</h1>
              {seller.verified && <CheckCircle2 size={18} style={{ color: 'var(--accent)' }} />}
            </div>
            <div className="text-sm" style={{ color: 'var(--muted)' }}>{seller.handle}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>{seller.badge}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{seller.sport} · {seller.followers?.toLocaleString()} followers</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFollowing(!following)}
              className={`follow-btn px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 ${following ? 'active' : ''}`}
            >
              {following ? <UserCheck size={14} /> : <UserPlus size={14} />}
              {following ? 'Following' : 'Follow'}
            </button>
            <button className="btn-ghost px-4 py-2 rounded-lg text-sm font-medium" style={{ color: 'var(--text)' }}>
              Subscribe
            </button>
          </div>
        </div>
        <div className="profile-stats">
          {[
            { label: 'ROI', value: seller.roi, color: 'var(--accent)' },
            { label: 'Hit Rate', value: seller.hit, color: 'var(--text)' },
            { label: 'Units', value: seller.units, color: 'var(--text)' },
            { label: 'Picks', value: `${seller.picks}`, color: 'var(--text)' },
            { label: 'Followers', value: `${(seller.followers ?? 0).toLocaleString()}`, color: 'var(--text)' },
          ].map(stat => (
            <div key={stat.label} className="profile-stat">
              <div className="stat-num text-xl" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[10px] uppercase tracking-wide mt-1" style={{ color: 'var(--muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b mb-6 overflow-x-auto scroll-hide" style={{ borderColor: 'var(--border)' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all ${tab === t ? 'tab-active' : 'tab-inactive'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'Active picks' && (
        <div>
          {sellerPicks.length === 0 ? (
            <div className="text-center py-16">
              <Star size={32} className="mx-auto mb-3 opacity-20" />
              <p style={{ color: 'var(--muted)' }}>No active picks right now</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sellerPicks.map(pick => (
                <PickCard
                  key={pick.id}
                  pick={pick as PickCardData}
                  isBookmarked={bookmarks.has(pick.id)}
                  onBookmarkToggle={(id) => {
                    setBookmarks(prev => {
                      const next = new Set(prev)
                      if (next.has(id)) next.delete(id)
                      else next.add(id)
                      return next
                    })
                  }}
                  onUnlock={setBuyPick}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'History' && (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="ap-card">
              <div>
                <div className="ap-label">Pick</div>
                <div className="ap-val text-sm">MLB Hitter Prop</div>
              </div>
              <div>
                <div className="ap-label">Game</div>
                <div className="ap-val text-sm">NYY vs BOS</div>
              </div>
              <div>
                <div className="ap-label">Price</div>
                <div className="ap-val">${5 + i}</div>
              </div>
              <div>
                <div className="ap-label">Buyers</div>
                <div className="ap-val">{10 + i * 4}</div>
              </div>
              <div>
                <div className="ap-label">Result</div>
                <div className={`ap-val text-xs font-bold ${i % 3 !== 1 ? 'text-green-400' : 'text-red-400'}`}>
                  {i % 3 !== 1 ? '✓ HIT' : '✗ MISS'}
                </div>
              </div>
              <div>
                <div className="ap-label">Date</div>
                <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{i + 1}d ago</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Performance' && (
        <div className="card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 size={16} style={{ color: 'var(--accent)' }} />
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Monthly performance</h3>
          </div>
          <div className="flex items-end gap-3 h-40">
            {perfBars.map(bar => {
              const hitPct = (bar.hits / bar.total) * 100
              return (
                <div key={bar.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>{Math.round(hitPct)}%</div>
                  <div className="w-full rounded-t-lg" style={{ height: `${hitPct}%`, minHeight: 8, background: `linear-gradient(180deg, #22c55e, #16a34a)`, boxShadow: '0 0 12px rgba(34,197,94,0.4)' }} />
                  <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{bar.month}</div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-6 mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div>
              <div className="stat-num text-xl" style={{ color: 'var(--accent)' }}>{seller.roi}</div>
              <div className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>Total ROI</div>
            </div>
            <div>
              <div className="stat-num text-xl">{seller.hit}</div>
              <div className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>Avg hit rate</div>
            </div>
            <div>
              <div className="stat-num text-xl">{seller.units}</div>
              <div className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>Units won</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Reviews' && (
        <div className="space-y-4">
          {[
            { user: 'John M.', rating: 5, text: 'Incredible hit rate on MLB props. Been following for 3 months and easily profitable.', time: '2 days ago' },
            { user: 'Sarah K.', rating: 4, text: 'Very transparent with reasoning. Lost one pick but got the auto-refund which was seamless.', time: '1 week ago' },
            { user: 'Mike R.', rating: 5, text: 'Best MLB hitter prop analyst I\'ve found. The stake backing builds real trust.', time: '2 weeks ago' },
          ].map((review, i) => (
            <div key={i} className="card rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg, #22c55e, #3b82f6)', color: '#04130a' }}>
                    {review.user[0]}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{review.user}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(review.rating)].map((_, j) => <Star key={j} size={12} style={{ color: '#fde047', fill: '#fde047' }} />)}
                  <span className="text-xs ml-1" style={{ color: 'var(--muted)' }}>{review.time}</span>
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{review.text}</p>
            </div>
          ))}
        </div>
      )}

      <BuyModal pick={buyPick} onClose={() => setBuyPick(null)} />
    </div>
  )
}
