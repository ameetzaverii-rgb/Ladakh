import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const config = await db.tripConfig.update({ where: { id: params.id }, data: body })
  return NextResponse.json(config)
}
