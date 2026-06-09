import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { activeDestinationId } from '@/lib/destination'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const area = searchParams.get('area')
  const items = await db.shopItem.findMany({
    where: { destinationId: await activeDestinationId(), ...(area ? { area } : {}) },
    orderBy: [{ acquired: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.shopItem.create({
    data: {
      name: body.name,
      area: body.area ?? 'Leh',
      category: body.category ?? 'Handicraft',
      estPriceINR: body.estPriceINR ?? null,
      whereToBuy: body.whereToBuy ?? null,
      priority: body.priority ?? 'nice',
      acquired: body.acquired ?? false,
      notes: body.notes ?? null,
      photo: body.photo ?? null,
      destinationId: body.destinationId ?? await activeDestinationId(),
    },
  })
  return NextResponse.json(item, { status: 201 })
}
