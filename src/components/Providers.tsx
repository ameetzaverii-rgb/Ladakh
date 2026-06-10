'use client'

import { SessionProvider } from 'next-auth/react'
import { EditModeProvider } from './EditMode'

export function Providers({ children, gatingActive = false }: { children: React.ReactNode; gatingActive?: boolean }) {
  return (
    <SessionProvider>
      <EditModeProvider gatingActive={gatingActive}>{children}</EditModeProvider>
    </SessionProvider>
  )
}
