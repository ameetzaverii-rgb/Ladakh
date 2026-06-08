import { NextResponse } from 'next/server'
import { runMigrations } from '@/lib/migrations'

// Idempotent schema migration endpoint. Migrations also run automatically on
// boot (see ensureSchema in the root layout); this endpoint is a manual trigger.
// Call GET /api/migrate?token=ladakh2026 to force a run.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('token') !== 'ladakh2026') {
    return NextResponse.json({ error: 'Unauthorized. Add ?token=ladakh2026' }, { status: 401 })
  }

  const ran: string[] = []
  try {
    const done = await runMigrations()
    ran.push(...done)
    return NextResponse.json({ ok: true, ran })
  } catch (err) {
    return NextResponse.json(
      { ok: false, ran, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
