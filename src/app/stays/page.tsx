import { db } from '@/lib/db'
import { formatINR } from '@/lib/utils'
import { CategoryHero } from '@/components/Photo'
import { getCategoryImageFor } from '@/lib/imagery'
import { getActiveContext } from '@/lib/destination'
import { COWORKING_BY_SLUG, COWORKING_INTRO, coworkingKindLabel, type Coworking } from '@/lib/content/coworking'
import { BedDouble, Wifi, Laptop } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export default async function StaysPage() {
  const ctx = await getActiveContext()
  const [stays, heroImg] = await Promise.all([
    db.stay.findMany({ where: { destinationId: ctx.dest?.id ?? 'ladakh' }, orderBy: { pricePerNightINR: 'asc' } }),
    getCategoryImageFor('stays', ctx.dest?.slug, ctx.dest?.heroWiki),
  ])

  const grouped = stays.reduce((acc, s) => {
    const key = s.type
    acc[key] = acc[key] ?? []
    acc[key].push(s)
    return acc
  }, {} as Record<string, typeof stays>)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <CategoryHero src={heroImg?.src ?? null} color="blue" icon={BedDouble}
        title="Where to Rest" subtitle={ctx.features.emphasiseConnectivity
          ? 'Hotels, guesthouses and hostels — WiFi & coworking noted for remote work.'
          : 'Hotels, guesthouses, homestays and hostels for your trip.'} />

      {ctx.features.emphasiseConnectivity && ctx.dest?.slug === 'ladakh' && (
        <div className="info-box p-4 mb-8 text-sm text-muted leading-relaxed">
          <strong className="label-mono text-[0.65rem] text-gold block mb-2">📍 Best Neighbourhood for Workation</strong>
          <strong className="text-sand">Changspa Road</strong> — quietest, most café-dense, 10-min walk to Main Market.
          Best for solo remote work. · <strong className="text-sand">Fort Road</strong> — central, below Leh Palace.
          · <strong className="text-sand">Old Town</strong> — atmospheric and walkable.
        </div>
      )}

      {ctx.features.emphasiseConnectivity && (
        <CoworkingSection slug={ctx.dest?.slug ?? 'ladakh'} currency={ctx.dest?.currency ?? 'INR'} />
      )}

      {stays.length === 0 && (
        <div className="text-center py-16 text-stone">
          <div className="text-4xl mb-3">🏨</div>
          <p className="font-serif text-cream text-lg">No stays loaded yet</p>
          <p className="text-sm">Run <code className="text-gold">npm run db:seed</code> to populate.</p>
        </div>
      )}

      {Object.entries(grouped).map(([type, typeStays]) => (
        <div key={type} className="mb-10">
          <div className="label-mono text-[0.65rem] text-gold border-l-2 border-gold pl-3 mb-4">{type}S</div>
          <div className="grid md:grid-cols-2 gap-4">
            {typeStays.map(stay => (
              <StayCard key={stay.id} stay={stay} showConnectivity={ctx.features.emphasiseConnectivity} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function StayCard({ stay, showConnectivity = true }: { stay: any; showConnectivity?: boolean }) {
  const wifiStars = '★'.repeat(stay.wifiRating) + '☆'.repeat(5 - stay.wifiRating)
  return (
    <div className="card-base p-5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="label-mono text-[0.55rem] text-gold mb-1">{stay.neighbourhood}</div>
          <h3 className="font-serif text-cream text-lg leading-tight">{stay.name}</h3>
        </div>
        <div className="text-right shrink-0 ml-3">
          <div className="font-serif text-gold text-lg">{formatINR(stay.pricePerNightINR)}</div>
          <div className="label-mono text-[0.5rem] text-stone">/night</div>
        </div>
      </div>
      <p className="text-muted text-xs leading-relaxed mb-3">{stay.description}</p>
      <div className="flex gap-3 text-xs text-stone mb-3">
        {showConnectivity && <span>WiFi: <span className="text-gold text-[0.65rem]">{wifiStars}</span></span>}
        {showConnectivity && stay.hasCoworking && <span className="text-sage">✓ Coworking</span>}
        {stay.breakfastIncl && <span className="text-sage">✓ Breakfast</span>}
        {stay.hasPowerBackup && <span className="text-stone">✓ Power backup</span>}
      </div>
      {stay.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {stay.highlights.map((h: string, i: number) => (
            <span key={i} className="pill pill-gold">{h}</span>
          ))}
        </div>
      )}
      {stay.priceMonthlyINR && (
        <div className="text-xs text-stone">
          21-night: <span className="text-sand">~{formatINR(stay.priceMonthlyINR)}</span>
          <span className="text-muted"> (negotiated)</span>
        </div>
      )}
      {stay.bookingUrl && (
        <a href={stay.bookingUrl} target="_blank" rel="noopener noreferrer"
           className="label-mono text-[0.55rem] text-sky hover:underline block mt-2">
          🔗 Book Now
        </a>
      )}
    </div>
  )
}

/* Coworking & work-friendly spaces — only shown for Workation / Hybrid trips. */
function CoworkingSection({ slug, currency }: { slug: string; currency: string }) {
  const spaces = COWORKING_BY_SLUG[slug] ?? []
  if (spaces.length === 0) return null
  const intro = COWORKING_INTRO[slug]
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center gap-2">
        <Laptop className="h-4 w-4 text-flag-blue" />
        <h2 className="text-lg font-extrabold text-cream">Coworking &amp; work spaces</h2>
      </div>
      {intro && <p className="mb-4 text-sm leading-relaxed text-muted">{intro}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {spaces.map((s, i) => <CoworkingCard key={i} space={s} currency={currency} />)}
      </div>
    </section>
  )
}

function fmtMoney(n: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  } catch {
    return `${currency} ${n.toLocaleString('en-IN')}`
  }
}

function CoworkingCard({ space, currency }: { space: Coworking; currency: string }) {
  const wifiStars = '★'.repeat(space.wifiRating) + '☆'.repeat(5 - space.wifiRating)
  return (
    <div className="card-base p-5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="label-mono mb-1 text-[0.55rem] text-gold">{coworkingKindLabel(space.kind)} · {space.neighbourhood}</div>
          <h3 className="font-serif text-lg leading-tight text-cream">{space.name}</h3>
        </div>
        <div className="shrink-0 text-right">
          {space.dayPassINR != null ? (
            <>
              <div className="font-serif text-lg text-gold">{fmtMoney(space.dayPassINR, currency)}</div>
              <div className="label-mono text-[0.5rem] text-stone">/day pass</div>
            </>
          ) : (
            <div className="label-mono text-[0.55rem] text-stone">Price varies</div>
          )}
        </div>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-muted">{space.note}</p>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-stone">
        <span className="inline-flex items-center gap-1"><Wifi className="h-3.5 w-3.5 text-sky" /> <span className="text-gold text-[0.65rem]">{wifiStars}</span></span>
        {space.monthlyINR != null && <span>Monthly: <span className="text-sand">~{fmtMoney(space.monthlyINR, currency)}</span></span>}
      </div>
      {space.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {space.amenities.map((a, i) => <span key={i} className="pill pill-sky">{a}</span>)}
        </div>
      )}
      {space.url && (
        <a href={space.url} target="_blank" rel="noopener noreferrer"
           className="label-mono mt-2 block text-[0.55rem] text-sky hover:underline">🔗 Details</a>
      )}
    </div>
  )
}
