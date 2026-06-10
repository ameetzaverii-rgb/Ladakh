// Login-gated editing (Phase 2a).
// All write requests (POST/PUT/PATCH/DELETE) to /api/* require the admin to be
// signed in. Reads stay open to everyone. NextAuth's own /api/auth/* routes are
// excluded so sign-in keeps working.
//
// SAFE FALLBACK: if sign-in isn't configured yet (no Google creds or no
// ADMIN_EMAIL), gating is disabled so the app stays fully editable as before.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const WRITE = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export async function middleware(req: NextRequest) {
  if (!WRITE.has(req.method)) return NextResponse.next()

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  const gating = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && adminEmail)
  if (!gating) return NextResponse.next()

  const token = await getToken({ req })
  const role = (token as any)?.role
  const email = typeof token?.email === 'string' ? token.email.toLowerCase() : null
  const isAdmin = role === 'ADMIN' || (!!adminEmail && email === adminEmail)
  if (isAdmin) return NextResponse.next()

  return NextResponse.json(
    { error: 'Sign in as the admin to make changes.' },
    { status: 401 },
  )
}

// Guard all API routes except NextAuth's own endpoints.
export const config = { matcher: ['/api/((?!auth/).*)'] }
