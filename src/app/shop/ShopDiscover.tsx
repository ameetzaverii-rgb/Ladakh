'use client'

import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { SHOP_IDEAS, type ShopIdea } from '@/lib/shopSuggestions'
import { catIcon } from '@/lib/categoryIcons'
import { Heart, X, RotateCcw, Sparkles, MapPin } from 'lucide-react'

const SEEN_KEY = 'shopIdeasSeen'

function loadSeen(): string[] {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]') } catch { return [] }
}
function saveSeen(ids: string[]) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(ids)) } catch {}
}

export function ShopDiscover({ existingNames, images = {} }: { existingNames: string[]; images?: Record<string, string> }) {
  const router = useRouter()
  const have = useMemo(() => new Set(existingNames.map(n => n.toLowerCase())), [existingNames])
  const [seen, setSeen] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  // Build the deck once on first client render (skip seen + already-owned).
  const [deck, setDeck] = useState<ShopIdea[]>([])
  if (!ready && typeof window !== 'undefined') {
    const s = loadSeen()
    setSeen(s)
    setDeck(SHOP_IDEAS.filter(i => !s.includes(i.id) && !have.has(i.name.toLowerCase())))
    setReady(true)
  }

  const [drag, setDrag] = useState(0)
  const startX = useRef<number | null>(null)
  const current = deck[0]

  function markSeen(id: string) {
    const next = Array.from(new Set([...seen, id]))
    setSeen(next); saveSeen(next)
  }

  async function decide(keep: boolean) {
    if (!current) return
    if (keep) {
      await fetch('/api/shop', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: current.name, area: current.area, category: current.category,
          estPriceINR: current.estPriceINR, whereToBuy: current.whereToBuy, priority: 'nice',
          photo: images[current.id] ?? null,
        }),
      })
      toast.success(`Kept · ${current.name}`)
      router.refresh()
    }
    markSeen(current.id)
    setDeck(d => d.slice(1))
    setDrag(0)
  }

  function reset() {
    saveSeen([]); setSeen([])
    setDeck(SHOP_IDEAS.filter(i => !have.has(i.name.toLowerCase())))
  }

  // pointer drag
  function onDown(e: React.PointerEvent) { startX.current = e.clientX; (e.target as HTMLElement).setPointerCapture(e.pointerId) }
  function onMove(e: React.PointerEvent) { if (startX.current != null) setDrag(e.clientX - startX.current) }
  function onUp() {
    if (drag > 110) decide(true)
    else if (drag < -110) decide(false)
    else setDrag(0)
    startX.current = null
  }

  if (!current) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 text-center">
        <Sparkles className="mx-auto mb-2 h-7 w-7 text-flag-yellow" />
        <p className="text-base font-bold text-cream">You&apos;ve been through the ideas</p>
        <p className="mt-1 text-sm text-stone">Kept items are in your list. New ideas get added to the repository over time.</p>
        <button onClick={reset} className="press mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-stone hover:text-cream">
          <RotateCcw className="h-4 w-4" /> Start over
        </button>
      </div>
    )
  }

  const Icon = catIcon(current.category)
  const rot = drag / 18
  const keepHint = Math.max(0, Math.min(1, drag / 110))
  const skipHint = Math.max(0, Math.min(1, -drag / 110))
  const photo = images[current.id]

  return (
    <div className="select-none">
      <p className="mb-3 text-center text-xs text-stone">Swipe right to keep · left to skip</p>
      <div className="relative mx-auto h-[460px] max-w-[20rem]">
        {/* peek of the next polaroid, tucked behind */}
        {deck[1] && <div className="absolute inset-x-4 top-4 h-full rounded-[3px] bg-white shadow-soft" style={{ transform: 'rotate(3deg)' }} />}

        {/* Polaroid card */}
        <div
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          className="absolute inset-0 flex cursor-grab touch-none flex-col rounded-[3px] bg-white p-3 pb-4 shadow-soft active:cursor-grabbing"
          style={{
            transform: `translateX(${drag}px) rotate(${rot - 1.2}deg)`,
            transition: startX.current == null ? 'transform 0.28s var(--ease-out-soft)' : 'none',
            boxShadow: '0 10px 30px -8px rgba(26,18,8,0.28)',
          }}
        >
          {/* photo window */}
          <div className="relative aspect-square w-full overflow-hidden rounded-[2px] bg-tint-yellow">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={current.name} draggable={false} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center"><Icon className="h-16 w-16 text-flag-yellow/70" strokeWidth={1.6} /></div>
            )}
            {/* price tag */}
            <span className="absolute right-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-sm font-extrabold tabular-nums text-cream shadow-soft">₹{current.estPriceINR.toLocaleString('en-IN')}</span>
            {/* drag stamps */}
            <div className="pointer-events-none absolute left-3 top-3 rounded-md border-[3px] border-sage px-2 py-0.5 text-base font-extrabold uppercase tracking-wide text-sage" style={{ opacity: keepHint, transform: 'rotate(-14deg)' }}>Keep</div>
            <div className="pointer-events-none absolute right-3 top-3 rounded-md border-[3px] border-rust px-2 py-0.5 text-base font-extrabold uppercase tracking-wide text-rust" style={{ opacity: skipHint, transform: 'rotate(14deg)' }}>Skip</div>
          </div>

          {/* caption — the white polaroid foot */}
          <div className="flex flex-1 flex-col px-1 pt-3">
            <h3 className="font-serif text-xl font-bold leading-tight text-cream">{current.name}</h3>
            <div className="mt-1 flex items-center gap-1.5 text-[0.7rem] font-semibold text-stone">
              <span className="inline-flex items-center gap-1 rounded-full bg-tint-yellow px-2 py-0.5 text-flag-yellow"><MapPin className="h-3 w-3" /> {current.area}</span>
              <span className="text-muted">·</span>
              <Icon className="h-3.5 w-3.5 text-stone" /> {current.category}
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{current.blurb}</p>
            <p className="mt-auto pt-2 text-[0.68rem] text-stone"><span className="font-semibold text-sand">Where:</span> {current.whereToBuy}</p>
          </div>
        </div>
      </div>

      {/* buttons */}
      <div className="mt-5 flex items-center justify-center gap-5">
        <button onClick={() => decide(false)} aria-label="Skip"
          className="press flex h-14 w-14 items-center justify-center rounded-full border border-border bg-white text-rust shadow-soft hover:bg-tint-red">
          <X className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <button onClick={() => decide(true)} aria-label="Keep"
          className="press flex h-16 w-16 items-center justify-center rounded-full text-white shadow-soft" style={{ background: '#3e9e6e' }}>
          <Heart className="h-7 w-7" strokeWidth={2.5} />
        </button>
      </div>
      <p className="mt-3 text-center text-[0.7rem] text-muted">{deck.length} idea{deck.length !== 1 ? 's' : ''} left</p>
    </div>
  )
}
