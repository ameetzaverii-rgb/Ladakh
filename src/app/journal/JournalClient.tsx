'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { FLAG, FLAG_TINT } from '@/lib/utils'
import { Plus, BookOpen, MapPin, ChevronDown, Pencil, Trash2 } from 'lucide-react'

type Entry = {
  id: string; tripDay: number; date: Date | string; title: string | null;
  content: string; mood: number | null; highlights: string[]; lowlights: string[];
  photos: string[]; location: string | null; weather: string | null;
}

const MOODS = ['😔', '😐', '🙂', '😊', '🤩']

export function JournalClient({ entries }: { entries: Entry[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editEntry, setEditEntry] = useState<Entry | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function deleteEntry(id: string) {
    await fetch(`/api/journal/${id}`, { method: 'DELETE' })
    startTransition(() => router.refresh())
    toast.success('Entry deleted')
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => { setShowForm(true); setEditEntry(null) }}
          className="press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white transition-[filter] hover:brightness-110"
          style={{ background: FLAG.ink }}
        >
          <Plus className="h-4 w-4" /> New entry
        </button>
      </div>

      {(showForm || editEntry) && (
        <EntryForm
          entry={editEntry}
          onClose={() => { setShowForm(false); setEditEntry(null) }}
        />
      )}

      {entries.length === 0 && (
        <div className="py-16 text-center text-stone">
          <BookOpen className="mx-auto mb-3 h-9 w-9 text-muted" />
          <p className="mb-1 text-xl font-bold text-cream">No entries yet</p>
          <p className="text-sm">Start writing when your journey begins.</p>
        </div>
      )}

      <div className="space-y-4">
        {entries.map(entry => (
          <JournalEntryCard
            key={entry.id}
            entry={entry}
            onEdit={() => { setEditEntry(entry); setShowForm(false) }}
            onDelete={() => deleteEntry(entry.id)}
          />
        ))}
      </div>
    </div>
  )
}

