import { HelpCircle, ShoppingBag, Lock, Activity, RotateCcw, AlertTriangle, Clock, RefreshCw, ShieldOff, Zap } from 'lucide-react'

const STEPS = [
  {
    num: 1,
    title: 'Seller stakes real money',
    desc: 'Every insured pick requires the seller to lock a stake in escrow via Stripe. If they don\'t put up money, they can\'t post an insured pick. Skin in the game is mandatory.',
    icon: Lock,
    color: '#22c55e',
    detail: 'Minimum $50 stake per pick. The stake ratio must be at least 5× the pick price.',
  },
  {
    num: 2,
    title: 'You unlock the full pick',
    desc: 'Pay once to see the full reasoning, best book, recommended odds, and recommended stake size. The encrypted pick is revealed instantly after payment clears.',
    icon: ShoppingBag,
    color: '#3b82f6',
    detail: 'Payment held in escrow until game settles. Powered by Stripe.',
  },
  {
    num: 3,
    title: 'We grade it live',
    desc: 'Our auto-grade engine polls live box scores and official APIs. The moment the game ends, the pick is graded automatically — no manual intervention, no disputes.',
    icon: Activity,
    color: '#a855f7',
    detail: 'Data sourced from MLB Statcast, NBA Stats API, NFL Next Gen Stats, and NHL Edge.',
  },
  {
    num: 4,
    title: 'Auto-refund if it loses',
    desc: 'If the pick loses, 95% of your purchase price is automatically refunded within 1 hour. The remaining 5% covers platform fees. No forms, no waiting, no arguing.',
    icon: RotateCcw,
    color: '#f59e0b',
    detail: '5% fee covers payment processing and platform operations.',
  },
]

const EDGE_CASES = [
  { icon: '⏰', title: 'Game postponed', desc: 'Full refund issued automatically. No fees.' },
  { icon: '🤕', title: 'Player scratched before game', desc: 'Void pick. Full refund, same day.' },
  { icon: '🌧️', title: 'Rain delay / suspended game', desc: 'If game doesn\'t complete, void + refund.' },
  { icon: '⚡', title: 'Tie / push result', desc: 'Depends on pick type. Most pushes = full refund.' },
  { icon: '🔧', title: 'Data error in grading', desc: 'Manual review within 24h. Buyer always gets benefit of doubt.' },
  { icon: '💸', title: 'Seller balance goes negative', desc: 'Seller account frozen. Refunds processed from reserve.' },
]

export default function HowPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Hero */}
      <div className="section-hero mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <HelpCircle size={20} style={{ color: 'var(--accent)' }} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--accent)' }}>Explained</span>
        </div>
        <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text)' }}>How PicksVault works</h1>
        <p className="text-base max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
          A marketplace where sellers must put their own money on the line.
          If the pick loses, you get most of your money back. Automatically.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-12">
        {STEPS.map(step => (
          <div key={step.num} className="step-card">
            <div className="step-num">{step.num}</div>
            <div className="flex-1">
              <h3 className="font-bold text-base mb-1.5" style={{ color: 'var(--text)' }}>{step.title}</h3>
              <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--muted)' }}>{step.desc}</p>
              <div className="text-[11px] font-mono px-2 py-1 rounded inline-block" style={{ background: `${step.color}12`, color: step.color, border: `1px solid ${step.color}30` }}>
                {step.detail}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Why this works */}
      <div className="card rounded-2xl p-8 mb-10 text-center" style={{ borderColor: 'rgba(34,197,94,0.25)' }}>
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>Why this works</h2>
        <p className="text-sm leading-relaxed max-w-lg mx-auto mb-6" style={{ color: 'var(--muted)' }}>
          Traditional picks services have no accountability — they can cherry-pick results, hide losses, and sell snake oil. PicksVault flips the model: every pick has real money behind it. Bad picks cost sellers real money. Good sellers build real track records on-chain.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {[
            { icon: '🎯', title: 'Aligned incentives', desc: 'Sellers only make money if picks win. Bad picks hurt their wallet.' },
            { icon: '📊', title: 'Verifiable records', desc: 'All pick results are on-chain and publicly auditable.' },
            { icon: '🛡️', title: 'Buyer protection', desc: 'You\'re never fully exposed. Auto-refunds are instant and automatic.' },
          ].map(item => (
            <div key={item.title} className="p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{item.title}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edge cases */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-5">
          <span className="accent-bar" />
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Edge cases & policies</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EDGE_CASES.map(ec => (
            <div key={ec.title} className="edge-card flex items-start gap-3">
              <div className="edge-icon flex-shrink-0">
                <span className="text-lg">{ec.icon}</span>
              </div>
              <div>
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>{ec.title}</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{ec.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-8">
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Ready to try it?</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>First pick is free. No credit card needed.</p>
        <a href="/" className="btn-primary px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
          <Zap size={16} />Browse picks
        </a>
      </div>
    </div>
  )
}
