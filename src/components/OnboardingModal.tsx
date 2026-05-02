'use client'

import { useState } from 'react'
import { X, ShieldCheck, Building, DollarSign, BarChart2, ChevronRight } from 'lucide-react'

const STEPS = [
  {
    num: 1,
    title: 'Verify Identity',
    desc: 'Provide government ID so buyers know you\'re a real person with skin in the game.',
    icon: ShieldCheck,
    cta: 'Start Verification',
    color: '#22c55e',
  },
  {
    num: 2,
    title: 'Connect Bank',
    desc: 'Link your bank account via Stripe Connect to receive earnings when your picks win.',
    icon: Building,
    cta: 'Connect with Stripe',
    color: '#3b82f6',
  },
  {
    num: 3,
    title: 'Fund Stake',
    desc: 'Deposit a minimum $100 stake. This is your skin in the game — it gets slashed if picks lose.',
    icon: DollarSign,
    cta: 'Fund $100 Stake',
    color: '#f59e0b',
  },
  {
    num: 4,
    title: 'Build Your Record',
    desc: 'Post your first 10 picks for free. After that, your track record speaks for itself.',
    icon: BarChart2,
    cta: 'Start Posting',
    color: '#a855f7',
  },
]

export default function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const Icon = current.icon

  return (
    <div className="fixed inset-0 z-50 modal-bg flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="card rounded-xl p-6 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4" style={{ color: 'var(--muted)' }}>
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="text-[11px] uppercase tracking-[0.18em] mb-2 font-semibold" style={{ color: 'var(--accent)' }}>Become a Seller</div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Seller Onboarding</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>4 steps to start selling stake-backed picks</p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{ background: i <= step ? 'var(--accent)' : 'rgba(255,255,255,0.08)' }}
            />
          ))}
        </div>

        {/* Current step */}
        <div className="text-center mb-6">
          <div
            className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-4"
            style={{ background: `${current.color}18`, border: `1px solid ${current.color}40` }}
          >
            <Icon size={36} style={{ color: current.color }} />
          </div>
          <div className="text-[11px] font-mono mb-2" style={{ color: 'var(--muted)' }}>Step {current.num} of 4</div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>{current.title}</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{current.desc}</p>
        </div>

        {/* All steps list */}
        <div className="space-y-2 mb-6">
          {STEPS.map((s, i) => {
            const StepIcon = s.icon
            const done = i < step
            const active = i === step
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{
                  background: active ? `${s.color}10` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active ? s.color + '35' : 'var(--border)'}`,
                  opacity: i > step ? 0.5 : 1,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: done ? 'rgba(34,197,94,0.15)' : `${s.color}15`, border: `1px solid ${done ? 'rgba(34,197,94,0.4)' : s.color + '30'}` }}
                >
                  {done ? <span className="text-green-400 text-xs font-bold">✓</span> : <StepIcon size={14} style={{ color: s.color }} />}
                </div>
                <span className="text-sm font-medium" style={{ color: active ? 'var(--text)' : 'var(--muted)' }}>{s.title}</span>
                {active && <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide" style={{ color: s.color }}>Current</span>}
              </div>
            )
          })}
        </div>

        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="btn-ghost px-4 py-3 rounded-md text-sm">Back</button>
          )}
          <button
            onClick={() => step < 3 ? setStep(step + 1) : onClose()}
            className="btn-primary flex-1 py-3 rounded-md flex items-center justify-center gap-2 text-sm font-semibold"
          >
            {current.cta}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
