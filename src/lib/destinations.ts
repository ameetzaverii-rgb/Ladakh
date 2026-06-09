// src/lib/destinations.ts
// Preset destination metadata — the four launch destinations. Used by the seed,
// the self-heal migration's Ladakh row, and the destination picker. Content
// (stays/treks/food/itinerary…) is seeded separately per destination.

import type { FlagColor } from './utils'

export interface DestinationPreset {
  slug: string
  name: string
  tagline: string
  region: string
  color: FlagColor
  heroWiki: string[]
  lat: number
  lng: number
  currency: string
  intro: string
  sortOrder: number
}

export const DESTINATION_PRESETS: DestinationPreset[] = [
  {
    slug: 'ladakh', name: 'Leh Ladakh', tagline: 'High-desert monasteries, lakes & passes',
    region: 'North India · 3,500m', color: 'blue', heroWiki: ['Thikse Monastery', 'Ladakh'],
    lat: 34.1526, lng: 77.5771, currency: 'INR',
    intro: 'A high-altitude cold desert of Buddhist monasteries, turquoise lakes and the world’s highest motorable passes.',
    sortOrder: 0,
  },
  {
    slug: 'kashmir', name: 'Kashmir', tagline: 'Dal Lake, houseboats & alpine meadows',
    region: 'North India · 1,600m', color: 'green', heroWiki: ['Dal Lake', 'Kashmir Valley'],
    lat: 34.0837, lng: 74.7973, currency: 'INR',
    intro: 'The Valley of houseboats, Mughal gardens, saffron fields and the alpine meadows of Gulmarg and Pahalgam.',
    sortOrder: 1,
  },
  {
    slug: 'pokhara', name: 'Pokhara', tagline: 'Lakeside calm under the Annapurnas',
    region: 'Nepal · 820m', color: 'red', heroWiki: ['Phewa Lake', 'Pokhara'],
    lat: 28.2096, lng: 83.9856, currency: 'NPR',
    intro: 'Nepal’s laid-back lake city — paragliding over Phewa Lake, Annapurna sunrises and a gateway to the foothills.',
    sortOrder: 2,
  },
  {
    slug: 'spiti', name: 'Spiti Valley', tagline: 'The middle land of cliff monasteries',
    region: 'Himachal · 3,800m', color: 'yellow', heroWiki: ['Key Monastery', 'Spiti Valley'],
    lat: 32.2464, lng: 78.0166, currency: 'INR',
    intro: 'A remote Trans-Himalayan desert valley of fossil villages, ancient gompas and impossibly starry skies.',
    sortOrder: 3,
  },
  {
    slug: 'sikkim', name: 'Sikkim', tagline: 'Monasteries, Kanchenjunga & alpine lakes',
    region: 'Northeast India · 1,650m', color: 'green', heroWiki: ['Rumtek Monastery', 'Gangtok'],
    lat: 27.3389, lng: 88.6065, currency: 'INR',
    intro: 'India’s greenest Himalayan state — Buddhist monasteries, glacial lakes, orchid cloud-forests and dawn views of Kanchenjunga.',
    sortOrder: 4,
  },
]

// All toggleable menu sections (core tabs Home/Plan/Journal/Budget are always on).
export const MENU_OPTIONS: { key: string; label: string }[] = [
  { key: 'stays', label: 'Stays' },
  { key: 'flights', label: 'Flights' },
  { key: 'treks', label: 'Treks' },
  { key: 'food', label: 'Food' },
  { key: 'events', label: 'Festivals' },
  { key: 'transport', label: 'Transport' },
  { key: 'shop', label: 'Shopping' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'prep', label: 'Prep checklist' },
  { key: 'emergency', label: 'Emergency' },
  { key: 'diary', label: 'Diary' },
]

export const ALL_MENU_KEYS = MENU_OPTIONS.map(m => m.key)
