import { db } from '@/lib/db'
import Link from 'next/link'
import { format } from 'date-fns'
import { ReviewLinks } from '@/components/ReviewLinks'
import { CategoryHero } from '@/components/Photo'
import { MiniMap } from '@/components/MiniMap'
import { FestivalGallery, type FestImage } from '@/components/FestivalGallery'
import { getCategoryImageFor } from '@/lib/imagery'
import { fetchWikiImage } from '@/lib/trekMedia'
import { getActiveContext } from '@/lib/destination'
import { PartyPopper, MapPin, Car, Lightbulb, Ticket } from 'lucide-react'

export const dynamic = 'force-dynamic'
const TYPE_COLORS: Record<string, string> = {
  FESTIVAL: 'pill-rust',
  CULTURAL: 'pill-gold',
  MONASTERY: 'pill-sage',
  MARKET: 'pill-sky',
  SPORTS: 'pill-gold',
  ASTRONOMY: 'pill-sky',
}

// A varied pool of distinct Ladakh imagery to round out each strip. Rotated by
// a hash of the festival name so different festivals don't share the same fill.
const FEST_POOL = [
  'Cham dance', 'Thangka', 'Hemis Festival', 'Diskit Monastery', 'Lamayuru Monastery',
  'Thikse Monastery', 'Leh Palace', 'Shanti Stupa', 'Prayer flag', 'Stok Monastery',
  'Likir Monastery', 'Ladakh',
]
function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Wikipedia titles to source ~4 distinct photos per festival — curated leads
// first, then a name-rotated slice of the pool so each festival looks different.
function festivalWikiTitles(name: string): string[] {
  const n = name.toLowerCase()
  let base: string[] = []
  if (n.includes('phyang')) base = ['Phyang Monastery', 'Cham dance']
  else if (n.includes('korzok') || n.includes('gustor') || n.includes('moriri')) base = ['Tso Moriri', 'Korzok', 'Changthang']
  else if (n.includes('naropa')) base = ['Naropa', 'Hemis Monastery']
  else if (n.includes('hemis')) base = ['Hemis Festival', 'Hemis Monastery']
  else if (n.includes('thiksey') || n.includes('thikse')) base = ['Thikse Monastery', 'Maitreya']
  else if (n.includes('dosmoche')) base = ['Leh Palace', 'Cham dance']
  else if (n.includes('losar')) base = ['Losar']
  else if (n.includes('sindhu')) base = ['Indus River', 'Leh']
  else if (n.includes('yuru') || n.includes('lamayuru')) base = ['Lamayuru Monastery', 'Cham dance']
  else if (n.includes('matho')) base = ['Matho Monastery']
  else if (n.includes('stok')) base = ['Stok Monastery', 'Stok Kangri']
  else if (n.includes('ladakh') || n.includes('polo') || n.includes('harvest')) base = ['Ladakh', 'Polo', 'Leh']

  const off = hashStr(name) % FEST_POOL.length
  const rotated = [...FEST_POOL.slice(off), ...FEST_POOL.slice(0, off)]
  return Array.from(new Set([...base, ...rotated]))
}

