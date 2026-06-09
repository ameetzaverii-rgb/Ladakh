import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ALL_MENU_KEYS } from '@/lib/destinations'

// Set up / switch the active trip: which destination + which menus are on.
export async function POST(req: NextRequest) {
  const body = await req.json()
  const destinationId: string | undefined = body.destinationId
  if (!destinationId) return NextResponse.json({ error: 'destinationId required' }, { status: 400 })

  const enabledMenus: string[] = Array.isArray(body.enabledMenus) ? body.enabledMenus : ALL_MENU_KEYS

  const existing = await db.tripConfig.findFirst()
  const data = { activeDestinationId: destinationId, enabledMenus, onboarded: true }
  const cfg = existing
    ? await db.tripConfig.update({ where: { id: existing.id }, data })
    : await db.tripConfig.create({ data })

  return NextResponse.json({ ok: true, cfg })
}
