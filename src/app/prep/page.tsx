import { db } from '@/lib/db'
import { PHASE_ORDER } from '@/lib/utils'
import { PrepClient } from './PrepClient'
import { CategoryHero } from '@/components/Photo'
import { getCategoryImage } from '@/lib/imagery'
import { ListChecks } from 'lucide-react'

export const dynamic = 'force-dynamic'
async function getChecklistData() {
  const items = await db.checklistItem.findMany({
    orderBy: [{ phase: 'asc' }, { priority: 'asc' }, { createdAt: 'asc' }],
  })
  return items
}

export default async function PrepPage() {
  const [items, heroImg] = await Promise.all([getChecklistData(), getCategoryImage('itinerary')])

  const byPhase = PHASE_ORDER.reduce((acc, phase) => {
    acc[phase] = items.filter(i => i.phase === phase)
    return acc
  }, {} as Record<string, typeof items>)

  const totalDone = items.filter(i => i.completed).length
  const totalCount = items.length
  const pct = totalCount > 0 ? Math.round((totalDone / totalCount) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <CategoryHero src={heroImg?.src ?? null} color="blue" icon={ListChecks}
        title="The Prep List" subtitle="Everything to book, pack, and sort before you fly." />

      {/* Progress bar */}
      <div className="card-base p-5 mb-8">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="text-3xl font-extrabold tabular-nums text-cream">{totalDone}<span className="text-lg text-stone">/{totalCount}</span></div>
            <div className="text-[0.7rem] font-medium text-stone">completed</div>
          </div>
          <div className="text-5xl font-extrabold tabular-nums text-flag-blue">{pct}%</div>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-[#eee9df]">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #2f6db5, #3e9e6e)' }}
          />
        </div>
      </div>

      <PrepClient items={items} byPhase={byPhase} />
    </div>
  )
}
