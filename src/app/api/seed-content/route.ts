import { NextResponse } from 'next/server'
import { seedAllDestinations } from '@/lib/seedContent'

// Force a content seed for the preset destinations (idempotent, per-model).
// GET /api/seed-content?token=ladakh2026 — returns a per-destination report.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('token') !== 'ladakh2026') {
    return NextResponse.json({ error: 'Unauthorized. Add ?token=ladakh2026' }, { status: 401 })
  }
  try {
    const report = await seedAllDestinations()
    return NextResponse.json({ ok: true, report })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
