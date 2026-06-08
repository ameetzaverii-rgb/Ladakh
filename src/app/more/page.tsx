import { FLAG, type FlagColor } from '@/lib/utils'
import { getCategoryImage } from '@/lib/imagery'
import { PhotoTile } from '@/components/Photo'
import {
  CalendarDays, PartyPopper, Mountain, Wallet, BedDouble, UtensilsCrossed,
  Car, ShoppingBag, Plane, BookOpen, NotebookPen, ListChecks, UserPlus, Settings, Images,
  ShieldAlert, type LucideIcon,
} from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Everything · Leh Ladakh' }

type Item = { href: string; label: string; icon: LucideIcon; color: FlagColor; img?: string }

const ITEMS: Item[] = [
  { href: '/gallery', label: 'Places', icon: Images, color: 'blue', img: 'gallery' },
  { href: '/emergency', label: 'Emergency', icon: ShieldAlert, color: 'red' },
  { href: '/itinerary', label: 'Itinerary', icon: CalendarDays, color: 'blue', img: 'itinerary' },
  { href: '/events', label: 'Festivals', icon: PartyPopper, color: 'red', img: 'events' },
  { href: '/treks', label: 'Treks', icon: Mountain, color: 'green', img: 'treks' },
  { href: '/budget', label: 'Budget', icon: Wallet, color: 'yellow', img: 'budget' },
  { href: '/stays', label: 'Stays', icon: BedDouble, color: 'blue', img: 'stays' },
  { href: '/food', label: 'Food', icon: UtensilsCrossed, color: 'red', img: 'food' },
  { href: '/transport', label: 'Transport', icon: Car, color: 'blue', img: 'transport' },
  { href: '/shop', label: 'Shop', icon: ShoppingBag, color: 'yellow', img: 'shop' },
  { href: '/flights', label: 'Flights', icon: Plane, color: 'blue', img: 'flights' },
  { href: '/journal', label: 'Journal', icon: BookOpen, color: 'ink', img: 'journal' },
  { href: '/diary', label: 'Diary', icon: NotebookPen, color: 'ink', img: 'diary' },
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

export default async function MorePage() {
  const srcs = await Promise.all(
    ITEMS.map(it => (it.img ? getCategoryImage(it.img) : Promise.resolve(null)))
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {ITEMS.map((item, i) => (
          <PhotoTile
            key={item.href}
            href={item.href}
            src={srcs[i]?.src ?? null}
            color={item.color}
            icon={item.icon}
            title={item.label}
            heightClass="h-28"
          />
        ))}
      </div>
    </div>
  )
}
