import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { currentOwnerId } from '@/lib/owner'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  delete body.userId; delete body.id
  const res = await db.checklistItem.updateMany({
    where: { id: params.id, userId: await currentOwnerId() },
    data: { ...body, completedAt: body.completed ? new Date() : null },
  })
  if (res.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(await db.checklistItem.findUnique({ where: { id: params.id } }))
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const res = await db.checklistItem.deleteMany({ where: { id: params.id, userId: await currentOwnerId() } })
  if (res.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
