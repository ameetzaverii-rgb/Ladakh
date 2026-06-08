'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Check, MapPin, Store, ShoppingBag, Plus, X, Pencil, Trash2,
  Shirt, UtensilsCrossed, Hammer, Gem, Sparkles, Package, Heart, type LucideIcon,
} from 'lucide-react'
import { ShopDiscover } from './ShopDiscover'

export type ShopItemT = {
  id: string; name: string; area: string; category: string;
  estPriceINR: number | null; whereToBuy: string | null; priority: string;
  acquired: boolean; notes: string | null; photo: string | null;
}

const AREAS = ['Leh', 'Nubra', 'Pangong', 'Sham', 'Turtuk', 'General']
const CATEGORIES = ['Textiles', 'Food', 'Handicraft', 'Jewellery', 'Spiritual', 'Misc']

const CATEGORY_ICON: Record<string, LucideIcon> = {
  Textiles: Shirt, Food: UtensilsCrossed, Handicraft: Hammer, Jewellery: Gem, Spiritual: Sparkles, Misc: Package,
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

export function ShopClient({ items, ideaImages = {} }: { items: ShopItemT[]; ideaImages?: Record<string, string> }) {
  const [filterArea, setFilterArea] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<ShopItemT | null>(null)
  // Start on the swipe deck when the list is still empty.
  const [tab, setTab] = useState<'list' | 'discover'>(items.length ? 'list' : 'discover')
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

  const groups = AREAS
    .map(area => ({ area, items: filtered.filter(i => i.area === area) }))
    .filter(g => g.items.length > 0)

  return (
    <div>
      {/* Tabs: my list vs discover ideas */}
      <div className="mb-6 inline-flex gap-1 rounded-full bg-[#f1efe9] p-1">
        <button onClick={() => setTab('list')}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${tab === 'list' ? 'bg-white text-cream shadow-soft' : 'text-stone hover:text-cream'}`}>
          <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2.2} /> My list
        </button>
        <button onClick={() => setTab('discover')}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${tab === 'discover' ? 'bg-white text-cream shadow-soft' : 'text-stone hover:text-cream'}`}>
          <Heart className="h-3.5 w-3.5" strokeWidth={2.2} /> Discover ideas
        </button>
      </div>

      {tab === 'discover' ? (
        <ShopDiscover existingNames={items.map(i => i.name)} images={ideaImages} />
      ) : (
      <>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="card-base p-3 text-center sm:p-4">
          <div className="mb-1 text-[0.6rem] font-semibold uppercase tracking-wide text-stone">Items</div>
          <div className="text-2xl font-extrabold tabular-nums text-cream">{acquired}/{items.length}</div>
          <div className="mt-0.5 text-[0.6rem] text-stone">bought</div>
        </div>
        <div className="card-base p-3 text-center sm:p-4">
          <div className="mb-1 text-[0.6rem] font-semibold uppercase tracking-wide text-stone">Est. total</div>
          <div className="text-lg font-extrabold tabular-nums text-gold sm:text-2xl">{inr(estTotal)}</div>
        </div>
        <div className="card-base p-3 text-center sm:p-4">
          <div className="mb-1 text-[0.6rem] font-semibold uppercase tracking-wide text-stone">Spent so far</div>
          <div className="text-lg font-extrabold tabular-nums text-rust sm:text-2xl">{inr(spent)}</div>
        </div>
      </div>

      {/* Filters + add */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Chip active={!filterArea} onClick={() => setFilterArea(null)} label="All areas" />
        {AREAS.filter(a => items.some(i => i.area === a)).map(a => (
          <Chip key={a} active={filterArea === a} onClick={() => setFilterArea(filterArea === a ? null : a)} label={a} />
        ))}
        <button onClick={() => { setShowForm(v => !v); setEditItem(null) }}
          className="press ml-auto inline-flex items-center gap-1 rounded-full bg-flag-yellow px-3 py-1.5 text-xs font-bold text-white">
          <Plus className="h-3.5 w-3.5" /> Add item
        </button>
      </div>

      {(showForm || editItem) && (
        <ItemForm item={editItem} onClose={() => { setShowForm(false); setEditItem(null) }} />
      )}

      {items.length === 0 && !showForm && (
        <div className="py-16 text-center text-stone">
          <ShoppingBag className="mx-auto mb-3 h-9 w-9 text-muted" />
          <p className="mb-1 text-lg font-bold text-cream">Nothing on the list yet</p>
          <p className="mb-4 text-sm">Swipe through classic Ladakh buys and keep the ones you want.</p>
          <button onClick={() => setTab('discover')}
            className="press inline-flex items-center gap-1.5 rounded-full bg-flag-yellow px-4 py-2 text-sm font-bold text-white">
            <Heart className="h-4 w-4" /> Discover ideas
          </button>
        </div>
      )}

      <div className="space-y-6">
        {groups.map(g => (
          <div key={g.area}>
            <div className="mb-3 flex items-center gap-1.5 text-sm font-bold text-cream">
              <MapPin className="h-4 w-4 text-flag-yellow" /> {g.area}
              <span className="text-xs font-medium text-stone">· {g.items.length}</span>
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
      </>
      )}
    </div>
  )
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`press rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? 'border-transparent text-white' : 'border-border bg-white text-stone hover:text-cream'
      }`}
      style={active ? { background: '#2a3140' } : undefined}
    >
      {label}
    </button>
  )
}

function ItemRow({ item, onToggle, onEdit, onDelete }: {
  item: ShopItemT; onToggle: () => void; onEdit: () => void; onDelete: () => void
}) {
  const pr = PRIORITY[item.priority] ?? PRIORITY.nice
  const Icon = CATEGORY_ICON[item.category] ?? Package
  return (
    <div className={`group card-base flex gap-3 p-4 ${item.acquired ? 'opacity-60' : ''}`}>
      <button
        onClick={onToggle}
        aria-label={item.acquired ? 'Mark as not bought' : 'Mark as bought'}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
          item.acquired ? 'border-sage bg-sage text-white' : 'border-border text-transparent hover:border-gold-mid'
        }`}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </button>

      {item.photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.photo} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-border object-cover" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-flag-yellow" />
          <span className={`text-base font-bold text-cream ${item.acquired ? 'line-through' : ''}`}>{item.name}</span>
          <span className={`pill ${pr.cls}`}>{pr.label}</span>
          {item.estPriceINR != null && <span className="text-xs font-bold tabular-nums text-gold">{inr(item.estPriceINR)}</span>}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.7rem] text-stone">
          <span>{item.category}</span>
          {item.whereToBuy && <span className="inline-flex items-center gap-0.5 text-sky"><Store className="h-3 w-3" /> {item.whereToBuy}</span>}
        </div>
        {item.notes && <p className="mt-1 text-xs leading-relaxed text-muted">{item.notes}</p>}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={onEdit} aria-label="Edit" className="text-muted hover:text-cream"><Pencil className="h-3.5 w-3.5" /></button>
        <button onClick={onDelete} aria-label="Delete" className="text-muted hover:text-rust"><Trash2 className="h-3.5 w-3.5" /></button>
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
      name, area, category,
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

  const inputCls = 'rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none'

  return (
    <form onSubmit={handleSubmit} className="card-base mb-6 space-y-3 p-5">
      <div className="text-sm font-bold text-cream">{item ? 'Edit item' : 'Add item'}</div>
      <div className="grid gap-3 md:grid-cols-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Item name *" required className={`md:col-span-2 ${inputCls}`} />
        <select value={area} onChange={e => setArea(e.target.value)} className={inputCls}>
          {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" value={estPrice} onChange={e => setEstPrice(e.target.value)} placeholder="Est. price ₹" min="0" className={`tabular-nums ${inputCls}`} />
        <select value={priority} onChange={e => setPriority(e.target.value)} className={inputCls}>
          <option value="must">Must-buy</option>
          <option value="nice">Nice to have</option>
          <option value="maybe">Maybe</option>
        </select>
        <input value={whereToBuy} onChange={e => setWhereToBuy(e.target.value)} placeholder="Where to buy (shop / market)" className={`md:col-span-2 ${inputCls}`} />
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (haggle hard, check for GI tag…)" rows={2} className={`md:col-span-2 resize-none ${inputCls}`} />
      </div>

      <div className="flex items-center gap-3">
        {photo && (
          <div className="relative h-16 w-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" className="h-full w-full rounded-lg border border-border object-cover" />
            <button type="button" onClick={() => setPhoto(null)} aria-label="Remove photo"
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rust text-white">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <label className="press inline-flex cursor-pointer items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-stone hover:text-cream">
          <Plus className="h-3.5 w-3.5" /> {uploading ? 'Adding…' : photo ? 'Replace photo' : 'Photo'}
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="hidden" />
        </label>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={loading}
          className="press rounded-lg bg-flag-yellow px-5 py-2 text-xs font-bold uppercase tracking-wide text-white transition-[filter] hover:brightness-110 disabled:opacity-50">
          {loading ? '...' : (item ? 'Update' : 'Add')}
        </button>
        <button type="button" onClick={onClose}
          className="rounded-lg border border-border px-5 py-2 text-xs font-semibold uppercase tracking-wide text-stone hover:text-cream">
          Cancel
        </button>
      </div>
    </form>
  )
}
