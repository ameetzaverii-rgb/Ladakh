'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Wallet, BookOpen, type LucideIcon } from 'lucide-react'
import { PLACE_OPTIONS, HIGHLIGHT_OPTIONS } from '@/lib/options'
import { MOODS } from '@/lib/moods'

type Tab = 'expense' | 'journal'

function mergeTag(current: string, tag: string): string {
  const arr = current.split(',').map(s => s.trim()).filter(Boolean)
  if (!arr.includes(tag)) arr.push(tag)
  return arr.join(', ')
}

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'expense', label: 'Log expense', icon: Wallet },
  { id: 'journal', label: 'Quick journal', icon: BookOpen },
]

export function QuickActions() {
  const [tab, setTab] = useState<Tab>('expense')
  const router = useRouter()

  return (
    <div className="card-base mb-8 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-3 pt-3">
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
                active ? 'border-gold text-cream' : 'border-transparent text-stone hover:text-cream'
              }`}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          )
        })}
        <span className="ml-auto hidden pr-1 text-[0.7rem] text-muted sm:block">⌘K for command bar</span>
      </div>
      <div className="p-4">
        {tab === 'expense' ? <ExpenseForm /> : <JournalForm />}
      </div>
      <datalist id="qa-place">{PLACE_OPTIONS.map(p => <option key={p} value={p} />)}</datalist>
    </div>
  )
}

function ExpenseForm() {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('FOOD')
  const [description, setDescription] = useState('')
  const [place, setPlace] = useState('')
  const [paymentMode, setPaymentMode] = useState('cash')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description) return
    setLoading(true)
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountINR: parseInt(amount),
        category,
        description,
        place: place || null,
        paymentMode,
        date: new Date().toISOString(),
        tripDay: 1,
      }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success(`₹${amount} logged — ${description}`)
      setAmount('')
      setDescription('')
      setPlace('')
    } else {
      toast.error('Failed to save expense')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1">
        <label className="label-mono text-[0.55rem]">Amount (₹)</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="350"
          required
          className="rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm w-28 focus:border-gold-mid outline-none tabular-nums"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="label-mono text-[0.55rem]">Category</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="rounded-lg border border-border bg-white text-sand px-3 py-2 text-sm focus:border-gold-mid outline-none"
        >
          {['FOOD','TRANSPORT','ACCOMMODATION','TREK','PERMITS','SHOPPING','HEALTH','WORK','MISC'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-32">
        <label className="label-mono text-[0.55rem]">Description</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Thukpa at Tibetan Kitchen"
          required
          className="rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="label-mono text-[0.55rem]">Place (opt)</label>
        <input
          type="text"
          list="qa-place"
          value={place}
          onChange={e => setPlace(e.target.value)}
          placeholder="Pick or type…"
          className="rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm w-36 focus:border-gold-mid outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="label-mono text-[0.55rem]">Payment</label>
        <select
          value={paymentMode}
          onChange={e => setPaymentMode(e.target.value)}
          className="rounded-lg border border-border bg-white text-sand px-3 py-2 text-sm focus:border-gold-mid outline-none"
        >
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2 rounded-lg bg-gold text-white font-semibold text-xs tracking-wide uppercase transition-[filter] hover:brightness-110 disabled:opacity-50"
      >
        {loading ? '...' : 'Log'}
      </button>
    </form>
  )
}

function JournalForm() {
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<string>('3')
  const [location, setLocation] = useState('')
  const [highlights, setHighlights] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content) return
    setLoading(true)
    const res = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        mood: parseInt(mood),
        location: location || null,
        highlights: highlights ? highlights.split(',').map(s => s.trim()).filter(Boolean) : [],
        date: new Date().toISOString(),
        tripDay: 1,
      }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Journal entry saved!')
      setContent('')
      setLocation('')
      setHighlights('')
      router.refresh()
    } else {
      toast.error('Failed to save entry')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex gap-1.5">
          {MOODS.map(m => {
            const on = mood === String(m.value)
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(String(m.value))}
                title={m.label}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${on ? 'border-transparent' : 'border-border hover:border-gold-mid'}`}
                style={on ? { background: m.color } : undefined}
              >
                <m.Icon className="h-5 w-5" style={{ color: on ? '#fff' : m.color }} />
              </button>
            )
          })}
        </div>
        <input
          type="text"
          list="qa-place"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Location — pick or type…"
          className="rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm flex-1 min-w-40 focus:border-gold-mid outline-none"
        />
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="What happened today? How did you feel? What surprised you?"
        rows={4}
        required
        className="w-full rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none resize-none leading-relaxed"
      />
      <div>
        <label className="label-mono text-[0.55rem]">Highlights</label>
        <div className="my-2 flex flex-wrap gap-1.5">
          {HIGHLIGHT_OPTIONS.slice(0, 8).map(tag => (
            <button key={tag} type="button" onClick={() => setHighlights(h => mergeTag(h, tag))}
              className="press rounded-full border border-border bg-white px-2.5 py-1 text-[0.68rem] font-medium text-stone hover:border-gold-mid hover:text-cream">
              + {tag}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-3">
          <input
            type="text"
            value={highlights}
            onChange={e => setHighlights(e.target.value)}
            placeholder="Tap chips, or type your own…"
            className="flex-1 rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-gold text-white font-semibold text-xs tracking-wide uppercase transition-[filter] hover:brightness-110 disabled:opacity-50"
          >
            {loading ? '...' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  )
}
