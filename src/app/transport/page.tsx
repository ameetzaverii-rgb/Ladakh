import { db } from '@/lib/db'
import { CategoryHero } from '@/components/Photo'
import { getCategoryImage } from '@/lib/imagery'
import { Car } from 'lucide-react'

export const dynamic = 'force-dynamic'
export default async function TransportPage() {
  const [routes, heroImg] = await Promise.all([
    db.transport.findMany({ orderBy: { rateINR: 'asc' } }),
    getCategoryImage('transport'),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <CategoryHero src={heroImg?.src ?? null} color="blue" icon={Car}
        title="Transport Guide" subtitle="Fixed Union rates, permits, bike rentals, and getting here." />

      <div className="warning-box p-4 mb-8 text-sm text-muted leading-relaxed">
        <strong className="label-mono text-[0.65rem] text-rust block mb-2">⚠️ No Self-Drive Rentals</strong>
        Ladakh Taxi Union bans all outside-registered cars from sightseeing since 2015. No Zoomcar/Revv.
        Hire a local Leh-registered driver — they know the roads, passes, and hidden spots far better anyway.
      </div>

      <div className="info-box p-4 mb-8 text-sm text-muted">
        <strong className="label-mono text-[0.65rem] text-gold block mb-2">🚗 Best Strategy for 21 Days</strong>
        Establish a relationship with ONE reliable driver from Day 1. Better rates, priority availability,
        and genuine local knowledge. Ask your hotel to recommend one.
      </div>

      {routes.length === 0 ? (
        <div className="text-center py-12 text-stone">
          <p className="font-serif text-cream text-lg">Run <code className="text-gold">npm run db:seed</code> to load transport data</p>
        </div>
      ) : (
        <div>
          <div className="label-mono text-xs text-gold mb-3 border-b border-gold/15 pb-2">
            Taxi Union Rate Reference (2025–26)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/20">
                  <th className="label-mono text-[0.58rem] text-gold text-left py-2 px-3">Destination</th>
                  <th className="label-mono text-[0.58rem] text-gold text-right py-2 px-3">Distance</th>
                  <th className="label-mono text-[0.58rem] text-gold text-right py-2 px-3">Rate</th>
                  <th className="label-mono text-[0.58rem] text-gold text-left py-2 px-3">Type</th>
                  <th className="label-mono text-[0.58rem] text-gold text-left py-2 px-3">Permits</th>
                </tr>
              </thead>
              <tbody>
                {routes.map(r => (
                  <tr key={r.id} className="border-b border-gold/6 hover:bg-white/[0.02]">
                    <td className="py-3 px-3 text-sand text-sm">{r.destination}</td>
                    <td className="py-3 px-3 text-muted text-xs text-right">{r.distanceKm}km</td>
                    <td className="py-3 px-3 text-cream font-bold tabular-nums text-sm text-right">₹{r.rateINR.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className="pill pill-sky">{r.rateType}</span>
                    </td>
                    <td className="py-3 px-3">
                      {r.permitRequired ? (
                        <span className="pill pill-rust">ILP req.</span>
                      ) : (
                        <span className="text-stone text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-10 info-box p-5">
        <strong className="label-mono text-[0.65rem] text-gold block mb-3">🏍 Bike Rentals in Leh</strong>
        <div className="text-sm text-muted leading-relaxed">
          Royal Enfield Himalayan or Bullet 500cc — most popular choice.
          Cost: ₹1,200–2,000/day. Multiple rental shops on Fort Road and Changspa Road.
          Recommended for experienced riders only — mountain roads demand respect.
          Always inspect the bike thoroughly before taking it.
        </div>
        <div className="mt-3 grid md:grid-cols-2 gap-2 text-xs text-stone">
          <div>📍 <span className="text-sand">Enfield House</span> — Fort Road</div>
          <div>📍 <span className="text-sand">Himalayan Bike Rentals</span> — Changspa</div>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="info-box p-4">
          <strong className="label-mono text-[0.65rem] text-gold block mb-2">✈️ Getting to Leh — By Air</strong>
          <p className="text-sm text-muted">Direct flights from Delhi (~1hr), Mumbai (~2hr). IndiGo, Air India, SpiceJet.
          Book 6–8 weeks ahead for July. Morning flights offer stunning Himalayan views.</p>
        </div>
        <div className="info-box p-4">
          <strong className="label-mono text-[0.65rem] text-gold block mb-2">📋 Inner Line Permits</strong>
          <p className="text-sm text-muted">Required for: Pangong Tso, Nubra Valley, Tso Moriri.
          Cost: ₹400–600/person/destination. DC Office near Main Market (Mon–Sat 10am–4pm).
          Bring 2 passport photos + ID copy.</p>
        </div>
      </div>
    </div>
  )
}
