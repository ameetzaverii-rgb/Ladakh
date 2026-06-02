'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Tab = 'shop' | 'food' | 'treks' | 'events'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'shop', label: 'Shop', icon: '🛍️' },
  { id: 'food', label: 'Food', icon: '🍜' },
  { id: 'treks', label: 'Treks', icon: '🥾' },
  { id: 'events', label: 'Festivals', icon: '🎭' },
]

const SHOP_AREAS = ['Leh', 'Nubra', 'Pangong', 'Sham', 'Turtuk', 'General']
const SHOP_CATEGORIES = ['Textiles', 'Food', 'Handicraft', 'Jewellery', 'Spiritual', 'Misc']
const PLACE_TYPES = ['CAFE', 'RESTAURANT', 'STREET_FOOD', 'BAKERY', 'DHABA']
const TREK_DIFFICULTY = ['EASY', 'MEDIUM', 'HARD', 'EXPERT']
const EVENT_TYPES = ['FESTIVAL', 'CULTURAL', 'MONASTERY', 'MARKET', 'SPORTS', 'ASTRONOMY']

const INPUT = 'w-full bg-dark border border-gold/20 text-cream px-3 py-2.5 text-sm focus:border-gold/50 outline-none rounded'
const LABEL = 'label-mono text-[0.6rem] block mb-1.5 text-stone'

export function ContributeClient({ counts }: { counts: Record<Tab, number> }) {
  const [tab, setTab] = useState<Tab>('shop')

  return (
    <div>
      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`py-3 rounded-lg border text-center transition-colors ${
              tab === t.id ? 'border-gold bg-gold/10 text-gold' : 'border-gold/15 text-stone hover:text-gold hover:border-gold/30'
            }`}
          >
            <div className="text-xl">{t.icon}</div>
            <div className="label-mono text-[0.55rem] mt-1">{t.label}</div>
            <div className="text-[0.55rem] opacity-60">{counts[t.id]} so far</div>
          </button>
        ))}
      </div>

      {tab === 'shop' && <ShopForm />}
      {tab === 'food' && <FoodForm />}
      {tab === 'treks' && <TrekForm />}
      {tab === 'events' && <EventForm />}
    </div>
  )
}

// Shared submit helper: posts, toasts, resets, refreshes.
function useSubmit() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  async function submit(url: string, payload: unknown, onDone: () => void) {
    setLoading(true)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success('Added — thank you! 🙏')
        onDone()
        router.refresh()
      } else {
        toast.error('Something went wrong, please try again')
      }
    } catch {
      toast.error('Network error, please try again')
    } finally {
      setLoading(false)
    }
  }
  return { loading, submit }
}

function FormShell({ title, children, onSubmit, loading }: {
  title: string; children: React.ReactNode; onSubmit: (e: React.FormEvent) => void; loading: boolean
}) {
  return (
    <form onSubmit={onSubmit} className="card-base p-5 sm:p-6 space-y-4">
      <p className="text-muted text-sm leading-relaxed">{title}</p>
      {children}
      <button type="submit" disabled={loading}
        className="w-full sm:w-auto px-6 py-2.5 bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold font-mono text-xs tracking-wider uppercase transition-all disabled:opacity-50 rounded">
        {loading ? 'Adding…' : 'Add to the trip'}
      </button>
    </form>
  )
}

function NameField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={LABEL}>Your name *</label>
      <input value={value} onChange={e => onChange(e.target.value)} required placeholder="So we can thank you!" className={INPUT} />
    </div>
  )
}

function ShopForm() {
  const { loading, submit } = useSubmit()
  const [name, setName] = useState('')
  const [area, setArea] = useState('Leh')
  const [category, setCategory] = useState('Handicraft')
  const [price, setPrice] = useState('')
  const [where, setWhere] = useState('')
  const [who, setWho] = useState('')

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    submit('/api/shop', {
      name, area, category,
      estPriceINR: price ? parseInt(price) : null,
      whereToBuy: where || null,
      priority: 'nice',
      notes: `🙋 Suggested by ${who}`,
    }, () => { setName(''); setPrice(''); setWhere('') })
  }

  return (
    <FormShell title="Something Amit should pick up in Ladakh?" onSubmit={onSubmit} loading={loading}>
      <div>
        <label className={LABEL}>Item *</label>
        <input value={name} onChange={e => setName(e.target.value)} required placeholder="Pashmina shawl, apricot jam…" className={INPUT} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Area</label>
          <select value={area} onChange={e => setArea(e.target.value)} className={INPUT}>
            {SHOP_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL}>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className={INPUT}>
            {SHOP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Est. price ₹</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" placeholder="2000" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Where to buy</label>
          <input value={where} onChange={e => setWhere(e.target.value)} placeholder="Moti Market" className={INPUT} />
        </div>
      </div>
      <NameField value={who} onChange={setWho} />
    </FormShell>
  )
}

