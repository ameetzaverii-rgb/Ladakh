// src/lib/imagery.ts
// Curated photo config for category tiles and the places gallery.
//
// SOURCE: by default each entry's photo is fetched live from Wikipedia/Wikimedia
// (real, attributed, cached 1 day) via fetchWikiImage(). To use your own photo
// or a hand-picked Unsplash image instead, just set `src` on the entry below —
// when `src` is present it wins and no network fetch happens. Example:
//   { id: 'pangong', ..., src: 'https://images.unsplash.com/photo-XXdrop-your-url' }

import { fetchWikiImage, type TrekImage } from './trekMedia'
import type { FlagColor } from './utils'

export interface PhotoRef {
  /** Optional manual override — Unsplash URL, /public path, anything <img> can load. */
  src?: string
  /** Wikipedia titles to try in order when no override is set. */
  wiki: string[]
}

export interface Place extends PhotoRef {
  id: string
  name: string
  blurb: string
  /** Itinerary day(s) this place falls on, or a tag like "Optional". */
  when: string
  region: string
  color: FlagColor
  lat: number
  lng: number
  /** Bento emphasis — some tiles span more space for visual rhythm. */
  span?: 'wide' | 'tall' | 'big'
}

/** The places on (or near) the 21-day plan, in roughly itinerary order. */
export const PLACES: Place[] = [
  { id: 'pangong', name: 'Pangong Tso', blurb: 'The surreal colour-shifting high-altitude lake on the Tibetan border.', when: 'Day 21', region: 'East Ladakh · 4,350m', color: 'blue', span: 'big', lat: 33.74, lng: 78.63, wiki: ['Pangong Tso'] },
  { id: 'nubra', name: 'Nubra Valley', blurb: 'Sand dunes, double-humped camels and green oases between giant peaks.', when: 'Day 15', region: 'Hunder · 3,050m', color: 'green', span: 'wide', lat: 34.576, lng: 77.49, wiki: ['Nubra Valley'] },
  { id: 'thiksey', name: 'Thiksey Monastery', blurb: 'A 12-storey monastery resembling the Potala, glowing at sunrise.', when: 'Day 6', region: 'Indus Valley · 3,300m', color: 'red', span: 'tall', lat: 34.0556, lng: 77.6675, wiki: ['Thikse Monastery'] },
  { id: 'turtuk', name: 'Turtuk Village', blurb: "One of India's last villages before Pakistan — Balti culture & apricots.", when: 'Day 16', region: 'Shyok Valley · 2,900m', color: 'green', lat: 34.846, lng: 76.827, wiki: ['Turtuk'] },
  { id: 'lehpalace', name: 'Leh Palace', blurb: 'The nine-storey former royal palace looking over the old town.', when: 'Day 5', region: 'Leh · 3,500m', color: 'blue', lat: 34.1658, lng: 77.5854, wiki: ['Leh Palace'] },
  { id: 'shanti', name: 'Shanti Stupa', blurb: 'A white-domed hilltop stupa with sweeping views over Leh at golden hour.', when: 'Day 4', region: 'Leh · 3,600m', color: 'red', lat: 34.1697, lng: 77.5636, wiki: ['Shanti Stupa'] },
  { id: 'phyang', name: 'Phyang Monastery', blurb: 'Home of the Tsedup festival and its masked Cham dances.', when: 'Day 2', region: 'Leh · 3,550m', color: 'red', lat: 34.2069, lng: 77.5, wiki: ['Phyang Monastery'] },
  { id: 'hemis', name: 'Hemis Monastery', blurb: 'The largest & wealthiest gompa in Ladakh, hidden in a side valley.', when: 'Excursion', region: 'Indus Valley · 3,600m', color: 'red', lat: 34.0125, lng: 77.7039, wiki: ['Hemis Monastery'] },
  { id: 'diskit', name: 'Diskit Monastery', blurb: 'Oldest monastery in Nubra, guarded by a giant Maitreya Buddha.', when: 'Day 15', region: 'Nubra · 3,140m', color: 'red', lat: 34.5403, lng: 77.5546, wiki: ['Diskit Monastery'] },
  { id: 'lamayuru', name: 'Lamayuru', blurb: 'The otherworldly "moonland" eroded hills around an ancient gompa.', when: 'Optional', region: 'West Ladakh · 3,510m', color: 'green', span: 'wide', lat: 34.2861, lng: 76.7769, wiki: ['Lamayuru Monastery'] },
  { id: 'alchi', name: 'Alchi Monastery', blurb: '11th-century murals among the finest surviving Indo-Tibetan art.', when: 'Day 14', region: 'Indus Valley · 3,100m', color: 'blue', lat: 34.223, lng: 77.176, wiki: ['Alchi Monastery'] },
  { id: 'magnetic', name: 'Magnetic Hill', blurb: 'The famous optical-illusion slope on the Leh–Kargil road.', when: 'Day 18', region: 'Leh–Kargil Rd · 3,300m', color: 'blue', lat: 34.227, lng: 77.357, wiki: ['Magnetic Hill, Ladakh', 'Magnetic Hill'] },
  { id: 'stok', name: 'Stok Kangri', blurb: 'The towering 6,153m peak above Stok village, framing the Indus.', when: 'Day 11', region: 'Stok · 3,550m', color: 'green', span: 'tall', lat: 34.07, lng: 77.54, wiki: ['Stok Kangri'] },
  { id: 'sham', name: 'Sham Valley', blurb: 'The gentle "apricot valley" trek past Likir and Hemis Shukpachan.', when: 'Day 8', region: 'West Ladakh · 3,700m', color: 'green', lat: 34.301, lng: 77.326, wiki: ['Likir Monastery', 'Sham Valley'] },
  { id: 'khardung', name: 'Khardung La', blurb: 'The legendary high mountain pass gateway to Nubra.', when: 'Day 15', region: 'Pass · 5,359m', color: 'blue', lat: 34.2784, lng: 77.6043, wiki: ['Khardung La'] },
  { id: 'sangam', name: 'Sangam Confluence', blurb: 'Where the green Indus meets the brown Zanskar near Nimmu.', when: 'Day 12', region: 'Nimmu · 3,100m', color: 'blue', lat: 34.19, lng: 77.33, wiki: ['Zanskar River', 'Indus River'] },
  { id: 'leh', name: 'Leh Old Town', blurb: 'Whitewashed lanes, the central bazaar and the Jama Masjid below the palace.', when: 'Day 3', region: 'Leh · 3,500m', color: 'yellow', lat: 34.1642, lng: 77.5848, wiki: ['Leh'] },
  { id: 'tsomoriri', name: 'Tso Moriri', blurb: 'A remote, pristine high-altitude lake in the Changthang plateau.', when: 'Optional', region: 'Changthang · 4,522m', color: 'blue', span: 'wide', lat: 32.91, lng: 78.31, wiki: ['Tso Moriri'] },
]

