import { HelpCircle, ShoppingBag, Shield, Activity, RotateCcw, Wallet, Zap } from 'lucide-react'

const STEPS = [
  {
    num: 1,
    title: 'Top up your PicksVault balance',
    desc: 'Deposit any amount into your account. Every pick you buy, every refund you get, every win you collect runs through that one balance. Withdraw to your bank anytime.',
    icon: Wallet,
    color: '#22c55e',
    detail: 'Test mode: deposit instantly. Production: card + ACH via Stripe.',
  },
  {
    num: 2,
    title: 'Buy a pick — add Pick Protection if you want it',
    desc: 'Every pick has an optional Pick Protection toggle. Pay a small premium and the full pick price is auto-refunded if it loses. Skip protection and you take the pick at face value, like any other tout.',
    icon: Shield,
    color: '#3b82f6',
    detail: 'Premium = 50% of pick price (e.g. $5 pick → $2.50 protection).',
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
    title: 'Refund hits your balance instantly',
    desc: 'If the pick loses and you opted into Pick Protection, the full pick price is back in your balance the moment grading completes. No tickets, no waiting on bank holds — it\'s instant inside PicksVault.',
    icon: RotateCcw,
    color: '#f59e0b',
    detail: 'Refunds funded by the protection pool — not by sellers.',
  },
]

const EDGE_CASES = [
  { icon: '⏰', title: 'Game postponed', desc: 'Full refund issued automatically — including any Pick Protection premium.' },
  { icon: '🤕', title: 'Player scratched before game', desc: 'Void pick. Full refund (price + premium) credited instantly.' },
  { icon: '🌧️', title: 'Rain delay / suspended game', desc: 'If game doesn\'t complete, the pick voids and you get a full refund.' },
  { icon: '⚡', title: 'Tie / push result', desc: 'Treated as a void. Pick price refunded; premium is kept for protected picks.' },
  { icon: '🔧', title: 'Data error in grading', desc: 'Manual review within 24h. Buyer always gets the benefit of the doubt.' },
  { icon: '🛡️', title: 'Protection pool runs low', desc: 'Premium pricing flexes up automatically to keep the pool solvent. Existing refunds always pay out.' },
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
          One PicksVault balance. Every pick comes with optional Pick Protection — opt in, get auto-refunded if the pick loses. No paperwork, no waiting.
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
        <div className="text-4xl mb-4">🛡️</div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>Why this works</h2>
        <p className="text-sm leading-relaxed max-w-lg mx-auto mb-6" style={{ color: 'var(--muted)' }}>
          Traditional picks services have zero accountability — cherry-picked results, hidden losses, no recourse. PicksVault gives you opt-in protection: every pick comes with the option to get refunded if it doesn\'t hit. The pool funds the refunds, not the seller — so you never have to trust a stranger\'s balance.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {[
            { icon: '🎯', title: 'Verified results', desc: 'Auto-graded by official box scores. Every pick result is recorded and public.' },
            { icon: '🛡️', title: 'Pick Protection', desc: 'Add it at checkout. Pick loses → instant refund. Pool-funded, never delayed.' },
            { icon: '⚡', title: 'Instant refunds', desc: 'No support tickets. Money lands in your balance the second the game settles.' },
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
