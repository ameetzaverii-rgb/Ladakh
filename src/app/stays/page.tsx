import { db } from '@/lib/db'
import { formatINR } from '@/lib/utils'
import { CategoryHero } from '@/components/Photo'
import { getCategoryImage } from '@/lib/imagery'
import { BedDouble } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export default async function StaysPage() {
  const [stays, heroImg] = await Promise.all([
    db.stay.findMany({ orderBy: { pricePerNightINR: 'asc' } }),
    getCategoryImage('stays'),
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
        title="Where to Rest" subtitle="Hotels, guesthouses, and hostels optimised for a 21-day workation." />

      <div className="info-box p-4 mb-8 text-sm text-muted leading-relaxed">
        <strong className="label-mono text-[0.65rem] text-gold block mb-2">📍 Best Neighbourhood for Workation</strong>
        <strong className="text-sand">Changspa Road</strong> — quietest, most café-dense, 10-min walk to Main Market.
        Best for solo remote work. · <strong className="text-sand">Fort Road</strong> — central, below Leh Palace.
        · <strong className="text-sand">Old Town</strong> — atmospheric and walkable.
      </div>

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
              <StayCard key={stay.id} stay={stay} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function StayCard({ stay }: { stay: any }) {
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
        <span>WiFi: <span className="text-gold text-[0.65rem]">{wifiStars}</span></span>
        {stay.hasCoworking && <span className="text-sage">✓ Coworking</span>}
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
