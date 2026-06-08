'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { DayWeather } from '@/components/DayWeather'
import { DAY_LOCATIONS } from '@/lib/locations'
import { FLAG, FLAG_TINT, type FlagColor } from '@/lib/utils'
import type { DayWeather as DayWeatherData } from '@/lib/weather'
import {
  List, LayoutGrid, MapPin, Laptop, Mountain, PartyPopper, Camera,
  UtensilsCrossed, Car, NotebookPen, ArrowUpRight, Pencil, Plus, Trash2,
  Check, X, ListChecks, ChevronDown, type LucideIcon,
} from 'lucide-react'

export interface Activity {
  id: string
  text: string
  done: boolean
}

export interface ViewDay {
  id: string
  dayNumber: number
  dayOfWeek: string
  title: string
  description: string
  isWorkDay: boolean
  isTrekDay: boolean
  isFestivalDay: boolean
  isExcursionDay: boolean
  breakfastNote?: string | null
  lunchNote?: string | null
  dinnerNote?: string | null
  activities?: Activity[]
  isCustom?: boolean
  sortOrder?: number
  customName?: string | null
  customLat?: number | null
  customLng?: number | null
}

// ── shared mutation helpers ──
async function patchDay(id: string, data: Record<string, unknown>) {
  await fetch(`/api/itinerary/${id}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  })
}
const uid = () => Math.random().toString(36).slice(2, 9)

// Strip leading/embedded emoji from seeded titles so the rows stay clean.
// (No /u flag — tsconfig targets ES5; covers surrogate-pair emoji + symbols.)
function cleanTitle(t: string): string {
  return t
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[←-⇿☀-➿⬀-⯿]|️|‍/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

type View = 'timeline' | 'calendar' | 'location'

const WEEK_LABELS: Record<number, string> = {
  1: 'Week One — Arrival & Acclimatisation',
  2: 'Week Two — Finding Flow',
  3: 'Week Three — Deep Ladakh',
}

const VIEWS: { id: View; label: string; icon: LucideIcon }[] = [
  { id: 'timeline', label: 'Timeline', icon: List },
  { id: 'calendar', label: 'Weeks', icon: LayoutGrid },
  { id: 'location', label: 'By place', icon: MapPin },
]

// Primary category → flag colour, label and matching lucide icon.
function dayMeta(day: ViewDay): { color: FlagColor; label: string; Icon: LucideIcon } {
  if (day.isFestivalDay) return { color: 'red', label: 'Festival', Icon: PartyPopper }
  if (day.isTrekDay) return { color: 'green', label: 'Trek', Icon: Mountain }
  if (day.isExcursionDay) return { color: 'yellow', label: 'Excursion', Icon: Camera }
  if (day.isWorkDay) return { color: 'blue', label: 'Work day', Icon: Laptop }
  return { color: 'blue', label: 'Explore', Icon: MapPin }
}

// Contextual cross-links so each day jumps straight to the relevant section.
function dayLinks(day: ViewDay): { href: string; label: string; Icon: LucideIcon }[] {
  const links: { href: string; label: string; Icon: LucideIcon }[] = []
  if (day.isFestivalDay) links.push({ href: '/events', label: 'Festival', Icon: PartyPopper })
  if (day.isTrekDay) links.push({ href: '/treks', label: 'Trek', Icon: Mountain })
  if (day.isExcursionDay) links.push({ href: '/transport', label: 'Getting there', Icon: Car })
  if (day.isWorkDay && !day.isTrekDay && !day.isExcursionDay) links.push({ href: '/food', label: 'Cafés', Icon: UtensilsCrossed })
  links.push({ href: '/diary', label: 'Diary', Icon: NotebookPen })
  return links
}

function DayLinkChips({ day }: { day: ViewDay }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-2.5">
      {dayLinks(day).map(l => {
        const Icon = l.Icon
        return (
          <Link
            key={l.href}
            href={l.href}
            className="press inline-flex items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-[0.68rem] font-medium text-stone transition-colors hover:border-gold-mid hover:text-cream"
          >
            <Icon className="h-3 w-3" /> {l.label}
            <ArrowUpRight className="h-3 w-3 opacity-50" />
          </Link>
        )
      })}
    </div>
  )
}

export function ItineraryViews({
  days,
  weather,
}: {
  days: ViewDay[]
  weather: Record<number, DayWeatherData | null>
}) {
  const [view, setView] = useState<View>('timeline')
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('itineraryView') as View | null
    if (saved === 'timeline' || saved === 'calendar' || saved === 'location') setView(saved)
  }, [])

  function pick(v: View) {
    setView(v)
    try {
      localStorage.setItem('itineraryView', v)
    } catch {}
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Segmented view switcher */}
        <div className="inline-flex gap-1 rounded-full bg-[#f1efe9] p-1">
          {VIEWS.map(v => {
            const Icon = v.icon
            const active = view === v.id
            return (
              <button
                key={v.id}
                onClick={() => pick(v.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  active ? 'bg-white text-cream shadow-soft' : 'text-stone hover:text-cream'
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
                {v.label}
              </button>
            )
          })}
        </div>
        {/* Edit-mode toggle (Timeline only) */}
        {view === 'timeline' && (
          <button
            onClick={() => setEditing(e => !e)}
            className={`press inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
              editing ? 'bg-flag-blue text-white' : 'border border-border bg-white text-stone hover:text-cream'
            }`}
          >
            {editing ? <><Check className="h-3.5 w-3.5" /> Done</> : <><Pencil className="h-3.5 w-3.5" /> Edit plan</>}
          </button>
        )}
      </div>

      {view === 'timeline' && <TimelineView days={days} weather={weather} editing={editing} />}
      {view === 'calendar' && <CalendarView days={days} weather={weather} />}
      {view === 'location' && <LocationView days={days} weather={weather} />}
    </>
  )
}

function MealNotes({ day }: { day: ViewDay }) {
  if (!day.breakfastNote && !day.lunchNote && !day.dinnerNote) return null
  const rows: { label: string; note: string }[] = []
  if (day.breakfastNote) rows.push({ label: 'Breakfast', note: day.breakfastNote })
  if (day.lunchNote) rows.push({ label: 'Lunch', note: day.lunchNote })
  if (day.dinnerNote) rows.push({ label: 'Dinner', note: day.dinnerNote })
  return (
    <div className="mt-3 space-y-1 border-t border-border pt-2.5 text-xs text-stone">
      {rows.map(r => (
        <div key={r.label}><span className="font-semibold text-sand">{r.label}: </span>{r.note}</div>
      ))}
    </div>
  )
}

/* Per-day activities checklist — tappable to toggle; editable in edit mode. */
function ActivityList({ day, editing }: { day: ViewDay; editing: boolean }) {
  const router = useRouter()
  const [items, setItems] = useState<Activity[]>(day.activities ?? [])
  const [text, setText] = useState('')

  async function save(next: Activity[]) {
    setItems(next)
    await patchDay(day.id, { activities: next })
    router.refresh()
  }
  const toggle = (id: string) => save(items.map(a => (a.id === id ? { ...a, done: !a.done } : a)))
  const remove = (id: string) => save(items.filter(a => a.id !== id))
  const add = () => {
    const t = text.trim()
    if (!t) return
    setText('')
    save([...items, { id: uid(), text: t, done: false }])
  }

  if (items.length === 0 && !editing) return null
  return (
    <div className="mt-3 border-t border-border pt-2.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-wide text-stone">
        <ListChecks className="h-3.5 w-3.5" /> Activities
      </div>
      <div className="space-y-1">
        {items.map(a => (
          <div key={a.id} className="flex items-center gap-2">
            <button onClick={() => toggle(a.id)} aria-label="Toggle"
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${a.done ? 'border-sage bg-sage text-white' : 'border-border hover:border-gold-mid'}`}>
              {a.done && <Check className="h-3 w-3" strokeWidth={3} />}
            </button>
            <span className={`flex-1 text-xs ${a.done ? 'text-stone line-through' : 'text-sand'}`}>{a.text}</span>
            {editing && (
              <button onClick={() => remove(a.id)} aria-label="Remove" className="text-muted hover:text-rust"><X className="h-3.5 w-3.5" /></button>
            )}
          </div>
        ))}
      </div>
      {editing && (
        <div className="mt-2 flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
            placeholder="Add an activity…"
            className="flex-1 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs outline-none focus:border-gold-mid" />
          <button onClick={add} className="press rounded-lg bg-flag-blue px-3 text-xs font-bold text-white">Add</button>
        </div>
      )}
    </div>
  )
}

