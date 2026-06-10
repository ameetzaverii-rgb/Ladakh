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
  {
    label: 'Destination table + Ladakh seed',
    sql: [
      `CREATE TABLE IF NOT EXISTS "Destination" (
        "id"        TEXT PRIMARY KEY,
        "slug"      TEXT NOT NULL UNIQUE,
        "name"      TEXT NOT NULL,
        "tagline"   TEXT NOT NULL DEFAULT '',
        "region"    TEXT NOT NULL DEFAULT '',
        "color"     TEXT NOT NULL DEFAULT 'blue',
        "heroWiki"  TEXT[] NOT NULL DEFAULT '{}',
        "heroSrc"   TEXT,
        "lat"       DOUBLE PRECISION NOT NULL DEFAULT 34.1526,
        "lng"       DOUBLE PRECISION NOT NULL DEFAULT 77.5771,
        "currency"  TEXT NOT NULL DEFAULT 'INR',
        "intro"     TEXT,
        "isCustom"  BOOLEAN NOT NULL DEFAULT false,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
      // Stable id = slug for the presets so backfill references are simple.
      `INSERT INTO "Destination" ("id","slug","name","tagline","region","color","heroWiki","lat","lng","currency","intro","sortOrder")
       VALUES
        ('ladakh','ladakh','Leh Ladakh','High-desert monasteries, lakes & passes','North India · 3,500m','blue',
         ARRAY['Thikse Monastery','Ladakh'], 34.1526, 77.5771, 'INR',
         'A high-altitude cold desert of Buddhist monasteries, turquoise lakes and the world''s highest motorable passes.', 0),
        ('kashmir','kashmir','Kashmir','Dal Lake, houseboats & alpine meadows','North India · 1,600m','green',
         ARRAY['Dal Lake','Kashmir Valley'], 34.0837, 74.7973, 'INR',
         'The Valley of houseboats, Mughal gardens, saffron fields and the alpine meadows of Gulmarg and Pahalgam.', 1),
        ('pokhara','pokhara','Pokhara','Lakeside calm under the Annapurnas','Nepal · 820m','red',
         ARRAY['Phewa Lake','Pokhara'], 28.2096, 83.9856, 'NPR',
         'Nepal''s laid-back lake city — paragliding over Phewa Lake, Annapurna sunrises and a gateway to the foothills.', 2),
        ('spiti','spiti','Spiti Valley','The middle land of cliff monasteries','Himachal · 3,800m','yellow',
         ARRAY['Key Monastery','Spiti Valley'], 32.2464, 78.0166, 'INR',
         'A remote Trans-Himalayan desert valley of fossil villages, ancient gompas and impossibly starry skies.', 3)
       ON CONFLICT ("slug") DO NOTHING;`,
    ],
  },
  {
    // Promote Sikkim to a full curated destination. Upsert (not DO NOTHING) so
    // that any earlier custom "sikkim" row is normalised to the curated preset
    // and marked non-custom; its content is seeded separately by ensureContent.
    label: 'Sikkim curated destination',
    sql: [
      `INSERT INTO "Destination" ("id","slug","name","tagline","region","color","heroWiki","lat","lng","currency","intro","sortOrder","isCustom")
       VALUES
        ('sikkim','sikkim','Sikkim','Monasteries, Kanchenjunga & alpine lakes','Northeast India · 1,650m','green',
         ARRAY['Rumtek Monastery','Gangtok'], 27.3389, 88.6065, 'INR',
         'India''s greenest Himalayan state — Buddhist monasteries, glacial lakes, orchid cloud-forests and dawn views of Kanchenjunga.', 4, false)
       ON CONFLICT ("slug") DO UPDATE SET
        "name"='Sikkim', "tagline"='Monasteries, Kanchenjunga & alpine lakes', "region"='Northeast India · 1,650m',
        "color"='green', "heroWiki"=ARRAY['Rumtek Monastery','Gangtok'], "lat"=27.3389, "lng"=88.6065, "currency"='INR',
        "intro"='India''s greenest Himalayan state — Buddhist monasteries, glacial lakes, orchid cloud-forests and dawn views of Kanchenjunga.',
        "sortOrder"=4, "isCustom"=false;`,
    ],
  },
  {
    label: 'destinationId columns + itinerary coords + TripConfig fields',
    sql: [
      `ALTER TABLE "Flight"        ADD COLUMN IF NOT EXISTS "destinationId" TEXT;`,
      `ALTER TABLE "Stay"          ADD COLUMN IF NOT EXISTS "destinationId" TEXT;`,
      `ALTER TABLE "Trek"          ADD COLUMN IF NOT EXISTS "destinationId" TEXT;`,
      `ALTER TABLE "Event"         ADD COLUMN IF NOT EXISTS "destinationId" TEXT;`,
      `ALTER TABLE "Transport"     ADD COLUMN IF NOT EXISTS "destinationId" TEXT;`,
      `ALTER TABLE "Place"         ADD COLUMN IF NOT EXISTS "destinationId" TEXT;`,
      `ALTER TABLE "ItineraryDay"  ADD COLUMN IF NOT EXISTS "destinationId" TEXT;`,
      `ALTER TABLE "ShopItem"      ADD COLUMN IF NOT EXISTS "destinationId" TEXT;`,
      `ALTER TABLE "ChecklistItem" ADD COLUMN IF NOT EXISTS "destinationId" TEXT;`,
      `ALTER TABLE "JournalEntry"  ADD COLUMN IF NOT EXISTS "destinationId" TEXT;`,
      `ALTER TABLE "Expense"       ADD COLUMN IF NOT EXISTS "destinationId" TEXT;`,
      `ALTER TABLE "ItineraryDay"  ADD COLUMN IF NOT EXISTS "lat" DOUBLE PRECISION;`,
      `ALTER TABLE "ItineraryDay"  ADD COLUMN IF NOT EXISTS "lng" DOUBLE PRECISION;`,
      `ALTER TABLE "ItineraryDay"  ADD COLUMN IF NOT EXISTS "altitudeM" INTEGER;`,
      `ALTER TABLE "ItineraryDay"  ADD COLUMN IF NOT EXISTS "locationName" TEXT;`,
      `ALTER TABLE "TripConfig"    ADD COLUMN IF NOT EXISTS "activeDestinationId" TEXT;`,
      `ALTER TABLE "TripConfig"    ADD COLUMN IF NOT EXISTS "enabledMenus" JSONB;`,
      `ALTER TABLE "TripConfig"    ADD COLUMN IF NOT EXISTS "onboarded" BOOLEAN NOT NULL DEFAULT true;`,
      `ALTER TABLE "TripConfig"    ADD COLUMN IF NOT EXISTS "tripType" TEXT NOT NULL DEFAULT 'WORKATION';`,
    ],
  },
  {
    label: 'Backfill existing data to Ladakh destination',
    sql: [
      `UPDATE "Flight"        SET "destinationId"='ladakh' WHERE "destinationId" IS NULL;`,
      `UPDATE "Stay"          SET "destinationId"='ladakh' WHERE "destinationId" IS NULL;`,
      `UPDATE "Trek"          SET "destinationId"='ladakh' WHERE "destinationId" IS NULL;`,
      `UPDATE "Event"         SET "destinationId"='ladakh' WHERE "destinationId" IS NULL;`,
      `UPDATE "Transport"     SET "destinationId"='ladakh' WHERE "destinationId" IS NULL;`,
      `UPDATE "Place"         SET "destinationId"='ladakh' WHERE "destinationId" IS NULL;`,
      `UPDATE "ItineraryDay"  SET "destinationId"='ladakh' WHERE "destinationId" IS NULL;`,
      `UPDATE "ShopItem"      SET "destinationId"='ladakh' WHERE "destinationId" IS NULL;`,
      `UPDATE "ChecklistItem" SET "destinationId"='ladakh' WHERE "destinationId" IS NULL;`,
      `UPDATE "JournalEntry"  SET "destinationId"='ladakh' WHERE "destinationId" IS NULL;`,
      `UPDATE "Expense"       SET "destinationId"='ladakh' WHERE "destinationId" IS NULL;`,
      `UPDATE "TripConfig"    SET "activeDestinationId"='ladakh' WHERE "activeDestinationId" IS NULL;`,
      // dayNumber was globally unique; make it unique per destination instead.
      `DROP INDEX IF EXISTS "ItineraryDay_dayNumber_key";`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ItineraryDay_destinationId_dayNumber_key" ON "ItineraryDay" ("destinationId","dayNumber");`,
    ],
  },
  {
    label: 'Per-user ownership (2b)',
    sql: [
      `ALTER TABLE "TripConfig"    ADD COLUMN IF NOT EXISTS "userId" TEXT;`,
      `ALTER TABLE "Expense"       ADD COLUMN IF NOT EXISTS "userId" TEXT;`,
      `ALTER TABLE "JournalEntry"  ADD COLUMN IF NOT EXISTS "userId" TEXT;`,
      `ALTER TABLE "ChecklistItem" ADD COLUMN IF NOT EXISTS "userId" TEXT;`,
      `CREATE INDEX IF NOT EXISTS "TripConfig_userId_idx"    ON "TripConfig" ("userId");`,
      `CREATE INDEX IF NOT EXISTS "Expense_userId_idx"       ON "Expense" ("userId");`,
      `CREATE INDEX IF NOT EXISTS "JournalEntry_userId_idx"  ON "JournalEntry" ("userId");`,
      `CREATE INDEX IF NOT EXISTS "ChecklistItem_userId_idx" ON "ChecklistItem" ("userId");`,
    ],
  },
  {
    label: 'Booking table (2b)',
    sql: [
      `CREATE TABLE IF NOT EXISTS "Booking" (
        "id"            TEXT PRIMARY KEY,
        "userId"        TEXT,
        "destinationId" TEXT,
        "type"          TEXT NOT NULL DEFAULT 'OTHER',
        "title"         TEXT NOT NULL,
        "vendor"        TEXT,
        "bookingRef"    TEXT,
        "costINR"       INTEGER,
        "date"          TIMESTAMP(3),
        "tripDay"       INTEGER,
        "url"           TEXT,
        "notes"         TEXT,
        "status"        TEXT NOT NULL DEFAULT 'CONFIRMED',
        "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS "Booking_userId_idx" ON "Booking" ("userId");`,
      `CREATE INDEX IF NOT EXISTS "Booking_destinationId_idx" ON "Booking" ("destinationId");`,
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
