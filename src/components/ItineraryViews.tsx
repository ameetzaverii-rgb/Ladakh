'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DayWeather } from '@/components/DayWeather'
import { DAY_LOCATIONS } from '@/lib/locations'
import { FLAG, FLAG_TINT, type FlagColor } from '@/lib/utils'
import type { DayWeather as DayWeatherData } from '@/lib/weather'
import {
  List, LayoutGrid, MapPin, Laptop, Mountain, PartyPopper, Camera,
  UtensilsCrossed, Car, NotebookPen, ArrowUpRight,
  ChevronDown, type LucideIcon,
} from 'lucide-react'

export interface ViewDay {
  id: string
  dayNumber: number
  dayOfWeek: string
  title: string
  description: string
  isWorkDay: boolean
  isTrekDay: boolean
  isFestivalDay: boolean
  isExcursionDay: boolean
  breakfastNote?: string | null
  lunchNote?: string | null
  dinnerNote?: string | null
}

type View = 'timeline' | 'calendar' | 'location'

const WEEK_LABELS: Record<number, string> = {
  1: 'Week One — Arrival & Acclimatisation',
  2: 'Week Two — Finding Flow',
  3: 'Week Three — Deep Ladakh',
}

const VIEWS: { id: View; label: string; icon: LucideIcon }[] = [
  { id: 'timeline', label: 'Timeline', icon: List },
  { id: 'calendar', label: 'Weeks', icon: LayoutGrid },
  { id: 'location', label: 'By place', icon: MapPin },
]

// Primary category → flag colour, label and matching lucide icon.
function dayMeta(day: ViewDay): { color: FlagColor; label: string; Icon: LucideIcon } {
  if (day.isFestivalDay) return { color: 'red', label: 'Festival', Icon: PartyPopper }
  if (day.isTrekDay) return { color: 'green', label: 'Trek', Icon: Mountain }
  if (day.isExcursionDay) return { color: 'yellow', label: 'Excursion', Icon: Camera }
  if (day.isWorkDay) return { color: 'blue', label: 'Work day', Icon: Laptop }
  return { color: 'blue', label: 'Explore', Icon: MapPin }
}

// Contextual cross-links so each day jumps straight to the relevant section.
function dayLinks(day: ViewDay): { href: string; label: string; Icon: LucideIcon }[] {
  const links: { href: string; label: string; Icon: LucideIcon }[] = []
  if (day.isFestivalDay) links.push({ href: '/events', label: 'Festival', Icon: PartyPopper })
  if (day.isTrekDay) links.push({ href: '/treks', label: 'Trek', Icon: Mountain })
  if (day.isExcursionDay) links.push({ href: '/transport', label: 'Getting there', Icon: Car })
  if (day.isWorkDay && !day.isTrekDay && !day.isExcursionDay) links.push({ href: '/food', label: 'Cafés', Icon: UtensilsCrossed })
  links.push({ href: '/diary', label: 'Diary', Icon: NotebookPen })
  return links
}

function DayLinkChips({ day }: { day: ViewDay }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-2.5">
      {dayLinks(day).map(l => {
        const Icon = l.Icon
        return (
          <Link
            key={l.href}
            href={l.href}
            className="press inline-flex items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-[0.68rem] font-medium text-stone transition-colors hover:border-gold-mid hover:text-cream"
          >
            <Icon className="h-3 w-3" /> {l.label}
            <ArrowUpRight className="h-3 w-3 opacity-50" />
          </Link>
        )
      })}
    </div>
  )
}

