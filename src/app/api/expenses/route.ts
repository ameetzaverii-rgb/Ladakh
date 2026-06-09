import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { activeDestinationId } from '@/lib/destination'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tripDay = searchParams.get('tripDay')
  const category = searchParams.get('category')

  const expenses = await db.expense.findMany({
    where: {
      destinationId: await activeDestinationId(),
      ...(tripDay ? { tripDay: parseInt(tripDay) } : {}),
      ...(category ? { category: category as any } : {}),
    },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(expenses)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const expense = await db.expense.create({
    data: {
      destinationId: body.destinationId ?? await activeDestinationId(),
      tripDay: body.tripDay ?? 1,
      date: new Date(body.date ?? Date.now()),
      amountINR: body.amountINR,
      category: body.category ?? 'MISC',
      description: body.description,
      place: body.place ?? null,
      paymentMode: body.paymentMode ?? 'cash',
      receipt: body.receipt ?? null,
    },
  })
  return NextResponse.json(expense, { status: 201 })
}
