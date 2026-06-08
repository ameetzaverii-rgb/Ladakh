import { db } from '@/lib/db'
import { ShopClient, type ShopItemT } from './ShopClient'
import { CategoryHero } from '@/components/Photo'
import { getCategoryImage } from '@/lib/imagery'
import { ShoppingBag } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  let items: ShopItemT[] = []
  let needsMigrate = false
  try {
    items = (await db.shopItem.findMany({
      orderBy: [{ acquired: 'asc' }, { createdAt: 'asc' }],
    })) as ShopItemT[]
  } catch {
    // Table not created yet — prompt to run the migration.
    needsMigrate = true
  }

  const heroImg = await getCategoryImage('shop')

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <CategoryHero src={heroImg?.src ?? null} color="yellow" icon={ShoppingBag}
        title="The Shopping List" subtitle="What to pick up — and where — across Ladakh. Tick things off as you buy them." />
      <a href="/contribute" className="mb-6 inline-block label-mono text-[0.6rem] text-sky hover:underline">🙋 Friends can add suggestions → share the Collaborate page</a>

      {needsMigrate ? (
        <div className="warning-box p-5 text-sm text-muted">
          <strong className="label-mono text-[0.65rem] text-rust block mb-2">⚙️ One-time setup needed</strong>
          The shop table hasn&apos;t been created in the database yet. Open{' '}
          <code className="text-gold">/api/migrate?token=ladakh2026</code> once, then{' '}
          <code className="text-gold">/api/seed?token=ladakh2026</code> to load the starter list, and refresh this page.
        </div>
      ) : (
        <ShopClient items={items} />
      )}
    </div>
  )
}