export function ItineraryViews({
  days,
  weather,
}: {
  days: ViewDay[]
  weather: Record<number, DayWeatherData | null>
}) {
  const [view, setView] = useState<View>('timeline')

  useEffect(() => {
    const saved = localStorage.getItem('itineraryView') as View | null
    if (saved === 'timeline' || saved === 'calendar' || saved === 'location') setView(saved)
  }, [])

  function pick(v: View) {
    setView(v)
    try {
      localStorage.setItem('itineraryView', v)
    } catch {}
  }

  return (
    <>
      {/* Segmented view switcher */}
      <div className="mb-6 inline-flex gap-1 rounded-full bg-[#f1efe9] p-1">
        {VIEWS.map(v => {
          const Icon = v.icon
          const active = view === v.id
          return (
            <button
              key={v.id}
              onClick={() => pick(v.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                active ? 'bg-white text-cream shadow-soft' : 'text-stone hover:text-cream'
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
              {v.label}
            </button>
          )
        })}
      </div>

      {view === 'timeline' && <TimelineView days={days} weather={weather} />}
      {view === 'calendar' && <CalendarView days={days} weather={weather} />}
      {view === 'location' && <LocationView days={days} weather={weather} />}
    </>
  )
}

function MealNotes({ day }: { day: ViewDay }) {
  if (!day.breakfastNote && !day.lunchNote && !day.dinnerNote) return null
  const rows: { label: string; note: string }[] = []
  if (day.breakfastNote) rows.push({ label: 'Breakfast', note: day.breakfastNote })
  if (day.lunchNote) rows.push({ label: 'Lunch', note: day.lunchNote })
  if (day.dinnerNote) rows.push({ label: 'Dinner', note: day.dinnerNote })
  return (
    <div className="mt-3 space-y-1 border-t border-border pt-2.5 text-xs text-stone">
      {rows.map(r => (
        <div key={r.label}><span className="font-semibold text-sand">{r.label}: </span>{r.note}</div>
      ))}
    </div>
  )
}

/* A full day card with an elegant colour band (day + category). */
function DayCard({ day, weather }: { day: ViewDay; weather: Record<number, DayWeatherData | null> }) {
  const { color, label, Icon } = dayMeta(day)
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      {/* elegant band */}
      <div className="flex items-center justify-between px-4 py-2" style={{ background: FLAG_TINT[color] }}>
        <span className="text-sm font-extrabold" style={{ color: FLAG[color] }}>
          Day {day.dayNumber}
          <span className="ml-2 text-[0.62rem] font-bold uppercase tracking-wide text-stone">{day.dayOfWeek}</span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.62rem] font-bold text-white" style={{ background: FLAG[color] }}>
          <Icon className="h-3 w-3" /> {label}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-[0.95rem] font-bold leading-snug text-cream">{day.title}</h3>
        {DAY_LOCATIONS[day.dayNumber] && (
          <div className="mt-1.5">
            <DayWeather weather={weather[day.dayNumber] ?? null} location={DAY_LOCATIONS[day.dayNumber]} />
          </div>
        )}
        <p className="mt-1.5 text-xs leading-relaxed text-muted">{day.description}</p>
        <MealNotes day={day} />
        <DayLinkChips day={day} />
      </div>
    </div>
  )
}

/* ---------- Timeline (collapsible by week) ---------- */
function TimelineView({ days, weather }: { days: ViewDay[]; weather: Record<number, DayWeatherData | null> }) {
  const weeks = [1, 2, 3].map(w => ({
    week: w,
    days: days.filter(d => Math.ceil(d.dayNumber / 7) === w),
  }))

  return (
    <div className="space-y-3">
      {weeks.map(({ week, days: weekDays }) => {
        if (weekDays.length === 0) return null
        const done = weekDays.length
        return (
          <Collapsible key={week} title={WEEK_LABELS[week]} meta={`${done} days`} tags={groupTags(weekDays)} defaultOpen={week === 1}>
            <div className="space-y-3 pt-1">
              {weekDays.map(day => <DayCard key={day.id} day={day} weather={weather} />)}
            </div>
          </Collapsible>
        )
      })}
    </div>
  )
}

