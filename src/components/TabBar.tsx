'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, CalendarDays, BookOpen, Wallet, LayoutGrid } from 'lucide-react'

const TABS = [
  { href: '/',          label: 'Home',    icon: Home },
  { href: '/itinerary', label: 'Plan',    icon: CalendarDays },
  { href: '/journal',   label: 'Journal', icon: BookOpen },
  { href: '/budget',    label: 'Budget',  icon: Wallet },
  { href: '/more',      label: 'More',    icon: LayoutGrid },
]

// Routes that live under the "More" hub light up the More tab.
const MORE_ROUTES = ['/more', '/gallery', '/stays', '/treks', '/transport', '/food', '/events', '/shop', '/flights', '/prep', '/diary', '/contribute', '/admin']

export function TabBar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/more') return MORE_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map(tab => {
          const active = isActive(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors',
                active ? 'text-flag-red' : 'text-muted hover:text-cream'
              )}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
              <span className={cn('text-[11px]', active ? 'font-bold' : 'font-medium')}>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
