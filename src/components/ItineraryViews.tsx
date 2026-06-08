'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DayWeather } from '@/components/DayWeather'
import { DAY_LOCATIONS } from '@/lib/locations'
import { FLAG, FLAG_TINT, type FlagColor } from '@/lib/utils'
import type { DayWeather as DayWeatherData } from '@/lib/weather'
import {
  List, LayoutGrid, MapPin, Laptop, Mountain, PartyPopper, Camera,
  Coffee, Sun, Moon, UtensilsCrossed, Car, NotebookPen, ArrowUpRight,
  type LucideIcon,
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

/* Elegant week-divider with a warm colour patch. */
function WeekHeader({ week }: { week: number }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #e8e3d8)' }} />
      <span
        className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.7rem] font-bold tracking-wide"
        style={{ background: 'linear-gradient(135deg, var(--tint-yellow), #fff)', color: '#8a6500', border: '1px solid rgba(176,122,22,0.2)' }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--gold)' }} />
        {WEEK_LABELS[week]}
      </span>
      <span className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #e8e3d8)' }} />
    </div>
  )
}

/* Compact day badge — replaces the wide left number column. */
function DayBadge({ day }: { day: ViewDay }) {
  const { color } = dayMeta(day)
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5" style={{ background: FLAG_TINT[color] }}>
      <span className="text-[0.7rem] font-extrabold leading-none" style={{ color: FLAG[color] }}>Day {day.dayNumber}</span>
      <span className="text-[0.6rem] font-bold uppercase tracking-wide text-stone">{day.dayOfWeek}</span>
    </span>
  )
}

function MealNotes({ day }: { day: ViewDay }) {
  if (!day.breakfastNote && !day.lunchNote && !day.dinnerNote) return null
  const rows: { Icon: LucideIcon; label: string; note: string }[] = []
  if (day.breakfastNote) rows.push({ Icon: Coffee, label: 'Breakfast', note: day.breakfastNote })
  if (day.lunchNote) rows.push({ Icon: Sun, label: 'Lunch', note: day.lunchNote })
  if (day.dinnerNote) rows.push({ Icon: Moon, label: 'Dinner', note: day.dinnerNote })
  return (
    <div className="mt-3 space-y-1 border-t border-border pt-2.5 text-xs text-stone">
      {rows.map(r => {
        const Icon = r.Icon
        return (
          <div key={r.label} className="flex gap-1.5">
            <Icon className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
            <span><span className="font-semibold text-sand">{r.label}: </span>{r.note}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Timeline (the detailed default) ---------- */
function TimelineView({ days, weather }: { days: ViewDay[]; weather: Record<number, DayWeatherData | null> }) {
  const weeks = [1, 2, 3].map(w => ({
    week: w,
    days: days.filter(d => Math.ceil(d.dayNumber / 7) === w),
  }))

  return (
    <>
      {weeks.map(({ week, days: weekDays }) => {
        if (weekDays.length === 0) return null
        return (
          <div key={week} className="mb-9">
            <WeekHeader week={week} />
            <div className="space-y-2.5">
              {weekDays.map(day => {
                const { color, label, Icon } = dayMeta(day)
                return (
                  <div key={day.id} className="relative overflow-hidden card-base p-4 pl-5">
                    <span className="absolute left-0 top-0 h-full w-1.5" style={{ background: FLAG[color] }} />
                    <div className="mb-2 flex items-center gap-2">
                      <DayBadge day={day} />
                      <span
                        className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.62rem] font-bold"
                        style={{ background: FLAG_TINT[color], color: FLAG[color] }}
                      >
                        <Icon className="h-3 w-3" /> {label}
                      </span>
                    </div>
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
                )
              })}
            </div>
          </div>
        )
      })}
    </>
  )
}

/* ---------- Calendar / weeks grid ---------- */
function CalendarView({ days, weather }: { days: ViewDay[]; weather: Record<number, DayWeatherData | null> }) {
  const weeks = [1, 2, 3].map(w => ({
    week: w,
    days: days.filter(d => Math.ceil(d.dayNumber / 7) === w),
  }))

  return (
    <div className="space-y-6">
      {weeks.map(({ week, days: weekDays }) => {
        if (weekDays.length === 0) return null
        return (
          <div key={week}>
            <WeekHeader week={week} />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {weekDays.map(day => {
                const w = weather[day.dayNumber]
                const loc = DAY_LOCATIONS[day.dayNumber]
                const { color, Icon } = dayMeta(day)
                return (
                  <div key={day.id} className="relative flex min-h-[7rem] flex-col overflow-hidden card-base p-2.5">
                    <span className="absolute left-0 top-0 h-full w-1" style={{ background: FLAG[color] }} />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold leading-none" style={{ color: FLAG[color] }}>{day.dayNumber}</span>
                      <span className="text-[0.55rem] font-bold uppercase tracking-wide text-stone">{day.dayOfWeek}</span>
                    </div>
                    {w && <div className="mt-1 text-[0.65rem] text-sand">{w.icon} {w.tempMax}°/{w.tempMin}°</div>}
                    <div className="mt-1 line-clamp-3 flex-1 text-[0.68rem] font-medium leading-snug text-cream">{day.title}</div>
                    {loc && (
                      <div className="mt-1 flex items-center gap-0.5 truncate text-[0.55rem] text-stone">
                        <MapPin className="h-2.5 w-2.5 shrink-0" /> {loc.name}
                      </div>
                    )}
                    <Icon className="mt-1 h-3.5 w-3.5" style={{ color: FLAG[color] }} />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- By location ---------- */
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
    <div className="space-y-4">
      {groups.map(g => {
        const loc = DAY_LOCATIONS[g.days[0].dayNumber]
        return (
          <div key={g.name} className="card-base p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-1.5 text-base font-bold text-cream">
                <MapPin className="h-4 w-4 text-sky" /> {g.name}
              </h3>
              <span className="rounded-full bg-[#f1efe9] px-2.5 py-0.5 text-[0.62rem] font-semibold text-stone">
                {g.days.length} {g.days.length === 1 ? 'day' : 'days'}{loc ? ` · ${loc.altitudeM.toLocaleString()}m` : ''}
              </span>
            </div>
            <div className="space-y-2">
              {g.days.map(day => {
                const w = weather[day.dayNumber]
                const { color, Icon } = dayMeta(day)
                return (
                  <div key={day.id} className="flex items-center gap-3 border-t border-border pt-2 first:border-0 first:pt-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold"
                          style={{ background: FLAG_TINT[color], color: FLAG[color] }}>
                      {day.dayNumber}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-sand">{day.title}</div>
                    </div>
                    {w && <div className="shrink-0 text-[0.7rem] text-stone">{w.icon} {w.tempMax}°/{w.tempMin}°</div>}
                    <Icon className="h-4 w-4 shrink-0" style={{ color: FLAG[color] }} />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
