'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/',           label: 'Dashboard',  short: 'Home' },
  { href: '/prep',       label: 'Prep List',  short: 'Prep' },
  { href: '/itinerary',  label: 'Itinerary',  short: 'Plan' },
  { href: '/journal',    label: 'Journal',    short: 'Log' },
  { href: '/budget',     label: 'Budget',     short: '₹' },
  { href: '/stays',      label: 'Stays',      short: 'Stay' },
  { href: '/treks',      label: 'Treks',      short: 'Trek' },
  { href: '/transport',  label: 'Transport',  short: 'Taxi' },
  { href: '/food',       label: 'Food',       short: 'Eat' },
  { href: '/events',     label: 'Festivals',  short: 'Fest' },
  { href: '/flights',    label: 'Flights',    short: '✈' },
  { href: '/admin',      label: 'Admin',      short: 'ADM' },
]

export function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-md border-b border-gold-dim">
      {/* Desktop */}
      <div className="hidden md:flex items-center overflow-x-auto scrollbar-none px-2">
        <Link href="/" className="shrink-0 px-3 py-3.5 font-serif text-gold text-sm font-semibold tracking-wider mr-2">
          LEH
        </Link>
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'shrink-0 px-3 py-3.5 font-mono text-[0.6rem] tracking-widest uppercase whitespace-nowrap border-b-2 transition-all duration-200',
              pathname === item.href
                ? 'text-gold border-gold'
                : 'text-stone border-transparent hover:text-gold hover:border-gold/40'
            )}
          >
            {item.label}
          </Link>
        ))}
        <div className="ml-auto shrink-0 px-3 py-3 label-mono text-xs opacity-40">
          ⌘K
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center justify-between px-4 py-3">
        <Link href="/" className="font-serif text-gold text-base font-semibold tracking-wider">
          Leh Ladakh
        </Link>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="text-stone hover:text-gold transition-colors p-1"
          aria-label="Toggle menu"
        >
          <div className="space-y-1">
            <span className={cn('block h-px w-5 bg-current transition-transform', menuOpen && 'rotate-45 translate-y-1.5')} />
            <span className={cn('block h-px w-5 bg-current transition-opacity', menuOpen && 'opacity-0')} />
            <span className={cn('block h-px w-5 bg-current transition-transform', menuOpen && '-rotate-45 -translate-y-1.5')} />
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-deep border-t border-gold-dim grid grid-cols-4 gap-px p-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'text-center py-2.5 font-mono text-[0.55rem] tracking-wider uppercase rounded transition-all',
                pathname === item.href
                  ? 'text-gold bg-gold/10'
                  : 'text-stone hover:text-gold'
              )}
            >
              {item.short}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
