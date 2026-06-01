'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { toast } from 'sonner'

type ParsedCommand =
  | { type: 'expense'; amount: number; category: string; description: string; place?: string }
  | { type: 'journal'; content: string }
  | { type: 'navigate'; href: string }
  | { type: 'unknown' }

function parseCommand(input: string): ParsedCommand {
  const lower = input.toLowerCase().trim()

  // spent 350 food tibetan kitchen
  const spentMatch = lower.match(/^(spent|expense|paid|₹)\s+(\d+)\s+(.+)/)
  if (spentMatch) {
    const amount = parseInt(spentMatch[2])
    const rest = spentMatch[3].split(' ')
    const catMap: Record<string, string> = {
      food: 'FOOD', lunch: 'FOOD', dinner: 'FOOD', breakfast: 'FOOD', cafe: 'FOOD', coffee: 'FOOD',
      taxi: 'TRANSPORT', transport: 'TRANSPORT', auto: 'TRANSPORT', bike: 'TRANSPORT',
      hotel: 'ACCOMMODATION', stay: 'ACCOMMODATION', room: 'ACCOMMODATION',
      trek: 'TREK', hike: 'TREK',
      permit: 'PERMITS', ilp: 'PERMITS',
      shop: 'SHOPPING', shopping: 'SHOPPING', market: 'SHOPPING', bazaar: 'SHOPPING',
      health: 'HEALTH', medicine: 'HEALTH', medical: 'HEALTH',
    }
    const cat = catMap[rest[0]] || 'MISC'
    const description = rest.slice(cat !== 'MISC' ? 1 : 0).join(' ') || rest[0]
    return { type: 'expense', amount, category: cat, description: description || rest[0], place: rest.slice(1).join(' ') }
  }

  // journal day 3: ...
  const journalMatch = lower.match(/^(journal|log|note|j:)\s*(.+)/)
  if (journalMatch) {
    return { type: 'journal', content: input.replace(/^(journal|log|note|j:)\s*/i, '') }
  }

  // Navigation shortcuts
  const navMap: Record<string, string> = {
    dashboard: '/', home: '/',
    prep: '/prep', checklist: '/prep',
    itinerary: '/itinerary', plan: '/itinerary',
    journal: '/journal',
    budget: '/budget', spend: '/budget',
    stays: '/stays', hotel: '/stays',
    treks: '/treks', trek: '/treks',
    transport: '/transport', taxi: '/transport',
    food: '/food', cafes: '/food',
    events: '/events', festivals: '/events',
    flights: '/flights', flight: '/flights',
    admin: '/admin',
  }
  if (navMap[lower]) return { type: 'navigate', href: navMap[lower] }

  return { type: 'unknown' }
}

export function CommandBar() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(v => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleSelect = useCallback(async (value: string) => {
    const parsed = parseCommand(value || input)
    setOpen(false)
    setInput('')

    if (parsed.type === 'navigate') {
      router.push(parsed.href)
      return
    }

    if (parsed.type === 'expense') {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountINR: parsed.amount,
          category: parsed.category,
          description: parsed.description,
          place: parsed.place,
          date: new Date().toISOString(),
          tripDay: 1,
          paymentMode: 'cash',
        }),
      })
      if (res.ok) {
        toast.success(`₹${parsed.amount} logged — ${parsed.description}`)
      } else {
        toast.error('Failed to log expense')
      }
      return
    }

    if (parsed.type === 'journal') {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: parsed.content,
          date: new Date().toISOString(),
          tripDay: 1,
        }),
      })
      if (res.ok) {
        toast.success('Journal entry saved')
        router.push('/journal')
      } else {
        toast.error('Failed to save journal entry')
      }
      return
    }

    // Unknown — try direct nav
    toast.info(`Try: "spent 350 food tibetan kitchen" or "journal today was amazing"`)
  }, [input, router])

  const QUICK_COMMANDS = [
    { label: 'Log expense', example: 'spent 350 food tibetan kitchen', group: 'Quick Entry' },
    { label: 'Journal entry', example: 'journal hiked to shanti stupa today', group: 'Quick Entry' },
    { label: 'Go to Prep Checklist', example: 'prep', group: 'Navigate' },
    { label: 'Go to Budget', example: 'budget', group: 'Navigate' },
    { label: 'Go to Itinerary', example: 'itinerary', group: 'Navigate' },
    { label: 'Go to Journal', example: 'journal', group: 'Navigate' },
    { label: 'Go to Flights', example: 'flights', group: 'Navigate' },
    { label: 'Go to Treks', example: 'treks', group: 'Navigate' },
  ]

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-dark/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl mx-4" onClick={e => e.stopPropagation()}>
        <Command
          className="rounded-none border border-gold/30 bg-deep overflow-hidden shadow-2xl"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          <div className="flex items-center border-b border-gold/20 px-4">
            <span className="text-gold mr-3 font-mono text-xs">⌘</span>
            <Command.Input
              value={input}
              onValueChange={setInput}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSelect(input)
              }}
              placeholder="spent 350 food · journal today... · or type a page name"
              className="flex-1 py-4 bg-transparent text-cream placeholder-stone/50 outline-none text-sm font-sans"
              autoFocus
            />
            <kbd className="font-mono text-[0.55rem] text-stone border border-stone/30 px-1.5 py-0.5">ESC</kbd>
          </div>
          <Command.List className="max-h-64 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-stone text-sm">
              Press Enter to run: <span className="text-gold">"{input}"</span>
            </Command.Empty>
            {['Quick Entry', 'Navigate'].map(group => (
              <Command.Group
                key={group}
                heading={group}
                className="mb-2"
              >
                {QUICK_COMMANDS.filter(c => c.group === group).map(cmd => (
                  <Command.Item
                    key={cmd.example}
                    value={cmd.example}
                    onSelect={() => handleSelect(cmd.example)}
                    className="flex items-center justify-between px-3 py-2 rounded cursor-pointer group"
                  >
                    <span className="text-sand text-sm">{cmd.label}</span>
                    <code className="text-stone group-aria-selected:text-gold text-[0.6rem] font-mono ml-4 shrink-0">
                      {cmd.example}
                    </code>
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
          <div className="border-t border-gold/10 px-4 py-2 flex gap-4 text-[0.6rem] font-mono text-stone">
            <span><kbd className="border border-stone/30 px-1">↵</kbd> run</span>
            <span><kbd className="border border-stone/30 px-1">↑↓</kbd> navigate</span>
            <span><kbd className="border border-stone/30 px-1">esc</kbd> close</span>
          </div>
        </Command>
      </div>
    </div>
  )
}