/** Representative photo for each app category/section. */
export const CATEGORY_IMAGES: Record<string, PhotoRef> = {
  itinerary: { wiki: ['Thikse Monastery', 'Ladakh'] },
  events: { wiki: ['Hemis Monastery', 'Hemis Festival'] },
  treks: { wiki: ['Markha Valley', 'Stok Kangri'] },
  budget: { wiki: ['Leh'] },
  stays: { wiki: ['Nubra Valley'] },
  food: { wiki: ['Momo (food)', 'Thukpa', 'Tibetan cuisine'] },
  transport: { wiki: ['Khardung La'] },
  shop: { wiki: ['Leh', 'Pashmina'] },
  flights: { wiki: ['Kushok Bakula Rimpochee Airport', 'Leh'] },
  journal: { wiki: ['Pangong Tso'] },
  diary: { wiki: ['Tso Moriri', 'Pangong Tso'] },
  gallery: { wiki: ['Pangong Tso'] },
}

/** Resolve a PhotoRef to an image: honour `src` override, else try Wikipedia titles. */
export async function resolvePhoto(ref: PhotoRef): Promise<TrekImage | null> {
  if (ref.src) return { src: ref.src, pageUrl: ref.src, title: '' }
  for (const title of ref.wiki) {
    const img = await fetchWikiImage(title)
    if (img) return img
  }
  return null
}

export async function getCategoryImage(key: string): Promise<TrekImage | null> {
  const ref = CATEGORY_IMAGES[key]
  return ref ? resolvePhoto(ref) : null
}

export type ResolvedPlace = Place & { image: TrekImage | null }

/** Fetch every place photo in parallel (mirrors the itinerary page's pattern). */
export async function getPlacesWithImages(): Promise<ResolvedPlace[]> {
  return Promise.all(
    PLACES.map(async place => ({ ...place, image: await resolvePhoto(place) }))
  )
}
