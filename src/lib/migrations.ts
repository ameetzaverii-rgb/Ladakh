// src/lib/migrations.ts
// Idempotent schema migrations, shared by the /api/migrate endpoint and the
// self-healing ensureSchema() call in the root layout. Every statement uses
// IF NOT EXISTS so running them repeatedly is safe and cheap.

import { db } from '@/lib/db'

interface Step { label: string; sql: string[] }

const STEPS: Step[] = [
  {
    label: 'TripConfig.categoryBudgets',
    sql: [`ALTER TABLE "TripConfig" ADD COLUMN IF NOT EXISTS "categoryBudgets" JSONB;`],
  },
  {
    label: 'ShopItem table',
    sql: [`
      CREATE TABLE IF NOT EXISTS "ShopItem" (
        "id"          TEXT PRIMARY KEY,
        "name"        TEXT NOT NULL,
        "area"        TEXT NOT NULL DEFAULT 'Leh',
        "category"    TEXT NOT NULL DEFAULT 'Handicraft',
        "estPriceINR" INTEGER,
        "whereToBuy"  TEXT,
        "priority"    TEXT NOT NULL DEFAULT 'nice',
        "acquired"    BOOLEAN NOT NULL DEFAULT false,
        "notes"       TEXT,
        "photo"       TEXT,
        "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `],
  },
  {
    label: 'ShopItem indexes',
    sql: [
      `CREATE INDEX IF NOT EXISTS "ShopItem_area_idx" ON "ShopItem" ("area");`,
      `CREATE INDEX IF NOT EXISTS "ShopItem_acquired_idx" ON "ShopItem" ("acquired");`,
    ],
  },
  {
    label: 'ItineraryDay customisation columns',
    sql: [
      `ALTER TABLE "ItineraryDay" ADD COLUMN IF NOT EXISTS "activities" JSONB NOT NULL DEFAULT '[]';`,
      `ALTER TABLE "ItineraryDay" ADD COLUMN IF NOT EXISTS "isCustom" BOOLEAN NOT NULL DEFAULT false;`,
      `ALTER TABLE "ItineraryDay" ADD COLUMN IF NOT EXISTS "sortOrder" DOUBLE PRECISION;`,
      `ALTER TABLE "ItineraryDay" ADD COLUMN IF NOT EXISTS "customName" TEXT;`,
      `ALTER TABLE "ItineraryDay" ADD COLUMN IF NOT EXISTS "customLat" DOUBLE PRECISION;`,
      `ALTER TABLE "ItineraryDay" ADD COLUMN IF NOT EXISTS "customLng" DOUBLE PRECISION;`,
      `UPDATE "ItineraryDay" SET "sortOrder" = "dayNumber" WHERE "sortOrder" IS NULL;`,
    ],
  },
]

/** Run every migration step in order. Returns the labels that succeeded. */
export async function runMigrations(): Promise<string[]> {
  const ran: string[] = []
  for (const step of STEPS) {
    for (const sql of step.sql) await db.$executeRawUnsafe(sql)
    ran.push(step.label)
  }
  return ran
}

// Self-healing: run the migrations once per server process. Cached so it only
// touches the DB on the first request after a cold start; later calls await an
// already-resolved promise. On failure the cache resets so a later request retries.
let ensured: Promise<void> | null = null
export function ensureSchema(): Promise<void> {
  if (!ensured) {
    ensured = runMigrations()
      .then(() => undefined)
      .catch(err => {
        ensured = null
        console.error('[ensureSchema] migration failed:', err instanceof Error ? err.message : err)
      })
  }
  return ensured
}
