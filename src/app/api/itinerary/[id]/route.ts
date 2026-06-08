import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Editable fields (seeded days can edit everything except being deleted).
const ALLOWED = [
  'title', 'description', 'breakfastNote', 'lunchNote', 'dinnerNote',
  'isWorkDay', 'isTrekDay', 'isFestivalDay', 'isExcursionDay',
  'activities', 'sortOrder', 'customName', 'customLat', 'customLng',
] as const

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const data: Record<string, unknown> = {}
  for (const key of ALLOWED) {
    if (key in body) data[key] = body[key]
  }
  const day = await db.itineraryDay.update({ where: { id: params.id }, data })
  return NextResponse.json(day)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  // Only user-added custom days may be removed; the seeded 21 stay anchored.
  const day = await db.itineraryDay.findUnique({ where: { id: params.id } })
  if (!day) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!day.isCustom) {
    return NextResponse.json({ error: 'Seeded days cannot be deleted' }, { status: 400 })
  }
  await db.itineraryDay.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
