'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronRight, MapPin, Star, BookOpen } from 'lucide-react'
import { FLAG, type FlagColor } from '@/lib/utils'

// External links for the lightbox action menu.
function mapHref(it: GalleryItem) {
  return typeof it.lat === 'number' && typeof it.lng === 'number'
    ? `https://www.google.com/maps/search/?api=1&query=${it.lat},${it.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(it.name + ' Ladakh')}`
}
function reviewHref(it: GalleryItem) {
  return `https://www.google.com/search?q=${encodeURIComponent(it.name + ' Ladakh reviews')}`
}

export interface GalleryItem {
  id: string
  name: string
  blurb: string
  when: string
  region: string
  color: FlagColor
  span?: 'wide' | 'tall' | 'big'
  src: string | null
  pageUrl: string
  lat?: number
  lng?: number
}

const SPAN: Record<string, string> = {
  wide: 'sm:col-span-2',
  tall: 'row-span-2',
  big: 'sm:col-span-2 row-span-2',
}

export function Gallery({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  const close = useCallback(() => setOpen(null), [])
  const go = useCallback(
    (dir: number) => setOpen(i => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length]
  )

  // Keyboard navigation + scroll lock while the lightbox is open.
  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, close, go])

  return (
    <>
      <div className="grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[180px] sm:grid-cols-3 lg:grid-cols-4">
        {items.map((it, i) => (
          <button
            key={it.id}
            onClick={() => it.src && setOpen(i)}
            style={{ ['--d' as any]: `${Math.min(i * 45, 600)}ms` }}
            className={`group reveal press relative overflow-hidden rounded-2xl text-left shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${SPAN[it.span ?? ''] ?? ''}`}
          >
            {it.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.src} alt={it.name} loading="lazy"
                   className="img-zoom absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: FLAG[it.color] }} />
            )}
            {/* legibility gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            {/* category dot */}
            <span className="absolute left-3 top-3 h-2.5 w-2.5 rounded-full ring-2 ring-white/70"
                  style={{ background: FLAG[it.color] }} />
            <span className="absolute right-3 top-3 rounded-full bg-black/35 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              {it.when}
            </span>
            <div className="absolute inset-x-0 bottom-0 p-3">
              <div className="text-sm font-extrabold leading-tight text-white drop-shadow">{it.name}</div>
              <div className="mt-0.5 flex items-center gap-1 text-[0.65rem] text-white/80">
                <MapPin className="h-3 w-3" /> {it.region}
              </div>
            </div>
          </button>
        ))}
      </div>

      {open !== null && items[open] && (
        <div
          className="lb-back fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={items[open].name}
        >
          <button onClick={close} aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
          <button onClick={e => { e.stopPropagation(); go(-1) }} aria-label="Previous"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-6">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={e => { e.stopPropagation(); go(1) }} aria-label="Next"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-6">
            <ChevronRight className="h-6 w-6" />
          </button>

          <figure className="lb-panel flex max-h-[88vh] w-full max-w-3xl flex-col" onClick={e => e.stopPropagation()}>
            {items[open].src && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={items[open].src!} alt={items[open].name}
                   className="max-h-[68vh] w-full rounded-2xl object-contain" />
            )}
            <figcaption className="mt-3 rounded-2xl bg-white/5 p-4 text-white">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: FLAG[items[open].color] }} />
                <h3 className="text-lg font-extrabold">{items[open].name}</h3>
                <span className="ml-auto text-xs text-white/70">{items[open].when} · {items[open].region}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-white/80">{items[open].blurb}</p>
              {/* Action menu: reviews · map · wiki */}
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={mapHref(items[open])} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20">
                  <MapPin className="h-3.5 w-3.5" /> Map
                </a>
                <a href={reviewHref(items[open])} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20">
                  <Star className="h-3.5 w-3.5" /> Reviews
                </a>
                {items[open].pageUrl && items[open].pageUrl.startsWith('http') && (
                  <a href={items[open].pageUrl} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20">
                    <BookOpen className="h-3.5 w-3.5" /> Wikipedia
                  </a>
                )}
              </div>
              <div className="mt-2 text-center text-[0.65rem] text-white/40">{open + 1} / {items.length}</div>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  )
}
