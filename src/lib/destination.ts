// src/lib/destination.ts
// Server helpers to resolve the currently active destination + its trip config.
// Everything destination-scoped filters by activeDestinationId().

import { db } from './db'
import { ALL_MENU_KEYS } from './destinations'

export type ActiveDestination = Awaited<ReturnType<typeof db.destination.findUnique>>

/** The active destination id (falls back to the seeded Ladakh). */
export async function activeDestinationId(): Promise<string> {
  const cfg = await db.tripConfig.findFirst().catch(() => null)
  return cfg?.activeDestinationId ?? 'ladakh'
}

/** Active destination row + the set of enabled menu keys. */
export async function getActiveContext() {
  const cfg = await db.tripConfig.findFirst().catch(() => null)
  const id = cfg?.activeDestinationId ?? 'ladakh'
  let dest: ActiveDestination = null
  try {
    dest = (await db.destination.findUnique({ where: { id } }))
      ?? (await db.destination.findUnique({ where: { slug: 'ladakh' } }))
  } catch {
    dest = null
  }
  const enabled: string[] = Array.isArray(cfg?.enabledMenus) ? (cfg!.enabledMenus as string[]) : ALL_MENU_KEYS
  return { dest, cfg, enabledMenus: enabled, onboarded: cfg?.onboarded ?? true }
}

/** Is a given menu key enabled for the active trip? */
export function menuEnabled(enabledMenus: string[], key: string): boolean {
  return enabledMenus.includes(key)
}
