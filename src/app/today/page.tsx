import { db } from '@/lib/db'
import { daysUntil, formatINR, FLAG, FLAG_TINT, type FlagColor } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'
import { AccountButton } from '@/components/AccountButton'
import { TarchoLogo } from '@/components/Logo'
import { DestinationSwitcher } from '@/components/TripControls'
import { authConfigured } from '@/lib/auth'
import { getCurrentWeather } from '@/lib/weather'
import { DAY_LOCATIONS } from '@/lib/locations'
import { activeDestinationId, getActiveContext } from '@/lib/destination'
import {
  CalendarDays, PartyPopper, Mountain, Wallet, ListChecks, BookOpen,
  BedDouble, ChevronRight, type LucideIcon,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const LEH = DAY_LOCATIONS[1]

async function getDashboardData(showWorkChecklist: boolean) {
  const destinationId = await activeDestinationId()
  const [config, allChecklist, expenses, journalCount, nextEvents] = await Promise.all([
    db.tripConfig.findFirst().catch(() => null),
    db.checklistItem.findMany({ where: { destinationId }, orderBy: [{ phase: 'asc' }, { priority: 'asc' }] }),
    db.expense.findMany({ where: { destinationId }, orderBy: { date: 'desc' } }),
    db.journalEntry.count({ where: { destinationId } }).catch(() => 0),
    db.event.findMany({
      where: { destinationId, startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      take: 1,
    }),
  ])

  // Leisure trips hide the work-setup checklist entirely.
  const checklistItems = showWorkChecklist ? allChecklist : allChecklist.filter(i => i.category !== 'WORK_SETUP')

  const tripStart = config?.tripStartDate ?? new Date('2026-07-22')
  const tripEnd = config?.tripEndDate ?? new Date('2026-08-11')
  const budget = config?.totalBudgetINR ?? 150000

  const totalSpent = expenses.reduce((sum, e) => sum + e.amountINR, 0)
  const checklistDone = checklistItems.filter(i => i.completed).length
  const daysToTrip = daysUntil(tripStart)
  const isOnTrip = daysToTrip <= 0 && daysUntil(tripEnd) >= 0

  // While on the trip, today's itinerary day powers the "Today" hero.
  const currentDay = isOnTrip ? 1 - daysToTrip : null
  const todayPlan = currentDay
    ? await db.itineraryDay.findFirst({ where: { dayNumber: currentDay, destinationId } }).catch(() => null)
    : null

  return {
    tripStart, tripEnd, budget, totalSpent,
    checklistTotal: checklistItems.length, checklistDone,
    daysToTrip, isOnTrip, todayPlan, journalCount,
    nextEvent: nextEvents[0] ?? null,
  }
}

function greeting() {
  const h = new Date().getUTCHours() + 5 // rough IST
  const hour = (h >= 24 ? h - 24 : h)
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function Dashboard() {
  const ctx = await getActiveContext()
  const destinations = await db.destination.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, slug: true, name: true } })
  const destName = ctx.dest?.name ?? 'Ladakh'
  const destLat = ctx.dest?.lat ?? LEH.lat
  const destLng = ctx.dest?.lng ?? LEH.lng
  const travelerName = ctx.cfg?.travelerName || 'there'

  const [data, currentWeather] = await Promise.all([
    getDashboardData(ctx.features.showWorkChecklist),
    getCurrentWeather(destLat, destLng),
  ])

  const {
    tripStart, budget, totalSpent, checklistTotal, checklistDone,
    daysToTrip, isOnTrip, todayPlan, journalCount, nextEvent,
  } = data
  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0
  const on = (key: string) => ctx.enabledMenus.includes(key)

  // Prayer-flag ribbon — the colourful quick-nav. Plan & Budget always present.
  const ribbon = [
    { label: 'Plan', href: '/itinerary', color: 'blue' as const, show: true },
    { label: 'Stay', href: '/stays', color: 'air' as const, show: on('stays') },
    { label: 'Culture', href: '/events', color: 'red' as const, show: on('events') },
    { label: 'Treks', href: '/treks', color: 'green' as const, show: on('treks') },
    { label: 'Budget', href: '/budget', color: 'yellow' as const, show: true },
  ].filter(f => f.show)

  // Bento tiles — real data, respecting which sections the trip has enabled.
  const tiles: TileProps[] = [
    on('events') && { href: '/events', color: 'red', icon: PartyPopper, title: 'Festivals', sub: nextEvent?.name ?? 'See what’s on' },
    on('treks') && { href: '/treks', color: 'green', icon: Mountain, title: 'Treks', sub: 'Weekend adventures' },
    on('stays') && { href: '/stays', color: 'blue', icon: BedDouble, title: 'Stays', sub: 'Where you’ll sleep' },
    { href: '/budget', color: 'yellow', icon: Wallet, title: 'Budget', sub: `${formatINR(totalSpent)} of ${formatINR(budget)}` },
    { href: '/journal', color: 'ink', icon: BookOpen, title: 'Journal', sub: `${journalCount} ${journalCount === 1 ? 'entry' : 'entries'}` },
    on('prep') && { href: '/prep', color: 'blue', icon: ListChecks, title: 'Prep list', sub: `${checklistPct}% ready` },
  ].filter(Boolean) as TileProps[]

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      {/* Brand */}
      <div className="mb-4 flex justify-center">
        <Link href="/" aria-label="Tarcho home"><TarchoLogo size="sm" layout="stacked" /></Link>
      </div>

      {/* Controls — destination · weather · account */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <DestinationSwitcher destinations={destinations} activeId={ctx.dest?.id ?? null} variant="chip" />
        <div className="flex shrink-0 items-center gap-2">
          {currentWeather && (
            <Link href="/weather" title="Forecast"
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold"
              style={{ background: FLAG_TINT.blue, color: '#235a98' }}>
              <span className="text-base leading-none">{currentWeather.icon}</span>{currentWeather.temp}°
            </Link>
          )}
          <AccountButton configured={authConfigured} compact />
        </div>
      </div>

      {/* Greeting */}
      <h1 className="text-2xl font-semibold leading-tight tracking-tight" style={{ color: FLAG.blue }}>
        {greeting()}, {travelerName}
      </h1>
      <p className="mt-1 text-sm text-stone">
        {isOnTrip
          ? `You’re in ${destName} · ${format(new Date(), 'EEE, MMM d')}`
          : `${format(new Date(), 'EEE, MMM d')} · ${daysToTrip > 0 ? daysToTrip : 0} days to ${destName}`}
      </p>

      {/* Prayer-flag ribbon nav */}
      <nav className="relative mt-5" aria-label="Quick navigation">
        <div className="absolute left-1 right-1 top-0 h-px bg-border" />
        <div className="flex gap-1.5 pt-1.5">
          {ribbon.map(f => {
            const air = f.color === 'air'
            const fg = air ? FLAG.ink : '#fff'
            return (
              <Link key={f.label} href={f.href}
                className="press flex flex-1 flex-col items-center gap-1 rounded-b-xl pb-2.5 pt-3"
                style={{ background: air ? '#f6f1e7' : FLAG[f.color], border: air ? '1px solid var(--border)' : 'none' }}>
                <RibbonIcon label={f.label} color={fg} />
                <span className="text-[0.62rem] font-bold" style={{ color: fg }}>{f.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bento grid */}
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {/* Today / countdown hero */}
        <Link href="/itinerary"
          className="press relative col-span-2 flex min-h-[112px] flex-col justify-end overflow-hidden rounded-2xl p-4 text-white shadow-soft"
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

        {tiles.map(t => <Tile key={t.href} {...t} />)}
      </div>

      {/* Explore everything */}
      <Link href="/more"
        className="press mt-4 flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3.5 shadow-soft">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: FLAG_TINT.ink }}>
          <BookOpen className="h-[18px] w-[18px]" style={{ color: FLAG.ink }} />
        </span>
        <div className="min-w-0">
          <div className="text-sm font-bold text-cream">Explore everything</div>
          <div className="text-xs text-stone">Stays, food, transport, flights & more</div>
        </div>
        <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-muted" />
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
    <Link href={href} className="press rounded-2xl border border-border bg-white p-3.5 shadow-soft">
      <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: FLAG_TINT[color] }}>
        <Icon className="h-[18px] w-[18px]" style={{ color: FLAG[color] }} strokeWidth={2.2} />
      </span>
      <div className="text-sm font-bold text-cream">{title}</div>
      <div className="truncate text-[0.68rem] text-stone">{sub}</div>
    </Link>
  )
}