/* A full day card with an elegant colour band (day + category). */
function DayCard({ day, weather, editing }: { day: ViewDay; weather: Record<number, DayWeatherData | null>; editing: boolean }) {
  const { color, label, Icon } = dayMeta(day)
  const [open, setOpen] = useState(false)
  const loc = day.isCustom
    ? (day.customLat != null && day.customLng != null ? { name: day.customName ?? day.title, lat: day.customLat, lng: day.customLng, altitudeM: 0 } : null)
    : DAY_LOCATIONS[day.dayNumber]
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      {/* elegant band */}
      <div className="flex items-center justify-between px-4 py-2" style={{ background: FLAG_TINT[color] }}>
        <span className="text-sm font-extrabold" style={{ color: FLAG[color] }}>
          {day.isCustom ? 'Extra stop' : `Day ${day.dayNumber}`}
          {day.dayOfWeek && <span className="ml-2 text-[0.62rem] font-bold uppercase tracking-wide text-stone">{day.dayOfWeek}</span>}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.62rem] font-bold text-white" style={{ background: FLAG[color] }}>
            <Icon className="h-3 w-3" /> {label}
          </span>
          {editing && (
            <button onClick={() => setOpen(true)} aria-label="Edit day"
              className="press flex h-6 w-6 items-center justify-center rounded-full bg-white text-stone hover:text-cream">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-[0.95rem] font-bold leading-snug text-cream">{cleanTitle(day.title)}</h3>
        {loc && (
          <div className="mt-1.5">
            <DayWeather weather={weather[day.dayNumber] ?? null} location={loc} />
          </div>
        )}
        {day.description && <p className="mt-1.5 text-xs leading-relaxed text-muted">{day.description}</p>}
        <MealNotes day={day} />
        <ActivityList day={day} editing={editing} />
        <DayLinkChips day={day} />
      </div>
      {open && <DayEditor day={day} onClose={() => setOpen(false)} />}
    </div>
  )
}

