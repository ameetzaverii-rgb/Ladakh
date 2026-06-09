import { db } from '@/lib/db'
import { fetchWikiImage } from '@/lib/trekMedia'
import { getActiveContext } from '@/lib/destination'
import { Onboarding, type OnboardDestination } from './Onboarding'

export const dynamic = 'force-dynamic'

export default async function StartPage() {
  const [destinations, ctx] = await Promise.all([
    db.destination.findMany({ orderBy: { sortOrder: 'asc' } }),
    getActiveContext(),
  ])

  // Resolve a hero photo per destination (Wikipedia, cached 1 day).
  const withImages: OnboardDestination[] = await Promise.all(
    destinations.map(async d => {
      let image = d.heroSrc ?? null
      if (!image) {
        for (const title of d.heroWiki) {
          const img = await fetchWikiImage(title)
          if (img?.src) { image = img.src; break }
        }
      }
      return {
        id: d.id, slug: d.slug, name: d.name, tagline: d.tagline,
        region: d.region, color: d.color, intro: d.intro ?? '', image,
      }
    })
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Onboarding
        destinations={withImages}
        activeId={ctx.dest?.id ?? null}
        currentMenus={ctx.enabledMenus}
      />
    </div>
  )
}
