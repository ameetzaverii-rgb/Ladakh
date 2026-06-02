// src/lib/locations.ts
// Geographic anchor for each itinerary day — used for live weather + the map.
// Kept in code (not the DB) because these are fixed geographic facts, not
// editable trip content. Coordinates are the day's primary base/destination.

export interface DayLocation {
  name: string
  lat: number
  lng: number
  altitudeM: number
}

export const DAY_LOCATIONS: Record<number, DayLocation> = {
  1: { name: 'Leh', lat: 34.1526, lng: 77.5771, altitudeM: 3500 },
  2: { name: 'Phyang Monastery', lat: 34.2069, lng: 77.5, altitudeM: 3550 },
  3: { name: 'Leh Old Town', lat: 34.1642, lng: 77.5848, altitudeM: 3500 },
  4: { name: 'Shanti Stupa, Leh', lat: 34.1697, lng: 77.5636, altitudeM: 3600 },
  5: { name: 'Leh Palace', lat: 34.1658, lng: 77.5854, altitudeM: 3500 },
  6: { name: 'Thiksey Monastery', lat: 34.0556, lng: 77.6675, altitudeM: 3300 },
  7: { name: 'Leh', lat: 34.1526, lng: 77.5771, altitudeM: 3500 },
  8: { name: 'Sham Valley (Hemis Shukpachan)', lat: 34.301, lng: 77.326, altitudeM: 3700 },
  9: { name: 'Leh', lat: 34.1526, lng: 77.5771, altitudeM: 3500 },
  10: { name: 'Leh', lat: 34.1526, lng: 77.5771, altitudeM: 3500 },
  11: { name: 'Stok Village', lat: 34.07, lng: 77.54, altitudeM: 3550 },
  12: { name: 'Sangam Confluence (Nimmu)', lat: 34.19, lng: 77.33, altitudeM: 3100 },
  13: { name: 'Leh', lat: 34.1526, lng: 77.5771, altitudeM: 3500 },
  14: { name: 'Alchi Monastery', lat: 34.223, lng: 77.176, altitudeM: 3100 },
  15: { name: 'Nubra Valley (Hunder)', lat: 34.576, lng: 77.49, altitudeM: 3050 },
  16: { name: 'Turtuk Village', lat: 34.846, lng: 76.827, altitudeM: 2900 },
  17: { name: 'Leh', lat: 34.1526, lng: 77.5771, altitudeM: 3500 },
  18: { name: 'Magnetic Hill', lat: 34.23, lng: 77.35, altitudeM: 3300 },
  19: { name: 'Leh', lat: 34.1526, lng: 77.5771, altitudeM: 3500 },
  20: { name: 'Leh', lat: 34.1526, lng: 77.5771, altitudeM: 3500 },
  21: { name: 'Pangong Tso (Spangmik)', lat: 33.74, lng: 78.63, altitudeM: 4350 },
}
