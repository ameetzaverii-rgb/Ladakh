// Time-of-day masthead image for the homepage.
// Picks a Ladakh image that matches both the current hour (in India / IST) and a
// theme of the trip — dawn gompas, morning monasteries, afternoon lakes,
// golden-hour Leh, and the night sky over the Hanle observatory.
// Images come live from Wikipedia (real + attributed), reusing the trek fetcher.

import { fetchWikiImage, type TrekImage } from './trekMedia'

export interface HeroImage extends TrekImage {
  theme: string
  greeting: string
  /** Soft mood wash painted over the photo. */
  tint: string
  /** Accent colour for the greeting label. */
  accent: string
}

interface Bucket {
  /** Inclusive start hour, exclusive end hour, on a 0–29 clock (night wraps past 24). */
  from: number
  to: number
  theme: string
  greeting: string
  titles: string[]
  tint: string
  accent: string
}

const BUCKETS: Bucket[] = [
  {
    from: 5, to: 8,
    theme: 'Dawn over the gompas',
    greeting: 'Good morning',
    titles: ['Lamayuru Monastery', 'Diskit Monastery', 'Thikse Monastery', 'Ladakh'],
    tint: 'linear-gradient(to top, rgba(15,11,6,0.90), rgba(120,60,50,0.28) 55%, rgba(232,168,124,0.30))',
    accent: '#e8a87c',
  },
  {
    from: 8, to: 12,
    theme: 'Morning at the monastery',
    greeting: 'A clear Ladakhi morning',
    titles: ['Thikse Monastery', 'Hemis Monastery', 'Shanti Stupa', 'Ladakh'],
    tint: 'linear-gradient(to top, rgba(15,11,6,0.90), rgba(30,80,110,0.25) 55%, rgba(127,180,201,0.28))',
    accent: '#7fb4c9',
  },
  {
    from: 12, to: 17,
    theme: 'Afternoon by the high lakes',
    greeting: 'Good afternoon',
    titles: ['Pangong Tso', 'Nubra Valley', 'Tso Moriri', 'Ladakh'],
    tint: 'linear-gradient(to top, rgba(15,11,6,0.88), rgba(20,110,105,0.22) 55%, rgba(75,179,167,0.26))',
    accent: '#4bb3a7',
  },
  {
    from: 17, to: 20,
    theme: 'Golden hour over Leh',
    greeting: 'Good evening',
    titles: ['Leh Palace', 'Shanti Stupa', 'Leh', 'Ladakh'],
    tint: 'linear-gradient(to top, rgba(15,11,6,0.90), rgba(150,90,30,0.30) 55%, rgba(217,140,58,0.32))',
    accent: '#d98c3a',
  },
  {
    // Night wraps: 20:00–05:00 → represented as 20–29.
    from: 20, to: 29,
    theme: 'Under Ladakh’s stars',
    greeting: 'Clear night skies',
    titles: ['Indian Astronomical Observatory', 'Hanle, Ladakh', 'Pangong Tso', 'Ladakh'],
    tint: 'linear-gradient(to top, rgba(8,8,18,0.92), rgba(40,40,90,0.40) 55%, rgba(138,134,196,0.30))',
    accent: '#a7a3e0',
  },
]

// Current hour in India, regardless of where the server runs.
function istHour(): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false,
  }).formatToParts(new Date())
  const h = Number(parts.find(p => p.type === 'hour')?.value ?? '12')
  return h % 24
}

export function pickBucket(hour: number): Bucket {
  const eff = hour < 5 ? hour + 24 : hour // fold early morning into the night bucket
  return BUCKETS.find(b => eff >= b.from && eff < b.to) ?? BUCKETS[1]
}

export async function getHeroForNow(): Promise<HeroImage | null> {
  const bucket = pickBucket(istHour())
  for (const title of bucket.titles) {
    const img = await fetchWikiImage(title)
    if (img) {
      return {
        ...img,
        theme: bucket.theme,
        greeting: bucket.greeting,
        tint: bucket.tint,
        accent: bucket.accent,
      }
    }
  }
  return null
}
