import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { activeDestinationId } from '@/lib/destination'

// Create a custom "extra stop" day, positioned right after an existing day.
export async function POST(req: NextRequest) {
  const body = await req.json()
  const destinationId = body.destinationId ?? await activeDestinationId()
  const afterSort: number = typeof body.afterSortOrder === 'number' ? body.afterSortOrder : 0

  // Find the next sortOrder slot just after the chosen day (within this trip).
  const next = await db.itineraryDay.findFirst({
    where: { destinationId, sortOrder: { gt: afterSort } },
    orderBy: { sortOrder: 'asc' },
  })
  const newSort = next?.sortOrder != null ? (afterSort + next.sortOrder) / 2 : afterSort + 1

  // dayNumber is unique per destination; custom days live in the 100+ range.
  const maxDay = await db.itineraryDay.aggregate({ where: { destinationId }, _max: { dayNumber: true } })
  const dayNumber = Math.max(100, (maxDay._max.dayNumber ?? 0) + 1)

  const day = await db.itineraryDay.create({
    data: {
      dayNumber,
      destinationId,
      dayOfWeek: body.dayOfWeek ?? '',
      title: body.title ?? 'New stop',
      description: body.description ?? '',
      isWorkDay: false,
      isTrekDay: !!body.isTrekDay,
      isFestivalDay: !!body.isFestivalDay,
      isExcursionDay: body.isExcursionDay ?? true,
      isCustom: true,
      sortOrder: newSort,
      customName: body.customName ?? null,
      customLat: body.customLat ?? null,
      customLng: body.customLng ?? null,
      activities: body.activities ?? [],
    },
  })
  return NextResponse.json(day, { status: 201 })
}
