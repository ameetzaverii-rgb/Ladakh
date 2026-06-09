// src/lib/seedContent.ts
// Idempotently seed a destination's curated content on boot — only when that
// destination has no itinerary yet, so it never duplicates or overwrites.
// Runs after ensureSchema() from the root layout.

import { db } from './db'
import { KASHMIR } from './content/kashmir'

interface DestContent {
  stays: readonly any[]
  food: readonly any[]
  treks: readonly any[]
  events: readonly any[]
  transport: readonly any[]
  shop: readonly any[]
  itinerary: readonly any[]
}

const CONTENT: Record<string, DestContent> = {
  kashmir: KASHMIR,
}

async function seedDestination(destinationId: string, c: DestContent) {
  // Guard: skip if this destination already has itinerary content.
  const existing = await db.itineraryDay.count({ where: { destinationId } })
  if (existing > 0) return false

  await db.stay.createMany({ data: c.stays.map(s => ({ ...s, destinationId })) })
  await db.place.createMany({ data: c.food.map(f => ({ ...f, destinationId })) })
  await db.trek.createMany({ data: c.treks.map(t => ({ ...t, destinationId })) })
  await db.transport.createMany({ data: c.transport.map(t => ({ ...t, destinationId })) })
  await db.shopItem.createMany({ data: c.shop.map(s => ({ ...s, destinationId })) })
  await db.event.createMany({
    data: c.events.map((e: any) => {
      const { startISO, endISO, ...rest } = e
      return { ...rest, destinationId, startDate: new Date(startISO), endDate: new Date(endISO) }
    }),
  })
  await db.itineraryDay.createMany({
    data: c.itinerary.map((d: any) => ({
      ...d,
      destinationId,
      sortOrder: d.dayNumber,
      isWorkDay: d.isWorkDay ?? false,
      isTrekDay: d.isTrekDay ?? false,
      isExcursionDay: d.isExcursionDay ?? false,
      isFestivalDay: d.isFestivalDay ?? false,
    })),
  })
  return true
}

let ensured: Promise<void> | null = null
export function ensureContent(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      for (const [slug, content] of Object.entries(CONTENT)) {
        const dest = await db.destination.findUnique({ where: { slug } }).catch(() => null)
        if (dest) await seedDestination(dest.id, content)
      }
    })().catch(err => {
      ensured = null
      console.error('[ensureContent] seeding failed:', err instanceof Error ? err.message : err)
    })
  }
  return ensured
}
