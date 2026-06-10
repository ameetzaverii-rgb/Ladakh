// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './db'

// Build the provider list from whatever is configured. Google is the primary
// social login; it is only added when its credentials are present, so the app
// keeps building/running before the env vars are set in Vercel.
function buildProviders() {
  const providers: NextAuthOptions['providers'] = []
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      })
    )
  }
  return providers
}

/** True when at least one social provider is configured (used to show sign-in UI). */
export const authConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  session: { strategy: 'jwt' },
  pages: { signIn: '/signin' },
  providers: buildProviders(),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id
        token.role = (user as any).role ?? 'VIEWER'
      }
      // The configured owner email is always treated as admin.
      const admin = process.env.ADMIN_EMAIL?.toLowerCase()
      if (admin && typeof token.email === 'string' && token.email.toLowerCase() === admin) {
        token.role = 'ADMIN'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.uid
        ;(session.user as any).role = token.role
        ;(session.user as any).isAdmin = token.role === 'ADMIN'
      }
      return session
    },
  },
}
