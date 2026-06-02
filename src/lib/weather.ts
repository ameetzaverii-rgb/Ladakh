// src/lib/weather.ts
// Live weather for each itinerary day via Open-Meteo (free, no API key).
//
// The trip is months out, so for far-future dates the public forecast does not
// exist yet. We therefore:
//   • use the real FORECAST when the day is within ~16 days, and
//   • fall back to last year's ACTUAL weather for the same calendar date
//     (a solid "typical" estimate) for anything further out.
// As the trip approaches, days automatically switch over to the live forecast.

export interface DayWeather {
  tempMax: number
  tempMin: number
  label: string
  icon: string
  precipProb: number | null // % chance of rain (forecast only)
  windMax: number | null // km/h
  source: 'forecast' | 'typical'
}

// WMO weather interpretation codes → friendly label + emoji
const WMO: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mostly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Freezing fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌦️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '🌨️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  77: { label: 'Snow grains', icon: '🌨️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Rain showers', icon: '🌧️' },
  82: { label: 'Violent showers', icon: '⛈️' },
  85: { label: 'Snow showers', icon: '🌨️' },
  86: { label: 'Heavy snow showers', icon: '❄️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm + hail', icon: '⛈️' },
  99: { label: 'Severe thunderstorm', icon: '⛈️' },
}

function describe(code: number) {
  return WMO[code] ?? { label: 'Unknown', icon: '🌡️' }
}

// Per-instance memory cache so we don't re-hit the API on every render.
const cache = new Map<string, { value: DayWeather | null; expires: number }>()
const TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 21600 }, // 6h Next.js fetch cache
    })
    if (!res.ok) throw new Error(`Weather API ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timeout)
  }
}

export async function getDayWeather(
  lat: number,
  lng: number,
  isoDate: string
): Promise<DayWeather | null> {
  const key = `${lat},${lng},${isoDate}`
  const hit = cache.get(key)
  if (hit && hit.expires > Date.now()) return hit.value

  const target = new Date(isoDate + 'T00:00:00Z')
  const diffDays = (target.getTime() - Date.now()) / 86400000
  const withinForecast = diffDays >= -1 && diffDays <= 15

  let value: DayWeather | null = null
  try {
    if (withinForecast) {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max` +
        `&timezone=Asia%2FKolkata&start_date=${isoDate}&end_date=${isoDate}`
      const d = await fetchJson(url)
      const code = d.daily.weathercode[0]
      const { label, icon } = describe(code)
      value = {
        tempMax: Math.round(d.daily.temperature_2m_max[0]),
        tempMin: Math.round(d.daily.temperature_2m_min[0]),
        label,
        icon,
        precipProb: d.daily.precipitation_probability_max?.[0] ?? null,
        windMax: Math.round(d.daily.windspeed_10m_max?.[0] ?? 0),
        source: 'forecast',
      }
    } else {
      // Same calendar date, previous year, from the historical archive.
      const prevYear = target.getUTCFullYear() - 1
      const histDate = `${prevYear}-${isoDate.slice(5)}`
      const url =
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max` +
        `&timezone=Asia%2FKolkata&start_date=${histDate}&end_date=${histDate}`
      const d = await fetchJson(url)
      const code = d.daily.weathercode[0]
      const { label, icon } = describe(code)
      value = {
        tempMax: Math.round(d.daily.temperature_2m_max[0]),
        tempMin: Math.round(d.daily.temperature_2m_min[0]),
        label,
        icon,
        precipProb: null,
        windMax: Math.round(d.daily.windspeed_10m_max?.[0] ?? 0),
        source: 'typical',
      }
    }
  } catch {
    value = null
  }

  cache.set(key, { value, expires: Date.now() + TTL_MS })
  return value
}
