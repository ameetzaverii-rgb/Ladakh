import { db } from '@/lib/db'
import { formatINR, formatINRFull } from '@/lib/utils'
import { BudgetClient } from './BudgetClient'
import { AddExpense } from './AddExpense'
import { CategoryBudgets } from './CategoryBudgets'
import { CategoryHero } from '@/components/Photo'
import { getCategoryImage } from '@/lib/imagery'
import { Wallet } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Fallback targets used only if none have been saved in trip settings yet.
const DEFAULT_BREAKDOWN: Record<string, number> = {
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
  const [expenses, config, heroImg] = await Promise.all([
    db.expense.findMany({ orderBy: { date: 'desc' } }),
    db.tripConfig.findFirst().catch(() => null),
    getCategoryImage('budget'),
  ])

  const totalBudget = config?.totalBudgetINR ?? 150000
  const totalSpent = expenses.reduce((sum, e) => sum + e.amountINR, 0)
  const remaining = totalBudget - totalSpent

  // Per-category targets come from editable trip settings; fall back to defaults.
  const savedBudgets = (config?.categoryBudgets ?? null) as Record<string, number> | null
  const breakdown = savedBudgets && Object.keys(savedBudgets).length > 0 ? savedBudgets : DEFAULT_BREAKDOWN

  const spendByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amountINR
    return acc
  }, {} as Record<string, number>)

  const avgDailySpend = expenses.length > 0
    ? Math.round(totalSpent / Math.max(...expenses.map(e => e.tripDay), 1))
    : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <CategoryHero src={heroImg?.src ?? null} color="yellow" icon={Wallet}
        title="Budget Tracker" subtitle="Live spend vs estimate — every rupee accounted for." />

      {/* Add expense — pinned to the top */}
      <AddExpense />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="card-base p-3 sm:p-5 text-center">
          <div className="label-mono text-[0.55rem] text-stone mb-1">Total Budget</div>
          <div className="font-serif text-2xl text-cream">{formatINR(totalBudget)}</div>
          <div className="label-mono text-[0.5rem] text-stone mt-0.5">{formatINRFull(totalBudget)}</div>
        </div>
        <div className="card-base p-3 sm:p-5 text-center">
          <div className="label-mono text-[0.55rem] text-stone mb-1">Spent</div>
          <div className="font-serif text-2xl text-rust">{formatINR(totalSpent)}</div>
          <div className="label-mono text-[0.5rem] text-stone mt-0.5">{Math.round((totalSpent/totalBudget)*100)}% of budget</div>
        </div>
        <div className="card-base p-3 sm:p-5 text-center">
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
        <div className="h-3 bg-[#eee9df] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
              background: totalSpent > totalBudget * 0.8
                ? 'linear-gradient(90deg, #d24b3e, #e07050)'
                : 'linear-gradient(90deg, #e0a21b, #3e9e6e)',
            }}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 text-center">
          {[0.33, 0.66, 1].map((frac, i) => {
            const label = ['Week 1', 'Week 2', 'Full Trip']
            const target = totalBudget * frac
            return (
              <div key={i}>
                <div className="label-mono text-[0.5rem] text-stone">{label[i]}</div>
                <div className="label-mono text-[0.55rem] text-cream">{formatINR(target)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Editable category breakdown */}
      <CategoryBudgets budgets={breakdown} spendByCategory={spendByCategory} />

      <BudgetClient expenses={expenses} />
    </div>
  )
}
