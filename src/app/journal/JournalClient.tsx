'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { MOOD_LABELS } from '@/lib/utils'

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
      <div className="flex justify-end mb-6">
        <button
          onClick={() => { setShowForm(true); setEditEntry(null) }}
          className="pill pill-gold"
        >
          + New Entry
        </button>
      </div>

      {(showForm || editEntry) && (
        <EntryForm
          entry={editEntry}
          onClose={() => { setShowForm(false); setEditEntry(null) }}
        />
      )}

      {entries.length === 0 && (
        <div className="text-center py-16 text-stone">
          <div className="text-4xl mb-3">📔</div>
          <p className="font-serif text-xl text-cream mb-2">No entries yet</p>
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
        className="flex items-start gap-4 p-5 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="shrink-0 text-center">
          <div className="font-serif text-3xl text-gold/40 font-light leading-none">{entry.tripDay}</div>
          <div className="label-mono text-[0.5rem] text-stone">day</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="label-mono text-[0.55rem] text-sky">{dateStr}</span>
            {entry.location && <span className="label-mono text-[0.5rem] text-stone">📍 {entry.location}</span>}
            {mood && <span className="text-lg">{mood}</span>}
            {entry.weather && <span className="label-mono text-[0.5rem] text-stone">{entry.weather}</span>}
          </div>
          {entry.title && (
            <div className="font-serif text-cream text-lg mb-1">{entry.title}</div>
          )}
          <p className="text-muted text-sm leading-relaxed line-clamp-2">{entry.content}</p>
        </div>
        <div className="text-stone text-xs shrink-0">{expanded ? '▲' : '▼'}</div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gold/10 pt-4">
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
                  <img key={i} src={url} alt="" className="w-24 h-24 object-cover border border-gold/20" />
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-2">
            <button onClick={onEdit} className="label-mono text-[0.55rem] text-sky hover:underline">Edit</button>
            <button onClick={onDelete} className="label-mono text-[0.55rem] text-rust/60 hover:text-rust">Delete</button>
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
  const [photos, setPhotos] = useState((entry?.photos ?? []).join('\n'))
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
      photos: photos.split('\n').map(s => s.trim()).filter(Boolean),
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
            className="w-full bg-dark border border-gold/20 text-cream px-3 py-2 text-sm focus:border-gold/50 outline-none" />
        </div>
        <div>
          <label className="label-mono text-[0.55rem] block mb-1">Location</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)}
            placeholder="Phyang Monastery"
            className="w-full bg-dark border border-gold/20 text-cream px-3 py-2 text-sm focus:border-gold/50 outline-none" />
        </div>
        <div>
          <label className="label-mono text-[0.55rem] block mb-1">Weather</label>
          <input type="text" value={weather} onChange={e => setWeather(e.target.value)}
            placeholder="Sunny 24°C"
            className="w-full bg-dark border border-gold/20 text-cream px-3 py-2 text-sm focus:border-gold/50 outline-none" />
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
          className="w-full bg-dark border border-gold/20 text-cream px-3 py-2 text-sm focus:border-gold/50 outline-none" />
      </div>

      <div>
        <label className="label-mono text-[0.55rem] block mb-1">Entry *</label>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder="Write about your day..."
          rows={6} required
          className="w-full bg-dark border border-gold/20 text-cream px-3 py-2 text-sm focus:border-gold/50 outline-none resize-none leading-relaxed" />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="label-mono text-[0.55rem] block mb-1">Highlights (comma-separated)</label>
          <input type="text" value={highlights} onChange={e => setHighlights(e.target.value)}
            placeholder="Saw masked dances, amazing momos, 5000m!"
            className="w-full bg-dark border border-gold/20 text-cream px-3 py-2 text-sm focus:border-gold/50 outline-none" />
        </div>
        <div>
          <label className="label-mono text-[0.55rem] block mb-1">Lowlights (comma-separated)</label>
          <input type="text" value={lowlights} onChange={e => setLowlights(e.target.value)}
            placeholder="Altitude headache, poor WiFi"
            className="w-full bg-dark border border-gold/20 text-cream px-3 py-2 text-sm focus:border-gold/50 outline-none" />
        </div>
      </div>

      <div>
        <label className="label-mono text-[0.55rem] block mb-1">Photo URLs (one per line)</label>
        <textarea value={photos} onChange={e => setPhotos(e.target.value)}
          placeholder="https://..."
          rows={2}
          className="w-full bg-dark border border-gold/20 text-cream px-3 py-2 text-sm focus:border-gold/50 outline-none resize-none" />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="px-5 py-2 bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold font-mono text-xs tracking-wider uppercase transition-all disabled:opacity-50">
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