export default async function EventsPage() {
  const ctx = await getActiveContext()
  const [events, heroImg] = await Promise.all([
    db.event.findMany({ where: { destinationId: ctx.dest?.id ?? 'ladakh' }, orderBy: { startDate: 'asc' } }),
    getCategoryImageFor('events', ctx.dest?.slug, ctx.dest?.heroWiki),
  ])

  // Resolve up to 4 distinct photos per festival (Wikipedia, cached 1 day).
  const eventImages: Record<string, FestImage[]> = {}
  await Promise.all(
    events.map(async ev => {
      const imgs: FestImage[] = []
      const seen = new Set<string>()
      for (const title of festivalWikiTitles(ev.name)) {
        if (imgs.length >= 4) break
        const img = await fetchWikiImage(title)
        if (img?.src && !seen.has(img.src)) { seen.add(img.src); imgs.push({ src: img.src, pageUrl: img.pageUrl }) }
      }
      eventImages[ev.id] = imgs
    })
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <CategoryHero src={heroImg?.src ?? null} color="red" icon={PartyPopper}
        title="Festival Calendar" subtitle={`Festivals, fairs and cultural happenings around ${ctx.dest?.name ?? 'your destination'}.`} />
      <div className="mb-8 flex flex-wrap gap-4">
        <Link href="/itinerary" className="label-mono text-[0.6rem] text-sky hover:underline">↩ See where these fall on your plan</Link>
        <Link href="/contribute" className="label-mono text-[0.6rem] text-sky hover:underline">🙋 Friends can flag an event</Link>
      </div>

      {ctx.dest?.slug === 'ladakh' && (
        <div className="card-base p-5 mb-8 bg-gradient-to-r from-rust/10 to-gold/5">
          <div className="label-mono text-[0.55rem] text-gold mb-1">◈ Festival Season ◈</div>
          <h3 className="font-serif text-xl text-gold mb-2">Phyang Tsedup — Jul 22–23, 2026</h3>
          <p className="text-sm text-muted leading-relaxed">
            One of Ladakh&apos;s most spectacular festivals. Sacred Cham masked dances by monks in elaborate costumes.
            The unfurling of the giant silk Thangka is a once-in-a-lifetime sight. Arrive early morning.
            17km from Leh — taxi ₹800–1,200. Free entry.
          </p>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-16 text-stone">
          <div className="text-4xl mb-3">🎭</div>
          <p className="font-serif text-cream text-lg">No events loaded</p>
          <p className="text-sm">Run <code className="text-gold">npm run db:seed</code></p>
        </div>
      )}

      <div className="space-y-4">
        {events.map(event => (
          <div key={event.id} className="card-base p-5 relative overflow-hidden">
            <span className="absolute left-0 top-0 h-full w-1.5 bg-flag-red" />
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="font-serif text-cream text-lg mb-0.5">{event.name}</h3>
                <div className="flex gap-2 flex-wrap">
                  <span className={`pill ${TYPE_COLORS[event.type] ?? 'pill-gold'}`}>{event.type}</span>
                  {event.freeEntry && <span className="pill pill-sage">Free Entry</span>}
                  {event.ticketRequired && <span className="pill pill-rust">Tickets Required</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-serif text-gold text-sm">
                  {format(new Date(event.startDate), 'MMM d')}
                </div>
                {event.startDate !== event.endDate && (
                  <div className="label-mono text-[0.5rem] text-stone">
                    – {format(new Date(event.endDate), 'MMM d')}
                  </div>
                )}
              </div>
            </div>
            <p className="text-muted text-sm leading-relaxed mb-3">{event.description}</p>

            {/* Photo strip → opens a slideshow for this festival */}
            {eventImages[event.id]?.length > 0 && (
              <div className="mb-3">
                <FestivalGallery title={event.name} images={eventImages[event.id]} />
              </div>
            )}

            <div className="text-xs text-stone space-y-1">
              <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0 text-flag-red" /> {event.location}</div>
              {event.distanceFromLehKm && <div className="flex items-center gap-1.5"><Car className="h-3.5 w-3.5 shrink-0 text-stone" /> {event.distanceFromLehKm}km from Leh</div>}
              {event.tips && <div className="flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5 shrink-0 text-gold" /> {event.tips}</div>}
              {event.ticketUrl && (
                <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-1.5 text-sky hover:underline"><Ticket className="h-3.5 w-3.5 shrink-0" /> Get Tickets</a>
              )}
            </div>
            <div className="mt-3">
              <MiniMap label={event.name} query={`${event.name} ${event.location}`} />
            </div>
            <div className="mt-3 pt-3 border-t border-gold/10">
              <ReviewLinks name={event.name} context={`festival ${event.location}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
