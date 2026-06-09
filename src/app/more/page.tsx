import { db } from '@/lib/db'
import { FLAG, type FlagColor } from '@/lib/utils'
import { getCategoryImageFor } from '@/lib/imagery'
import { getActiveContext } from '@/lib/destination'
import { authConfigured } from '@/lib/auth'
import { PhotoTile } from '@/components/Photo'
import { AccountButton } from '@/components/AccountButton'
import { DestinationSwitcher, TripTypeToggle } from '@/components/TripControls'
import {
  CalendarDays, PartyPopper, Mountain, Wallet, BedDouble, UtensilsCrossed,
  Car, ShoppingBag, Plane, BookOpen, NotebookPen, ListChecks, UserPlus, Settings, Images,
  ShieldAlert, type LucideIcon,
} from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Everything · Leh Ladakh' }

// `menu` ties a tile to a toggleable section; items without it are always shown.
type Item = { href: string; label: string; icon: LucideIcon; color: FlagColor; img?: string; menu?: string }

const ITEMS: Item[] = [
  { href: '/gallery', label: 'Places', icon: Images, color: 'blue', img: 'gallery', menu: 'gallery' },
  { href: '/emergency', label: 'Emergency', icon: ShieldAlert, color: 'red', menu: 'emergency' },
  { href: '/itinerary', label: 'Itinerary', icon: CalendarDays, color: 'blue', img: 'itinerary' },
  { href: '/events', label: 'Festivals', icon: PartyPopper, color: 'red', img: 'events', menu: 'events' },
  { href: '/treks', label: 'Treks', icon: Mountain, color: 'green', img: 'treks', menu: 'treks' },
  { href: '/budget', label: 'Budget', icon: Wallet, color: 'yellow', img: 'budget' },
  { href: '/stays', label: 'Stays', icon: BedDouble, color: 'blue', img: 'stays', menu: 'stays' },
  { href: '/food', label: 'Food', icon: UtensilsCrossed, color: 'red', img: 'food', menu: 'food' },
  { href: '/transport', label: 'Transport', icon: Car, color: 'blue', img: 'transport', menu: 'transport' },
  { href: '/shop', label: 'Shop', icon: ShoppingBag, color: 'yellow', img: 'shop', menu: 'shop' },
  { href: '/flights', label: 'Flights', icon: Plane, color: 'blue', img: 'flights', menu: 'flights' },
  { href: '/journal', label: 'Journal', icon: BookOpen, color: 'ink', img: 'journal' },
  { href: '/diary', label: 'Diary', icon: NotebookPen, color: 'ink', img: 'diary', menu: 'diary' },
  { href: '/prep', label: 'Prep List', icon: ListChecks, color: 'blue', menu: 'prep' },
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
  const ctx = await getActiveContext()
  const destinations = await db.destination.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, slug: true, name: true } })
  const items = ITEMS.filter(it => !it.menu || ctx.enabledMenus.includes(it.menu))
  const srcs = await Promise.all(
    items.map(it => (it.img ? getCategoryImageFor(it.img, ctx.dest?.slug, ctx.dest?.heroWiki) : Promise.resolve(null)))
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="section-title mb-1">Everything</h1>
      <p className="mb-4 text-sm text-stone">Every part of your {ctx.dest?.name ?? 'trip'}, colour-coded.</p>

      {/* Account */}
      <div className="mb-4"><AccountButton configured={authConfigured} /></div>

      {/* Trip settings — switch destination & format without rebuilding */}
      <div className="mb-6 space-y-3 rounded-2xl border border-border bg-white/60 p-4">
        <div>
          <div className="mb-1.5 text-[0.62rem] font-bold uppercase tracking-wide text-stone">Destination</div>
          <DestinationSwitcher destinations={destinations} activeId={ctx.dest?.id ?? null} variant="block" />
        </div>
        <div>
          <div className="mb-1.5 text-[0.62rem] font-bold uppercase tracking-wide text-stone">Trip type</div>
          <TripTypeToggle value={ctx.tripType} />
        </div>
      </div>

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
        {items.map((item, i) => (
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
