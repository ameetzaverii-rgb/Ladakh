// src/lib/options.ts
// Predefined option lists so logging is a pick-from-menu rather than free typing
// (avoids spelling inconsistencies for places, weather, etc.).
import { DAY_LOCATIONS } from './locations'

// Known places on the trip + common Leh spots — used in <datalist> pickers.
export const PLACE_OPTIONS: string[] = Array.from(
  new Set([
    ...Object.values(DAY_LOCATIONS).map(l => l.name),
    'Leh Main Bazaar',
    'Changspa Road',
    'Fort Road',
    'Leh Market',
    'Tibetan Kitchen',
    'Khardung La',
    'Hemis Monastery',
    'Diskit Monastery',
    'Lamayuru',
    'Tso Moriri',
    'Hunder Sand Dunes',
  ])
).sort((a, b) => a.localeCompare(b))

export const WEATHER_OPTIONS: string[] = [
  'Sunny',
  'Partly cloudy',
  'Cloudy',
  'Light rain',
  'Rain',
  'Snow',
  'Windy',
  'Clear night',
  'Cold',
  'Warm',
]

// Tap-to-add highlight tags for journal entries.
export const HIGHLIGHT_OPTIONS: string[] = [
  'Stunning views',
  'Great food',
  'Met someone new',
  'Tough altitude',
  'Productive workday',
  'Festival',
  'Long drive',
  'Photography',
  'Rest day',
  'Shopping',
  'Monastery visit',
  'Trek',
]
