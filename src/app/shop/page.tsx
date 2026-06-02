import { db } from '@/lib/db'
import { ShopClient, type ShopItemT } from './ShopClient'

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="label-mono text-xs text-gold mb-2">Souvenir Repository</div>
        <h1 className="section-title mb-1">The <em className="text-gold italic">Shopping List</em></h1>
        <p className="text-stone text-sm">What to pick up — and where — across each part of Ladakh. Tick things off as you buy them.</p>
        <a href="/contribute" className="inline-block mt-2 label-mono text-[0.6rem] text-sky hover:underline">🙋 Friends can add suggestions → share the Collaborate page</a>
      </div>

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
