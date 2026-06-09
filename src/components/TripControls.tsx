'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { MapPin, ChevronsUpDown, Check, Plus, Briefcase, Sun, Laptop } from 'lucide-react'
import { TRIP_TYPE_OPTIONS, type TripType } from '@/lib/tripType'

export interface SwitchDest { id: string; slug: string; name: string }

async function patchTrip(body: Record<string, unknown>) {
  const res = await fetch('/api/trip', {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  return res.ok
}

/** One-tap destination switcher — keeps your format, dates and budget. */
export function DestinationSwitcher({ destinations, activeId, variant = 'chip' }: {
  destinations: SwitchDest[]; activeId: string | null; variant?: 'chip' | 'block'
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const active = destinations.find(d => d.id === activeId) ?? null

  function choose(d: SwitchDest) {
    setOpen(false)
    if (d.id === activeId) return
    start(async () => {
      const ok = await patchTrip({ activeDestinationId: d.id })
      if (!ok) { toast.error('Could not switch destination'); return }
      toast.success(`Switched to ${d.name}`)
      router.refresh()
    })
  }

  const trigger = variant === 'chip'
    ? 'flex min-w-0 items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-bold text-cream shadow-soft transition-colors hover:border-gold-mid'
    : 'flex w-full items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm shadow-soft hover:border-gold-mid'

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className={trigger} disabled={pending} title="Switch destination">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-flag-red" />
        <span className="truncate font-bold text-cream">{active?.name ?? 'Choose a destination'}</span>
        <ChevronsUpDown className={`h-3.5 w-3.5 shrink-0 text-stone ${variant === 'block' ? 'ml-auto' : ''}`} />
      </button>

      {open && (
        <>
          <button aria-label="Close" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-40 mt-1.5 w-60 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-lg">
            <div className="px-3 pb-1 pt-1.5 text-[0.6rem] font-bold uppercase tracking-wide text-stone">Switch destination</div>
            {destinations.map(d => (
              <button key={d.id} onClick={() => choose(d)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-cream hover:bg-tint-blue">
                <span className="truncate font-semibold">{d.name}</span>
                {d.id === activeId && <Check className="ml-auto h-4 w-4 text-flag-blue" strokeWidth={3} />}
              </button>
            ))}
            <div className="my-1 h-px bg-border" />
            <Link href="/start" onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-sky hover:bg-tint-blue">
              <Plus className="h-4 w-4" /> New trip / customise…
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

const TYPE_ICON: Record<TripType, typeof Laptop> = { LEISURE: Sun, WORKATION: Briefcase, HYBRID: Laptop }

/** Inline trip-type switch — saves immediately, no rebuild. */
export function TripTypeToggle({ value }: { value: TripType }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [current, setCurrent] = useState<TripType>(value)

  function pick(t: TripType) {
    if (t === current) return
    setCurrent(t)
    start(async () => {
      const ok = await patchTrip({ tripType: t })
      if (!ok) { toast.error('Could not update trip type'); setCurrent(value); return }
      const label = TRIP_TYPE_OPTIONS.find(o => o.key === t)?.label ?? t
      toast.success(`Trip set to ${label}`)
      router.refresh()
    })
  }

  return (
    <div className="grid grid-cols-3 gap-2" aria-disabled={pending}>
      {TRIP_TYPE_OPTIONS.map(o => {
        const on = current === o.key
        const Icon = TYPE_ICON[o.key]
        return (
          <button key={o.key} onClick={() => pick(o.key)} disabled={pending}
            className={`press rounded-xl border-2 p-2.5 text-left transition-colors ${on ? 'border-flag-blue bg-tint-blue' : 'border-border bg-white hover:border-gold-mid'}`}>
            <div className="flex items-center justify-between">
              <Icon className="h-4 w-4" style={{ color: on ? '#2f6db5' : '#8a8175' }} />
              {on && <Check className="h-3.5 w-3.5 text-flag-blue" strokeWidth={3} />}
            </div>
            <div className="mt-1 text-sm font-bold text-cream">{o.label}</div>
            <div className="text-[0.64rem] leading-snug text-muted">{o.blurb}</div>
          </button>
        )
      })}
    </div>
  )
}
