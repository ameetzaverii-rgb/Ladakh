import { getSightsForDestination } from '@/lib/imagery'
import { getActiveContext } from '@/lib/destination'
import { Gallery, type GalleryItem } from '@/components/Gallery'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Places' }

export default async function GalleryPage() {
  const ctx = await getActiveContext()
  const places = await getSightsForDestination(ctx.dest?.slug ?? 'ladakh')

  const items: GalleryItem[] = places.map(p => ({
    id: p.id,
    name: p.name,
    blurb: p.blurb,
    when: p.when,
    region: p.region,
    color: p.color,
    span: p.span,
    src: p.image?.src ?? null,
    pageUrl: p.image?.pageUrl ?? '',
    lat: p.lat,
    lng: p.lng,
  }))

  const withPhotos = items.filter(i => i.src).length

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="section-title mb-1">Places</h1>
      <p className="mb-6 text-sm text-stone">
        Every stop on your 21-day plan, in pictures. Tap any photo to open it full-screen — use ← → to browse.
      </p>

      <Gallery items={items} />

      <p className="mt-6 text-center text-[0.7rem] text-muted">
        {withPhotos} of {items.length} photos loaded live from Wikimedia · attributed in each photo&apos;s detail view
      </p>
    </div>
  )
}
