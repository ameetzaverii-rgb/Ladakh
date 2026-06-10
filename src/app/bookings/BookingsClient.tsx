'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCanEdit } from '@/components/EditMode'
import { FLAG, FLAG_TINT, formatINR, type FlagColor } from '@/lib/utils'
import { Plane, BedDouble, Mountain, PartyPopper, Car, Ticket, Plus, Trash2, ExternalLink, type LucideIcon } from 'lucide-react'

export interface Booking {
  id: string; type: string; title: string; vendor: string | null; bookingRef: string | null
  costINR: number | null; date: string | null; tripDay: number | null; url: string | null
  notes: string | null; status: string
}

const TYPES: { key: string; label: string; icon: LucideIcon; color: FlagColor }[] = [
  { key: 'FLIGHT', label: 'Flight', icon: Plane, color: 'blue' },
  { key: 'STAY', label: 'Stay', icon: BedDouble, color: 'green' },
  { key: 'TREK', label: 'Trek', icon: Mountain, color: 'green' },
  { key: 'EVENT', label: 'Ticket', icon: PartyPopper, color: 'red' },
  { key: 'TRANSPORT', label: 'Transport', icon: Car, color: 'yellow' },
  { key: 'OTHER', label: 'Other', icon: Ticket, color: 'ink' },
]
const meta = (t: string) => TYPES.find(x => x.key === t) ?? TYPES[TYPES.length - 1]

export function BookingsClient({ initial }: { initial: Booking[] }) {
  const router = useRouter()
  const canEdit = useCanEdit()
  const [items, setItems] = useState<Booking[]>(initial)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ type: 'FLIGHT', title: '', vendor: '', bookingRef: '', costINR: '', date: '', url: '' })

  const total = items.reduce((s, b) => s + (b.costINR ?? 0), 0)
  const input = 'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-gold-mid'

  async function add() {
    if (!form.title.trim()) { toast.error('Give the booking a title'); return }
    setBusy(true)
    const res = await fetch('/api/booking', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: form.type, title: form.title.trim(), vendor: form.vendor || null,
        bookingRef: form.bookingRef || null, url: form.url || null,
        costINR: form.costINR ? parseInt(form.costINR) : null, date: form.date || null,
      }),
    })
    setBusy(false)
    if (!res.ok) { toast.error(res.status === 401 ? 'Sign in to add a booking' : 'Could not save'); return }
    const created = await res.json()
    setItems(prev => [...prev, { ...created, date: created.date ? created.date.slice(0, 10) : null }])
    setForm({ type: 'FLIGHT', title: '', vendor: '', bookingRef: '', costINR: '', date: '', url: '' })
    setOpen(false)
    toast.success('Booking added')
    router.refresh()
  }

  async function remove(id: string) {
    const prev = items
    setItems(items.filter(b => b.id !== id))
    const res = await fetch(`/api/booking/${id}`, { method: 'DELETE' })
    if (!res.ok) { setItems(prev); toast.error('Could not delete') }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="text-sm text-stone">
          {items.length} booking{items.length !== 1 ? 's' : ''}{total > 0 && <> · <span className="font-bold text-cream">{formatINR(total)}</span></>}
        </div>
        {canEdit && (
          <button onClick={() => setOpen(o => !o)} className="press inline-flex items-center gap-1.5 rounded-full bg-flag-blue px-4 py-2 text-sm font-bold text-white">
            <Plus className="h-4 w-4" /> Add booking
          </button>
        )}
      </div>

      {open && canEdit && (
        <div className="mb-5 space-y-3 rounded-2xl border border-border bg-white/60 p-4">
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map(t => (
              <button key={t.key} onClick={() => setForm(f => ({ ...f, type: t.key }))}
                className={`press flex items-center gap-1.5 rounded-xl border-2 px-2.5 py-2 text-xs font-bold ${form.type === t.key ? 'border-flag-blue bg-tint-blue text-cream' : 'border-border bg-white text-stone'}`}>
                <t.icon className="h-4 w-4" style={{ color: FLAG[t.color] }} /> {t.label}
              </button>
            ))}
          </div>
          <input className={input} placeholder="Title (e.g. Delhi → Leh, IndiGo 6E-2345)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <input className={input} placeholder="Vendor (airline, hotel…)" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} />
            <input className={input} placeholder="Booking ref / PNR" value={form.bookingRef} onChange={e => setForm(f => ({ ...f, bookingRef: e.target.value }))} />
            <input className={input} type="number" placeholder="Cost ₹" value={form.costINR} onChange={e => setForm(f => ({ ...f, costINR: e.target.value }))} />
            <input className={input} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <input className={input} placeholder="Confirmation link (optional)" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={add} disabled={busy} className="press rounded-full bg-flag-blue px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save booking'}</button>
            <button onClick={() => setOpen(false)} className="press rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-stone">Cancel</button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white/50 p-8 text-center text-sm text-stone">
          No bookings yet. {canEdit ? 'Add your flights, stays and treks as you confirm them.' : 'Sign in to record your bookings.'}
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map(b => {
            const m = meta(b.type)
            return (
              <div key={b.id} className="card-base flex items-center gap-3 p-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: FLAG_TINT[m.color] }}>
                  <m.icon className="h-5 w-5" style={{ color: FLAG[m.color] }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold text-cream">{b.title}</div>
                  <div className="flex flex-wrap gap-x-2 text-xs text-stone">
                    {b.vendor && <span>{b.vendor}</span>}
                    {b.bookingRef && <span>· {b.bookingRef}</span>}
                    {b.date && <span>· {b.date}</span>}
                    {b.costINR ? <span>· <span className="font-semibold text-cream">{formatINR(b.costINR)}</span></span> : null}
                  </div>
                </div>
                {b.url && (
                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="press text-stone hover:text-flag-blue" title="Open confirmation">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {canEdit && (
                  <button onClick={() => remove(b.id)} className="press text-stone hover:text-rust" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
