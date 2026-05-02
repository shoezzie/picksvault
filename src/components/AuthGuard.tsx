'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
      } else {
        setAuthed(true)
      }
      setLoading(false)
    })
  }, [pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent mx-auto mb-4 animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
        </div>
      </div>
    )
  }

  if (!authed) return null
  return <>{children}</>
}
