'use client'

import { useEffect, useState } from 'react'
import { DayWeather } from '@/components/DayWeather'
import { DAY_LOCATIONS } from '@/lib/locations'
import type { DayWeather as DayWeatherData } from '@/lib/weather'

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

const VIEWS: { id: View; label: string; icon: string }[] = [
  { id: 'timeline', label: 'Timeline', icon: '☰' },
  { id: 'calendar', label: 'Weeks', icon: '▦' },
  { id: 'location', label: 'By place', icon: '📍' },
]

function dayIcons(day: ViewDay) {
  return (
    <>
      {day.isWorkDay && <span className="text-xs">🖥</span>}
      {day.isTrekDay && <span className="text-xs">🥾</span>}
      {day.isFestivalDay && <span className="text-xs">🎭</span>}
      {day.isExcursionDay && <span className="text-xs">🌄</span>}
    </>
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
      {/* View switcher */}
      <div className="inline-flex gap-1 mb-6 card-base p-1 rounded-md">
        {VIEWS.map(v => (
          <button
            key={v.id}
            onClick={() => pick(v.id)}
            className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider uppercase transition-colors ${
              view === v.id ? 'bg-gold/20 text-gold' : 'text-stone hover:text-gold'
            }`}
          >
            <span className="mr-1">{v.icon}</span>
            {v.label}
          </button>
        ))}
      </div>

      {view === 'timeline' && <TimelineView days={days} weather={weather} />}
      {view === 'calendar' && <CalendarView days={days} weather={weather} />}
      {view === 'location' && <LocationView days={days} weather={weather} />}
    </>
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
          <div key={week} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gold/10" />
              <div className="label-mono text-[0.65rem] text-gold border-l-2 border-gold pl-3">
                {WEEK_LABELS[week]}
              </div>
              <div className="h-px w-8 bg-gold/10" />
            </div>

            {weekDays.map((day, idx) => (
              <div key={day.id} className="flex gap-4 relative">
                {idx < weekDays.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-0 w-px bg-gold/10" />
                )}
                <div className="w-10 shrink-0 text-center pt-3">
                  <div className="font-serif text-2xl text-gold/30 font-light leading-none">{day.dayNumber}</div>
                  <div className="label-mono text-[0.45rem] text-stone">{day.dayOfWeek}</div>
                </div>

                <div className="flex-1 card-base p-4 mb-3">
                  {DAY_LOCATIONS[day.dayNumber] && (
                    <DayWeather weather={weather[day.dayNumber] ?? null} location={DAY_LOCATIONS[day.dayNumber]} />
                  )}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-serif text-cream text-base leading-tight">{day.title}</h3>
                    <div className="flex gap-1 shrink-0">{dayIcons(day)}</div>
                  </div>
                  <p className="text-muted text-xs leading-relaxed">{day.description}</p>
                  {(day.breakfastNote || day.lunchNote || day.dinnerNote) && (
                    <div className="mt-3 pt-2 border-t border-gold/8 text-xs text-stone space-y-0.5">
                      {day.breakfastNote && <div><span className="text-sand">☀️ Breakfast: </span>{day.breakfastNote}</div>}
                      {day.lunchNote && <div><span className="text-sand">🌤 Lunch: </span>{day.lunchNote}</div>}
                      {day.dinnerNote && <div><span className="text-sand">🌙 Dinner: </span>{day.dinnerNote}</div>}
                    </div>
                  )}
                </div>
              </div>
            ))}
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
            <div className="label-mono text-[0.6rem] text-gold mb-2">{WEEK_LABELS[week]}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {weekDays.map(day => {
                const w = weather[day.dayNumber]
                const loc = DAY_LOCATIONS[day.dayNumber]
                return (
                  <div key={day.id} className="card-base p-2.5 flex flex-col min-h-[7rem]">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-lg text-gold/50 leading-none">{day.dayNumber}</span>
                      <span className="label-mono text-[0.45rem] text-stone">{day.dayOfWeek}</span>
                    </div>
                    {w && (
                      <div className="text-[0.65rem] text-sand mt-1">
                        {w.icon} {w.tempMax}°/{w.tempMin}°
                      </div>
                    )}
                    <div className="text-[0.65rem] text-cream leading-snug mt-1 line-clamp-3 flex-1">
                      {day.title}
                    </div>
                    {loc && <div className="label-mono text-[0.4rem] text-stone mt-1 truncate">📍 {loc.name}</div>}
                    <div className="flex gap-0.5 mt-1">{dayIcons(day)}</div>
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
  // Group by location name, ordered by first day spent there.
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
    <div className="space-y-5">
      {groups.map(g => {
        const loc = DAY_LOCATIONS[g.days[0].dayNumber]
        return (
          <div key={g.name} className="card-base p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-cream text-lg">📍 {g.name}</h3>
              <span className="label-mono text-[0.55rem] text-stone">
                {g.days.length} {g.days.length === 1 ? 'day' : 'days'}
                {loc ? ` · ${loc.altitudeM.toLocaleString()}m` : ''}
              </span>
            </div>
            <div className="space-y-2">
              {g.days.map(day => {
                const w = weather[day.dayNumber]
                return (
                  <div key={day.id} className="flex items-center gap-3 border-t border-gold/8 pt-2 first:border-0 first:pt-0">
                    <div className="w-8 text-center shrink-0">
                      <div className="font-serif text-base text-gold/50 leading-none">{day.dayNumber}</div>
                      <div className="label-mono text-[0.4rem] text-stone">{day.dayOfWeek}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-sand truncate">{day.title}</div>
                    </div>
                    {w && (
                      <div className="text-[0.7rem] text-stone shrink-0">{w.icon} {w.tempMax}°/{w.tempMin}°</div>
                    )}
                    <div className="flex gap-0.5 shrink-0">{dayIcons(day)}</div>
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
