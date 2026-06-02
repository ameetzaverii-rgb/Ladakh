import { db } from '@/lib/db'
import { DAY_LOCATIONS } from '@/lib/locations'
import { getDayWeather, type DayWeather as DayWeatherData } from '@/lib/weather'
import { ItineraryMap, type MapDay } from '@/components/ItineraryMap'
import { ItineraryViews, type ViewDay } from '@/components/ItineraryViews'

export const dynamic = 'force-dynamic'

// Build the calendar date (YYYY-MM-DD) for a given day number.
function isoForDay(start: Date, dayNumber: number): string {
  const d = new Date(start)
  d.setUTCDate(d.getUTCDate() + (dayNumber - 1))
  return d.toISOString().slice(0, 10)
}

export default async function ItineraryPage() {
  const [days, tripConfig] = await Promise.all([
    db.itineraryDay.findMany({ orderBy: { dayNumber: 'asc' } }),
    db.tripConfig.findFirst(),
  ])

  // Live weather for every day, fetched in parallel.
  const startDate = tripConfig?.tripStartDate ?? new Date('2026-07-22')
  const weather: Record<number, DayWeatherData | null> = {}
  await Promise.all(
    days.map(async day => {
      const loc = DAY_LOCATIONS[day.dayNumber]
      if (!loc) return
      weather[day.dayNumber] = await getDayWeather(loc.lat, loc.lng, isoForDay(startDate, day.dayNumber))
    })
  )

  // Locations for the route map.
  const mapDays: MapDay[] = days
    .filter(d => DAY_LOCATIONS[d.dayNumber])
    .map(d => {
      const loc = DAY_LOCATIONS[d.dayNumber]
      return { dayNumber: d.dayNumber, title: d.title, name: loc.name, lat: loc.lat, lng: loc.lng }
    })

  // Plain serialisable day data for the client view switcher.
  const viewDays: ViewDay[] = days.map(d => ({
    id: d.id,
    dayNumber: d.dayNumber,
    dayOfWeek: d.dayOfWeek,
    title: d.title,
    description: d.description,
    isWorkDay: d.isWorkDay,
    isTrekDay: d.isTrekDay,
    isFestivalDay: d.isFestivalDay,
    isExcursionDay: d.isExcursionDay,
    breakfastNote: d.breakfastNote,
    lunchNote: d.lunchNote,
    dinnerNote: d.dinnerNote,
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

      {/* Route map */}
      {mapDays.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-xl text-cream">Where you'll be</h2>
            <span className="label-mono text-[0.55rem] text-stone">
              <span className="text-gold">●</span> Leh base &nbsp;·&nbsp; <span className="text-rust">●</span> Excursions
            </span>
          </div>
          <ItineraryMap days={mapDays} />
          <p className="text-muted text-[0.7rem] mt-2">Tap a pin to see which days are spent there.</p>
        </div>
      )}

      {days.length === 0 ? (
        <div className="text-center py-16 text-stone">
          <div className="text-4xl mb-3">📅</div>
          <p className="font-serif text-cream text-lg mb-2">Itinerary not seeded yet</p>
          <p className="text-sm">Run <code className="text-gold">npm run db:seed</code> to populate the 21-day plan.</p>
        </div>
      ) : (
        <ItineraryViews days={viewDays} weather={weather} />
      )}
    </div>
  )
}
