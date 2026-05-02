import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'PicksVault — Sports Picks Marketplace',
  description: 'Sports picks with optional Pick Protection — auto-refund to your balance if the pick doesn\'t hit.',
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
