// src/lib/content/coworking.ts
// Curated coworking + work-friendly spaces per destination. Reference content
// (no DB) surfaced on the Stays page only for work trips (Workation / Hybrid).
// Prices are indicative day-pass / monthly rates in local currency — edit freely.

export interface Coworking {
  name: string
  neighbourhood: string
  /** Dedicated space, a laptop-friendly café, or a hotel business centre/desk. */
  kind: 'COWORKING' | 'CAFE' | 'HOTEL_DESK'
  /** Indicative day-pass price; null = varies / ask. */
  dayPassINR: number | null
  /** Indicative monthly price, if offered. */
  monthlyINR?: number | null
  wifiRating: number // 1–5
  amenities: string[]
  note: string
  url?: string
}

const KIND_LABEL: Record<Coworking['kind'], string> = {
  COWORKING: 'Coworking',
  CAFE: 'Work-friendly café',
  HOTEL_DESK: 'Hotel business centre',
}
export function coworkingKindLabel(k: Coworking['kind']): string {
  return KIND_LABEL[k]
}

// A short, honest intro per destination (connectivity reality varies a lot).
export const COWORKING_INTRO: Record<string, string> = {
  ladakh: 'Leh has one dedicated hub plus café desks and hotel business centres. Carry a Jio/Airtel SIM — connectivity dips during evening peak and on excursions.',
  kashmir: 'Srinagar leans on work-friendly cafés and hotel business centres rather than dedicated coworking. WiFi is decent in the city, patchy in the valleys.',
  pokhara: 'Lakeside Pokhara is a genuine digital-nomad base — dedicated coworking with fibre, plus dozens of laptop-friendly cafés.',
  spiti: 'Spiti has no dedicated coworking and slow, often solar-powered connectivity. Plan offline work and sync from Kaza; carry a BSNL/Jio hotspot.',
  sikkim: 'Gangtok works from cafés on MG Marg and hotel business centres; dedicated coworking is limited. WiFi is reliable in town, thinner up north.',
}

export const COWORKING_BY_SLUG: Record<string, Coworking[]> = {
  ladakh: [
    { name: 'Ladakh Coworking Hub', neighbourhood: 'Changspa, Leh', kind: 'COWORKING', dayPassINR: 500, monthlyINR: 8000, wifiRating: 4, amenities: ['Power backup', 'Meeting room', 'Coffee', 'Calls OK'], note: 'Leh’s main dedicated coworking space — fibre + backup power, busy with remote workers in season (May–Sep).' },
    { name: 'Café desks (Coffee Culture, Bistro Bot)', neighbourhood: 'Main Bazaar / Changspa', kind: 'CAFE', dayPassINR: null, wifiRating: 3, amenities: ['Coffee', 'Power outlets'], note: 'Several cafés let you work over a coffee; connectivity slows in the evening peak.' },
    { name: 'Hotel business centres', neighbourhood: 'Fort Road / Changspa', kind: 'HOTEL_DESK', dayPassINR: null, wifiRating: 4, amenities: ['Power backup', 'Quiet', 'Printer'], note: 'Grand Dragon, Ladakh Retreat and similar offer business centres / meeting rooms — often free for guests.' },
  ],
  kashmir: [
    { name: 'Books & Bricks Café', neighbourhood: 'Rajbagh, Srinagar', kind: 'CAFE', dayPassINR: null, wifiRating: 4, amenities: ['Coffee', 'Power outlets', 'Quiet'], note: 'Café-bookshop — the closest Srinagar has to a co-working café, with fast-ish WiFi and plug points.' },
    { name: 'Hotel business centres', neighbourhood: 'Gupkar / Boulevard', kind: 'HOTEL_DESK', dayPassINR: null, wifiRating: 4, amenities: ['Power backup', 'Meeting room', 'Quiet'], note: 'The Lalit Grand Palace and Hotel Heevan have proper business centres and reliable connectivity.' },
    { name: 'Chai Jaai (riverfront)', neighbourhood: 'Zaina Kadal, Srinagar', kind: 'CAFE', dayPassINR: null, wifiRating: 3, amenities: ['Coffee', 'River view'], note: 'Calm restored riverfront house — a pleasant spot for a focused work coffee.' },
  ],
  pokhara: [
    { name: 'Outpost Coworking, Lakeside', neighbourhood: 'Lakeside, Pokhara', kind: 'COWORKING', dayPassINR: 600, monthlyINR: 9000, wifiRating: 4, amenities: ['Fast fibre', 'Meeting room', 'Coffee', 'Calls OK'], note: 'Lakeside coworking popular with digital nomads — reliable fibre, backup power and a community vibe.' },
    { name: 'Lakeside nomad cafés', neighbourhood: 'Lakeside, Pokhara', kind: 'CAFE', dayPassINR: null, wifiRating: 4, amenities: ['Coffee', 'Power outlets', 'Lake view'], note: 'Lakeside is full of laptop-friendly cafés with good WiFi and lake views.' },
    { name: 'Hotel business centres', neighbourhood: 'Lakeside, Pokhara', kind: 'HOTEL_DESK', dayPassINR: null, wifiRating: 3, amenities: ['Power backup', 'Quiet'], note: 'Most mid/upper hotels offer a desk or business centre and a generator for load-shedding.' },
  ],
  spiti: [
    { name: 'Café desks, Kaza', neighbourhood: 'Kaza', kind: 'CAFE', dayPassINR: null, wifiRating: 2, amenities: ['Coffee', 'Solar power'], note: 'Sol Café and similar offer a corner to work, but connectivity is slow and power can be solar-dependent.' },
    { name: 'Homestay / hotel WiFi', neighbourhood: 'Kaza', kind: 'HOTEL_DESK', dayPassINR: null, wifiRating: 2, amenities: ['Quiet'], note: 'Most work happens from your stay — carry a BSNL/Jio hotspot; signal fades beyond Kaza.' },
  ],
  sikkim: [
    { name: 'Baker’s Café, MG Marg', neighbourhood: 'MG Marg, Gangtok', kind: 'CAFE', dayPassINR: null, wifiRating: 3, amenities: ['Coffee', 'Power outlets', 'Bakery'], note: 'The most reliable work-from-café spot on the pedestrian mall.' },
    { name: 'Café Live & Loud', neighbourhood: 'MG Marg, Gangtok', kind: 'CAFE', dayPassINR: null, wifiRating: 3, amenities: ['Coffee', 'Balcony', 'Quiet by day'], note: 'Sofas and espresso by day, live music by night — fine for a long work session.' },
    { name: 'Hotel business centres', neighbourhood: 'Gangtok', kind: 'HOTEL_DESK', dayPassINR: null, wifiRating: 4, amenities: ['Power backup', 'Meeting room', 'Quiet'], note: 'Mayfair and Denzong Regency offer business centres and dependable connectivity.' },
  ],
}
