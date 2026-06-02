import { db } from '@/lib/db'
import { ContributeClient } from './ContributeClient'

export const dynamic = 'force-dynamic'

export default async function ContributePage() {
  // Existing counts so friends can see the lists are alive. Guarded individually.
  const [shop, food, treks, events] = await Promise.all([
    db.shopItem.count().catch(() => 0),
    db.place.count().catch(() => 0),
    db.trek.count().catch(() => 0),
    db.event.count().catch(() => 0),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <div className="label-mono text-xs text-gold mb-2">Crowdsource the trip</div>
        <h1 className="section-title mb-2">Help plan <em className="text-gold italic">Ladakh</em> 🙏</h1>
        <p className="text-stone text-sm leading-relaxed max-w-md mx-auto">
          Been to Ladakh, or have a tip? Add your recommendations below — they drop straight into the
          trip planner. No login needed. Add your name so we know who to thank!
        </p>
      </div>

      <ContributeClient counts={{ shop, food, treks, events }} />
    </div>
  )
}
