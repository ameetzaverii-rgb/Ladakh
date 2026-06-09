import { AccountButton } from '@/components/AccountButton'
import { authConfigured } from '@/lib/auth'
import { TarchoLogo } from '@/components/Logo'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Sign in · Tarcho' }

export default function SignInPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-4 text-center">
      <TarchoLogo size="lg" layout="stacked" className="mb-5" />
      <h1 className="font-display text-2xl text-cream">Sign in</h1>
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
