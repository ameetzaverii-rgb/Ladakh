import { NextResponse } from 'next/server'
import { authConfigured } from '@/lib/auth'

// Reports whether sign-in / per-user gating is configured, WITHOUT exposing any
// secret values — just booleans. Open this at /api/health to confirm setup.
export const dynamic = 'force-dynamic'

export function GET() {
  const has = (v?: string | null) => !!(v && v.trim())

  const googleConfigured = authConfigured
  const adminEmailSet = has(process.env.ADMIN_EMAIL)
  const nextAuthSecretSet = has(process.env.NEXTAUTH_SECRET)
  const nextAuthUrlSet = has(process.env.NEXTAUTH_URL) || has(process.env.VERCEL_URL)
  const databaseUrlSet = has(process.env.DATABASE_URL)

  // Per-user mode (Phase 2b) is live only when sign-in + an admin email exist.
  const gatingActive = googleConfigured && adminEmailSet

  return NextResponse.json({
    mode: gatingActive ? 'per-user (sign-in required to edit)' : 'open shared demo',
    gatingActive,
    checks: {
      googleSignIn: googleConfigured,
      adminEmail: adminEmailSet,
      nextAuthSecret: nextAuthSecretSet,
      nextAuthUrl: nextAuthUrlSet,
      database: databaseUrlSet,
    },
    // What to set if gating is off but you want per-user mode:
    missing: [
      !googleConfigured && 'GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET',
      !adminEmailSet && 'ADMIN_EMAIL',
      !nextAuthSecretSet && 'NEXTAUTH_SECRET',
      !nextAuthUrlSet && 'NEXTAUTH_URL (or rely on VERCEL_URL)',
    ].filter(Boolean),
    checkedAt: new Date().toISOString(),
  })
}