/* ---------- Timeline (collapsible by week) ---------- */
function TimelineView({ days, weather, editing }: { days: ViewDay[]; weather: Record<number, DayWeatherData | null>; editing: boolean }) {
  // Group by the seeded day a card sits under (custom days inherit the week).
  const weekOf = (d: ViewDay) => Math.ceil(Math.floor(d.sortOrder ?? d.dayNumber) / 7)
  const weeks = [1, 2, 3].map(w => ({ week: w, days: days.filter(d => weekOf(d) === w) }))

  return (
    <div className="space-y-3">
      {weeks.map(({ week, days: weekDays }) => {
        if (weekDays.length === 0) return null
        return (
          <Collapsible key={week} title={WEEK_LABELS[week]} meta={`${weekDays.length} days`} tags={groupTags(weekDays)} defaultOpen={week === 1}>
            <div className="space-y-3 pt-1">
              {weekDays.map(day => (
                <div key={day.id}>
                  <DayCard day={day} weather={weather} editing={editing} />
                  {editing && <AddStop afterSortOrder={day.sortOrder ?? day.dayNumber} dayOfWeek={day.dayOfWeek} />}
                </div>
              ))}
            </div>
          </Collapsible>
        )
      })}
    </div>
  )
}

/* Inline editor for a day (seeded or custom). */
function DayEditor({ day, onClose }: { day: ViewDay; onClose: () => void }) {
  const router = useRouter()
  const [title, setTitle] = useState(day.title)
  const [description, setDescription] = useState(day.description ?? '')
  const [breakfast, setBreakfast] = useState(day.breakfastNote ?? '')
  const [lunch, setLunch] = useState(day.lunchNote ?? '')
  const [dinner, setDinner] = useState(day.dinnerNote ?? '')
  const [tags, setTags] = useState({
    isWorkDay: day.isWorkDay, isTrekDay: day.isTrekDay, isFestivalDay: day.isFestivalDay, isExcursionDay: day.isExcursionDay,
  })
  const [place, setPlace] = useState(day.customName ?? '')
  const [saving, setSaving] = useState(false)

  const TAGS: { key: keyof typeof tags; label: string; color: FlagColor }[] = [
    { key: 'isWorkDay', label: 'Work', color: 'blue' },
    { key: 'isTrekDay', label: 'Trek', color: 'green' },
    { key: 'isExcursionDay', label: 'Excursion', color: 'yellow' },
    { key: 'isFestivalDay', label: 'Festival', color: 'red' },
  ]

  async function save() {
    setSaving(true)
    await patchDay(day.id, {
      title, description, breakfastNote: breakfast || null, lunchNote: lunch || null, dinnerNote: dinner || null,
      ...tags, ...(day.isCustom ? { customName: place || null } : {}),
    })
    setSaving(false)
    onClose()
    toast.success('Day updated')
    router.refresh()
  }

  async function remove() {
    await fetch(`/api/itinerary/${day.id}`, { method: 'DELETE' })
    onClose()
    toast.success('Stop removed')
    router.refresh()
  }

  const inputCls = 'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-gold-mid'
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="lb-panel max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-cream">{day.isCustom ? 'Edit stop' : `Edit Day ${day.dayNumber}`}</h3>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-cream"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className={inputCls} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={3} className={`resize-none ${inputCls}`} />
          {day.isCustom && (
            <input value={place} onChange={e => setPlace(e.target.value)} placeholder="Place name (for the map)" className={inputCls} />
          )}
          <div>
            <div className="mb-1.5 text-[0.62rem] font-bold uppercase tracking-wide text-stone">Day type</div>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(t => {
                const on = tags[t.key]
                return (
                  <button key={t.key} type="button" onClick={() => setTags(s => ({ ...s, [t.key]: !s[t.key] }))}
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
                    style={on ? { background: FLAG[t.color], color: '#fff', borderColor: 'transparent' } : { borderColor: '#e8e3d8', color: '#6b7280' }}>
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <input value={breakfast} onChange={e => setBreakfast(e.target.value)} placeholder="Breakfast" className={inputCls} />
            <input value={lunch} onChange={e => setLunch(e.target.value)} placeholder="Lunch" className={inputCls} />
            <input value={dinner} onChange={e => setDinner(e.target.value)} placeholder="Dinner" className={inputCls} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button onClick={save} disabled={saving} className="press rounded-lg bg-flag-blue px-5 py-2 text-sm font-bold text-white disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-stone hover:text-cream">Cancel</button>
          {day.isCustom && (
            <button onClick={remove} className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-rust hover:underline">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* "Add a stop after this day" button + quick create. */
function AddStop({ afterSortOrder, dayOfWeek }: { afterSortOrder: number; dayOfWeek: string }) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)

  async function create() {
    const t = title.trim()
    if (!t) return
    setBusy(true)
    await fetch('/api/itinerary', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: t, afterSortOrder, dayOfWeek, isExcursionDay: true }),
    })
    setBusy(false); setTitle(''); setAdding(false)
    toast.success('Stop added')
    router.refresh()
  }

  if (!adding) {
    return (
      <button onClick={() => setAdding(true)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-semibold text-stone hover:border-gold-mid hover:text-cream">
        <Plus className="h-3.5 w-3.5" /> Add a stop here
      </button>
    )
  }
  return (
    <div className="mt-2 flex gap-2">
      <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); create() } }}
        placeholder="e.g. Coffee at Alchi"
        className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-xs outline-none focus:border-gold-mid" />
      <button onClick={create} disabled={busy} className="press rounded-lg bg-flag-blue px-3 text-xs font-bold text-white disabled:opacity-50">Add</button>
      <button onClick={() => setAdding(false)} className="rounded-lg border border-border px-3 text-xs font-semibold text-stone">Cancel</button>
    </div>
  )
}

