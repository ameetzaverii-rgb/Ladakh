'use client'

import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export interface FestImage { src: string; pageUrl?: string }

/** A small strip of festival photos that opens into a swipe/slide lightshow. */
export function FestivalGallery({ title, images }: { title: string; images: FestImage[] }) {
  const [open, setOpen] = useState<number | null>(null)
  if (images.length === 0) return null

  const show = (i: number) => setOpen(i)
  const close = () => setOpen(null)
  const prev = () => setOpen(o => (o === null ? o : (o - 1 + images.length) % images.length))
  const next = () => setOpen(o => (o === null ? o : (o + 1) % images.length))

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, images.length])

  const thumbs = images.slice(0, 4)
  const extra = images.length - thumbs.length

  return (
    <>
      <div className="flex gap-2">
        {thumbs.map((img, i) => (
          <button key={i} onClick={() => show(i)}
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gold/15 transition-transform hover:scale-[1.04] focus:outline-none focus:ring-2 focus:ring-gold/40 sm:h-20 sm:w-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={`${title} ${i + 1}`} className="h-full w-full object-cover" />
            {i === thumbs.length - 1 && extra > 0 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-bold text-white">+{extra}</span>
            )}
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4" onClick={close}>
          <button onClick={close} aria-label="Close" className="absolute right-4 top-4 z-10 text-white/80 hover:text-white"><X className="h-7 w-7" /></button>
          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); prev() }} aria-label="Previous"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><ChevronLeft className="h-6 w-6" /></button>
              <button onClick={e => { e.stopPropagation(); next() }} aria-label="Next"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><ChevronRight className="h-6 w-6" /></button>
            </>
          )}
          <figure className="max-h-[88vh] w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[open].src} alt={title} className="mx-auto max-h-[80vh] w-auto rounded-lg object-contain" />
            <figcaption className="mt-3 text-center text-sm text-white/80">
              {title} <span className="text-white/40">· {open + 1} / {images.length}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  )
}
