import { db } from '@/lib/db'
import { daysUntil, formatINR, CATEGORY_COLORS, PHASE_ORDER } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import { QuickActions } from '@/components/QuickActions'

export const dynamic = 'force-dynamic'
async function getDashboardData() {
  const [config, checklistItems, expenses, journalEntries, nextEvents] = await Promise.all([
    db.tripConfig.findFirst().catch(() => null),
    db.checklistItem.findMany({ orderBy: [{ phase: 'asc' }, { priority: 'asc' }] }),
    db.expense.findMany({ orderBy: { date: 'desc' } }),
    db.journalEntry.findMany({ orderBy: { date: 'desc' }, take: 3 }),
    db.event.findMany({
      where: { startDate: { gte: new Date() } },
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

  const spendByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amountINR
    return acc
  }, {} as Record<string, number>)

  const urgentItems = checklistItems.filter(i =>
    !i.completed && (i.phase === 'ASAP' || i.phase === 'MONTH_BEFORE')
  ).slice(0, 5)

  return {
    tripStart, tripEnd, budget, totalSpent,
    checklistTotal: checklistItems.length, checklistDone,
    daysToTrip, isOnTrip, spendByCategory, urgentItems,
    recentJournal: journalEntries, nextEvents,
  }
}

export default async function Dashboard() {
  const data = await getDashboardData()

  const {
    tripStart, budget, totalSpent, checklistTotal, checklistDone,
    daysToTrip, isOnTrip, urgentItems, recentJournal, nextEvents,
  } = data

  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0
  const budgetPct = Math.min(Math.round((totalSpent / budget) * 100), 100)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Hero countdown */}
      <div className="relative overflow-hidden rounded-none border border-gold/20 bg-gradient-to-br from-deep via-dark to-deep p-8 mb-8 text-center"
           style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(184,92,56,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(90,143,163,0.1) 0%, transparent 60%), #1a1208' }}>
        <div className="label-mono text-xs mb-3 text-gold/60">
          3,524m · Union Territory of Ladakh
        </div>
        <h1 className="font-serif text-5xl md:text-7xl text-cream font-light tracking-tight mb-2">
          Leh <em className="text-gold italic">Ladakh</em>
        </h1>
        <p className="font-serif text-stone italic text-lg mb-6">21-Day Workation</p>

        {isOnTrip ? (
          <div className="inline-flex items-center gap-3 bg-gold/10 border border-gold/30 px-6 py-3">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="font-mono text-sm text-gold tracking-widest uppercase">
              You are in Ladakh
            </span>
          </div>
        ) : (
          <div className="flex justify-center gap-6 flex-wrap">
            <StatPill value={daysToTrip > 0 ? daysToTrip : 0} label="Days to Trip" />
            <StatPill value={`${format(tripStart, 'MMM d')}`} label="Departure" />
            <StatPill value="21" label="Nights" />
            <StatPill value={formatINR(budget)} label="Budget" />
          </div>
        )}
      </div>

      {/* Progress cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <ProgressCard
          href="/prep"
          label="Prep Checklist"
          icon="✅"
          value={checklistDone}
          total={checklistTotal}
          pct={checklistPct}
          color="#c9993a"
        />
        <ProgressCard
          href="/budget"
          label="Budget Used"
          icon="₹"
          value={formatINR(totalSpent)}
          total={formatINR(budget)}
          pct={budgetPct}
          color={budgetPct > 80 ? '#b85c38' : '#c9993a'}
          subtitle={`${formatINR(budget - totalSpent)} left`}
        />
        <Link href="/journal"
          className="card-base p-4 flex flex-col gap-1 group">
          <div className="label-mono text-[0.55rem]">Journal</div>
          <div className="font-serif text-2xl text-gold">{recentJournal.length}</div>
          <div className="text-stone text-xs">Entries</div>
          {recentJournal[0] && (
            <div className="text-muted text-[0.7rem] mt-1 truncate group-hover:text-sand transition-colors">
              Day {recentJournal[0].tripDay}: {recentJournal[0].title || 'entry'}
            </div>
          )}
        </Link>
        <Link href="/events"
          className="card-base p-4 flex flex-col gap-1 group">
          <div className="label-mono text-[0.55rem]">Next Event</div>
          {nextEvents[0] ? (
            <>
              <div className="font-serif text-sm text-cream leading-tight mt-1">
                {nextEvents[0].name}
              </div>
              <div className="label-mono text-[0.5rem] text-sky">
                {format(nextEvents[0].startDate, 'MMM d')}
              </div>
            </>
          ) : (
            <div className="text-stone text-xs mt-1">No events yet</div>
          )}
        </Link>
      </div>

      {/* Quick entry forms */}
      <QuickActions />

      {/* Urgent checklist */}
      {urgentItems.length > 0 && (
        <section className="mb-8">
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
        <section className="mb-8">
          <SectionHeader title="Recent Journal" href="/journal" linkLabel="All entries" />
          <div className="grid md:grid-cols-3 gap-3">
            {recentJournal.map(entry => (
              <JournalCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      )}

      {/* Module grid */}
      <section>
        <SectionHeader title="All Modules" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: '/prep', icon: '✅', title: 'Prep Checklist', desc: 'Book flights, permits, gear' },
            { href: '/itinerary', icon: '🗓', title: 'Itinerary', desc: '21-day day-by-day plan' },
            { href: '/journal', icon: '📔', title: 'Trip Journal', desc: 'Daily logs & highlights' },
            { href: '/budget', icon: '💰', title: 'Budget', desc: 'Track every rupee' },
            { href: '/stays', icon: '🏨', title: 'Stays', desc: 'Hotels & guesthouses' },
            { href: '/treks', icon: '🥾', title: 'Treks', desc: '3 weekend adventures' },
            { href: '/transport', icon: '🚗', title: 'Transport', desc: 'Taxis, bikes, permits' },
            { href: '/food', icon: '🍜', title: 'Food & Cafés', desc: 'Best spots in Leh' },
            { href: '/events', icon: '🎭', title: 'Festivals', desc: 'Phyang Tsedup + more' },
            { href: '/flights', icon: '✈️', title: 'Flights', desc: 'Delhi–Leh pricing' },
          ].map(m => (
            <Link key={m.href} href={m.href}
              className="card-base p-4 group">
              <div className="text-2xl mb-2">{m.icon}</div>
              <div className="font-serif text-cream text-base group-hover:text-gold transition-colors">{m.title}</div>
              <div className="text-muted text-xs mt-0.5">{m.desc}</div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}

function StatPill({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center">
      <div className="font-serif text-2xl md:text-3xl text-gold font-light">{value}</div>
      <div className="label-mono text-[0.55rem] text-stone mt-0.5">{label}</div>
    </div>
  )
}

function ProgressCard({
  href, label, icon, value, total, pct, color, subtitle
}: {
  href: string; label: string; icon: string; value: string | number
  total: string | number; pct: number; color: string; subtitle?: string
}) {
  return (
    <Link href={href} className="card-base p-4 group">
      <div className="label-mono text-[0.55rem] mb-1">{icon} {label}</div>
      <div className="font-serif text-xl text-cream">{value}</div>
      <div className="text-stone text-xs">of {total}</div>
      <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
             style={{ width: `${pct}%`, background: color }} />
      </div>
      {subtitle && <div className="text-muted text-[0.65rem] mt-1">{subtitle}</div>}
    </Link>
  )
}

function SectionHeader({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-serif text-xl text-cream">{title}</h2>
      {href && linkLabel && (
        <Link href={href} className="label-mono text-[0.55rem] text-stone hover:text-gold transition-colors">
          {linkLabel} →
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
    <div className="card-base px-4 py-3 flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full shrink-0 ${item.completed ? 'bg-sage' : 'bg-rust/60'}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-sand truncate">{item.title}</div>
        {item.notes && <div className="text-xs text-stone truncate">{item.notes}</div>}
      </div>
      <span className={`pill ${phaseColors[item.phase] ?? 'pill-gold'} shrink-0`}>
        {item.phase.replace('_', ' ').replace('BEFORE', '').trim()}
      </span>
    </div>
  )
}

function JournalCard({ entry }: { entry: any }) {
  const moodEmoji = ['', '😔', '😐', '🙂', '😊', '🤩']
  return (
    <div className="card-base p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="label-mono text-[0.55rem] text-sky">Day {entry.tripDay}</span>
        {entry.mood && <span className="text-base">{moodEmoji[entry.mood]}</span>}
      </div>
      {entry.title && <div className="font-serif text-cream text-sm mb-1">{entry.title}</div>}
      <p className="text-muted text-xs leading-relaxed line-clamp-3">{entry.content}</p>
      {entry.location && (
        <div className="label-mono text-[0.5rem] text-stone mt-2">📍 {entry.location}</div>
      )}
    </div>
  )
}
