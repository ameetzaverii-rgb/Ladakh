// src/app/api/treks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { activeDestinationId } from '@/lib/destination'

export const revalidate = 3600

export async function GET(req: NextRequest) {
  try {
    const treks = await db.trek.findMany({
      where: { available: true, destinationId: await activeDestinationId() },
      orderBy: [{ durationDays: 'asc' }, { difficulty: 'asc' }],
    })
    return NextResponse.json({ treks, total: treks.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch treks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const trek = await db.trek.create({ data: { ...body, destinationId: body.destinationId ?? await activeDestinationId() } })
    return NextResponse.json({ trek }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create trek' }, { status: 500 })
  }
}