/* A single clean day row — the colour-coded badge is the only indicator. */
function DayRow({ day, weather }: { day: ViewDay; weather: Record<number, DayWeatherData | null> }) {
  const { color } = dayMeta(day)
  const w = weather[day.dayNumber]
  const loc = DAY_LOCATIONS[day.dayNumber]
  return (
    <div className="flex items-center gap-3 border-t border-border py-2.5 first:border-0">
      <span className="w-8 shrink-0 text-center text-sm font-extrabold tabular-nums" style={{ color: FLAG[color] }}>{day.dayNumber}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-cream">{cleanTitle(day.title)}</div>
        <div className="truncate text-[0.68rem] text-stone">{day.dayOfWeek}{loc ? ` · ${loc.name}` : ''}</div>
      </div>
      {w && <div className="shrink-0 text-[0.72rem] text-stone">{w.icon} {w.tempMax}°/{w.tempMin}°</div>}
    </div>
  )
}

// Distinct category icons present in a group — shown on the section title bar.
function groupTags(days: ViewDay[]): { Icon: LucideIcon; color: FlagColor }[] {
  const order: FlagColor[] = ['blue', 'green', 'red', 'yellow', 'ink']
  const seen = new Map<FlagColor, LucideIcon>()
  for (const d of days) {
    const { color, Icon } = dayMeta(d)
    if (!seen.has(color)) seen.set(color, Icon)
  }
  return order.filter(c => seen.has(c)).map(c => ({ color: c, Icon: seen.get(c)! }))
}

