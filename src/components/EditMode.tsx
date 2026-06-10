'use client'

import { createContext, useContext } from 'react'
import { useSession } from 'next-auth/react'

// `gatingActive` is true only when sign-in + an admin email are configured.
const Ctx = createContext<{ gatingActive: boolean }>({ gatingActive: false })

export function EditModeProvider({ gatingActive, children }: { gatingActive: boolean; children: React.ReactNode }) {
  return <Ctx.Provider value={{ gatingActive }}>{children}</Ctx.Provider>
}

/**
 * True when the current viewer may edit shared trip data — i.e. they're the
 * signed-in admin, or gating is off because sign-in isn't configured yet.
 */
export function useCanEdit(): boolean {
  const { gatingActive } = useContext(Ctx)
  const { data } = useSession()
  if (!gatingActive) return true
  return !!(data?.user as any)?.isAdmin
}
