// src/lib/seedContent.ts
// Idempotently seed each destination's curated content. Seeding is per-model
// and guarded (only inserts a model when that destination has none of it), so a
// transient failure in one model self-heals on the next run and nothing ever
// duplicates. Runs on boot (after ensureSchema) and via /api/seed-content.

import { db } from './db'
import { KASHMIR } from './content/kashmir'
import { POKHARA } from './content/pokhara'
import { SPITI } from './content/spiti'
import { SIKKIM } from './content/sikkim'

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
  pokhara: POKHARA,
  spiti: SPITI,
  sikkim: SIKKIM,
}

// Seed one model only if the destination currently has zero of it.
async function seedModel(
  count: () => Promise<number>,
  create: () => Promise<unknown>,
  report: Record<string, number>,
  key: string,
) {
  if ((await count()) > 0) return
  await create()
  report[key] = (report[key] ?? 0) + 1
}

async function seedDestination(destinationId: string, c: DestContent) {
  const r: Record<string, number> = {}
  await seedModel(() => db.itineraryDay.count({ where: { destinationId } }),
    () => db.itineraryDay.createMany({
      data: c.itinerary.map((d: any) => ({
        ...d, destinationId, sortOrder: d.dayNumber,
        isWorkDay: d.isWorkDay ?? false, isTrekDay: d.isTrekDay ?? false,
        isExcursionDay: d.isExcursionDay ?? false, isFestivalDay: d.isFestivalDay ?? false,
      })),
    }), r, 'itinerary')
  await seedModel(() => db.stay.count({ where: { destinationId } }),
    () => db.stay.createMany({ data: c.stays.map(s => ({ ...s, destinationId })) }), r, 'stays')
  await seedModel(() => db.place.count({ where: { destinationId } }),
    () => db.place.createMany({ data: c.food.map(f => ({ ...f, destinationId })) }), r, 'food')
  await seedModel(() => db.trek.count({ where: { destinationId } }),
    () => db.trek.createMany({ data: c.treks.map(t => ({ ...t, destinationId })) }), r, 'treks')
  await seedModel(() => db.transport.count({ where: { destinationId } }),
    () => db.transport.createMany({ data: c.transport.map(t => ({ ...t, destinationId })) }), r, 'transport')
  await seedModel(() => db.shopItem.count({ where: { destinationId } }),
    () => db.shopItem.createMany({ data: c.shop.map(s => ({ ...s, destinationId })) }), r, 'shop')
  await seedModel(() => db.event.count({ where: { destinationId } }),
    () => db.event.createMany({
      data: c.events.map((e: any) => {
        const { startISO, endISO, ...rest } = e
        return { ...rest, destinationId, startDate: new Date(startISO), endDate: new Date(endISO) }
      }),
    }), r, 'events')
  return r
}

/** Seed every preset destination. Returns a per-destination report (or error). */
export async function seedAllDestinations(): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {}
  for (const [slug, content] of Object.entries(CONTENT)) {
    try {
      const dest = await db.destination.findUnique({ where: { slug } })
      if (!dest) { out[slug] = 'destination missing'; continue }
      out[slug] = (await seedDestination(dest.id, content)) ?? {}
    } catch (err) {
      out[slug] = `error: ${err instanceof Error ? err.message : String(err)}`
    }
  }
  return out
}

let ensured: Promise<void> | null = null
export function ensureContent(): Promise<void> {
  if (!ensured) {
    ensured = seedAllDestinations()
      .then(() => undefined)
      .catch(err => {
        ensured = null
        console.error('[ensureContent] seeding failed:', err instanceof Error ? err.message : err)
      })
  }
  return ensured
}
