'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { CATEGORY_COLORS, formatINRFull } from '@/lib/utils'
import { catIcon, PAYMENT_ICON } from '@/lib/categoryIcons'
import { Trash2, type LucideIcon } from 'lucide-react'

type Expense = {
  id: string; tripDay: number; date: Date | string; amountINR: number;
  category: string; description: string; place: string | null; paymentMode: string;
}

export function BudgetClient({ expenses }: { expenses: Expense[] }) {
  const [filterCat, setFilterCat] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const categories = Array.from(new Set(expenses.map(e => e.category)))
  const filtered = filterCat ? expenses.filter(e => e.category === filterCat) : expenses

  async function deleteExpense(id: string) {
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    startTransition(() => router.refresh())
    toast.success('Expense removed')
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterChip active={!filterCat} onClick={() => setFilterCat(null)} label="All" />
        {categories.map(cat => {
          const Icon = catIcon(cat)
          const color = CATEGORY_COLORS[cat] ?? '#8c92a0'
          return (
            <FilterChip
              key={cat}
              active={filterCat === cat}
              onClick={() => setFilterCat(filterCat === cat ? null : cat)}
              label={cat.charAt(0) + cat.slice(1).toLowerCase()}
              Icon={Icon}
              color={color}
            />
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-stone">
          <p className="text-lg font-bold text-cream">No expenses logged yet</p>
          <p className="mt-1 text-sm">Use the form above, or ⌘K → &quot;spent 350 food tibetan kitchen&quot;</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(expense => {
          const color = CATEGORY_COLORS[expense.category] ?? '#8c92a0'
          const Icon = catIcon(expense.category)
          const Pay = PAYMENT_ICON[expense.paymentMode]
          const dateStr = typeof expense.date === 'string'
            ? format(parseISO(expense.date), 'MMM d')
            : format(expense.date, 'MMM d')
          return (
            <div key={expense.id} className="group card-base flex items-center gap-3 px-3 py-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${color}1a` }}>
                <Icon className="h-[18px] w-[18px]" style={{ color }} strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-cream">{expense.description}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.7rem] text-stone">
                  <span className="font-medium" style={{ color }}>Day {expense.tripDay}</span>
                  {expense.place && <span>· {expense.place}</span>}
                  <span>· {dateStr}</span>
                  {Pay && <Pay className="h-3 w-3" />}
                </div>
              </div>
              <div className="shrink-0 text-sm font-bold text-cream">{formatINRFull(expense.amountINR)}</div>
              <button
                onClick={() => deleteExpense(expense.id)}
                aria-label="Delete expense"
                className="shrink-0 text-muted opacity-0 transition-all hover:text-rust group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>

      {filtered.length > 0 && (
        <div className="mt-4 flex justify-end">
          <div className="rounded-full bg-[#f1efe9] px-3 py-1 text-xs font-bold text-cream">
            Total: ₹{filtered.reduce((s, e) => s + e.amountINR, 0).toLocaleString('en-IN')}
          </div>
        </div>
      )}
    </div>
  )
}

function FilterChip({
  active, onClick, label, Icon, color,
}: {
  active: boolean; onClick: () => void; label: string
  Icon?: LucideIcon
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`press inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? 'border-transparent bg-cream text-white' : 'border-border bg-white text-stone hover:text-cream'
      }`}
      style={active ? { background: '#2a3140' } : undefined}
    >
      {Icon && <Icon className="h-3.5 w-3.5" style={!active && color ? { color } : undefined} />}
      {label}
    </button>
  )
}
