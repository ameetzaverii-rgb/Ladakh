import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// One-time, idempotent schema migration endpoint.
// Call GET /api/migrate?token=ladakh2026 after deploying schema changes so the
// live database gets new tables/columns without running the Prisma CLI.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('token') !== 'ladakh2026') {
    return NextResponse.json({ error: 'Unauthorized. Add ?token=ladakh2026' }, { status: 401 })
  }

  const ran: string[] = []
  try {
    // Per-category budget targets on the trip config.
    await db.$executeRawUnsafe(
      `ALTER TABLE "TripConfig" ADD COLUMN IF NOT EXISTS "categoryBudgets" JSONB;`
    )
    ran.push('TripConfig.categoryBudgets')

    // Shopping / souvenir repository.
    await db.$executeRawUnsafe(`
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
    `)
    ran.push('ShopItem table')

    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ShopItem_area_idx" ON "ShopItem" ("area");`)
    await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ShopItem_acquired_idx" ON "ShopItem" ("acquired");`)
    ran.push('ShopItem indexes')

    return NextResponse.json({ ok: true, ran })
  } catch (err) {
    return NextResponse.json(
      { ok: false, ran, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
