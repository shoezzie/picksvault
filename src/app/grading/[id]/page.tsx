import GradingView from '@/components/GradingView'
import { Activity } from 'lucide-react'

export default function GradingPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Activity size={18} style={{ color: 'var(--accent)' }} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--accent)' }}>Live tracking</span>
      </div>
      <GradingView pickId={params.id} />
    </div>
  )
}
