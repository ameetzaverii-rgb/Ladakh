import { db } from '@/lib/db'
import { ShopClient, type ShopItemT } from './ShopClient'
import { CategoryHero } from '@/components/Photo'
import { getCategoryImage } from '@/lib/imagery'
import { fetchWikiImage } from '@/lib/trekMedia'
import { shopIdeasForSlug, type ShopIdea } from '@/lib/shopSuggestions'
import { getActiveContext } from '@/lib/destination'
import { ShoppingBag } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  const ctx = await getActiveContext()
  const slug = ctx.dest?.slug ?? 'ladakh'
  let items: ShopItemT[] = []
  let needsMigrate = false
  try {
    items = (await db.shopItem.findMany({
      where: { destinationId: ctx.dest?.id ?? 'ladakh' },
      orderBy: [{ acquired: 'asc' }, { createdAt: 'asc' }],
    })) as ShopItemT[]
  } catch {
    // Table not created yet — prompt to run the migration.
    needsMigrate = true
  }

  // Per-destination idea deck + Polaroid photos (Wikipedia, cached 1 day).
  const ideas: ShopIdea[] = shopIdeasForSlug(slug)
  const ideaImages: Record<string, string> = {}
  await Promise.all(
    ideas.map(async idea => {
      for (const title of idea.wiki) {
        const img = await fetchWikiImage(title)
        if (img?.src) { ideaImages[idea.id] = img.src; break }
      }
    })
  )

  const heroImg = await getCategoryImage('shop')

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <CategoryHero src={heroImg?.src ?? null} color="yellow" icon={ShoppingBag}
        title="The Shopping List" subtitle={`What to pick up — and where — across ${ctx.dest?.name ?? 'your trip'}.`} />
      <a href="/contribute" className="mb-6 inline-block label-mono text-[0.6rem] text-sky hover:underline">🙋 Friends can add suggestions → share the Collaborate page</a>

      {needsMigrate ? (
        <div className="warning-box p-5 text-sm text-muted">
          <strong className="label-mono text-[0.65rem] text-rust block mb-2">⚙️ One-time setup needed</strong>
          The shop table hasn&apos;t been created in the database yet. Open{' '}
          <code className="text-gold">/api/migrate?token=ladakh2026</code> once, then refresh this page.
        </div>
      ) : (
        <ShopClient items={items} ideas={ideas} ideaImages={ideaImages} />
      )}
    </div>
  )
}
