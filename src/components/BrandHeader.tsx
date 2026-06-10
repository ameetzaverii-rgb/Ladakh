'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TarchoLogo } from './Logo'

// The sign-in page shows its own large hero logo, so skip the header there.
const HIDE_ON = ['/signin']

/** A slim, app-wide brand bar: the prayer-flag mark above the Tarcho wordmark,
 *  centred and visible on every screen, linking home. */
export function BrandHeader() {
  const pathname = usePathname()
  if (HIDE_ON.includes(pathname)) return null

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-dark/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-2.5">
        <Link href="/" aria-label="Tarcho home" className="press">
          <TarchoLogo size="sm" layout="stacked" />
        </Link>
      </div>
    </header>
  )
}
