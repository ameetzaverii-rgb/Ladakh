import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { activeDestinationId } from '@/lib/destination'
import { currentOwnerId } from '@/lib/owner'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const phase = searchParams.get('phase')
  const completed = searchParams.get('completed')

  const items = await db.checklistItem.findMany({
    where: {
      destinationId: await activeDestinationId(),
      userId: await currentOwnerId(),
      ...(phase ? { phase: phase as any } : {}),
      ...(completed !== null ? { completed: completed === 'true' } : {}),
    },
    orderBy: [{ phase: 'asc' }, { priority: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.checklistItem.create({
    data: {
      destinationId: body.destinationId ?? await activeDestinationId(),
      userId: await currentOwnerId(),
      title: body.title,
      category: body.category ?? 'MISC',
      phase: body.phase ?? 'MONTH_BEFORE',
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      notes: body.notes ?? null,
      priority: body.priority ?? 2,
      bookingRef: body.bookingRef ?? null,
      costINR: body.costINR ?? null,
      url: body.url ?? null,
    },
  })
  return NextResponse.json(item, { status: 201 })
}
