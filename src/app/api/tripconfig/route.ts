import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const config = await db.tripConfig.findFirst()
  return NextResponse.json(config)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const config = await db.tripConfig.create({ data: body })
  return NextResponse.json(config, { status: 201 })
}
