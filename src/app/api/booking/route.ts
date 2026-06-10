import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { activeDestinationId } from '@/lib/destination'
import { currentOwnerId } from '@/lib/owner'

export async function GET() {
  const bookings = await db.booking.findMany({
    where: { destinationId: await activeDestinationId(), userId: await currentOwnerId() },
    orderBy: [{ date: 'asc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json(bookings)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.title || !String(body.title).trim()) {
    return NextResponse.json({ error: 'title required' }, { status: 400 })
  }
  const booking = await db.booking.create({
    data: {
      userId: await currentOwnerId(),
      destinationId: body.destinationId ?? await activeDestinationId(),
      type: body.type ?? 'OTHER',
      title: String(body.title).trim(),
      vendor: body.vendor ?? null,
      bookingRef: body.bookingRef ?? null,
      costINR: typeof body.costINR === 'number' ? body.costINR : null,
      date: body.date ? new Date(body.date) : null,
      tripDay: typeof body.tripDay === 'number' ? body.tripDay : null,
      url: body.url ?? null,
      notes: body.notes ?? null,
      status: body.status ?? 'CONFIRMED',
    },
  })
  return NextResponse.json(booking, { status: 201 })
}
