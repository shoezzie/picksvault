'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  BarChart2, Bookmark, Trophy, Activity, HelpCircle,
  Sun, Moon, LogOut, LayoutDashboard, ChevronDown,
  ShoppingBag, Wallet, Plus, Receipt
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import DepositModal from './DepositModal'

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [depositOpen, setDepositOpen] = useState(false)
  const supabase = createClient()

  const refreshBalance = async () => {
    try {
      const r = await fetch('/api/balance')
      if (r.ok) {
        const d = await r.json()
        setBalance(typeof d.available === 'number' ? d.available : null)
      }
    } catch {}
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) refreshBalance()
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null)
      if (session?.user) refreshBalance()
      else setBalance(null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // Refresh balance whenever route changes (after a purchase, refund, etc.)
  useEffect(() => { if (user) refreshBalance() }, [pathname, user])

  useEffect(() => {
    // Default to dark; respect saved preference if present
    const saved = (localStorage.getItem('theme') as 'dark' | 'light' | null) ?? 'dark'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navLinks = [
    { href: '/', label: 'Marketplace', icon: <ShoppingBag size={14} /> },
    { href: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={14} /> },
    { href: '/my-picks', label: 'My Picks', icon: <BarChart2 size={14} /> },
    { href: '/bookmarks', label: 'Bookmarks', icon: <Bookmark size={14} /> },
    { href: '/grading/1', label: 'Live Grading', icon: <Activity size={14} /> },
    { href: '/how', label: 'How it Works', icon: <HelpCircle size={14} /> },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav
      className="border-b sticky top-0 z-40 backdrop-blur"
      style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(7,8,10,0.92)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <svg viewBox="0 0 40 40" className="w-8 h-8">
            <defs>
              <linearGradient id="pv-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <radialGradient id="pv-inner" cx="0.5" cy="0.4" r="0.6">
                <stop offset="0%" stopColor="#062b14" />
                <stop offset="100%" stopColor="#020a05" />
              </radialGradient>
            </defs>
            <circle cx="20" cy="20" r="18.5" fill="url(#pv-grad)" />
            <circle cx="20" cy="20" r="18.5" fill="none" stroke="#86efac" strokeWidth="0.6" opacity="0.5" />
            <g stroke="#04130a" strokeWidth="1.2" strokeLinecap="round">
              <line x1="20" y1="2.5" x2="20" y2="5.5" />
              <line x1="20" y1="34.5" x2="20" y2="37.5" />
              <line x1="2.5" y1="20" x2="5.5" y2="20" />
              <line x1="34.5" y1="20" x2="37.5" y2="20" />
            </g>
            <circle cx="20" cy="20" r="13" fill="url(#pv-inner)" stroke="#16a34a" strokeWidth="0.6" />
            <g stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
              <line x1="20" y1="9" x2="20" y2="13" />
              <line x1="20" y1="27" x2="20" y2="31" />
              <line x1="9" y1="20" x2="13" y2="20" />
              <line x1="27" y1="20" x2="31" y2="20" />
            </g>
            <circle cx="20" cy="20" r="4.2" fill="#04130a" stroke="#4ade80" strokeWidth="0.8" />
            <circle cx="20" cy="20" r="1.8" fill="#22c55e" />
            <path d="M 6 10 A 18 18 0 0 1 24 4" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          </svg>
          <span className="font-bold text-[15px] tracking-tight text-white">
            Picks<span style={{ color: 'var(--accent)' }}>Vault</span>
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <div className="hidden lg:flex items-center gap-0.5 flex-1">
          {navLinks.map(link => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link text-sm whitespace-nowrap"
                style={{
                  color: active ? '#ffffff' : '#71717a',
                  fontWeight: active ? 600 : 400,
                  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                  borderRadius: 0,
                  paddingBottom: '0px',
                  paddingTop: '0px',
                  height: '56px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {link.icon}
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="lg:hidden w-9 h-9 rounded-lg border flex items-center justify-center text-base transition-colors hover:bg-white/10 flex-shrink-0"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'rgba(255,255,255,0.02)' }}
            aria-label="Open menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
          <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {user ? (
            <>
              {/* Balance pill */}
              <button
                onClick={() => setDepositOpen(true)}
                className="hidden sm:flex items-center gap-1.5 rounded-lg pl-2.5 pr-1.5 py-1.5 text-sm font-medium transition-all whitespace-nowrap"
                style={{
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  color: '#ffffff',
                }}
                title="Deposit funds"
              >
                <Wallet size={13} style={{ color: 'var(--accent)' }} />
                <span className="stat-num text-sm">${balance == null ? '—' : balance.toFixed(2)}</span>
                <span className="rounded w-5 h-5 flex items-center justify-center ml-0.5" style={{ background: 'var(--accent)', color: '#04130a' }}>
                  <Plus size={11} strokeWidth={3} />
                </span>
              </button>

              {/* Dashboard link */}
              <Link
                href="/dashboard"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.14)' }}
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-white/10"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg,#22c55e,#3b82f6)', color: '#04130a' }}
                  >
                    {user.email?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-sm hidden sm:block max-w-[96px] truncate text-white">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={12} style={{ color: 'var(--muted)' }} />
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl py-1 shadow-2xl z-50"
                    style={{ background: '#0d0e12', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Link href="/my-picks" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors text-white" onClick={() => setMenuOpen(false)}>
                      <BarChart2 size={14} /> My Picks
                    </Link>
                    <Link href="/bookmarks" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors text-white" onClick={() => setMenuOpen(false)}>
                      <Bookmark size={14} /> Bookmarks
                    </Link>
                    <Link href="/transactions" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors text-white" onClick={() => setMenuOpen(false)}>
                      <Receipt size={14} /> Transactions
                    </Link>
                    <div className="my-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
                    <button onClick={signOut} className="flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-white/5 transition-colors text-red-400">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.14)' }}
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="btn-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="lg:hidden"
          style={{ background: '#0d0e12', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map(link => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link text-sm py-2.5"
                  style={{
                    color: active ? '#ffffff' : '#71717a',
                    fontWeight: active ? 600 : 400,
                    borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                    borderRadius: 6,
                    paddingLeft: 12,
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              )
            })}
            {!user && (
              <div className="flex gap-2 pt-2 mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <Link
                  href="/auth/login"
                  className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium text-white transition-colors hover:bg-white/10"
                  style={{ border: '1px solid rgba(255,255,255,0.14)' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-primary flex-1 text-center py-2.5 rounded-lg text-sm font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {depositOpen && (
        <DepositModal
          currentBalance={balance ?? 0}
          onClose={() => setDepositOpen(false)}
          onSuccess={(newBal) => { setBalance(newBal); setDepositOpen(false) }}
        />
      )}
    </nav>
  )
}
