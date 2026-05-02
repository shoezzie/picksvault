'use client'

import { useState, useEffect } from 'react'
import { Activity, Lock, CheckCircle2, XCircle, Timer, Zap } from 'lucide-react'

const AT_BAT_LOG = [
  { time: '6th Inn', event: 'Judge grounds out to SS', impact: 'neutral', tb: 0 },
  { time: '4th Inn', event: 'Judge singles to RF · 1 TB', impact: 'positive', tb: 1 },
  { time: '2nd Inn', event: 'Judge strikes out swinging', impact: 'neutral', tb: 0 },
  { time: '1st Inn', event: 'Judge walks', impact: 'neutral', tb: 0 },
]

export default function GradingView({ pickId }: { pickId: string }) {
  const [currentTB, setCurrentTB] = useState(1)
  const [targetTB] = useState(1.5)
  const [inning, setInning] = useState('6th Inning')
  const [score] = useState('NYY 3 - BOS 2')
  const progress = Math.min((currentTB / targetTB) * 100, 100)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTB(prev => Math.min(prev + 0.1, 3))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const isHit = currentTB >= targetTB

  return (
    <div className="space-y-6">
      {/* Grading hero */}
      <div className="grading-hero">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="live-dot" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--accent)' }}>Live grading</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Aaron Judge O1.5 Total Bases</h1>
            <div className="text-sm text-white/60">NYY vs BOS · {inning} · {score}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Current TBs</div>
            <div className="text-4xl font-bold font-mono" style={{ color: currentTB >= targetTB ? '#22c55e' : 'white' }}>
              {currentTB.toFixed(1)}
            </div>
            <div className="text-sm text-white/60">Target: {targetTB}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-white/50 mb-1.5">
            <span>Progress to target</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${progress}%`,
                background: isHit ? 'linear-gradient(90deg, #16a34a, #22c55e, #4ade80)' : 'linear-gradient(90deg, #1e40af, #3b82f6)',
                boxShadow: isHit ? '0 0 16px rgba(34,197,94,0.6)' : 'none',
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          {isHit ? (
            <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#4ade80' }}>
              <CheckCircle2 size={16} />Pick is currently HIT
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-300">
              <Timer size={16} />Needs {(targetTB - currentTB).toFixed(1)} more total bases
            </span>
          )}
        </div>
      </div>

      {/* Pick details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Activity size={15} style={{ color: 'var(--accent)' }} />
            Auto-Grade Engine
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted)' }}>Pick</span>
              <span className="font-semibold" style={{ color: 'var(--text)' }}>Judge O1.5 TB</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted)' }}>Current TBs</span>
              <span className="stat-num" style={{ color: 'var(--text)' }}>{currentTB.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted)' }}>Target</span>
              <span className="stat-num" style={{ color: 'var(--text)' }}>{targetTB}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted)' }}>Status</span>
              <span className={`font-semibold ${isHit ? 'text-green-400' : 'text-blue-400'}`}>
                {isHit ? '✓ HIT' : '⏳ PENDING'}
              </span>
            </div>
            <hr style={{ borderColor: 'var(--border)' }} />
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted)' }}>Data source</span>
              <span className="text-xs" style={{ color: 'var(--text)' }}>MLB Statcast API</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted)' }}>Last update</span>
              <span className="text-xs font-mono" style={{ color: 'var(--text)' }}>Live</span>
            </div>
          </div>
        </div>

        <div className="card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Lock size={15} style={{ color: 'var(--accent)' }} />
            Stake Watcher
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted)' }}>Seller stake</span>
              <span className="stat-num" style={{ color: 'var(--accent)' }}>$120</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted)' }}>At risk</span>
              <span className="stat-num text-yellow-400">$120</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted)' }}>Buyers</span>
              <span className="stat-num" style={{ color: 'var(--text)' }}>38</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted)' }}>Total buyer spend</span>
              <span className="stat-num" style={{ color: 'var(--text)' }}>$190</span>
            </div>
            <hr style={{ borderColor: 'var(--border)' }} />
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted)' }}>If loses</span>
              <span className="text-xs font-semibold text-red-400">38 × 95% refunds = $180.50</span>
            </div>
          </div>
        </div>
      </div>

      {/* At-bat log */}
      <div className="card rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Zap size={15} style={{ color: 'var(--accent)' }} />
          At-Bat Log
        </h3>
        <div className="space-y-2">
          {AT_BAT_LOG.map((ab, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                background: ab.impact === 'positive' ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${ab.impact === 'positive' ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
              }}
            >
              <span className="text-[10px] font-mono w-16 flex-shrink-0" style={{ color: 'var(--muted)' }}>{ab.time}</span>
              <span className="flex-1 text-sm" style={{ color: 'var(--text)' }}>{ab.event}</span>
              {ab.tb > 0 && (
                <span className="text-xs font-mono font-semibold" style={{ color: 'var(--accent)' }}>+{ab.tb} TB</span>
              )}
            </div>
          ))}
          {/* Live at-bat indicator */}
          <div className="flex items-center gap-3 p-3 rounded-lg animate-pulse" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <span className="text-[10px] font-mono w-16 flex-shrink-0 text-blue-300">NOW</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="live-dot" style={{ background: '#3b82f6' }} />
                <span className="text-sm text-blue-300">Judge at bat, 1-2 count</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
