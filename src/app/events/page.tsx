import { db } from '@/lib/db'
import Link from 'next/link'
import { format } from 'date-fns'
import { ReviewLinks } from '@/components/ReviewLinks'

export const dynamic = 'force-dynamic'
const TYPE_COLORS: Record<string, string> = {
  FESTIVAL: 'pill-rust',
  CULTURAL: 'pill-gold',
  MONASTERY: 'pill-sage',
  MARKET: 'pill-sky',
  SPORTS: 'pill-gold',
  ASTRONOMY: 'pill-sky',
}

export default async function EventsPage() {
  const events = await db.event.findMany({ orderBy: { startDate: 'asc' } })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="label-mono text-xs text-gold mb-2">Festivals & Events</div>
        <h1 className="section-title mb-1">Festival <em className="text-gold italic">Calendar</em></h1>
        <p className="text-stone text-sm">Arriving late July puts you at two of Ladakh's most spectacular festivals.</p>
        <Link href="/itinerary" className="inline-block mt-2 label-mono text-[0.6rem] text-sky hover:underline">↩ See where these fall on your 21-day plan</Link>
      </div>

      <div className="card-base p-5 mb-8 bg-gradient-to-r from-rust/10 to-gold/5">
        <div className="label-mono text-[0.55rem] text-gold mb-1">◈ Festival Season ◈</div>
        <h3 className="font-serif text-xl text-gold mb-2">Phyang Tsedup — Jul 22–23, 2026</h3>
        <p className="text-sm text-muted leading-relaxed">
          One of Ladakh's most spectacular festivals. Sacred Cham masked dances by monks in elaborate costumes.
          The unfurling of the giant silk Thangka is a once-in-a-lifetime sight. Arrive early morning.
          17km from Leh — taxi ₹800–1,200. Free entry.
        </p>
      </div>

      {events.length === 0 && (
        <div className="text-center py-16 text-stone">
          <div className="text-4xl mb-3">🎭</div>
          <p className="font-serif text-cream text-lg">No events loaded</p>
          <p className="text-sm">Run <code className="text-gold">npm run db:seed</code></p>
        </div>
      )}

      <div className="space-y-4">
        {events.map(event => (
          <div key={event.id} className="card-base p-5">
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
            <p className="text-muted text-xs leading-relaxed mb-2">{event.description}</p>
            <div className="text-xs text-stone space-y-0.5">
              <div>📍 {event.location}</div>
              {event.distanceFromLehKm && <div>🚗 {event.distanceFromLehKm}km from Leh</div>}
              {event.tips && <div>💡 {event.tips}</div>}
              {event.ticketUrl && (
                <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer"
                   className="text-sky hover:underline">🎫 Get Tickets</a>
              )}
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
