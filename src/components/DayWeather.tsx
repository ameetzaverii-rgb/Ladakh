// src/components/DayWeather.tsx
// Presentational weather + packing strip shown at the top of each itinerary day.
// Data is prefetched in the page (server) and passed in, so this stays sync.

import type { DayWeather as DayWeatherData } from '@/lib/weather'
import type { DayLocation } from '@/lib/locations'
import { getClothing } from '@/lib/clothing'

export function DayWeather({
  weather,
  location,
}: {
  weather: DayWeatherData | null
  location: DayLocation
}) {
  if (!weather) {
    return (
      <div className="mb-3 rounded-md border border-gold/10 bg-white/[0.02] px-3 py-2 text-[0.7rem] text-stone">
        🌡️ Weather for {location.name} unavailable right now.
      </div>
    )
  }

  const clothing = getClothing({
    tempMin: weather.tempMin,
    tempMax: weather.tempMax,
    label: weather.label,
    altitudeM: location.altitudeM,
  })

  return (
    <div className="mb-3 rounded-md border border-gold/15 bg-gradient-to-r from-sky/[0.07] to-transparent px-3 py-2.5">
      {/* Weather line */}
      <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
        <span className="text-lg leading-none">{weather.icon}</span>
        <span className="font-serif text-cream text-sm">{weather.label}</span>
        <span className="text-sand text-sm font-mono">
          {weather.tempMax}° <span className="text-stone">/ {weather.tempMin}°C</span>
        </span>
        {weather.precipProb != null && weather.precipProb > 0 && (
          <span className="text-sky text-[0.7rem]">💧 {weather.precipProb}%</span>
        )}
        {weather.windMax != null && weather.windMax > 0 && (
          <span className="text-stone text-[0.7rem]">🌬 {weather.windMax} km/h</span>
        )}
        <span
          className={`pill ${weather.source === 'forecast' ? 'pill-gold' : ''} ml-auto`}
          style={
            weather.source === 'typical'
              ? { background: 'rgba(139,115,85,0.15)', color: 'var(--stone)' }
              : undefined
          }
          title={
            weather.source === 'forecast'
              ? 'Live forecast'
              : 'Typical weather (based on last year — switches to live forecast ~2 weeks before)'
          }
        >
          {weather.source === 'forecast' ? 'Live' : 'Typical'}
        </span>
      </div>

      {/* Clothing line */}
      <div className="mt-2 pt-2 border-t border-gold/8">
        <div className="label-mono text-[0.5rem] text-gold mb-1.5">What to pack today</div>
        <div className="flex flex-wrap gap-1.5">
          {clothing.map((c, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded bg-white/[0.04] border border-gold/10 px-1.5 py-0.5 text-[0.65rem] text-sand"
            >
              <span>{c.icon}</span>
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
