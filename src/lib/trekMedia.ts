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
  return { titles: ['Ladakh'], youtubeQuery: 'Ladakh trekking' }
}

export interface TrekImage {
  src: string
  pageUrl: string
  title: string
}

export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
}

async function fetchSummary(title: string): Promise<TrekImage | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { signal: controller.signal, next: { revalidate: 86400 } } // cache 1 day
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
    const img = await fetchSummary(title)
    if (img) return img
  }
  return null
}
