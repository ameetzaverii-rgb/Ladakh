import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const revalidate = 3600

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const laptop = searchParams.get('laptop') === 'true' ? true : undefined

  const places = await db.place.findMany({
    where: {
      ...(type ? { type: type as any } : {}),
      ...(laptop !== undefined ? { laptopFriendly: laptop } : {}),
    },
    orderBy: { laptopFriendly: 'desc' },
  })
  return NextResponse.json(places)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const place = await db.place.create({ data: body })
  return NextResponse.json(place, { status: 201 })
}
