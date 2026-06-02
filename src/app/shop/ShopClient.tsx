'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export type ShopItemT = {
  id: string; name: string; area: string; category: string;
  estPriceINR: number | null; whereToBuy: string | null; priority: string;
  acquired: boolean; notes: string | null; photo: string | null;
}

const AREAS = ['Leh', 'Nubra', 'Pangong', 'Sham', 'Turtuk', 'General']
const CATEGORIES = ['Textiles', 'Food', 'Handicraft', 'Jewellery', 'Spiritual', 'Misc']

const CATEGORY_ICONS: Record<string, string> = {
  Textiles: '🧣', Food: '🫙', Handicraft: '🪔', Jewellery: '📿', Spiritual: '🏵', Misc: '🛍',
}
const PRIORITY: Record<string, { label: string; cls: string }> = {
  must: { label: 'Must-buy', cls: 'pill-rust' },
  nice: { label: 'Nice', cls: 'pill-gold' },
  maybe: { label: 'Maybe', cls: 'pill-sage' },
}

function inr(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

// Resize/compress an image to a small JPEG data URL (same approach as the journal).
function resizeImage(file: File, maxDim = 1000, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new window.Image()
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim }
        else if (height >= width && height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
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

export function ShopClient({ items }: { items: ShopItemT[] }) {
  const [filterArea, setFilterArea] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<ShopItemT | null>(null)
  const router = useRouter()

  const filtered = filterArea ? items.filter(i => i.area === filterArea) : items
  const acquired = items.filter(i => i.acquired).length
  const estTotal = items.reduce((s, i) => s + (i.estPriceINR ?? 0), 0)
  const spent = items.filter(i => i.acquired).reduce((s, i) => s + (i.estPriceINR ?? 0), 0)

  async function toggleAcquired(item: ShopItemT) {
    await fetch(`/api/shop/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acquired: !item.acquired }),
    })
    router.refresh()
  }

  async function remove(id: string) {
    await fetch(`/api/shop/${id}`, { method: 'DELETE' })
    router.refresh()
    toast.success('Removed')
  }

  // Group filtered items by area for display.
  const groups = AREAS
    .map(area => ({ area, items: filtered.filter(i => i.area === area) }))
    .filter(g => g.items.length > 0)

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card-base p-4 text-center">
          <div className="label-mono text-[0.55rem] text-stone mb-1">Items</div>
          <div className="font-serif text-2xl text-cream">{acquired}/{items.length}</div>
          <div className="label-mono text-[0.5rem] text-stone mt-0.5">bought</div>
        </div>
        <div className="card-base p-4 text-center">
          <div className="label-mono text-[0.55rem] text-stone mb-1">Est. total</div>
          <div className="font-serif text-2xl text-gold">{inr(estTotal)}</div>
        </div>
        <div className="card-base p-4 text-center">
          <div className="label-mono text-[0.55rem] text-stone mb-1">Spent so far</div>
          <div className="font-serif text-2xl text-rust">{inr(spent)}</div>
        </div>
      </div>

      {/* Filters + add */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <button onClick={() => setFilterArea(null)}
          className={`pill ${!filterArea ? 'pill-gold' : 'border border-gold/20 text-stone hover:text-gold'}`}>
          All areas
        </button>
        {AREAS.filter(a => items.some(i => i.area === a)).map(a => (
          <button key={a} onClick={() => setFilterArea(filterArea === a ? null : a)}
            className={`pill ${filterArea === a ? 'pill-gold' : 'border border-gold/20 text-stone hover:text-gold'}`}>
            {a}
          </button>
        ))}
        <button onClick={() => { setShowForm(v => !v); setEditItem(null) }} className="pill pill-sky ml-auto">
          + Add item
        </button>
      </div>

      {(showForm || editItem) && (
        <ItemForm
          item={editItem}
          onClose={() => { setShowForm(false); setEditItem(null) }}
        />
      )}

      {items.length === 0 && !showForm && (
        <div className="text-center py-16 text-stone">
          <div className="text-4xl mb-3">🛍</div>
          <p className="font-serif text-cream text-lg mb-2">Nothing on the list yet</p>
          <p className="text-sm">Add items above, or run the seed to load classic Ladakh buys.</p>
        </div>
      )}

      <div className="space-y-6">
        {groups.map(g => (
          <div key={g.area}>
            <div className="label-mono text-[0.65rem] text-gold border-l-2 border-gold pl-3 mb-3">
              📍 {g.area} <span className="text-stone">· {g.items.length}</span>
            </div>
            <div className="space-y-2">
              {g.items.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onToggle={() => toggleAcquired(item)}
                  onEdit={() => { setEditItem(item); setShowForm(false) }}
                  onDelete={() => remove(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ItemRow({ item, onToggle, onEdit, onDelete }: {
  item: ShopItemT; onToggle: () => void; onEdit: () => void; onDelete: () => void
}) {
  const pr = PRIORITY[item.priority] ?? PRIORITY.nice
  return (
    <div className={`card-base p-4 flex gap-3 group ${item.acquired ? 'opacity-60' : ''}`}>
      <button
        onClick={onToggle}
        aria-label={item.acquired ? 'Mark as not bought' : 'Mark as bought'}
        className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-colors ${
          item.acquired ? 'bg-sage/30 border-sage text-sage' : 'border-gold/30 text-transparent hover:border-gold'
        }`}
      >
        ✓
      </button>

      {item.photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.photo} alt="" className="w-12 h-12 object-cover rounded border border-gold/20 shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base">{CATEGORY_ICONS[item.category] ?? '🛍'}</span>
          <span className={`font-serif text-cream text-base ${item.acquired ? 'line-through' : ''}`}>{item.name}</span>
          <span className={`pill ${pr.cls}`}>{pr.label}</span>
          {item.estPriceINR != null && <span className="label-mono text-[0.55rem] text-gold">{inr(item.estPriceINR)}</span>}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="label-mono text-[0.5rem] text-stone">{item.category}</span>
          {item.whereToBuy && <span className="label-mono text-[0.5rem] text-sky">🏪 {item.whereToBuy}</span>}
        </div>
        {item.notes && <p className="text-muted text-xs mt-1 leading-relaxed">{item.notes}</p>}
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <button onClick={onEdit} className="label-mono text-[0.5rem] text-sky hover:underline opacity-0 group-hover:opacity-100 transition-opacity">edit</button>
        <button onClick={onDelete} className="label-mono text-[0.5rem] text-rust/60 hover:text-rust opacity-0 group-hover:opacity-100 transition-opacity">delete</button>
      </div>
    </div>
  )
}

function ItemForm({ item, onClose }: { item: ShopItemT | null; onClose: () => void }) {
  const [name, setName] = useState(item?.name ?? '')
  const [area, setArea] = useState(item?.area ?? 'Leh')
  const [category, setCategory] = useState(item?.category ?? 'Handicraft')
  const [estPrice, setEstPrice] = useState(item?.estPriceINR != null ? String(item.estPriceINR) : '')
  const [whereToBuy, setWhereToBuy] = useState(item?.whereToBuy ?? '')
  const [priority, setPriority] = useState(item?.priority ?? 'nice')
  const [notes, setNotes] = useState(item?.notes ?? '')
  const [photo, setPhoto] = useState<string | null>(item?.photo ?? null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      setPhoto(await resizeImage(file))
    } catch {
      toast.error('Could not process image')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      name,
      area,
      category,
      estPriceINR: estPrice ? parseInt(estPrice) : null,
      whereToBuy: whereToBuy || null,
      priority,
      notes: notes || null,
      photo,
    }
    const url = item ? `/api/shop/${item.id}` : '/api/shop'
    const method = item ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    if (res.ok) {
      toast.success(item ? 'Updated' : 'Added to list')
      onClose()
      router.refresh()
    } else {
      toast.error('Failed to save')
    }
  }

  const inputCls = 'bg-dark border border-gold/20 text-cream px-3 py-2 text-sm focus:border-gold/50 outline-none'

  return (
    <form onSubmit={handleSubmit} className="card-base p-5 mb-6 space-y-3">
      <div className="label-mono text-xs text-gold">{item ? 'Edit item' : 'Add item'}</div>
      <div className="grid md:grid-cols-2 gap-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Item name *" required className={`md:col-span-2 ${inputCls}`} />
        <select value={area} onChange={e => setArea(e.target.value)} className={inputCls}>
          {AREAS.map(a => <option key={a} value={a}>📍 {a}</option>)}
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
        </select>
        <input type="number" value={estPrice} onChange={e => setEstPrice(e.target.value)} placeholder="Est. price ₹" min="0" className={inputCls} />
        <select value={priority} onChange={e => setPriority(e.target.value)} className={inputCls}>
          <option value="must">🔴 Must-buy</option>
          <option value="nice">🟡 Nice to have</option>
          <option value="maybe">⚪ Maybe</option>
        </select>
        <input value={whereToBuy} onChange={e => setWhereToBuy(e.target.value)} placeholder="Where to buy (shop / market)" className={`md:col-span-2 ${inputCls}`} />
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (haggle hard, check for GI tag…)" rows={2} className={`md:col-span-2 resize-none ${inputCls}`} />
      </div>

      <div className="flex items-center gap-3">
        {photo && (
          <div className="relative w-16 h-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" className="w-full h-full object-cover rounded border border-gold/20" />
            <button type="button" onClick={() => setPhoto(null)} aria-label="Remove photo"
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rust text-cream text-xs flex items-center justify-center">✕</button>
          </div>
        )}
        <label className="pill border border-gold/30 text-stone hover:text-gold cursor-pointer">
          {uploading ? 'Adding…' : photo ? 'Replace photo' : '+ Photo'}
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="hidden" />
        </label>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="px-5 py-2 bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold font-mono text-xs tracking-wider uppercase transition-all disabled:opacity-50">
          {loading ? '...' : (item ? 'Update' : 'Add')}
        </button>
        <button type="button" onClick={onClose}
          className="px-5 py-2 border border-gold/10 text-stone font-mono text-xs tracking-wider uppercase hover:text-gold transition-all">
          Cancel
        </button>
      </div>
    </form>
  )
}