function FoodForm() {
  const { loading, submit } = useSubmit()
  const [name, setName] = useState('')
  const [type, setType] = useState('CAFE')
  const [neighbourhood, setNeighbourhood] = useState('')
  const [mustOrder, setMustOrder] = useState('')
  const [description, setDescription] = useState('')
  const [who, setWho] = useState('')

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    submit('/api/places', {
      name,
      type,
      neighbourhood: neighbourhood || 'Leh',
      description: `${description} — 🙋 suggested by ${who}`,
      mustOrder: mustOrder.split(',').map(s => s.trim()).filter(Boolean),
      tags: [],
      wifiAvailable: false,
      laptopFriendly: false,
    }, () => { setName(''); setNeighbourhood(''); setMustOrder(''); setDescription('') })
  }

  return (
    <FormShell title="A café or restaurant worth a visit?" onSubmit={onSubmit} loading={loading}>
      <div>
        <label className={LABEL}>Place name *</label>
        <input value={name} onChange={e => setName(e.target.value)} required placeholder="Lehvenda Café" className={INPUT} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className={INPUT}>
            {PLACE_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL}>Neighbourhood</label>
          <input value={neighbourhood} onChange={e => setNeighbourhood(e.target.value)} placeholder="Changspa" className={INPUT} />
        </div>
      </div>
      <div>
        <label className={LABEL}>Must order (comma-separated)</label>
        <input value={mustOrder} onChange={e => setMustOrder(e.target.value)} placeholder="Apricot cake, pour-over" className={INPUT} />
      </div>
      <div>
        <label className={LABEL}>Why you love it *</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={2} placeholder="Best views in Leh, great for working…" className={`${INPUT} resize-none`} />
      </div>
      <NameField value={who} onChange={setWho} />
    </FormShell>
  )
}

function TrekForm() {
  const { loading, submit } = useSubmit()
  const [name, setName] = useState('')
  const [difficulty, setDifficulty] = useState('MEDIUM')
  const [duration, setDuration] = useState('2')
  const [altitude, setAltitude] = useState('')
  const [start, setStart] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [who, setWho] = useState('')

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    submit('/api/treks', {
      name,
      difficulty,
      durationDays: parseInt(duration) || 1,
      maxAltitudeM: parseInt(altitude) || 4000,
      startPoint: start || 'Leh',
      priceINR: parseInt(price) || 0,
      description: `${description} — 🙋 suggested by ${who}`,
      highlights: [],
    }, () => { setName(''); setAltitude(''); setStart(''); setPrice(''); setDescription('') })
  }

  return (
    <FormShell title="A trek worth adding to the weekends?" onSubmit={onSubmit} loading={loading}>
      <div>
        <label className={LABEL}>Trek name *</label>
        <input value={name} onChange={e => setName(e.target.value)} required placeholder="Markha Valley Trek" className={INPUT} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Difficulty</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={INPUT}>
            {TREK_DIFFICULTY.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL}>Days</label>
          <input type="number" value={duration} onChange={e => setDuration(e.target.value)} min="1" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Max altitude (m)</label>
          <input type="number" value={altitude} onChange={e => setAltitude(e.target.value)} placeholder="4900" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Price ₹ / person</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="8000" className={INPUT} />
        </div>
      </div>
      <div>
        <label className={LABEL}>Start point</label>
        <input value={start} onChange={e => setStart(e.target.value)} placeholder="Chilling" className={INPUT} />
      </div>
      <div>
        <label className={LABEL}>Why it's worth it *</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={2} placeholder="Classic Ladakh trek, stunning gorges…" className={`${INPUT} resize-none`} />
      </div>
      <NameField value={who} onChange={setWho} />
    </FormShell>
  )
}

function EventForm() {
  const { loading, submit } = useSubmit()
  const [name, setName] = useState('')
  const [type, setType] = useState('FESTIVAL')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')
  const [who, setWho] = useState('')

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    submit('/api/events', {
      name,
      type,
      location: location || 'Leh',
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || startDate || new Date().toISOString(),
      description: `${description} — 🙋 suggested by ${who}`,
      freeEntry: true,
    }, () => { setName(''); setLocation(''); setStartDate(''); setEndDate(''); setDescription('') })
  }

  return (
    <FormShell title="A festival or event during the trip (22 Jul – 11 Aug)?" onSubmit={onSubmit} loading={loading}>
      <div>
        <label className={LABEL}>Event name *</label>
        <input value={name} onChange={e => setName(e.target.value)} required placeholder="Hemis Festival" className={INPUT} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className={INPUT}>
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL}>Location</label>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Hemis Monastery" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Start date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>End date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={INPUT} />
        </div>
      </div>
      <div>
        <label className={LABEL}>What's it about *</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={2} placeholder="Masked dances, once every 12 years the giant thangka…" className={`${INPUT} resize-none`} />
      </div>
      <NameField value={who} onChange={setWho} />
    </FormShell>
  )
}
