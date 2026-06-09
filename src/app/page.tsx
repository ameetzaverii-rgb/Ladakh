import { db } from '@/lib/db'
import { daysUntil, formatINR, FLAG, FLAG_TINT, type FlagColor } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'
import { QuickActions } from '@/components/QuickActions'
import { AccountButton } from '@/components/AccountButton'
import { authConfigured } from '@/lib/auth'
import { DailyAlert } from '@/components/DailyAlert'
import { PhotoTile } from '@/components/Photo'
import { getCategoryImageFor } from '@/lib/imagery'
import { getCurrentWeather } from '@/lib/weather'
import { DAY_LOCATIONS } from '@/lib/locations'
import { activeDestinationId, getActiveContext } from '@/lib/destination'
import {
  CalendarDays, PartyPopper, Mountain, Wallet, ListChecks, BookOpen,
  ChevronRight, Images, MapPin, ChevronsUpDown, type LucideIcon,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const LEH = DAY_LOCATIONS[1]

async function getDashboardData() {
  const destinationId = await activeDestinationId()
  const [config, checklistItems, expenses, journalEntries, nextEvents] = await Promise.all([
    db.tripConfig.findFirst().catch(() => null),
    db.checklistItem.findMany({ where: { destinationId }, orderBy: [{ phase: 'asc' }, { priority: 'asc' }] }),
    db.expense.findMany({ where: { destinationId }, orderBy: { date: 'desc' } }),
    db.journalEntry.findMany({ where: { destinationId }, orderBy: { date: 'desc' }, take: 3 }),
    db.event.findMany({
      where: { destinationId, startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      take: 3,
    }),
  ])

  const tripStart = config?.tripStartDate ?? new Date('2026-07-22')
  const tripEnd = config?.tripEndDate ?? new Date('2026-08-11')
  const budget = config?.totalBudgetINR ?? 150000

  const totalSpent = expenses.reduce((sum, e) => sum + e.amountINR, 0)
  const checklistDone = checklistItems.filter(i => i.completed).length
  const daysToTrip = daysUntil(tripStart)
  const isOnTrip = daysToTrip <= 0 && daysUntil(tripEnd) >= 0

  const urgentItems = checklistItems.filter(i =>
    !i.completed && (i.phase === 'ASAP' || i.phase === 'MONTH_BEFORE')
  ).slice(0, 5)

  // While on the trip, today's itinerary day powers the daily alert banner.
  const currentDay = isOnTrip ? 1 - daysToTrip : null
  const todayPlan = currentDay
    ? await db.itineraryDay.findFirst({ where: { dayNumber: currentDay, destinationId } }).catch(() => null)
    : null

  return {
    tripStart, tripEnd, budget, totalSpent,
    checklistTotal: checklistItems.length, checklistDone,
    daysToTrip, isOnTrip, urgentItems, todayPlan,
    recentJournal: journalEntries, nextEvents,
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
  const destName = ctx.dest?.name ?? 'Ladakh'
  const destLat = ctx.dest?.lat ?? LEH.lat
  const destLng = ctx.dest?.lng ?? LEH.lng
  const slug = ctx.dest?.slug
  const hero = ctx.dest?.heroWiki
  const travelerName = ctx.cfg?.travelerName || 'there'
  const [data, currentWeather, itinImg, festImg, trekImg, budgetImg, galleryImg] = await Promise.all([
    getDashboardData(),
    getCurrentWeather(destLat, destLng),
    getCategoryImageFor('itinerary', slug, hero),
    getCategoryImageFor('events', slug, hero),
    getCategoryImageFor('treks', slug, hero),
    getCategoryImageFor('budget', slug, hero),
    getCategoryImageFor('gallery', slug, hero),
  ])

  const {
    tripStart, budget, totalSpent, checklistTotal, checklistDone,
    daysToTrip, isOnTrip, urgentItems, todayPlan, recentJournal, nextEvents,
  } = data

  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0
  const budgetPct = Math.min(Math.round((totalSpent / budget) * 100), 100)

  return (
    <div className="mx-auto max-w-3xl px-4 py-7">

      {/* On-trip daily reminder */}
      {todayPlan && (
        <DailyAlert plan={{
          day: todayPlan.dayNumber,
          title: todayPlan.title,
          isWorkDay: todayPlan.isWorkDay,
          isTrekDay: todayPlan.isTrekDay,
          isFestivalDay: todayPlan.isFestivalDay,
          isExcursionDay: todayPlan.isExcursionDay,
        }} />
      )}

      {/* Masthead — row 1: trip chip + weather · row 2: greeting · row 3: date/countdown */}
      <div className="mb-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Link
            href="/start"
            title="Switch destination or start a new trip"
            className="flex min-w-0 items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-bold text-cream shadow-soft transition-colors hover:border-gold-mid"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-flag-red" />
            <span className="truncate">{destName}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-stone" />
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            {currentWeather && (
              <Link
                href="/weather"
                title="See the day-by-day forecast"
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold"
                style={{ background: FLAG_TINT.blue, color: '#235a98' }}
              >
                <span className="text-base leading-none">{currentWeather.icon}</span>
                {currentWeather.temp}°
              </Link>
            )}
            <AccountButton configured={authConfigured} compact />
          </div>
        </div>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight" style={{ color: FLAG.blue }}>{greeting()}, {travelerName}</h1>
        <p className="mt-1 text-sm text-stone">
          {isOnTrip
            ? `You're in ${destName} · ${format(new Date(), 'EEE, MMM d')}`
            : `${format(new Date(), 'EEE, MMM d')} · ${daysToTrip > 0 ? daysToTrip : 0} days to ${destName}`}
        </p>
      </div>

      {/* Countdown banner */}
      <div
        className="relative mb-6 overflow-hidden rounded-2xl px-5 py-5 text-white shadow-soft"
        style={{ background: `linear-gradient(100deg, ${FLAG.blue} 0%, ${FLAG.red} 55%, ${FLAG.yellow} 100%)` }}
      >
        {isOnTrip ? (
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
            <div>
              <div className="text-xl font-extrabold leading-tight">You&apos;re in {destName}</div>
              <div className="text-sm text-white/85">Make today count</div>
            </div>
            <Link href="/itinerary" className="ml-auto rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur-sm">
              Today
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="text-4xl font-extrabold leading-none">{daysToTrip > 0 ? daysToTrip : 0}</div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">days until your trip</div>
              <div className="text-sm text-white/80">Departs {format(tripStart, 'MMM d, yyyy')}</div>
            </div>
            <Link href="/itinerary" className="ml-auto rounded-full bg-white/20 px-4 py-2 text-sm font-bold backdrop-blur-sm hover:bg-white/30">
              View plan
            </Link>
          </div>
        )}
      </div>

      {/* Colour-coded photo tiles (respect the trip's enabled menus) */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <PhotoTile href="/itinerary" src={itinImg?.src ?? null} color="blue" icon={CalendarDays} title="Itinerary" sub="Your day-by-day plan" />
        {ctx.enabledMenus.includes('events') && (
          <PhotoTile href="/events" src={festImg?.src ?? null} color="red" icon={PartyPopper} title="Festivals"
            sub={nextEvents[0] ? nextEvents[0].name : 'See what’s on'} />
        )}
        {ctx.enabledMenus.includes('treks') && (
          <PhotoTile href="/treks" src={trekImg?.src ?? null} color="green" icon={Mountain} title="Treks" sub="Weekend adventures" />
        )}
        <PhotoTile href="/budget" src={budgetImg?.src ?? null} color="yellow" icon={Wallet} title="Budget"
          sub={`${formatINR(totalSpent)} of ${formatINR(budget)}`} />
      </div>

      {/* Places gallery CTA */}
      {ctx.enabledMenus.includes('gallery') && (
      <Link href="/gallery"
        className="group press relative mb-6 block h-28 overflow-hidden rounded-2xl shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
        {galleryImg?.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={galleryImg.src} alt="Places to visit" className="img-zoom absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: FLAG.blue }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
        <div className="absolute inset-0 flex items-center gap-3 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Images className="h-6 w-6 text-white" strokeWidth={2.2} />
          </span>
          <div>
            <div className="text-lg font-extrabold text-white drop-shadow">Places gallery</div>
            <div className="text-xs text-white/85">Every stop on your 21-day plan, in pictures</div>
          </div>
          <ChevronRight className="ml-auto h-5 w-5 text-white/80" />
        </div>
      </Link>
      )}

      {/* Progress */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ProgressCard
          href="/prep" color="blue" icon={ListChecks} label="Prep checklist"
          value={`${checklistDone}/${checklistTotal}`} pct={checklistPct} note={`${checklistPct}% ready`}
        />
        <ProgressCard
          href="/budget" color={budgetPct > 80 ? 'red' : 'yellow'} icon={Wallet} label="Budget used"
          value={formatINR(totalSpent)} pct={budgetPct} note={`${formatINR(budget - totalSpent)} left`}
        />
      </div>

      {/* Quick log */}
      <QuickActions />

      {/* Urgent */}
      {urgentItems.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Urgent" href="/prep" linkLabel="See all" />
          <div className="space-y-2">
            {urgentItems.map(item => (
              <ChecklistRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recent journal */}
      {recentJournal.length > 0 && (
        <section className="mb-6">
          <SectionHeader title="Recent journal" href="/journal" linkLabel="All entries" />
          <div className="grid gap-3 sm:grid-cols-3">
            {recentJournal.map(entry => (
              <JournalCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      )}

      {/* Explore everything */}
      <Link
        href="/more"
        className="flex items-center gap-3 rounded-2xl border border-border bg-white px-5 py-4 shadow-soft transition-transform hover:-translate-y-0.5"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: FLAG_TINT.ink }}>
          <BookOpen className="h-5 w-5" style={{ color: FLAG.ink }} />
        </span>
        <div>
          <div className="font-bold text-cream">Explore everything</div>
          <div className="text-xs text-stone">Stays, food, transport, flights & more</div>
        </div>
        <ChevronRight className="ml-auto h-5 w-5 text-muted" />
      </Link>

    </div>
  )
}

function ProgressCard({ href, color, icon: Icon, label, value, pct, note }: {
  href: string; color: FlagColor; icon: LucideIcon; label: string; value: string; pct: number; note: string
}) {
  return (
    <Link href={href} className="card-base p-4">
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: FLAG[color] }} />
        <span className="text-xs font-semibold text-stone">{label}</span>
      </div>
      <div className="text-xl font-extrabold text-cream">{value}</div>
      <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: '#eee9df' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: FLAG[color] }} />
      </div>
      <div className="mt-1.5 text-[0.7rem] text-muted">{note}</div>
    </Link>
  )
}

function SectionHeader({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-extrabold text-cream">{title}</h2>
      {href && linkLabel && (
        <Link href={href} className="flex items-center gap-0.5 text-xs font-semibold text-stone hover:text-cream">
          {linkLabel} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}

function ChecklistRow({ item }: { item: any }) {
  const phaseColors: Record<string, string> = {
    ASAP: 'pill-rust',
    MONTH_BEFORE: 'pill-gold',
    WEEK_BEFORE: 'pill-sky',
  }
  return (
    <Link href="/prep" className="press card-base flex items-center gap-3 px-4 py-3">
      <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.completed ? 'bg-sage' : 'bg-rust'}`} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-sand">{item.title}</div>
        {item.notes && <div className="truncate text-xs text-stone">{item.notes}</div>}
      </div>
      <span className={`pill ${phaseColors[item.phase] ?? 'pill-gold'} shrink-0`}>
        {item.phase.replace('_', ' ').replace('BEFORE', '').trim()}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
    </Link>
  )
}

function JournalCard({ entry }: { entry: any }) {
  const moodEmoji = ['', '😔', '😐', '🙂', '😊', '🤩']
  return (
    <div className="card-base p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full px-2 py-0.5 text-[0.7rem] font-bold" style={{ background: FLAG_TINT.ink, color: FLAG.ink }}>
          Day {entry.tripDay}
        </span>
        {entry.mood && <span className="text-base">{moodEmoji[entry.mood]}</span>}
      </div>
      {entry.title && <div className="mb-1 font-bold text-cream">{entry.title}</div>}
      <p className="line-clamp-3 text-xs leading-relaxed text-muted">{entry.content}</p>
      {entry.location && <div className="mt-2 text-[0.7rem] text-stone">📍 {entry.location}</div>}
    </div>
  )
}
