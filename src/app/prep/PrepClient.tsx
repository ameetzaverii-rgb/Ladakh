'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PHASE_LABELS, PHASE_ORDER, CATEGORY_ICONS } from '@/lib/utils'

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
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActivePhase(null)}
          className={`pill transition-all ${!activePhase ? 'pill-gold' : 'border border-gold/20 text-stone hover:text-gold'}`}
        >
          All ({items.length})
        </button>
        {PHASES.map(phase => {
          const count = byPhase[phase]?.length ?? 0
          const done = byPhase[phase]?.filter(i => i.completed).length ?? 0
          return (
            <button
              key={phase}
              onClick={() => setActivePhase(activePhase === phase ? null : phase)}
              className={`pill transition-all ${activePhase === phase ? 'pill-gold' : 'border border-gold/20 text-stone hover:text-gold'}`}
            >
              {PHASE_LABELS[phase]} ({done}/{count})
            </button>
          )
        })}
        <button
          onClick={() => setShowAddForm(v => !v)}
          className="pill pill-sky ml-auto"
        >
          + Add Item
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

function ChecklistItemRow({
  item, onToggle, onDelete
}: { item: Item; onToggle: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const icon = CATEGORY_ICONS[item.category] ?? '📌'
  const priorityColors = ['', 'text-rust', 'text-gold', 'text-stone']

  return (
    <div
      className={`card-base transition-all ${item.completed ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onToggle}
          className={`w-5 h-5 shrink-0 border-2 rounded-sm flex items-center justify-center transition-all ${
            item.completed
              ? 'bg-sage border-sage text-white'
              : 'border-gold/30 hover:border-gold'
          }`}
        >
          {item.completed && <span className="text-[0.6rem] leading-none">✓</span>}
        </button>
        <span className="text-base shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className={`text-sm ${item.completed ? 'line-through text-stone' : 'text-sand'}`}>
            {item.title}
          </div>
          {item.bookingRef && (
            <div className="label-mono text-[0.55rem] text-sky">Ref: {item.bookingRef}</div>
          )}
        </div>
        {item.costINR && (
          <span className="label-mono text-[0.55rem] text-gold shrink-0">₹{item.costINR.toLocaleString()}</span>
        )}
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-stone hover:text-gold text-xs ml-1 shrink-0"
        >
          {expanded ? '▲' : '▼'}
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
            className="w-full bg-dark border border-gold/20 text-cream px-3 py-2 text-sm focus:border-gold/50 outline-none"
          />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="bg-dark border border-gold/20 text-sand px-3 py-2 text-sm focus:border-gold/50 outline-none">
          {Object.keys(CATEGORY_ICONS).map(c => (
            <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
          ))}
        </select>
        <select value={phase} onChange={e => setPhase(e.target.value)}
          className="bg-dark border border-gold/20 text-sand px-3 py-2 text-sm focus:border-gold/50 outline-none">
          {PHASE_ORDER.map(p => (
            <option key={p} value={p}>{PHASE_LABELS[p]}</option>
          ))}
        </select>
        <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="bg-dark border border-gold/20 text-cream px-3 py-2 text-sm focus:border-gold/50 outline-none" />
        <input type="number" value={costINR} onChange={e => setCostINR(e.target.value)}
          placeholder="Cost ₹ (optional)"
          className="bg-dark border border-gold/20 text-cream px-3 py-2 text-sm focus:border-gold/50 outline-none" />
        <input type="text" value={bookingRef} onChange={e => setBookingRef(e.target.value)}
          placeholder="Booking ref (optional)"
          className="bg-dark border border-gold/20 text-cream px-3 py-2 text-sm focus:border-gold/50 outline-none" />
        <input type="url" value={url} onChange={e => setUrl(e.target.value)}
          placeholder="Booking URL (optional)"
          className="bg-dark border border-gold/20 text-cream px-3 py-2 text-sm focus:border-gold/50 outline-none" />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="px-5 py-2 bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold font-mono text-xs tracking-wider uppercase transition-all disabled:opacity-50">
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