/* A single clean day row — the colour-coded badge is the only indicator. */
function DayRow({ day, weather }: { day: ViewDay; weather: Record<number, DayWeatherData | null> }) {
  const { color } = dayMeta(day)
  const w = weather[day.dayNumber]
  const loc = DAY_LOCATIONS[day.dayNumber]
  return (
    <div className="flex items-center gap-3 border-t border-border py-2.5 first:border-0">
      <span className="w-8 shrink-0 text-center text-sm font-extrabold tabular-nums" style={{ color: FLAG[color] }}>{day.dayNumber}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-cream">{day.title}</div>
        <div className="truncate text-[0.68rem] text-stone">{day.dayOfWeek}{loc ? ` · ${loc.name}` : ''}</div>
      </div>
      {w && <div className="shrink-0 text-[0.72rem] text-stone">{w.icon} {w.tempMax}°/{w.tempMin}°</div>}
    </div>
  )
}

// Distinct category icons present in a group — shown on the section title bar.
function groupTags(days: ViewDay[]): { Icon: LucideIcon; color: FlagColor }[] {
  const order: FlagColor[] = ['blue', 'green', 'red', 'yellow', 'ink']
  const seen = new Map<FlagColor, LucideIcon>()
  for (const d of days) {
    const { color, Icon } = dayMeta(d)
    if (!seen.has(color)) seen.set(color, Icon)
  }
  return order.filter(c => seen.has(c)).map(c => ({ color: c, Icon: seen.get(c)! }))
}

/* Collapsible section — category icons live on the title bar, not in the rows. */
function Collapsible({
  title, meta, tags = [], defaultOpen = false, children,
}: {
  title: string; meta: string; tags?: { Icon: LucideIcon; color: FlagColor }[]; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="overflow-hidden card-base">
      <button onClick={() => setOpen(v => !v)} className="flex w-full items-center gap-2.5 px-4 py-3 text-left">
        <span className="truncate text-sm font-bold text-cream">{title}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          {tags.map((t, i) => <t.Icon key={i} className="h-4 w-4" style={{ color: FLAG[t.color] }} strokeWidth={2.2} />)}
        </span>
        <span className="shrink-0 rounded-full bg-[#f1efe9] px-2 py-0.5 text-[0.62rem] font-semibold text-stone">{meta}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-2">{children}</div>}
    </div>
  )
}

/* ---------- Calendar / weeks (collapsible) ---------- */
function CalendarView({ days, weather }: { days: ViewDay[]; weather: Record<number, DayWeatherData | null> }) {
  const weeks = [1, 2, 3].map(w => ({
    week: w,
    days: days.filter(d => Math.ceil(d.dayNumber / 7) === w),
  }))

  return (
    <div className="space-y-3">
      {weeks.map(({ week, days: weekDays }) => {
        if (weekDays.length === 0) return null
        return (
          <Collapsible
            key={week}
            title={WEEK_LABELS[week]}
            meta={`${weekDays.length} days`}
            tags={groupTags(weekDays)}
            defaultOpen={week === 1}
          >
            {weekDays.map(day => <DayRow key={day.id} day={day} weather={weather} />)}
          </Collapsible>
        )
      })}
    </div>
  )
}

/* ---------- By location (collapsible) ---------- */
function LocationView({ days, weather }: { days: ViewDay[]; weather: Record<number, DayWeatherData | null> }) {
  const groups: { name: string; days: ViewDay[] }[] = []
  const index = new Map<string, number>()
  for (const day of days) {
    const name = DAY_LOCATIONS[day.dayNumber]?.name ?? 'Other'
    if (!index.has(name)) {
      index.set(name, groups.length)
      groups.push({ name, days: [] })
    }
    groups[index.get(name)!].days.push(day)
  }

  return (
    <div className="space-y-3">
      {groups.map((g, i) => {
        const loc = DAY_LOCATIONS[g.days[0].dayNumber]
        return (
          <Collapsible
            key={g.name}
            title={g.name}
            meta={`${g.days.length} ${g.days.length === 1 ? 'day' : 'days'}${loc ? ` · ${loc.altitudeM.toLocaleString()}m` : ''}`}
            tags={groupTags(g.days)}
            defaultOpen={i === 0}
          >
            {g.days.map(day => <DayRow key={day.id} day={day} weather={weather} />)}
          </Collapsible>
        )
      })}
    </div>
  )
}
