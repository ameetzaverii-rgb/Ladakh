import { db } from '@/lib/db'
import { DAY_LOCATIONS } from '@/lib/locations'
import { getActiveContext } from '@/lib/destination'
import { getCurrentWeather, getDayWeather, type DayWeather } from '@/lib/weather'
import { CategoryHero } from '@/components/Photo'
import { getCategoryImageFor } from '@/lib/imagery'
import { format } from 'date-fns'
import { CloudSun, Droplets, Wind } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Weather' }

function isoForDay(start: Date, dayNumber: number): string {
  const d = new Date(start)
  d.setUTCDate(d.getUTCDate() + (dayNumber - 1))
  return d.toISOString().slice(0, 10)
}

export default async function WeatherPage() {
  const ctx = await getActiveContext()
  const destId = ctx.dest?.id ?? 'ladakh'
  const [days, config, heroImg] = await Promise.all([
    db.itineraryDay.findMany({ where: { destinationId: destId }, orderBy: [{ sortOrder: 'asc' }, { dayNumber: 'asc' }] }),
    db.tripConfig.findFirst().catch(() => null),
    getCategoryImageFor('gallery', ctx.dest?.slug, ctx.dest?.heroWiki),
  ])
  const startDate = config?.tripStartDate ?? new Date('2026-07-22')

  const coordsFor = (d: (typeof days)[number]) => {
    if (d.lat != null && d.lng != null) return { lat: d.lat, lng: d.lng, name: d.locationName ?? d.customName ?? d.title }
    if (d.isCustom && d.customLat != null && d.customLng != null) return { lat: d.customLat, lng: d.customLng, name: d.customName ?? d.title }
    const loc = DAY_LOCATIONS[d.dayNumber]
    return loc ? { lat: loc.lat, lng: loc.lng, name: loc.name } : null
  }

  const current = await getCurrentWeather(ctx.dest?.lat ?? 34.15, ctx.dest?.lng ?? 77.57)

  const rows = await Promise.all(
    days.filter(d => !d.isCustom).map(async d => {
      const c = coordsFor(d)
      const w: DayWeather | null = c ? await getDayWeather(c.lat, c.lng, isoForDay(startDate, d.dayNumber)) : null
      return { day: d, c, w }
    })
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <CategoryHero src={heroImg?.src ?? null} color="blue" icon={CloudSun}
        title="Weather" subtitle={`Day-by-day forecast across your ${ctx.dest?.name ?? 'trip'}.`} />

      {current && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-white px-5 py-4 shadow-soft">
          <span className="text-3xl leading-none">{current.icon}</span>
          <div>
            <div className="text-2xl font-extrabold text-cream">{current.temp}°C</div>
            <div className="text-xs text-stone">Now in {ctx.dest?.name ?? 'destination'} · {current.label}</div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {rows.map(({ day, c, w }) => (
          <div key={day.id} className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3">
            <div className="w-12 shrink-0">
              <div className="text-[0.6rem] font-bold uppercase tracking-wide text-stone">{day.dayOfWeek}</div>
              <div className="text-sm font-extrabold text-cream">D{day.dayNumber}</div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-cream">{c?.name ?? day.title}</div>
              <div className="text-[0.7rem] text-stone">{format(new Date(isoForDay(startDate, day.dayNumber)), 'EEE, MMM d')}{w ? ` · ${w.label}` : ''}</div>
            </div>
            {w ? (
              <div className="flex shrink-0 items-center gap-3">
                <div className="flex items-center gap-3 text-[0.7rem] text-stone">
                  {w.precipProb != null && <span className="inline-flex items-center gap-1"><Droplets className="h-3 w-3 text-sky" />{w.precipProb}%</span>}
                  {w.windMax != null && <span className="inline-flex items-center gap-1"><Wind className="h-3 w-3" />{Math.round(w.windMax)}</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg leading-none">{w.icon}</span>
                  <span className="text-sm font-bold text-cream tabular-nums">{w.tempMax}°<span className="text-stone">/{w.tempMin}°</span></span>
                </div>
              </div>
            ) : (
              <span className="shrink-0 text-xs text-muted">—</span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-[0.7rem] text-muted">
        Live forecast from Open-Meteo where available; far-future dates show typical seasonal conditions.
      </p>
    </div>
  )
}
