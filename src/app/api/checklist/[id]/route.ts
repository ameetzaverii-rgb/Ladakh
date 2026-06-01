import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const item = await db.checklistItem.update({
    where: { id: params.id },
    data: {
      ...body,
      completedAt: body.completed ? new Date() : null,
    },
  })
  return NextResponse.json(item)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.checklistItem.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
