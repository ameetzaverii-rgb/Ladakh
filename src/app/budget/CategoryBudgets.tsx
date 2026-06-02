'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { formatINR, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/utils'

// Editable per-category budget targets. Reads from trip settings (categoryBudgets)
// and saves changes back via PATCH /api/tripconfig, so the breakdown is no longer
// a hardcoded static block.
export function CategoryBudgets({
  budgets,
  spendByCategory,
}: {
  budgets: Record<string, number>
  spendByCategory: Record<string, number>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(budgets).map(([k, v]) => [k, String(v)]))
  )
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function save() {
    setSaving(true)
    const cleaned: Record<string, number> = {}
    for (const [k, v] of Object.entries(draft)) cleaned[k] = parseInt(v) || 0
    const res = await fetch('/api/tripconfig', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryBudgets: cleaned }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success('Budget targets updated')
      setEditing(false)
      router.refresh()
    } else {
      toast.error('Could not save')
    }
  }

  const total = Object.values(budgets).reduce((s, v) => s + v, 0)

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between border-b border-gold/15 pb-2 mb-4">
        <span className="label-mono text-xs text-gold">By Category · target {formatINR(total)}</span>
        {editing ? (
          <div className="flex gap-3">
            <button onClick={save} disabled={saving} className="label-mono text-[0.6rem] text-sage hover:underline disabled:opacity-50">
              {saving ? 'saving…' : 'save'}
            </button>
            <button onClick={() => setEditing(false)} className="label-mono text-[0.6rem] text-stone hover:text-gold">cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="label-mono text-[0.6rem] text-sky hover:underline">edit targets</button>
        )}
      </div>

      <div className="space-y-3">
        {Object.entries(budgets).map(([cat, budgeted]) => {
          const spent = spendByCategory[cat] ?? 0
          const pct = budgeted > 0 ? Math.min((spent / budgeted) * 100, 100) : 0
          const over = spent > budgeted && budgeted > 0
          const color = CATEGORY_COLORS[cat] ?? '#666'
          return (
            <div key={cat} className="flex items-center gap-3">
              <span className="text-base w-6 shrink-0">{CATEGORY_ICONS[cat] ?? '📌'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1 items-center">
                  <span className="label-mono text-[0.6rem] text-sand">{cat}</span>
                  {editing ? (
                    <input
                      type="number"
                      value={draft[cat] ?? '0'}
                      onChange={e => setDraft(d => ({ ...d, [cat]: e.target.value }))}
                      className="w-24 bg-dark border border-gold/20 text-cream px-2 py-0.5 text-xs text-right focus:border-gold/50 outline-none"
                    />
                  ) : (
                    <span className={`label-mono text-[0.55rem] ${over ? 'text-rust' : 'text-stone'}`}>
                      {formatINR(spent)} / {formatINR(budgeted)}
                    </span>
                  )}
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: over ? '#b85c38' : color }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
