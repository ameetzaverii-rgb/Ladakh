import { db } from '@/lib/db'
import { PHASE_LABELS, PHASE_ORDER, CATEGORY_ICONS } from '@/lib/utils'
import { PrepClient } from './PrepClient'

export const revalidate = 60

async function getChecklistData() {
  const items = await db.checklistItem.findMany({
    orderBy: [{ phase: 'asc' }, { priority: 'asc' }, { createdAt: 'asc' }],
  })
  return items
}

export default async function PrepPage() {
  const items = await getChecklistData()

  const byPhase = PHASE_ORDER.reduce((acc, phase) => {
    acc[phase] = items.filter(i => i.phase === phase)
    return acc
  }, {} as Record<string, typeof items>)

  const totalDone = items.filter(i => i.completed).length
  const totalCount = items.length
  const pct = totalCount > 0 ? Math.round((totalDone / totalCount) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="label-mono text-xs text-gold mb-2">Pre-Trip Preparation</div>
        <h1 className="section-title mb-1">The <em className="text-gold italic">Prep</em> List</h1>
        <p className="text-stone text-sm">Everything you need to book, pack, and sort before you fly.</p>
      </div>

      {/* Progress bar */}
      <div className="card-base p-5 mb-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="font-serif text-3xl text-gold">{totalDone}</div>
            <div className="label-mono text-[0.55rem] text-stone">of {totalCount} completed</div>
          </div>
          <div className="font-serif text-5xl text-gold/30 font-light">{pct}%</div>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #b85c38, #c9993a)' }}
          />
        </div>
      </div>

      <PrepClient items={items} byPhase={byPhase} />
    </div>
  )
}
