import { db } from '@/lib/db'
import { DAY_LOCATIONS } from '@/lib/locations'
import { getDayWeather, type DayWeather as DayWeatherData } from '@/lib/weather'
import { ItineraryMap, type MapDay } from '@/components/ItineraryMap'
import { ItineraryViews, type ViewDay } from '@/components/ItineraryViews'
import { CategoryHero } from '@/components/Photo'
import { getCategoryImage } from '@/lib/imagery'
import { FLAG, FLAG_TINT, type FlagColor } from '@/lib/utils'
import { CalendarDays, Laptop, Mountain, Camera, PartyPopper, type LucideIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Build the calendar date (YYYY-MM-DD) for a given day number.
function isoForDay(start: Date, dayNumber: number): string {
  const d = new Date(start)
  d.setUTCDate(d.getUTCDate() + (dayNumber - 1))
  return d.toISOString().slice(0, 10)
}

export default async function ItineraryPage() {
  const [days, tripConfig, heroImg] = await Promise.all([
    db.itineraryDay.findMany({ orderBy: [{ sortOrder: 'asc' }, { dayNumber: 'asc' }] }),
    db.tripConfig.findFirst().catch(() => null),
    getCategoryImage('itinerary'),
  ])

  // Coordinates for a day: seeded days use the fixed location map, custom days
  // use their own optional location.
  const coordsFor = (d: (typeof days)[number]) => {
    if (d.isCustom) return d.customLat != null && d.customLng != null
      ? { lat: d.customLat, lng: d.customLng, name: d.customName ?? d.title } : null
    const loc = DAY_LOCATIONS[d.dayNumber]
    return loc ? { lat: loc.lat, lng: loc.lng, name: loc.name } : null
  }

  // Live weather for every day, fetched in parallel.
  const startDate = tripConfig?.tripStartDate ?? new Date('2026-07-22')
  const weather: Record<number, DayWeatherData | null> = {}
  await Promise.all(
    days.map(async day => {
      const c = coordsFor(day)
      if (!c) return
      const baseDay = day.isCustom ? Math.max(1, Math.floor(day.sortOrder ?? 1)) : day.dayNumber
      weather[day.dayNumber] = await getDayWeather(c.lat, c.lng, isoForDay(startDate, baseDay))
    })
  )

  // Locations for the route map.
  const mapDays: MapDay[] = days
    .map(d => {
      const c = coordsFor(d)
      return c ? { dayNumber: d.dayNumber, title: d.title, name: c.name, lat: c.lat, lng: c.lng } : null
    })
    .filter((d): d is MapDay => d !== null)

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
    activities: Array.isArray(d.activities) ? (d.activities as unknown as ViewDay['activities']) : [],
    isCustom: d.isCustom,
    sortOrder: d.sortOrder ?? d.dayNumber,
    customName: d.customName,
    customLat: d.customLat,
    customLng: d.customLng,
  }))

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <CategoryHero src={heroImg?.src ?? null} color="blue" icon={CalendarDays}
        title="The 21-Day Plan" subtitle="Work mornings, explore afternoons — your day-by-day Ladakh workation." />

      {/* Legend */}
      <div className="mb-7 flex flex-wrap gap-2">
        {([
          { Icon: Laptop, label: 'Work day', color: 'blue' },
          { Icon: Mountain, label: 'Trek', color: 'green' },
          { Icon: Camera, label: 'Excursion', color: 'yellow' },
          { Icon: PartyPopper, label: 'Festival', color: 'red' },
        ] as { Icon: LucideIcon; label: string; color: FlagColor }[]).map(l => {
          const Icon = l.Icon
          return (
            <span key={l.label} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold"
                  style={{ background: FLAG_TINT[l.color], color: FLAG[l.color] }}>
              <Icon className="h-3.5 w-3.5" /> {l.label}
            </span>
          )
        })}
      </div>

      {/* Route map */}
      {mapDays.length > 0 && (
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-cream">Where you&apos;ll be</h2>
            <span className="text-[0.62rem] font-medium text-stone">
              <span style={{ color: FLAG.blue }}>●</span> Leh base &nbsp;·&nbsp; <span style={{ color: FLAG.red }}>●</span> Excursions
            </span>
          </div>
          <ItineraryMap days={mapDays} />
          <p className="mt-2 text-[0.7rem] text-muted">Tap a pin to see which days are spent there.</p>
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
