import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { currentOwnerId } from '@/lib/owner'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  delete body.userId; delete body.id
  if (body.date !== undefined) body.date = body.date ? new Date(body.date) : null
  const res = await db.booking.updateMany({ where: { id: params.id, userId: await currentOwnerId() }, data: body })
  if (res.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(await db.booking.findUnique({ where: { id: params.id } }))
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const res = await db.booking.deleteMany({ where: { id: params.id, userId: await currentOwnerId() } })
  if (res.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
