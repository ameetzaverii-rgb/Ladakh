import { db } from '@/lib/db'
import Link from 'next/link'
import { format } from 'date-fns'
import { daysUntil, formatINR, FLAG, FLAG_TINT, type FlagColor } from '@/lib/utils'
import { activeDestinationId, getActiveContext } from '@/lib/destination'
import {
  CalendarDays, PartyPopper, Mountain, Wallet, BookOpen, BedDouble,
  MapPin, ArrowRight, type LucideIcon,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getData() {
  const destinationId = await activeDestinationId()
  const [config, expenses, journalCount, nextEvents, firstTrek] = await Promise.all([
    db.tripConfig.findFirst().catch(() => null),
    db.expense.findMany({ where: { destinationId } }).catch(() => []),
    db.journalEntry.count({ where: { destinationId } }).catch(() => 0),
    db.event.findMany({ where: { destinationId, startDate: { gte: new Date() } }, orderBy: { startDate: 'asc' }, take: 1 }).catch(() => []),
    db.trek.findFirst({ where: { destinationId }, select: { name: true } }).catch(() => null),
  ])
  const tripStart = config?.tripStartDate ?? new Date('2026-07-22')
  const tripEnd = config?.tripEndDate ?? new Date('2026-08-11')
  const budget = config?.totalBudgetINR ?? 150000
  const totalSpent = expenses.reduce((s, e) => s + e.amountINR, 0)
  const daysToTrip = daysUntil(tripStart)
  const isOnTrip = daysToTrip <= 0 && daysUntil(tripEnd) >= 0
  const currentDay = isOnTrip ? 1 - daysToTrip : null
  const todayPlan = currentDay
    ? await db.itineraryDay.findFirst({ where: { dayNumber: currentDay, destinationId } }).catch(() => null)
    : null
  return { tripStart, budget, totalSpent, daysToTrip, isOnTrip, todayPlan, journalCount, nextEvent: nextEvents[0] ?? null, firstTrek }
}

function greeting() {
  const h = new Date().getUTCHours() + 5 // rough IST
  const hour = h >= 24 ? h - 24 : h
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function Home() {
  const ctx = await getActiveContext()
  const destName = ctx.dest?.name ?? 'Ladakh'
  const travelerName = ctx.cfg?.travelerName || 'there'
  const { tripStart, budget, totalSpent, daysToTrip, isOnTrip, todayPlan, journalCount, nextEvent, firstTrek } = await getData()
  const on = (k: string) => ctx.enabledMenus.includes(k)

  // Prayer-flag ribbon — colourful quick-nav. Plan & Budget always present.
  const ribbon = [
    { label: 'Plan', href: '/itinerary', color: 'blue' as const, show: true },
    { label: 'Stay', href: '/stays', color: 'air' as const, show: on('stays') },
    { label: 'Culture', href: '/events', color: 'red' as const, show: on('events') },
    { label: 'Treks', href: '/treks', color: 'green' as const, show: on('treks') },
    { label: 'Budget', href: '/budget', color: 'yellow' as const, show: true },
  ].filter(f => f.show)

  const tiles: TileProps[] = [
    on('events') && { href: '/events', color: 'red', icon: PartyPopper, title: 'Festivals', sub: nextEvent?.name ?? 'See what’s on' },
    on('treks') && { href: '/treks', color: 'green', icon: Mountain, title: 'Treks', sub: firstTrek?.name ?? 'Weekend adventures' },
    { href: '/budget', color: 'yellow', icon: Wallet, title: 'Budget', sub: `${formatINR(totalSpent)} of ${formatINR(budget)}` },
    { href: '/journal', color: 'ink', icon: BookOpen, title: 'Journal', sub: `${journalCount} ${journalCount === 1 ? 'entry' : 'entries'}` },
  ].filter(Boolean) as TileProps[]

  return (
    <div className="mx-auto max-w-md px-4 py-5">
      {/* Dark hero panel — greeting · flag ribbon · today */}
      <div className="overflow-hidden rounded-[1.75rem] p-5 shadow-lift" style={{ background: '#141821' }}>
        {/* Switch / pick trip */}
        <div className="flex justify-end">
          <Link href="/start" aria-label="Switch or start a trip"
            className="press flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-soft">
            <MapPin className="h-5 w-5" style={{ color: FLAG.blue }} />
          </Link>
        </div>

        <h1 className="mt-1 text-2xl font-bold leading-tight" style={{ color: '#5b9be0' }}>
          {greeting()}, {travelerName}
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#9aa1ae' }}>
          {isOnTrip
            ? `You’re in ${destName} · ${format(new Date(), 'EEE, MMM d')}`
            : `${daysToTrip > 0 ? daysToTrip : 0} days to ${destName} · ${format(new Date(), 'EEE, MMM d')}`}
        </p>

        {/* Prayer-flag ribbon */}
        <div className="mt-4 border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <div className="flex gap-1.5">
            {ribbon.map(f => {
              const air = f.color === 'air'
              const fg = air ? FLAG.ink : '#fff'
              return (
                <Link key={f.label} href={f.href}
                  className="press flex flex-1 flex-col items-center gap-1 rounded-xl py-2.5"
                  style={{ background: air ? '#f3ede1' : FLAG[f.color] }}>
                  <RibbonIcon label={f.label} color={fg} />
                  <span className="text-[0.62rem] font-bold" style={{ color: fg }}>{f.label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Today / countdown hero */}
        <Link href="/itinerary"
          className="press relative mt-3 flex min-h-[112px] flex-col justify-end overflow-hidden rounded-2xl p-4 text-white"
          style={{ background: `linear-gradient(110deg, ${FLAG.blue}, ${FLAG.red} 60%, ${FLAG.yellow})` }}>
          {isOnTrip && todayPlan ? (
            <>
              <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-white/85">Today · Day {todayPlan.dayNumber}</span>
              <span className="text-lg font-extrabold leading-tight drop-shadow">{todayPlan.title}</span>
            </>
          ) : (
            <>
              <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-white/85">Countdown</span>
              <span className="text-lg font-extrabold leading-tight drop-shadow">
                {daysToTrip > 0 ? `${daysToTrip} days to ${destName}` : `Your ${destName} trip`}
              </span>
              <span className="mt-0.5 text-xs text-white/85">Departs {format(tripStart, 'MMM d, yyyy')}</span>
            </>
          )}
        </Link>

        {/* Bento tiles */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          {tiles.map(t => <Tile key={t.href} {...t} />)}
        </div>
      </div>

      {/* Into the detailed dashboard */}
      <Link href="/today"
        className="press mt-3 flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-white px-5 py-3 text-sm font-bold text-cream shadow-soft hover:border-gold-mid">
        Open full dashboard <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

const RIBBON_ICON: Record<string, LucideIcon> = {
  Plan: CalendarDays, Stay: BedDouble, Culture: PartyPopper, Treks: Mountain, Budget: Wallet,
}
function RibbonIcon({ label, color }: { label: string; color: string }) {
  const Icon = RIBBON_ICON[label] ?? CalendarDays
  return <Icon className="h-[18px] w-[18px]" style={{ color }} strokeWidth={2.2} />
}

interface TileProps { href: string; color: FlagColor; icon: LucideIcon; title: string; sub: string }
function Tile({ href, color, icon: Icon, title, sub }: TileProps) {
  return (
    <Link href={href} className="press rounded-2xl bg-white p-3.5 shadow-soft">
      <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: FLAG_TINT[color] }}>
        <Icon className="h-[18px] w-[18px]" style={{ color: FLAG[color] }} strokeWidth={2.2} />
      </span>
      <div className="text-sm font-bold text-cream">{title}</div>
      <div className="truncate text-[0.68rem] text-stone">{sub}</div>
    </Link>
  )
}
