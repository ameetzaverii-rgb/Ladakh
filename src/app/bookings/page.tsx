import { db } from '@/lib/db'
import { activeDestinationId } from '@/lib/destination'
import { currentOwnerId } from '@/lib/owner'
import { BookingsClient } from './BookingsClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Bookings · Tarcho' }

export default async function BookingsPage() {
  const [destinationId, ownerId] = [await activeDestinationId(), await currentOwnerId()]
  const rows = await db.booking
    .findMany({ where: { destinationId, userId: ownerId }, orderBy: [{ date: 'asc' }, { createdAt: 'desc' }] })
    .catch(() => [])
  const bookings = rows.map(b => ({
    id: b.id, type: b.type, title: b.title, vendor: b.vendor, bookingRef: b.bookingRef,
    costINR: b.costINR, date: b.date ? b.date.toISOString().slice(0, 10) : null,
    tripDay: b.tripDay, url: b.url, notes: b.notes, status: b.status,
  }))
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="section-title mb-1">Bookings</h1>
      <p className="mb-5 text-sm text-stone">Your confirmed flights, stays, treks and tickets — refs, cost and links in one place.</p>
      <BookingsClient initial={bookings} />
    </div>
  )
}
