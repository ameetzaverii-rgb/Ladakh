import { db } from '@/lib/db'
import { DAY_LOCATIONS } from '@/lib/locations'
import { getDayWeather, type DayWeather as DayWeatherData } from '@/lib/weather'
import { ItineraryMap, type MapDay } from '@/components/ItineraryMap'
import { ItineraryViews, type ViewDay } from '@/components/ItineraryViews'
import { CategoryHero } from '@/components/Photo'
import { getCategoryImageFor } from '@/lib/imagery'
import { FLAG, FLAG_TINT, type FlagColor } from '@/lib/utils'
import { getActiveContext } from '@/lib/destination'
import { planSubtitle } from '@/lib/tripType'
import { CalendarDays, Laptop, Mountain, Camera, PartyPopper, type LucideIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Build the calendar date (YYYY-MM-DD) for a given day number.
function isoForDay(start: Date, dayNumber: number): string {
  const d = new Date(start)
  d.setUTCDate(d.getUTCDate() + (dayNumber - 1))
  return d.toISOString().slice(0, 10)
}

export default async function ItineraryPage() {
  const ctx = await getActiveContext()
  const [days, tripConfig, heroImg] = await Promise.all([
    db.itineraryDay.findMany({ where: { destinationId: ctx.dest?.id ?? 'ladakh' }, orderBy: [{ sortOrder: 'asc' }, { dayNumber: 'asc' }] }),
    db.tripConfig.findFirst().catch(() => null),
    getCategoryImageFor('itinerary', ctx.dest?.slug, ctx.dest?.heroWiki),
  ])

  // Coordinates for a day, in priority order: per-day stored coords (used by
  // non-Ladakh destinations), custom-day coords, then the Ladakh DAY_LOCATIONS
  // fallback keyed by day number.
  const coordsFor = (d: (typeof days)[number]) => {
    if (d.lat != null && d.lng != null) return { lat: d.lat, lng: d.lng, name: d.locationName ?? d.customName ?? d.title }
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
        title={viewDays.length ? `Your ${viewDays.filter(d => !d.isCustom).length}-Day Plan` : 'Your Plan'}
        subtitle={planSubtitle(ctx.tripType, ctx.dest?.name ?? 'trip')} />

      {/* Legend */}
      <div className="mb-7 flex flex-wrap gap-2">
        {([
          { Icon: Laptop, label: 'Work day', color: 'blue' },
          { Icon: Mountain, label: 'Trek', color: 'green' },
          { Icon: Camera, label: 'Excursion', color: 'yellow' },
          { Icon: PartyPopper, label: 'Festival', color: 'red' },
        ] as { Icon: LucideIcon; label: string; color: FlagColor }[])
          .filter(l => l.label !== 'Work day' || ctx.features.showWorkDays)
          .map(l => {
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
        <div className="mx-auto max-w-sm rounded-2xl border border-border bg-white px-6 py-12 text-center">
          <CalendarDays className="mx-auto mb-3 h-9 w-9 text-muted" />
          <p className="mb-1 font-serif text-lg text-cream">No plan for {ctx.dest?.name ?? 'this trip'} yet</p>
          <p className="text-sm text-stone">
            {ctx.dest?.isCustom
              ? 'This is your own destination — switch on “Edit plan” to add your first day and build the itinerary.'
              : 'Content for this destination is still loading. Pull to refresh in a moment, or tap “Edit plan” to start adding days yourself.'}
          </p>
        </div>
      ) : (
        <ItineraryViews days={viewDays} weather={weather} showWork={ctx.features.showWorkDays} />
      )}
    </div>
  )
}
