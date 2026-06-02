import { db } from '@/lib/db'
import { formatINR, formatINRFull, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/utils'
import { BudgetClient } from './BudgetClient'

export const dynamic = 'force-dynamic'
const BUDGET_BREAKDOWN: Record<string, number> = {
  ACCOMMODATION: 76500,
  FOOD: 31500,
  TRANSPORT: 15000,
  TREK: 21500,
  PERMITS: 1500,
  SHOPPING: 10000,
  HEALTH: 3000,
  WORK: 0,
  MISC: 5000,
}

export default async function BudgetPage() {
  const [expenses, config] = await Promise.all([
    db.expense.findMany({ orderBy: { date: 'desc' } }),
    db.tripConfig.findFirst().catch(() => null),
  ])

  const totalBudget = config?.totalBudgetINR ?? 150000
  const totalSpent = expenses.reduce((sum, e) => sum + e.amountINR, 0)
  const remaining = totalBudget - totalSpent

  const spendByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amountINR
    return acc
  }, {} as Record<string, number>)

  // Daily breakdown
  const spendByDay = expenses.reduce((acc, e) => {
    acc[e.tripDay] = (acc[e.tripDay] || 0) + e.amountINR
    return acc
  }, {} as Record<number, number>)

  const avgDailySpend = expenses.length > 0
    ? Math.round(totalSpent / Math.max(...expenses.map(e => e.tripDay), 1))
    : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="label-mono text-xs text-gold mb-2">Finance Tracker</div>
        <h1 className="section-title mb-1">Budget <em className="text-gold italic">Tracker</em></h1>
        <p className="text-stone text-sm">Live spend vs estimate. Every rupee accounted for.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="card-base p-5 text-center">
          <div className="label-mono text-[0.55rem] text-stone mb-1">Total Budget</div>
          <div className="font-serif text-2xl text-cream">{formatINR(totalBudget)}</div>
          <div className="label-mono text-[0.5rem] text-stone mt-0.5">{formatINRFull(totalBudget)}</div>
        </div>
        <div className="card-base p-5 text-center">
          <div className="label-mono text-[0.55rem] text-stone mb-1">Spent</div>
          <div className="font-serif text-2xl text-rust">{formatINR(totalSpent)}</div>
          <div className="label-mono text-[0.5rem] text-stone mt-0.5">{Math.round((totalSpent/totalBudget)*100)}% of budget</div>
        </div>
        <div className="card-base p-5 text-center">
          <div className="label-mono text-[0.55rem] text-stone mb-1">Remaining</div>
          <div className={`font-serif text-2xl ${remaining >= 0 ? 'text-sage' : 'text-rust'}`}>
            {formatINR(Math.abs(remaining))}
          </div>
          <div className="label-mono text-[0.5rem] text-stone mt-0.5">
            {remaining >= 0 ? 'left' : 'over budget!'}
          </div>
        </div>
      </div>

      {/* Budget bar */}
      <div className="card-base p-5 mb-8">
        <div className="flex justify-between mb-2">
          <span className="label-mono text-[0.6rem] text-gold">Burn rate</span>
          <span className="label-mono text-[0.55rem] text-stone">₹{avgDailySpend.toLocaleString()}/day avg</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
              background: totalSpent > totalBudget * 0.8
                ? 'linear-gradient(90deg, #b85c38, #e07050)'
                : 'linear-gradient(90deg, #6b7c5e, #c9993a)',
            }}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 text-center">
          {[0.33, 0.66, 1].map((frac, i) => {
            const label = ['Week 1', 'Week 2', 'Full Trip']
            const target = totalBudget * frac
            const pct = Math.round((totalSpent / target) * 100)
            return (
              <div key={i} className="">
                <div className="label-mono text-[0.5rem] text-stone">{label[i]}</div>
                <div className="label-mono text-[0.55rem] text-cream">{formatINR(target)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="mb-8">
        <div className="label-mono text-xs text-gold mb-4 border-b border-gold/15 pb-2">By Category</div>
        <div className="space-y-3">
          {Object.entries(BUDGET_BREAKDOWN).map(([cat, budgeted]) => {
            const spent = spendByCategory[cat] ?? 0
            const pct = budgeted > 0 ? Math.min((spent / budgeted) * 100, 100) : 0
            const color = CATEGORY_COLORS[cat] ?? '#666'
            return (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-base w-6 shrink-0">{CATEGORY_ICONS[cat] ?? '📌'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="label-mono text-[0.6rem] text-sand">{cat}</span>
                    <span className="label-mono text-[0.55rem] text-stone">
                      {formatINR(spent)} / {formatINR(budgeted)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <BudgetClient expenses={expenses} />
    </div>
  )
}
