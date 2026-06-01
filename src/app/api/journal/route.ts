import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tripDay = searchParams.get('tripDay')

  const entries = await db.journalEntry.findMany({
    where: tripDay ? { tripDay: parseInt(tripDay) } : {},
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const entry = await db.journalEntry.create({
    data: {
      tripDay: body.tripDay ?? 1,
      date: new Date(body.date ?? Date.now()),
      title: body.title ?? null,
      content: body.content,
      mood: body.mood ?? null,
      highlights: body.highlights ?? [],
      lowlights: body.lowlights ?? [],
      photos: body.photos ?? [],
      location: body.location ?? null,
      weather: body.weather ?? null,
    },
  })
  return NextResponse.json(entry, { status: 201 })
}