/* Collapsible section — category icons live on the title bar, not in the rows. */
function Collapsible({
  title, meta, tags = [], defaultOpen = false, children,
}: {
  title: string; meta: string; tags?: { Icon: LucideIcon; color: FlagColor }[]; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="overflow-hidden card-base">
      <button onClick={() => setOpen(v => !v)} className="flex w-full items-center gap-2.5 px-4 py-3 text-left">
        <span className="truncate text-sm font-bold text-cream">{title}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          {tags.map((t, i) => <t.Icon key={i} className="h-4 w-4" style={{ color: FLAG[t.color] }} strokeWidth={2.2} />)}
        </span>
        <span className="shrink-0 rounded-full bg-[#f1efe9] px-2 py-0.5 text-[0.62rem] font-semibold text-stone">{meta}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-2">{children}</div>}
    </div>
  )
}

/* ---------- Calendar / weeks (collapsible) ---------- */
function CalendarView({ days, weather }: { days: ViewDay[]; weather: Record<number, DayWeatherData | null> }) {
  const weeks = [1, 2, 3].map(w => ({
    week: w,
    days: days.filter(d => Math.ceil(Math.floor(d.sortOrder ?? d.dayNumber) / 7) === w),
  }))

  return (
    <div className="space-y-3">
      {weeks.map(({ week, days: weekDays }) => {
        if (weekDays.length === 0) return null
        return (
          <Collapsible
            key={week}
            title={WEEK_LABELS[week]}
            meta={`${weekDays.length} days`}
            tags={groupTags(weekDays)}
            defaultOpen={week === 1}
          >
            {weekDays.map(day => <DayRow key={day.id} day={day} weather={weather} />)}
          </Collapsible>
        )
      })}
    </div>
  )
}

/* ---------- By location (collapsible) ---------- */
function LocationView({ days, weather }: { days: ViewDay[]; weather: Record<number, DayWeatherData | null> }) {
  const groups: { name: string; days: ViewDay[] }[] = []
  const index = new Map<string, number>()
  for (const day of days) {
    const name = day.isCustom
      ? (day.customName ?? day.title)
      : (DAY_LOCATIONS[day.dayNumber]?.name ?? 'Other')
    if (!index.has(name)) {
      index.set(name, groups.length)
      groups.push({ name, days: [] })
    }
    groups[index.get(name)!].days.push(day)
  }

  return (
    <div className="space-y-3">
      {groups.map((g, i) => {
        const loc = DAY_LOCATIONS[g.days[0].dayNumber]
        return (
          <Collapsible
            key={g.name}
            title={g.name}
            meta={`${g.days.length} ${g.days.length === 1 ? 'day' : 'days'}${loc ? ` · ${loc.altitudeM.toLocaleString()}m` : ''}`}
            tags={groupTags(g.days)}
            defaultOpen={i === 0}
          >
            {g.days.map(day => <DayRow key={day.id} day={day} weather={weather} />)}
          </Collapsible>
        )
      })}
    </div>
  )
}
