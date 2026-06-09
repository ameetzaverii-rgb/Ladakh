'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FLAG, FLAG_TINT, type FlagColor } from '@/lib/utils'
import { MENU_OPTIONS, ALL_MENU_KEYS } from '@/lib/destinations'
import { MapPin, Plus, Check, ChevronLeft, Sparkles, ArrowRight } from 'lucide-react'

export interface OnboardDestination {
  id: string; slug: string; name: string; tagline: string
  region: string; color: string; intro: string; image: string | null
}

type Step = 'pick' | 'menus' | 'details' | 'custom'
const COLORS: FlagColor[] = ['blue', 'green', 'red', 'yellow']

const todayISO = () => new Date().toISOString().slice(0, 10)
function addDaysISO(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export function Onboarding({ destinations, activeId, currentMenus, defaults }: {
  destinations: OnboardDestination[]; activeId: string | null; currentMenus: string[]
  defaults?: { startDate?: string; days?: number; budget?: number; travelerName?: string }
}) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('pick')
  const [dests, setDests] = useState(destinations)
  const [picked, setPicked] = useState<OnboardDestination | null>(null)
  const [menus, setMenus] = useState<Set<string>>(new Set(currentMenus.length ? currentMenus : ALL_MENU_KEYS))
  const [busy, setBusy] = useState(false)
  // Trip preferences
  const [startDate, setStartDate] = useState(defaults?.startDate || todayISO())
  const [days, setDays] = useState(defaults?.days && defaults.days > 0 ? defaults.days : 10)
  const [budget, setBudget] = useState(defaults?.budget && defaults.budget > 0 ? defaults.budget : 150000)
  const [traveler, setTraveler] = useState(defaults?.travelerName || '')

  function choose(d: OnboardDestination) {
    setPicked(d)
    setMenus(new Set(ALL_MENU_KEYS))
    setStep('menus')
  }

  async function build() {
    if (!picked) return
    setBusy(true)
    const tripEndDate = addDaysISO(startDate, Math.max(1, days) - 1)
    const res = await fetch('/api/trip', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destinationId: picked.id, enabledMenus: Array.from(menus),
        tripStartDate: startDate, tripEndDate, totalBudgetINR: budget,
        travelerName: traveler || undefined,
      }),
    })
    setBusy(false)
    if (!res.ok) { toast.error('Could not build the trip'); return }
    toast.success(`Your ${picked.name} trip is ready`)
    router.push('/')
    router.refresh()
  }

  // ── Pick a destination ──
  if (step === 'pick') {
    return (
      <div>
        <header className="mb-7 text-center">
          <div className="label-mono mb-1 text-[0.6rem] text-gold">◈ Start a new trip ◈</div>
          <h1 className="font-serif text-3xl font-bold text-cream">Where to?</h1>
          <p className="mt-1 text-sm text-stone">Pick a destination — then choose the sections you want.</p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          {dests.map((d, i) => {
            const color = (COLORS.includes(d.color as FlagColor) ? d.color : COLORS[i % COLORS.length]) as FlagColor
            return (
              <button key={d.id} onClick={() => choose(d)}
                className="press group overflow-hidden rounded-2xl border border-border bg-white text-left shadow-soft transition-shadow hover:shadow-lift">
                <div className="relative h-32 w-full" style={{ background: FLAG_TINT[color] }}>
                  {d.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.image} alt={d.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  {activeId === d.id && (
                    <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[0.55rem] font-bold text-cream">Current</span>
                  )}
                  <div className="absolute bottom-0 left-0 p-3">
                    <h3 className="font-serif text-xl font-bold leading-tight text-white drop-shadow">{d.name}</h3>
                    <div className="flex items-center gap-1 text-[0.62rem] font-semibold text-white/85"><MapPin className="h-3 w-3" /> {d.region}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <p className="text-xs leading-snug text-muted">{d.tagline}</p>
                  <ArrowRight className="h-4 w-4 shrink-0 text-stone transition-transform group-hover:translate-x-0.5" style={{ color: FLAG[color] }} />
                </div>
              </button>
            )
          })}
          {/* Build your own */}
          <button onClick={() => setStep('custom')}
            className="press flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-white/50 text-stone transition-colors hover:border-gold-mid hover:text-cream">
            <Plus className="h-7 w-7" />
            <span className="text-sm font-bold">Create your own</span>
            <span className="px-6 text-center text-[0.7rem] text-muted">Build a custom destination from scratch</span>
          </button>
        </div>
      </div>
    )
  }

  // ── Choose menus ──
  if (step === 'menus' && picked) {
    return (
      <div>
        <button onClick={() => setStep('pick')} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-stone hover:text-cream">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <header className="mb-6">
          <div className="label-mono mb-1 text-[0.6rem] text-gold">{picked.region}</div>
          <h1 className="font-serif text-2xl font-bold text-cream">Build your {picked.name} trip</h1>
          <p className="mt-1 text-sm text-stone">Turn on the sections you want. Home, Plan, Journal & Budget are always included.</p>
        </header>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {MENU_OPTIONS.map(m => {
            const on = menus.has(m.key)
            return (
              <button key={m.key} onClick={() => setMenus(s => { const n = new Set(s); n.has(m.key) ? n.delete(m.key) : n.add(m.key); return n })}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-sm font-semibold transition-colors ${
                  on ? 'border-transparent bg-flag-blue text-white' : 'border-border bg-white text-stone hover:text-cream'
                }`}>
                {m.label}
                {on && <Check className="h-4 w-4 shrink-0" strokeWidth={3} />}
              </button>
            )
          })}
        </div>
        <div className="mt-7 flex items-center gap-3">
          <button onClick={() => setStep('details')}
            className="press inline-flex items-center gap-2 rounded-full bg-flag-blue px-6 py-3 text-sm font-bold text-white">
            Next: trip details <ArrowRight className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted">{menus.size} section{menus.size !== 1 ? 's' : ''} on</span>
        </div>
      </div>
    )
  }

  // ── Trip details (dates, length, budget) ──
  if (step === 'details' && picked) {
    const endDate = addDaysISO(startDate, Math.max(1, days) - 1)
    const perDay = days > 0 ? Math.round(budget / days) : budget
    const fmt = (iso: string) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    const input = 'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-gold-mid'
    return (
      <div className="mx-auto max-w-md">
        <button onClick={() => setStep('menus')} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-stone hover:text-cream">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <header className="mb-6">
          <div className="label-mono mb-1 text-[0.6rem] text-gold">{picked.region}</div>
          <h1 className="font-serif text-2xl font-bold text-cream">A few trip details</h1>
          <p className="mt-1 text-sm text-stone">We’ll use these for the countdown, day-by-day plan and budget tracker. You can change them anytime in settings.</p>
        </header>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[0.62rem] font-bold uppercase tracking-wide text-stone">Your name (optional)</label>
            <input value={traveler} onChange={e => setTraveler(e.target.value)} placeholder="e.g. Amit" className={input} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[0.62rem] font-bold uppercase tracking-wide text-stone">Travel start date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={input} />
            </div>
            <div>
              <label className="mb-1 block text-[0.62rem] font-bold uppercase tracking-wide text-stone">Number of days</label>
              <input type="number" min={1} max={120} value={days} onChange={e => setDays(parseInt(e.target.value) || 1)} className={input} />
            </div>
          </div>
          <p className="-mt-1 text-xs text-muted">Ends <span className="font-semibold text-sand">{fmt(endDate)}</span> · {days} day{days !== 1 ? 's' : ''}</p>
          <div>
            <label className="mb-1 block text-[0.62rem] font-bold uppercase tracking-wide text-stone">Total budget (₹)</label>
            <input type="number" min={0} step={1000} value={budget} onChange={e => setBudget(parseInt(e.target.value) || 0)} className={input} />
            <p className="mt-1 text-xs text-muted">≈ {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(perDay)} / day</p>
          </div>
        </div>
        <div className="mt-7 flex items-center gap-3">
          <button onClick={build} disabled={busy}
            className="press inline-flex items-center gap-2 rounded-full bg-flag-blue px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
            <Sparkles className="h-4 w-4" /> {busy ? 'Building…' : `Build my ${picked.name} trip`}
          </button>
        </div>
      </div>
    )
  }

  // ── Build your own destination ──
  return <CustomDestination onBack={() => setStep('pick')} onCreated={(d) => { setDests(x => [...x, d]); choose(d) }} />
}

function CustomDestination({ onBack, onCreated }: { onBack: () => void; onCreated: (d: OnboardDestination) => void }) {
  const [name, setName] = useState('')
  const [region, setRegion] = useState('')
  const [tagline, setTagline] = useState('')
  const [color, setColor] = useState<FlagColor>('blue')
  const [busy, setBusy] = useState(false)
  const input = 'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-gold-mid'

  async function create() {
    if (!name.trim()) { toast.error('Give your destination a name'); return }
    setBusy(true)
    const res = await fetch('/api/destinations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, region, tagline, color, heroWiki: [name] }),
    })
    setBusy(false)
    if (!res.ok) { toast.error('Could not create destination'); return }
    const d = await res.json()
    toast.success(`${d.name} created`)
    onCreated({ id: d.id, slug: d.slug, name: d.name, tagline: d.tagline, region: d.region, color: d.color, intro: d.intro ?? '', image: null })
  }

  return (
    <div className="mx-auto max-w-md">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-stone hover:text-cream">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="mb-1 font-serif text-2xl font-bold text-cream">Create your destination</h1>
      <p className="mb-5 text-sm text-stone">Set it up now — add stays, food and an itinerary later from each section.</p>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[0.62rem] font-bold uppercase tracking-wide text-stone">Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Coorg" className={input} />
        </div>
        <div>
          <label className="mb-1 block text-[0.62rem] font-bold uppercase tracking-wide text-stone">Region / altitude</label>
          <input value={region} onChange={e => setRegion(e.target.value)} placeholder="e.g. Karnataka · 1,200m" className={input} />
        </div>
        <div>
          <label className="mb-1 block text-[0.62rem] font-bold uppercase tracking-wide text-stone">Tagline</label>
          <input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Misty coffee hills & waterfalls" className={input} />
        </div>
        <div>
          <label className="mb-1 block text-[0.62rem] font-bold uppercase tracking-wide text-stone">Accent colour</label>
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} aria-label={c}
                className={`h-8 w-8 rounded-full border-2 ${color === c ? 'border-cream' : 'border-transparent'}`}
                style={{ background: FLAG[c] }} />
            ))}
          </div>
        </div>
      </div>
      <button onClick={create} disabled={busy}
        className="press mt-6 inline-flex items-center gap-2 rounded-full bg-flag-blue px-6 py-3 text-sm font-bold text-white disabled:opacity-50">
        <Plus className="h-4 w-4" /> {busy ? 'Creating…' : 'Create & choose menus'}
      </button>
    </div>
  )
}
