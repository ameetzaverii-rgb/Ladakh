'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, X, ChevronRight } from 'lucide-react'
import { FLAG } from '@/lib/utils'

export interface TodayPlan {
  day: number
  title: string
  isWorkDay: boolean
  isTrekDay: boolean
  isFestivalDay: boolean
  isExcursionDay: boolean
}

function reminderFor(p: TodayPlan): { tip: string; color: string } {
  if (p.isFestivalDay) return { tip: 'Festival today — arrive early for the Cham dances.', color: FLAG.red }
  if (p.isTrekDay) return { tip: 'Trek day — carry water, layers and sun protection.', color: FLAG.green }
  if (p.isExcursionDay) return { tip: 'Excursion — carry your Inner Line Permit and a photo ID.', color: FLAG.yellow }
  return { tip: 'Work this morning, then explore the afternoon.', color: FLAG.blue }
}

const todayKey = () => new Date().toISOString().slice(0, 10)

export function DailyAlert({ plan }: { plan: TodayPlan }) {
  const [show, setShow] = useState(false)

  // Once-a-day: stays dismissed only for the current date, returns tomorrow.
  useEffect(() => {
    try {
      setShow(localStorage.getItem('dailyAlertDismissed') !== todayKey())
    } catch {
      setShow(true)
    }
  }, [])

  if (!show) return null
  const { tip, color } = reminderFor(plan)

  function dismiss() {
    try { localStorage.setItem('dailyAlertDismissed', todayKey()) } catch {}
    setShow(false)
  }

  return (
    <div className="reveal mb-5 overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
      <div className="h-1.5 w-full" style={{ background: color }} />
      <div className="flex items-start gap-3 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}1a` }}>
          <Bell className="h-5 w-5" style={{ color }} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[0.62rem] font-bold uppercase tracking-wide" style={{ color }}>
            Today · Day {plan.day} of 21
          </div>
          <div className="truncate text-sm font-bold text-cream">{plan.title}</div>
          <div className="mt-0.5 text-xs text-stone">{tip}</div>
          <Link href="/itinerary" className="mt-1.5 inline-flex items-center gap-0.5 text-xs font-semibold" style={{ color }}>
            Open today’s plan <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 text-muted hover:text-cream">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
