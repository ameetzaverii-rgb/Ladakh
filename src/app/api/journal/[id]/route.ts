import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const entry = await db.journalEntry.update({
    where: { id: params.id },
    data: body,
  })
  return NextResponse.json(entry)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await db.journalEntry.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
