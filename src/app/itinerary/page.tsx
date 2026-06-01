import { db } from '@/lib/db'
import Link from 'next/link'

export const revalidate = 3600

const WEEK_LABELS: Record<number, string> = {
  1: 'Week One — Arrival & Acclimatisation',
  2: 'Week Two — Finding Flow',
  3: 'Week Three — Deep Ladakh',
}

const EMOJI_MAP: Record<string, string> = {
  work: '🖥',
  trek: '🥾',
  excursion: '🌄',
  festival: '🎭',
  arrival: '🛬',
  rest: '🌙',
}

export default async function ItineraryPage() {
  const days = await db.itineraryDay.findMany({
    orderBy: { dayNumber: 'asc' },
  })

  const weeks = [1, 2, 3].map(w => ({
    week: w,
    days: days.filter(d => Math.ceil(d.dayNumber / 7) === w),
  }))

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="label-mono text-xs text-gold mb-2">21-Day Plan</div>
        <h1 className="section-title mb-1">The <em className="text-gold italic">Blueprint</em></h1>
        <p className="text-stone text-sm">Your day-by-day Ladakh workation schedule. Work mornings, explore afternoons.</p>
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap mb-8 card-base p-3">
        {[
          { icon: '🖥', label: 'Work Day' },
          { icon: '🥾', label: 'Trek' },
          { icon: '🌄', label: 'Excursion' },
          { icon: '🎭', label: 'Festival' },
        ].map(l => (
          <span key={l.label} className="label-mono text-[0.6rem] text-stone flex items-center gap-1.5">
            <span>{l.icon}</span>{l.label}
          </span>
        ))}
      </div>

      {days.length === 0 && (
        <div className="text-center py-16 text-stone">
          <div className="text-4xl mb-3">📅</div>
          <p className="font-serif text-cream text-lg mb-2">Itinerary not seeded yet</p>
          <p className="text-sm">Run <code className="text-gold">npm run db:seed</code> to populate the 21-day plan.</p>
        </div>
      )}

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

            {weekDays.map((day, idx) => {
              const dayType = day.isTrekDay ? 'trek'
                : day.isFestivalDay ? 'festival'
                : day.isExcursionDay ? 'excursion'
                : day.dayNumber === 1 ? 'arrival'
                : 'work'

              return (
                <div key={day.id} className="flex gap-4 relative">
                  {/* Connector line */}
                  {idx < weekDays.length - 1 && (
                    <div className="absolute left-[19px] top-10 bottom-0 w-px bg-gold/10" />
                  )}
                  {/* Day number */}
                  <div className="w-10 shrink-0 text-center pt-3">
                    <div className="font-serif text-2xl text-gold/30 font-light leading-none">{day.dayNumber}</div>
                    <div className="label-mono text-[0.45rem] text-stone">{day.dayOfWeek}</div>
                  </div>

                  {/* Day card */}
                  <div className="flex-1 card-base p-4 mb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-serif text-cream text-base leading-tight">{day.title}</h3>
                      <div className="flex gap-1 shrink-0">
                        {day.isWorkDay && <span className="text-xs">🖥</span>}
                        {day.isTrekDay && <span className="text-xs">🥾</span>}
                        {day.isFestivalDay && <span className="text-xs">🎭</span>}
                        {day.isExcursionDay && <span className="text-xs">🌄</span>}
                      </div>
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
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
