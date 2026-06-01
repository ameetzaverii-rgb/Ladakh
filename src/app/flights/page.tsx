import { db } from '@/lib/db'
import { format } from 'date-fns'
import { formatINR } from '@/lib/utils'

export const revalidate = 300

export default async function FlightsPage() {
  const flights = await db.flight.findMany({ orderBy: { priceINR: 'asc' } })

  const skyscannerUrl = `https://www.skyscanner.co.in/routes/del/ixl/`

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="label-mono text-xs text-gold mb-2">Delhi → Leh</div>
        <h1 className="section-title mb-1">Flight <em className="text-gold italic">Options</em></h1>
        <p className="text-stone text-sm">
          Delhi–Leh is ~1hr. Book 6–8 weeks ahead for July — peak season fills fast.
        </p>
      </div>

      <div className="info-box p-4 mb-6">
        <strong className="label-mono text-[0.65rem] text-gold block mb-2">✈️ Booking Tips</strong>
        <ul className="text-sm text-muted space-y-1 list-none">
          <li>• Morning flights (6–9am departure) get best mountain views on approach</li>
          <li>• IndiGo 6E 2041, Air India AI 444, SpiceJet SG 122 are the main options</li>
          <li>• Book 6–8 weeks ahead — July is peak season, seats evaporate</li>
          <li>• One-way outward, consider return via Manali–Leh highway for the experience</li>
        </ul>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <a href={skyscannerUrl} target="_blank" rel="noopener noreferrer"
           className="pill pill-sky">
          🔍 Live search on Skyscanner
        </a>
        <a href="https://www.makemytrip.com/flights/domestic/del-to-leh-cheapflights.html"
           target="_blank" rel="noopener noreferrer"
           className="pill pill-gold">
          MakeMyTrip DEL→IXL
        </a>
        <a href="https://www.goibibo.com/flights/flight-search/DEL/IXL/S/"
           target="_blank" rel="noopener noreferrer"
           className="pill pill-sage">
          Goibibo DEL→IXL
        </a>
      </div>

      {flights.length === 0 && (
        <div className="text-center py-16 text-stone">
          <div className="text-4xl mb-3">✈️</div>
          <p className="font-serif text-cream text-lg">No flights loaded yet</p>
          <p className="text-sm">Run <code className="text-gold">npm run db:seed</code> to add sample flights.</p>
        </div>
      )}

      <div className="space-y-3">
        {flights.map(flight => (
          <FlightCard key={flight.id} flight={flight} />
        ))}
      </div>

      {flights.length > 0 && (
        <p className="label-mono text-[0.55rem] text-stone mt-4">
          Prices updated: {format(new Date(flights[0].priceUpdated), 'MMM d, h:mm a')} · Update via Admin
        </p>
      )}
    </div>
  )
}

function FlightCard({ flight }: { flight: any }) {
  const durationH = Math.floor(flight.durationMins / 60)
  const durationM = flight.durationMins % 60
  return (
    <div className="card-base flex items-center gap-4 px-5 py-4 flex-wrap">
      <div className="shrink-0 w-24">
        <div className="label-mono text-[0.55rem] text-stone">{flight.airline}</div>
        {flight.flightNumber && <div className="label-mono text-[0.6rem] text-sky">{flight.flightNumber}</div>}
      </div>
      <div className="flex items-center gap-3 flex-1 min-w-40">
        <div className="text-center">
          <div className="font-mono text-cream text-lg">{flight.departureTime}</div>
          <div className="label-mono text-[0.5rem] text-stone">{flight.origin}</div>
        </div>
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <div className="label-mono text-[0.45rem] text-stone">{durationH}h {durationM}m</div>
          <div className="w-full flex items-center gap-1">
            <div className="h-px flex-1 bg-gold/20" />
            <span className="text-gold text-xs">✈</span>
            <div className="h-px flex-1 bg-gold/20" />
          </div>
          <div className="label-mono text-[0.45rem] text-stone">non-stop</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-cream text-lg">
            {(() => {
              const [h, m] = flight.departureTime.split(':').map(Number)
              const totalMins = h * 60 + m + flight.durationMins
              const arrH = Math.floor(totalMins / 60) % 24
              const arrM = totalMins % 60
              return `${String(arrH).padStart(2,'0')}:${String(arrM).padStart(2,'0')}`
            })()}
          </div>
          <div className="label-mono text-[0.5rem] text-stone">{flight.destination}</div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-serif text-gold text-xl">{formatINR(flight.priceINR)}</div>
        <div className="label-mono text-[0.5rem] text-stone">economy</div>
      </div>
      {!flight.available && (
        <span className="pill pill-rust shrink-0">Sold out</span>
      )}
      {flight.bookingUrl && (
        <a href={flight.bookingUrl} target="_blank" rel="noopener noreferrer"
           className="pill pill-sky shrink-0">Book →</a>
      )}
    </div>
  )
}
