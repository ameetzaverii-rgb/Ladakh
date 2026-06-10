// Auth gating (Phase 2a + 2b).
// Writes to /api/* require sign-in. Personal data (your trip, expenses, journal,
// checklist, bookings) can be written by ANY signed-in user (scoped to their own
// rows in the handlers). Curated catalog/admin endpoints require the admin.
// Reads stay open. NextAuth's own /api/auth/* routes are excluded.
//
// SAFE FALLBACK: if sign-in isn't configured (no Google creds or no ADMIN_EMAIL),
// gating is disabled so the app stays fully editable as before.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const WRITE = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
// Per-user data — any signed-in user may write their own rows.
const PERSONAL = ['/api/expenses', '/api/journal', '/api/checklist', '/api/booking', '/api/trip']

export async function middleware(req: NextRequest) {
  if (!WRITE.has(req.method)) return NextResponse.next()

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  const gating = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && adminEmail)
  if (!gating) return NextResponse.next()

  const token = await getToken({ req })
  if (!token) return NextResponse.json({ error: 'Sign in to make changes.' }, { status: 401 })

  const path = req.nextUrl.pathname
  const isPersonal = PERSONAL.some(p => path === p || path.startsWith(p + '/'))
  if (isPersonal) return NextResponse.next()

  const role = (token as any).role
  const email = typeof token.email === 'string' ? token.email.toLowerCase() : null
  const isAdmin = role === 'ADMIN' || (!!adminEmail && email === adminEmail)
  if (isAdmin) return NextResponse.next()

  return NextResponse.json({ error: 'Only the admin can edit the shared guide.' }, { status: 403 })
}

// Guard all API routes except NextAuth's own endpoints.
export const config = { matcher: ['/api/((?!auth/).*)'] }
