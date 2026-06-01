// src/app/api/transport/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const revalidate = 3600

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    const transport = await db.transport.findMany({
      where: {
        available: true,
        ...(type && { type: type as any }),
      },
      orderBy: [{ rateINR: 'asc' }],
    })
    return NextResponse.json({ transport, total: transport.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transport' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const transport = await db.transport.create({ data: body })
    return NextResponse.json({ transport }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transport option' }, { status: 500 })
  }
}
