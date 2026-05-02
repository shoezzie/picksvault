import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'PicksVault — Sports Picks Marketplace',
  description: 'Stake-backed sports picks. Sellers put their own money on the line. Buyers get auto-refunded if the pick loses.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">
        <Nav />
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  )
}
