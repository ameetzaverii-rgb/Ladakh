import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ALL_MENU_KEYS } from '@/lib/destinations'
import { asTripType } from '@/lib/tripType'

// Set up / switch the active trip: which destination + which menus are on.
export async function POST(req: NextRequest) {
  const body = await req.json()
  const destinationId: string | undefined = body.destinationId
  if (!destinationId) return NextResponse.json({ error: 'destinationId required' }, { status: 400 })

  const enabledMenus: string[] = Array.isArray(body.enabledMenus) ? body.enabledMenus : ALL_MENU_KEYS

  // Optional trip preferences captured during onboarding.
  const data: Record<string, unknown> = { activeDestinationId: destinationId, enabledMenus, onboarded: true }
  if (body.tripType !== undefined) data.tripType = asTripType(body.tripType)
  if (body.tripStartDate) data.tripStartDate = new Date(body.tripStartDate)
  if (body.tripEndDate) data.tripEndDate = new Date(body.tripEndDate)
  if (typeof body.totalBudgetINR === 'number' && body.totalBudgetINR > 0) data.totalBudgetINR = Math.round(body.totalBudgetINR)
  if (typeof body.travelerName === 'string' && body.travelerName.trim()) data.travelerName = body.travelerName.trim()

  const existing = await db.tripConfig.findFirst()
  const cfg = existing
    ? await db.tripConfig.update({ where: { id: existing.id }, data })
    : await db.tripConfig.create({ data })

  return NextResponse.json({ ok: true, cfg })
}

// Lightweight partial update — switch destination or change trip type/prefs
// without re-running onboarding. Only the provided fields are touched.
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (typeof body.activeDestinationId === 'string') data.activeDestinationId = body.activeDestinationId
  if (body.tripType !== undefined) data.tripType = asTripType(body.tripType)
  if (Array.isArray(body.enabledMenus)) data.enabledMenus = body.enabledMenus
  if (body.tripStartDate) data.tripStartDate = new Date(body.tripStartDate)
  if (body.tripEndDate) data.tripEndDate = new Date(body.tripEndDate)
  if (typeof body.totalBudgetINR === 'number' && body.totalBudgetINR > 0) data.totalBudgetINR = Math.round(body.totalBudgetINR)
  if (typeof body.travelerName === 'string' && body.travelerName.trim()) data.travelerName = body.travelerName.trim()

  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'no fields to update' }, { status: 400 })

  const existing = await db.tripConfig.findFirst()
  const cfg = existing
    ? await db.tripConfig.update({ where: { id: existing.id }, data })
    : await db.tripConfig.create({ data: { ...data, onboarded: true } })

  return NextResponse.json({ ok: true, cfg })
}
