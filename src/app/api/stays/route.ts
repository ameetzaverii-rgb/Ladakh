// src/app/api/stays/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const revalidate = 3600

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const coworking = searchParams.get('coworking') === 'true' ? true : undefined

    const stays = await db.stay.findMany({
      where: {
        available: true,
        ...(type && { type: type as any }),
        ...(coworking !== undefined && { hasCoworking: coworking }),
      },
      orderBy: [{ pricePerNightINR: 'asc' }],
    })

    return NextResponse.json({ stays, total: stays.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stays' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const stay = await db.stay.create({ data: body })
    return NextResponse.json({ stay }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create stay' }, { status: 500 })
  }
}
