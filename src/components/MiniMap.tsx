import { MapPin, ExternalLink } from 'lucide-react'

// A lightweight, key-free location map: OpenStreetMap embed when we have
// coordinates, otherwise a tidy "view on map" button. Consistent everywhere.
export function MiniMap({
  lat, lng, label, query, height = 170,
}: {
  lat?: number | null
  lng?: number | null
  label: string
  query?: string
  height?: number
}) {
  const hasCoords = typeof lat === 'number' && typeof lng === 'number'
  const gmaps = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((query ?? label) + ' Ladakh')}`

  if (!hasCoords) {
    return (
      <a href={gmaps} target="_blank" rel="noopener noreferrer"
        className="press inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-stone hover:text-cream">
        <MapPin className="h-3.5 w-3.5 text-flag-blue" /> View on map <ExternalLink className="h-3 w-3 opacity-60" />
      </a>
    )
  }

  const d = 0.06
  const bbox = `${lng! - d},${lat! - d},${lng! + d},${lat! + d}`
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <iframe src={src} title={`Map of ${label}`} loading="lazy"
        style={{ height, width: '100%', border: 0 }} />
      <a href={gmaps} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 bg-white py-2 text-xs font-semibold text-stone hover:text-cream">
        <MapPin className="h-3.5 w-3.5 text-flag-blue" /> Open in Google Maps <ExternalLink className="h-3 w-3 opacity-60" />
      </a>
    </div>
  )
}
