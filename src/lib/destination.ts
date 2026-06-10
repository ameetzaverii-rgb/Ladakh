// src/lib/destination.ts
// Server helpers to resolve the currently active destination + its trip config.
// Per-user (2b): the trip config is the signed-in user's own, or the shared demo
// for anonymous visitors. Everything destination-scoped also filters by ownerId.

import { db } from './db'
import { ALL_MENU_KEYS } from './destinations'
import { asTripType, tripFeatures } from './tripType'
import { currentOwnerId, resolveTripConfig } from './owner'

export type ActiveDestination = Awaited<ReturnType<typeof db.destination.findUnique>>

/** The active destination id for the current viewer (falls back to seeded Ladakh). */
export async function activeDestinationId(): Promise<string> {
  const cfg = await resolveTripConfig()
  return cfg?.activeDestinationId ?? 'ladakh'
}

/** Active destination row + trip config + enabled menus, scoped to the viewer. */
export async function getActiveContext() {
  const ownerId = await currentOwnerId()
  const cfg = await resolveTripConfig()
  const id = cfg?.activeDestinationId ?? 'ladakh'
  let dest: ActiveDestination = null
  try {
    dest = (await db.destination.findUnique({ where: { id } }))
      ?? (await db.destination.findUnique({ where: { slug: 'ladakh' } }))
  } catch {
    dest = null
  }
  const enabled: string[] = Array.isArray(cfg?.enabledMenus) ? (cfg!.enabledMenus as string[]) : ALL_MENU_KEYS
  const tripType = asTripType((cfg as { tripType?: string } | null)?.tripType)
  return { dest, cfg, ownerId, enabledMenus: enabled, onboarded: cfg?.onboarded ?? true, tripType, features: tripFeatures(tripType) }
}

/** Is a given menu key enabled for the active trip? */
export function menuEnabled(enabledMenus: string[], key: string): boolean {
  return enabledMenus.includes(key)
}
