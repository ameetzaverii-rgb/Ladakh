'use client'

import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { SHOP_IDEAS, type ShopIdea } from '@/lib/shopSuggestions'
import { catIcon } from '@/lib/categoryIcons'
import { Heart, X, RotateCcw, Check, Sparkles } from 'lucide-react'

const SEEN_KEY = 'shopIdeasSeen'

function loadSeen(): string[] {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]') } catch { return [] }
}
function saveSeen(ids: string[]) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(ids)) } catch {}
}

export function ShopDiscover({ existingNames }: { existingNames: string[] }) {
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

  return (
    <div className="select-none">
      <p className="mb-3 text-center text-xs text-stone">Swipe right to keep · left to skip</p>
      <div className="relative mx-auto h-[360px] max-w-sm">
        {/* peek of next card */}
        {deck[1] && <div className="absolute inset-x-3 top-3 h-full rounded-2xl border border-border bg-white/70" />}
        <div
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          className="absolute inset-0 cursor-grab touch-none rounded-2xl border border-border bg-white shadow-soft active:cursor-grabbing"
          style={{ transform: `translateX(${drag}px) rotate(${rot}deg)`, transition: startX.current == null ? 'transform 0.25s var(--ease-out-soft)' : 'none' }}
        >
          <div className="flex h-full flex-col p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tint-yellow">
                <Icon className="h-5 w-5 text-flag-yellow" strokeWidth={2.2} />
              </span>
              <div>
                <div className="text-[0.62rem] font-bold uppercase tracking-wide text-stone">{current.area} · {current.category}</div>
                <div className="text-base font-extrabold leading-tight text-cream">{current.name}</div>
              </div>
              <span className="ml-auto rounded-full bg-[#f1efe9] px-2.5 py-1 text-sm font-bold tabular-nums text-cream">₹{current.estPriceINR.toLocaleString('en-IN')}</span>
            </div>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-sand">{current.blurb}</p>
            <div className="rounded-xl bg-[#f7f5ef] px-3 py-2 text-xs text-stone"><span className="font-semibold text-sand">Where:</span> {current.whereToBuy}</div>

            {/* drag hints */}
            <div className="pointer-events-none absolute left-4 top-4 rounded-lg border-2 border-sage px-2 py-0.5 text-xs font-extrabold uppercase text-sage" style={{ opacity: keepHint, transform: 'rotate(-12deg)' }}>Keep</div>
            <div className="pointer-events-none absolute right-4 top-4 rounded-lg border-2 border-rust px-2 py-0.5 text-xs font-extrabold uppercase text-rust" style={{ opacity: skipHint, transform: 'rotate(12deg)' }}>Skip</div>
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
