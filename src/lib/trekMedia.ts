// src/lib/trekMedia.ts
// Real photos + video links for each trek.
// Images are fetched live from Wikipedia's REST API (reliable, attributed,
// no hardcoded fragile URLs). Videos open a relevant YouTube search.

export interface TrekMedia {
  titles: string[] // Wikipedia titles to try, in order
  youtubeQuery: string
}

// Match a trek to its media by keyword in the name.
export function getTrekMediaConfig(trekName: string): TrekMedia {
  const n = trekName.toLowerCase()
  if (n.includes('markha'))
    return { titles: ['Markha Valley'], youtubeQuery: 'Markha Valley trek Ladakh' }
  if (n.includes('stok'))
    return { titles: ['Stok Kangri'], youtubeQuery: 'Stok Kangri trek Ladakh' }
  if (n.includes('pangong'))
    return { titles: ['Pangong Tso'], youtubeQuery: 'Pangong Tso Ladakh' }
  if (n.includes('nubra'))
    return { titles: ['Nubra Valley'], youtubeQuery: 'Nubra Valley trek Ladakh' }
  if (n.includes('chadar') || n.includes('zanskar'))
    return { titles: ['Chadar Trek', 'Zanskar'], youtubeQuery: 'Chadar trek Zanskar' }
  if (n.includes('sham'))
    return { titles: ['Likir Monastery', 'Sham Valley', 'Ladakh'], youtubeQuery: 'Sham Valley trek Ladakh' }
  // Kashmir
  if (n.includes('great lakes')) return { titles: ['Great Lakes of Kashmir', 'Sonamarg'], youtubeQuery: 'Kashmir Great Lakes trek' }
  if (n.includes('lidder') || n.includes('aru')) return { titles: ['Aru, Jammu and Kashmir', 'Pahalgam'], youtubeQuery: 'Aru Lidderwat trek Pahalgam' }
  if (n.includes('khilanmarg') || n.includes('gulmarg')) return { titles: ['Gulmarg'], youtubeQuery: 'Khilanmarg Gulmarg trek' }
  if (n.includes('tarsar') || n.includes('marsar')) return { titles: ['Tarsar Lake', 'Pahalgam'], youtubeQuery: 'Tarsar Marsar trek Kashmir' }
  // Pokhara / Annapurna
  if (n.includes('australian camp') || n.includes('dhampus')) return { titles: ['Dhampus', 'Annapurna Massif'], youtubeQuery: 'Australian Camp Dhampus trek' }
  if (n.includes('poon hill') || n.includes('ghorepani')) return { titles: ['Poon Hill', 'Ghorepani'], youtubeQuery: 'Poon Hill trek Nepal' }
  if (n.includes('mardi')) return { titles: ['Machhapuchhre', 'Annapurna Massif'], youtubeQuery: 'Mardi Himal trek' }
  if (n.includes('sarangkot')) return { titles: ['Sarangkot'], youtubeQuery: 'Sarangkot sunrise Pokhara' }
  // Spiti
  if (n.includes('komic') || n.includes('langza') || n.includes('hikkim')) return { titles: ['Langza', 'Komic'], youtubeQuery: 'Langza Komic Hikkim Spiti' }
  if (n.includes('dhankar')) return { titles: ['Dhankar Monastery'], youtubeQuery: 'Dhankar lake trek Spiti' }
  if (n.includes('pin valley') || n.includes('mudh')) return { titles: ['Pin Valley National Park'], youtubeQuery: 'Pin Valley trek Spiti' }
  if (n.includes('kibber') || n.includes('tashigang')) return { titles: ['Kibber'], youtubeQuery: 'Kibber Spiti trek' }
  // Generic mountain fallback (not Ladakh-specific).
  return { titles: ['Himalayas'], youtubeQuery: 'Himalaya trekking' }
}

export interface TrekImage {
  src: string
  pageUrl: string
  title: string
}

export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}

export async function fetchWikiImage(title: string): Promise<TrekImage | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      {
        signal: controller.signal,
        next: { revalidate: 86400 }, // cache 1 day
        // Wikimedia requires a descriptive User-Agent; generic ones get 403'd,
        // which would silently drop every image across the app.
        headers: {
          'User-Agent': 'LadakhWorkationGuide/1.0 (https://ladakh-sage.vercel.app; amitzave@gmail.com)',
          'Api-User-Agent': 'LadakhWorkationGuide/1.0 (https://ladakh-sage.vercel.app; amitzave@gmail.com)',
          Accept: 'application/json',
        },
      }
    )
    if (!res.ok) return null
    const d = await res.json()
    const src: string | undefined = d.originalimage?.source ?? d.thumbnail?.source
    if (!src) return null
    return {
      src,
      pageUrl: d.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      title: d.title ?? title,
    }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// Try each candidate title until one yields an image.
export async function getTrekImage(trekName: string): Promise<TrekImage | null> {
  const { titles } = getTrekMediaConfig(trekName)
  for (const title of titles) {
    const img = await fetchWikiImage(title)
    if (img) return img
  }
  return null
}
