// src/app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const revalidate = 3600

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const upcoming = searchParams.get('upcoming') !== 'false'

    const events = await db.event.findMany({
      where: {
        ...(upcoming && { endDate: { gte: new Date() } }),
      },
      orderBy: [{ startDate: 'asc' }],
    })
    return NextResponse.json({ events, total: events.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Convert date strings to Date objects
    const event = await db.event.create({
      data: {
        ...body,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
      },
    })
    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
