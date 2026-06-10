import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { currentOwnerId } from '@/lib/owner'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  delete body.userId; delete body.id // never reassign ownership
  // Scope to the caller's own row so one user can't edit another's.
  const res = await db.expense.updateMany({ where: { id: params.id, userId: await currentOwnerId() }, data: body })
  if (res.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(await db.expense.findUnique({ where: { id: params.id } }))
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const res = await db.expense.deleteMany({ where: { id: params.id, userId: await currentOwnerId() } })
  if (res.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
