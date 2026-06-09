import { AccountButton } from '@/components/AccountButton'
import { authConfigured } from '@/lib/auth'
import { MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Sign in' }

export default function SignInPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-tint-blue text-flag-blue"><MapPin className="h-6 w-6" /></span>
      <h1 className="font-serif text-2xl font-bold text-cream">Sign in</h1>
      <p className="mb-6 mt-1 text-sm text-stone">
        Browsing is open to everyone — sign in to save your own trips, journal, budget and checklist.
      </p>
      <div className="w-full">
        <AccountButton configured={authConfigured} />
      </div>
      {!authConfigured && (
        <p className="mt-4 text-xs text-muted">Google sign-in is being configured. Check back shortly.</p>
      )}
    </div>
  )
}
