import { db } from '@/lib/db'
import Link from 'next/link'
import { getActiveContext } from '@/lib/destination'
import { authConfigured } from '@/lib/auth'
import { AccountButton } from '@/components/AccountButton'
import { TarchoLogo, FlagString } from '@/components/Logo'
import { FLAG, FLAG_TINT, type FlagColor } from '@/lib/utils'
import { ArrowRight, MapPin, Plus, Compass } from 'lucide-react'

export const dynamic = 'force-dynamic'

const COLORS: FlagColor[] = ['blue', 'green', 'red', 'yellow']

export default async function Landing() {
  const [ctx, destinations] = await Promise.all([
    getActiveContext(),
    db.destination.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, slug: true, name: true, region: true, tagline: true, color: true } }).catch(() => []),
  ])

  const hasTrip = !!ctx.dest && ctx.onboarded
  const tripName = ctx.dest?.name ?? null

  return (
    <div className="mx-auto min-h-screen max-w-md px-5 pb-28 pt-5">
      {/* Top bar — account / sign-in */}
      <div className="flex justify-end">
        <AccountButton configured={authConfigured} compact />
      </div>

      {/* Hero */}
      <header className="mt-10 flex flex-col items-center text-center">
        <TarchoLogo size="xl" layout="stacked" />
        <p className="mt-4 font-display text-base italic text-stone">a string of prayer flags on the wind</p>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
          Plan, journal and budget your Himalayan trip — one calm, colourful place.
        </p>
      </header>

      {/* Continue / start the active trip */}
      <div className="mt-10">
        {hasTrip ? (
          <Link
            href="/today"
            className="press group flex items-center gap-3 rounded-2xl px-5 py-4 text-white shadow-soft"
            style={{ background: `linear-gradient(100deg, ${FLAG.blue} 0%, ${FLAG.red} 60%, ${FLAG.yellow} 100%)` }}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Compass className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.62rem] font-semibold uppercase tracking-wide text-white/80">Continue your trip</span>
              <span className="block truncate text-lg font-extrabold leading-tight">{tripName}</span>
            </span>
            <ArrowRight className="ml-auto h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <Link
            href="/start"
            className="press group flex items-center gap-3 rounded-2xl px-5 py-4 text-white shadow-soft"
            style={{ background: `linear-gradient(100deg, ${FLAG.blue} 0%, ${FLAG.red} 60%, ${FLAG.yellow} 100%)` }}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold leading-tight">Start your first trip</span>
            <ArrowRight className="ml-auto h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}

        {hasTrip && (
          <Link href="/start" className="press mt-3 flex items-center justify-center gap-2 rounded-2xl border border-border bg-white px-5 py-3 text-sm font-bold text-cream shadow-soft hover:border-gold-mid">
            <Plus className="h-4 w-4 text-flag-blue" /> Start a new trip
          </Link>
        )}
      </div>

      {/* Pick a destination */}
      {destinations.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-center gap-2">
            <FlagString width={56} />
            <h2 className="font-display text-lg text-cream">Choose a destination</h2>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {destinations.map((d, i) => {
              const color = (COLORS.includes(d.color as FlagColor) ? d.color : COLORS[i % COLORS.length]) as FlagColor
              const active = d.id === ctx.dest?.id
              return (
                <Link
                  key={d.id}
                  href="/start"
                  className="press group flex items-center gap-3 rounded-2xl border border-border bg-white p-3 shadow-soft transition-shadow hover:shadow-lift"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: FLAG_TINT[color] }}>
                    <MapPin className="h-5 w-5" style={{ color: FLAG[color] }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-bold text-cream">{d.name}</span>
                      {active && <span className="rounded-full bg-tint-blue px-2 py-0.5 text-[0.55rem] font-bold text-flag-blue">Current</span>}
                    </span>
                    <span className="block truncate text-xs text-stone">{d.region}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-stone transition-transform group-hover:translate-x-0.5" />
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Sign in to save */}
      <section className="mt-10 rounded-2xl border border-border bg-white/60 p-4 text-center">
        <h2 className="font-display text-lg text-cream">Sign in to save your trips</h2>
        <p className="mx-auto mb-3 mt-1 max-w-xs text-xs leading-relaxed text-stone">
          Browsing is open to everyone. Sign in to keep your itinerary, journal, budget and checklist across devices.
        </p>
        <AccountButton configured={authConfigured} />
      </section>
    </div>
  )
}
