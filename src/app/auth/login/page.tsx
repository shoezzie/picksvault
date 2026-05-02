'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(redirect)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
          <LogIn size={28} style={{ color: '#04130a' }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Welcome back</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Sign in to your PicksVault account</p>
      </div>

      <div className="card rounded-2xl p-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="p-3 rounded-lg text-xs text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>{error}</div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" /> : <><LogIn size={16} />Sign In</>}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href={`/auth/signup?redirect=${redirect}`} className="font-semibold" style={{ color: 'var(--accent)' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <Suspense fallback={<div className="w-full max-w-sm h-64 skeleton-bar rounded-2xl" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
