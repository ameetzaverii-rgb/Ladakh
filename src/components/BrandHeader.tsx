'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TarchoLogo } from './Logo'
import { cn } from '@/lib/utils'

// The sign-in page shows its own large hero logo, so skip the header there.
const HIDE_ON = ['/signin']

// Common menus surfaced on wider screens (phones use the bottom tab bar).
const LINKS = [
  { href: '/itinerary', label: 'Plan' },
  { href: '/journal', label: 'Journal' },
  { href: '/budget', label: 'Budget' },
  { href: '/more', label: 'More' },
]

/** App-wide top bar: a prominent, left-aligned Tarcho mark (prayer-flag string
 *  above the wordmark) with common menus on the right for tablet/desktop. */
export function BrandHeader() {
  const pathname = usePathname()
  if (HIDE_ON.includes(pathname)) return null
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-dark/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2">
        <Link href="/" aria-label="Tarcho home" className="press shrink-0">
          <TarchoLogo size="md" layout="stacked" />
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          {LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors',
                isActive(l.href) ? 'bg-tint-red text-flag-red' : 'text-stone hover:bg-black/5 hover:text-cream',
              )}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
