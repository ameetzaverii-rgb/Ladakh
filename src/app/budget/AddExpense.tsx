'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CATEGORY_ICONS } from '@/lib/utils'

const HIDDEN = ['FLIGHTS', 'ACCOMMODATION', 'PERMITS', 'GEAR', 'DOCUMENTS', 'WORK_SETUP', 'MONEY']

// Prominent "log an expense" form pinned to the top of the Budget page.
export function AddExpense() {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('FOOD')
  const [description, setDescription] = useState('')
  const [place, setPlace] = useState('')
  const [tripDay, setTripDay] = useState('1')
  const [paymentMode, setPaymentMode] = useState('cash')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountINR: parseInt(amount),
        category,
        description,
        place: place || null,
        tripDay: parseInt(tripDay),
        paymentMode,
        date: new Date().toISOString(),
      }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success(`₹${amount} logged!`)
      setAmount(''); setDescription(''); setPlace('')
      router.refresh()
    } else {
      toast.error('Failed to save')
    }
  }

  const inputCls = 'rounded-lg border border-border bg-white text-cream px-3 py-2 text-sm focus:border-gold-mid outline-none'

  return (
    <div className="card-base p-5 mb-6 border-gold/30 bg-gold/[0.04]">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between"
        aria-expanded={open}
      >
        <span className="label-mono text-xs text-gold">＋ Log an expense</span>
        <span className="label-mono text-[0.6rem] text-stone">{open ? 'Hide' : 'Tap to add'}</span>
      </button>

      {/* Quick-amount row, always visible so adding is one tap away */}
      {!open && (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2 flex-wrap">
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="Amount ₹" required min="1" className={`w-28 ${inputCls}`} />
          <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
            {Object.keys(CATEGORY_ICONS).filter(c => !HIDDEN.includes(c)).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)}
            placeholder="On what? *" required className={`flex-1 min-w-[8rem] ${inputCls}`} />
          <button type="submit" disabled={loading}
            className="px-5 py-2 rounded-lg bg-gold text-white font-semibold text-xs tracking-wide uppercase transition-[filter] hover:brightness-110 disabled:opacity-50">
            {loading ? '...' : 'Add'}
          </button>
        </form>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="Amount ₹" required min="1" className={inputCls} />
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
              {Object.keys(CATEGORY_ICONS).filter(c => !HIDDEN.includes(c)).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input type="number" value={tripDay} onChange={e => setTripDay(e.target.value)}
              placeholder="Trip Day #" min="1" max="30" className={inputCls} />
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Description *" required className={`md:col-span-2 ${inputCls}`} />
            <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className={inputCls}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </select>
            <input type="text" value={place} onChange={e => setPlace(e.target.value)}
              placeholder="Place (optional)" className={`md:col-span-3 ${inputCls}`} />
          </div>
          <button type="submit" disabled={loading}
            className="px-5 py-2 rounded-lg bg-gold text-white font-semibold text-xs tracking-wide uppercase transition-[filter] hover:brightness-110 disabled:opacity-50">
            {loading ? '...' : 'Log Expense'}
          </button>
        </form>
      )}
    </div>
  )
}
