import { db } from '@/lib/db'
import { AdminClient } from './AdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [
    flights, stays, treks, events, transport, places, checklist, journal, expenses, config
  ] = await Promise.all([
    db.flight.findMany({ orderBy: { createdAt: 'desc' } }),
    db.stay.findMany({ orderBy: { pricePerNightINR: 'asc' } }),
    db.trek.findMany({ orderBy: { difficulty: 'asc' } }),
    db.event.findMany({ orderBy: { startDate: 'asc' } }),
    db.transport.findMany({ orderBy: { rateINR: 'asc' } }),
    db.place.findMany({ orderBy: { type: 'asc' } }),
    db.checklistItem.findMany({ orderBy: [{ phase: 'asc' }, { priority: 'asc' }] }),
    db.journalEntry.findMany({ orderBy: { date: 'desc' } }),
    db.expense.findMany({ orderBy: { date: 'desc' } }),
    db.tripConfig.findFirst().catch(() => null),
  ])

  const counts = {
    flights: flights.length,
    stays: stays.length,
    treks: treks.length,
    events: events.length,
    transport: transport.length,
    places: places.length,
    checklist: checklist.length,
    checklistDone: checklist.filter(i => i.completed).length,
    journal: journal.length,
    expenses: expenses.length,
    totalSpent: expenses.reduce((s, e) => s + e.amountINR, 0),
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="label-mono text-xs text-rust mb-2">Admin Panel</div>
        <h1 className="section-title mb-1">Data <em className="text-gold italic">Manager</em></h1>
        <p className="text-stone text-sm">CRUD for all models. Add, edit, delete. No auth required in dev.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-8">
        {Object.entries(counts).map(([key, val]) => (
          <div key={key} className="card-base p-3 text-center">
            <div className="font-serif text-xl text-gold">{typeof val === 'number' && val > 10000 ? `₹${(val/1000).toFixed(0)}K` : val}</div>
            <div className="label-mono text-[0.5rem] text-stone">{key}</div>
          </div>
        ))}
      </div>

      <AdminClient
        flights={flights}
        stays={stays}
        treks={treks}
        events={events}
        transport={transport}
        places={places}
        checklist={checklist}
        config={config}
      />
    </div>
  )
}
