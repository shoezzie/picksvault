'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (signupError) {
      setError(signupError.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">📬</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Check your email</h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <Link href="/" className="btn-primary mt-6 px-6 py-3 rounded-xl text-sm font-semibold inline-block">Back to marketplace</Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
          <UserPlus size={28} style={{ color: '#04130a' }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Create account</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Join PicksVault — free to browse & buy</p>
      </div>

      <div className="card rounded-2xl p-6">
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--muted)' }}>Username</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="yourhandle" className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm" />
            </div>
          </div>
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
            {loading ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" /> : <><UserPlus size={16} />Create Account</>}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link href={`/auth/login?redirect=${redirect}`} className="font-semibold" style={{ color: 'var(--accent)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <Suspense fallback={<div className="w-full max-w-sm h-80 skeleton-bar rounded-2xl" />}>
        <SignupForm />
      </Suspense>
    </div>
  )
}
