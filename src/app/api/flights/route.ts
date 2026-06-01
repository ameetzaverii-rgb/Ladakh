// src/app/api/flights/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const revalidate = 300 // Revalidate every 5 minutes

// GET /api/flights — list all available flights
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const origin = searchParams.get('origin')
    const available = searchParams.get('available') !== 'false'

    const flights = await db.flight.findMany({
      where: {
        ...(origin && { origin: origin.toUpperCase() }),
        available,
      },
      orderBy: [{ priceINR: 'asc' }],
    })

    return NextResponse.json({ flights, total: flights.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch flights' }, { status: 500 })
  }
}

// POST /api/flights — create a new flight (admin only)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const flight = await db.flight.create({ data: body })
    return NextResponse.json({ flight }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create flight' }, { status: 500 })
  }
}
