'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { CATEGORY_ICONS, CATEGORY_COLORS, formatINRFull } from '@/lib/utils'

type Expense = {
  id: string; tripDay: number; date: Date | string; amountINR: number;
  category: string; description: string; place: string | null; paymentMode: string;
}

const PAYMENT_ICONS: Record<string, string> = {
  cash: '💵', upi: '📱', card: '💳',
}

export function BudgetClient({ expenses }: { expenses: Expense[] }) {
  const [filterCat, setFilterCat] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const categories = [...new Set(expenses.map(e => e.category))]

  const filtered = filterCat ? expenses.filter(e => e.category === filterCat) : expenses

  async function deleteExpense(id: string) {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    startTransition(() => router.refresh())
    toast.success('Expense removed')
  }

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <button
          onClick={() => setFilterCat(null)}
          className={`pill transition-all ${!filterCat ? 'pill-gold' : 'border border-gold/20 text-stone hover:text-gold'}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(filterCat === cat ? null : cat)}
            className={`pill transition-all ${filterCat === cat ? 'pill-gold' : 'border border-gold/20 text-stone hover:text-gold'}`}>
            {CATEGORY_ICONS[cat]} {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-stone">
          <div className="text-3xl mb-3">💰</div>
          <p className="font-serif text-cream text-lg">No expenses logged yet</p>
          <p className="text-sm mt-1">Use the form above or ⌘K → "spent 350 food tibetan kitchen"</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(expense => {
          const color = CATEGORY_COLORS[expense.category] ?? '#666'
          const dateStr = typeof expense.date === 'string'
            ? format(parseISO(expense.date), 'MMM d')
            : format(expense.date, 'MMM d')
          return (
            <div key={expense.id} className="card-base flex items-center gap-3 px-4 py-3 group">
              <div className="w-1 h-8 rounded-full shrink-0" style={{ background: color }} />
              <div className="w-10 text-center shrink-0">
                <div className="label-mono text-[0.5rem] text-stone">Day</div>
                <div className="font-serif text-gold text-sm">{expense.tripDay}</div>
              </div>
              <div className="text-base shrink-0">{CATEGORY_ICONS[expense.category] ?? '📌'}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-sand">{expense.description}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  {expense.place && <span className="label-mono text-[0.5rem] text-stone">{expense.place}</span>}
                  <span className="label-mono text-[0.5rem] text-stone">{dateStr}</span>
                  <span className="text-xs">{PAYMENT_ICONS[expense.paymentMode] ?? ''}</span>
                </div>
              </div>
              <div className="font-mono text-sm text-cream shrink-0">
                {formatINRFull(expense.amountINR)}
              </div>
              <button
                onClick={() => deleteExpense(expense.id)}
                className="text-stone/40 hover:text-rust text-xs opacity-0 group-hover:opacity-100 transition-all shrink-0"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>

      {filtered.length > 0 && (
        <div className="mt-4 flex justify-end">
          <div className="label-mono text-[0.6rem] text-gold">
            Total: ₹{filtered.reduce((s, e) => s + e.amountINR, 0).toLocaleString('en-IN')}
          </div>
        </div>
      )}
    </div>
  )
}
