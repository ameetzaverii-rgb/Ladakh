import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const place = await db.place.update({ where: { id: params.id }, data: body })
  return NextResponse.json(place)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.place.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
