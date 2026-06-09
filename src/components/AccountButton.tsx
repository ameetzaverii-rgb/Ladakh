'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { LogIn, LogOut, User as UserIcon } from 'lucide-react'

/** Sign-in / account control. Shows nothing useful until Google is configured. */
export function AccountButton({ configured }: { configured: boolean }) {
  const { data: session, status } = useSession()

  if (status === 'authenticated' && session?.user) {
    const u = session.user
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 shadow-soft">
        {u.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={u.image} alt="" className="h-7 w-7 rounded-full" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-tint-blue text-flag-blue"><UserIcon className="h-4 w-4" /></span>
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-cream">{u.name ?? 'Signed in'}</div>
          <div className="truncate text-[0.62rem] text-stone">{u.email}</div>
        </div>
        <button onClick={() => signOut()} className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-stone hover:text-rust">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => (configured ? signIn('google') : undefined)}
      disabled={!configured}
      title={configured ? 'Sign in to save your trips' : 'Sign-in is being set up'}
      className="press flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-bold text-cream shadow-soft hover:border-gold-mid disabled:opacity-60"
    >
      <LogIn className="h-4 w-4" />
      {configured ? 'Sign in with Google' : 'Sign-in coming soon'}
    </button>
  )
}
