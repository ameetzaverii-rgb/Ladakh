import Link from 'next/link'
import { FLAG, FLAG_TINT, type FlagColor } from '@/lib/utils'
import {
  CalendarDays, PartyPopper, Mountain, Wallet, BedDouble, UtensilsCrossed,
  Car, ShoppingBag, Plane, BookOpen, NotebookPen, ListChecks, UserPlus, Settings,
  type LucideIcon,
} from 'lucide-react'

export const metadata = { title: 'Everything · Leh Ladakh' }

type Item = { href: string; label: string; icon: LucideIcon; color: FlagColor }

const ITEMS: Item[] = [
  { href: '/itinerary', label: 'Itinerary', icon: CalendarDays, color: 'blue' },
  { href: '/events', label: 'Festivals', icon: PartyPopper, color: 'red' },
  { href: '/treks', label: 'Treks', icon: Mountain, color: 'green' },
  { href: '/budget', label: 'Budget', icon: Wallet, color: 'yellow' },
  { href: '/stays', label: 'Stays', icon: BedDouble, color: 'blue' },
  { href: '/food', label: 'Food', icon: UtensilsCrossed, color: 'red' },
  { href: '/transport', label: 'Transport', icon: Car, color: 'blue' },
  { href: '/shop', label: 'Shop', icon: ShoppingBag, color: 'yellow' },
  { href: '/flights', label: 'Flights', icon: Plane, color: 'blue' },
  { href: '/journal', label: 'Journal', icon: BookOpen, color: 'ink' },
  { href: '/diary', label: 'Diary', icon: NotebookPen, color: 'ink' },
  { href: '/prep', label: 'Prep List', icon: ListChecks, color: 'blue' },
  { href: '/contribute', label: 'Collaborate', icon: UserPlus, color: 'yellow' },
  { href: '/admin', label: 'Admin', icon: Settings, color: 'ink' },
]

const LEGEND: { color: FlagColor; label: string }[] = [
  { color: 'blue', label: 'Plan' },
  { color: 'red', label: 'Culture' },
  { color: 'green', label: 'Treks' },
  { color: 'yellow', label: 'Money' },
  { color: 'ink', label: 'Journal' },
]

export default function MorePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="section-title mb-1">Everything</h1>
      <p className="mb-5 text-sm text-stone">Every part of your Ladakh workation, colour-coded.</p>

      {/* Colour legend */}
      <div className="mb-6 flex flex-wrap gap-x-4 gap-y-2 rounded-xl border border-border bg-white px-4 py-3">
        {LEGEND.map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded" style={{ background: FLAG[l.color] }} />
            <span className="text-xs font-medium text-stone">{l.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {ITEMS.map(item => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 rounded-2xl px-2 py-5 text-center transition-transform hover:-translate-y-0.5"
              style={{ background: FLAG_TINT[item.color] }}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: FLAG[item.color] }}
              >
                <Icon className="h-6 w-6 text-white" strokeWidth={2.2} />
              </span>
              <span className="text-xs font-bold text-cream">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
