'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PHASE_LABELS, PHASE_ORDER, CATEGORY_ICONS } from '@/lib/utils'
import { catIcon } from '@/lib/categoryIcons'
import { Check, ChevronDown } from 'lucide-react'

type Item = {
  id: string; title: string; category: string; phase: string;
  completed: boolean; notes: string | null; priority: number;
  bookingRef: string | null; costINR: number | null; url: string | null;
}

const PHASES = PHASE_ORDER

export function PrepClient({ items, byPhase }: { items: Item[]; byPhase: Record<string, Item[]> }) {
  const [activePhase, setActivePhase] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function toggleItem(id: string, completed: boolean) {
    await fetch(`/api/checklist/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    })
    startTransition(() => router.refresh())
    toast.success(completed ? 'Marked incomplete' : 'Done! ✓')
  }

  async function deleteItem(id: string) {
    await fetch(`/api/checklist/${id}`, { method: 'DELETE' })
    startTransition(() => router.refresh())
    toast.success('Removed')
  }

  const visiblePhases = activePhase ? [activePhase] : PHASES

  return (
    <div>
      {/* Phase filter tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <PhaseChip active={!activePhase} onClick={() => setActivePhase(null)} label={`All (${items.length})`} />
        {PHASES.map(phase => {
          const count = byPhase[phase]?.length ?? 0
          const done = byPhase[phase]?.filter(i => i.completed).length ?? 0
          return (
            <PhaseChip
              key={phase}
              active={activePhase === phase}
              onClick={() => setActivePhase(activePhase === phase ? null : phase)}
              label={`${PHASE_LABELS[phase]} (${done}/${count})`}
            />
          )
        })}
        <button
          onClick={() => setShowAddForm(v => !v)}
          className="press ml-auto inline-flex items-center gap-1 rounded-full bg-flag-blue px-3 py-1.5 text-xs font-bold text-white"
        >
          + Add item
        </button>
      </div>

      {showAddForm && <AddItemForm onClose={() => setShowAddForm(false)} />}

      {/* Checklist by phase */}
      {visiblePhases.map(phase => {
        const phaseItems = byPhase[phase] ?? []
        if (phaseItems.length === 0) return null
        const done = phaseItems.filter(i => i.completed).length
        return (
          <div key={phase} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-gold/10" />
              <span className="label-mono text-[0.65rem] text-gold">{PHASE_LABELS[phase]}</span>
              <span className="label-mono text-[0.55rem] text-stone">{done}/{phaseItems.length}</span>
              <div className="h-px flex-1 bg-gold/10" />
            </div>
            <div className="space-y-2">
              {phaseItems.map(item => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  onToggle={() => toggleItem(item.id, item.completed)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PhaseChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`press rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? 'border-transparent text-white' : 'border-border bg-white text-stone hover:text-cream'
      }`}
      style={active ? { background: '#2a3140' } : undefined}
    >
      {label}
    </button>
  )
}

function ChecklistItemRow({
  item, onToggle, onDelete
}: { item: Item; onToggle: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = catIcon(item.category)

  return (
    <div className={`card-base transition-all ${item.completed ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onToggle}
          aria-label={item.completed ? 'Mark incomplete' : 'Mark done'}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
            item.completed ? 'border-sage bg-sage text-white' : 'border-border text-transparent hover:border-gold-mid'
          }`}
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </button>
        <Icon className="h-4 w-4 shrink-0 text-flag-blue" />
        <div className="min-w-0 flex-1">
          <div className={`text-sm font-medium ${item.completed ? 'text-stone line-through' : 'text-sand'}`}>
            {item.title}
          </div>
          {item.bookingRef && (
            <div className="text-[0.62rem] font-medium text-sky">Ref: {item.bookingRef}</div>
          )}
        </div>
        {item.costINR && (
          <span className="shrink-0 text-xs font-bold tabular-nums text-gold">₹{item.costINR.toLocaleString()}</span>
        )}
        <button
          onClick={() => setExpanded(v => !v)}
          aria-label="Toggle details"
          className="ml-1 shrink-0 text-muted hover:text-cream"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-3 pt-1 border-t border-gold/10 space-y-2">
          {item.notes && <p className="text-muted text-xs">{item.notes}</p>}
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
               className="label-mono text-[0.55rem] text-sky hover:underline block">
              🔗 {item.url}
            </a>
          )}
          <div className="flex gap-2">
            <button
              onClick={onDelete}
              className="label-mono text-[0.55rem] text-rust/60 hover:text-rust"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AddItemForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('MISC')
  const [phase, setPhase] = useState('MONTH_BEFORE')
  const [notes, setNotes] = useState('')
  const [costINR, setCostINR] = useState('')
  const [bookingRef, setBookingRef] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, category, phase,
        notes: notes || null,
        costINR: costINR ? parseInt(costINR) : null,
        bookingRef: bookingRef || null,
        url: url || null,
      }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Item added!')
      onClose()
      router.refresh()
    } else {
      toast.error('Failed to add item')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-base p-5 mb-6 space-y-3">
      <div className="label-mono text-xs text-gold mb-2">New Checklist Item</div>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Book Delhi–Leh flight"
            required
            className="w-full rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none"
          />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="rounded-lg border border-border bg-white text-sand px-3 py-2 text-sm focus:border-gold-mid outline-none">
          {Object.keys(CATEGORY_ICONS).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={phase} onChange={e => setPhase(e.target.value)}
          className="rounded-lg border border-border bg-white text-sand px-3 py-2 text-sm focus:border-gold-mid outline-none">
          {PHASE_ORDER.map(p => (
            <option key={p} value={p}>{PHASE_LABELS[p]}</option>
          ))}
        </select>
        <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none" />
        <input type="number" value={costINR} onChange={e => setCostINR(e.target.value)}
          placeholder="Cost ₹ (optional)"
          className="rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none" />
        <input type="text" value={bookingRef} onChange={e => setBookingRef(e.target.value)}
          placeholder="Booking ref (optional)"
          className="rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none" />
        <input type="url" value={url} onChange={e => setUrl(e.target.value)}
          placeholder="Booking URL (optional)"
          className="rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none" />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="px-5 py-2 rounded-lg bg-gold text-white font-semibold text-xs tracking-wide uppercase transition-[filter] hover:brightness-110 disabled:opacity-50">
          {loading ? '...' : 'Add Item'}
        </button>
        <button type="button" onClick={onClose}
          className="px-5 py-2 border border-gold/10 text-stone font-mono text-xs tracking-wider uppercase hover:text-gold transition-all">
          Cancel
        </button>
      </div>
    </form>
  )
}