function JournalEntryCard({
  entry, onEdit, onDelete
}: { entry: Entry; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const mood = entry.mood ? MOODS[entry.mood - 1] : null
  const dateStr = typeof entry.date === 'string'
    ? format(parseISO(entry.date), 'EEE, MMM d yyyy')
    : format(entry.date, 'EEE, MMM d yyyy')

  return (
    <div className="card-base">
      <div
        className="flex cursor-pointer items-start gap-3.5 p-5"
        onClick={() => setExpanded(v => !v)}
      >
        <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl leading-none"
              style={{ background: FLAG_TINT.ink }}>
          <span className="text-[0.55rem] font-bold uppercase tracking-wide text-stone">Day</span>
          <span className="text-lg font-extrabold" style={{ color: FLAG.ink }}>{entry.tripDay}</span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] text-stone">
            <span className="font-semibold text-sky">{dateStr}</span>
            {entry.location && <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {entry.location}</span>}
            {mood && <span className="text-base leading-none">{mood}</span>}
            {entry.weather && <span>{entry.weather}</span>}
          </div>
          {entry.title && <div className="mb-1 text-lg font-bold text-cream">{entry.title}</div>}
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">{entry.content}</p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4">
          <p className="text-sand text-sm leading-relaxed whitespace-pre-wrap mb-4">{entry.content}</p>
          {entry.highlights.length > 0 && (
            <div className="mb-3">
              <div className="label-mono text-[0.55rem] text-gold mb-1.5">Highlights</div>
              <div className="flex flex-wrap gap-1.5">
                {entry.highlights.map((h, i) => (
                  <span key={i} className="pill pill-sage">{h}</span>
                ))}
              </div>
            </div>
          )}
          {entry.lowlights.length > 0 && (
            <div className="mb-3">
              <div className="label-mono text-[0.55rem] text-rust mb-1.5">Lowlights</div>
              <div className="flex flex-wrap gap-1.5">
                {entry.lowlights.map((l, i) => (
                  <span key={i} className="pill pill-rust">{l}</span>
                ))}
              </div>
            </div>
          )}
          {entry.photos.length > 0 && (
            <div className="mb-3">
              <div className="label-mono text-[0.55rem] text-stone mb-1.5">Photos</div>
              <div className="flex gap-2 flex-wrap">
                {entry.photos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-24 h-24 object-cover border border-gold/20 rounded hover:border-gold/50 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="mt-2 flex gap-2">
            <button onClick={onEdit} className="press inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-stone hover:text-cream">
              <Pencil className="h-3 w-3" /> Edit
            </button>
            <button onClick={onDelete} className="press inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-stone hover:border-rust hover:text-rust">
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EntryForm({ entry, onClose }: { entry: Entry | null; onClose: () => void }) {
  const [tripDay, setTripDay] = useState(String(entry?.tripDay ?? 1))
  const [title, setTitle] = useState(entry?.title ?? '')
  const [content, setContent] = useState(entry?.content ?? '')
  const [mood, setMood] = useState(String(entry?.mood ?? 3))
  const [location, setLocation] = useState(entry?.location ?? '')
  const [weather, setWeather] = useState(entry?.weather ?? '')
  const [highlights, setHighlights] = useState((entry?.highlights ?? []).join(', '))
  const [lowlights, setLowlights] = useState((entry?.lowlights ?? []).join(', '))
  const [photos, setPhotos] = useState<string[]>(entry?.photos ?? [])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Resize/compress an image in the browser to a small JPEG data URL so it can
  // be stored directly without a separate file-storage service.
  function resizeImage(file: File, maxDim = 1280, quality = 0.72): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new window.Image()
        img.onload = () => {
          let { width, height } = img
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else if (height >= width && height > maxDim) {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) return reject(new Error('no canvas'))
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        }
        img.onerror = reject
        img.src = reader.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    if (photos.length + files.length > 12) {
      toast.error('Up to 12 photos per entry')
      e.target.value = ''
      return
    }
    setUploading(true)
    try {
      const resized = await Promise.all(files.map(f => resizeImage(f)))
      setPhotos(prev => [...prev, ...resized])
    } catch {
      toast.error('Could not process one of the images')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function removePhoto(i: number) {
    setPhotos(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      tripDay: parseInt(tripDay),
      title: title || null,
      content,
      mood: parseInt(mood),
      location: location || null,
      weather: weather || null,
      highlights: highlights.split(',').map(s => s.trim()).filter(Boolean),
      lowlights: lowlights.split(',').map(s => s.trim()).filter(Boolean),
      photos,
      date: new Date().toISOString(),
    }

    const url = entry ? `/api/journal/${entry.id}` : '/api/journal'
    const method = entry ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    if (res.ok) {
      toast.success(entry ? 'Entry updated!' : 'Entry saved!')
      onClose()
      router.refresh()
    } else {
      toast.error('Failed to save')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-base p-6 mb-6 space-y-4">
      <div className="label-mono text-xs text-gold">{entry ? 'Edit Entry' : 'New Journal Entry'}</div>

      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="label-mono text-[0.55rem] block mb-1">Trip Day #</label>
          <input type="number" value={tripDay} onChange={e => setTripDay(e.target.value)} min="1" max="30"
            className="w-full rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none" />
        </div>
        <div>
          <label className="label-mono text-[0.55rem] block mb-1">Location</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)}
            placeholder="Phyang Monastery"
            className="w-full rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none" />
        </div>
        <div>
          <label className="label-mono text-[0.55rem] block mb-1">Weather</label>
          <input type="text" value={weather} onChange={e => setWeather(e.target.value)}
            placeholder="Sunny 24°C"
            className="w-full rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none" />
        </div>
      </div>

      <div>
        <label className="label-mono text-[0.55rem] block mb-1">Mood</label>
        <div className="flex gap-2">
          {MOODS.map((emoji, i) => (
            <button key={i} type="button" onClick={() => setMood(String(i + 1))}
              className={`text-xl w-10 h-10 flex items-center justify-center border rounded transition-all ${
                mood === String(i + 1) ? 'border-gold bg-gold/10' : 'border-transparent hover:border-gold/30'
              }`}>
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label-mono text-[0.55rem] block mb-1">Title (optional)</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Day I crossed Khardung La"
          className="w-full rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none" />
      </div>

      <div>
        <label className="label-mono text-[0.55rem] block mb-1">Entry *</label>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder="Write about your day..."
          rows={6} required
          className="w-full rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none resize-none leading-relaxed" />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="label-mono text-[0.55rem] block mb-1">Highlights (comma-separated)</label>
          <input type="text" value={highlights} onChange={e => setHighlights(e.target.value)}
            placeholder="Saw masked dances, amazing momos, 5000m!"
            className="w-full rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none" />
        </div>
        <div>
          <label className="label-mono text-[0.55rem] block mb-1">Lowlights (comma-separated)</label>
          <input type="text" value={lowlights} onChange={e => setLowlights(e.target.value)}
            placeholder="Altitude headache, poor WiFi"
            className="w-full rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none" />
        </div>
      </div>

      <div>
        <label className="label-mono text-[0.55rem] block mb-1">Photos</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {photos.map((src, i) => (
            <div key={i} className="relative w-20 h-20 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover border border-gold/20 rounded" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                aria-label="Remove photo"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rust text-white text-xs leading-none flex items-center justify-center shadow"
              >
                ✕
              </button>
            </div>
          ))}
          <label className="w-20 h-20 flex flex-col items-center justify-center border border-dashed border-gold/30 rounded cursor-pointer text-stone hover:text-gold hover:border-gold/50 transition-colors">
            <span className="text-xl leading-none">{uploading ? '…' : '+'}</span>
            <span className="label-mono text-[0.4rem] mt-1">{uploading ? 'Adding' : 'Add'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-muted text-[0.6rem]">
          Pick photos from your device — they're resized automatically. Up to 12 per entry.
        </p>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="px-5 py-2 rounded-lg bg-gold text-white font-semibold text-xs tracking-wide uppercase transition-[filter] hover:brightness-110 disabled:opacity-50">
          {loading ? '...' : (entry ? 'Update' : 'Save Entry')}
        </button>
        <button type="button" onClick={onClose}
          className="px-5 py-2 border border-gold/10 text-stone font-mono text-xs tracking-wider uppercase hover:text-gold transition-all">
          Cancel
        </button>
      </div>
    </form>
  )
}
