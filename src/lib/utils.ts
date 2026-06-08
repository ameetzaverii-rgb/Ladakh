import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Drop a trailing ".0" so amounts read cleanly (₹1.5L, ₹27K, ₹950).
function trim(n: number): string {
  return n.toFixed(1).replace(/\.0$/, '')
}
export function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${trim(amount / 100000)}L`
  if (amount >= 1000) return `₹${trim(amount / 1000)}K`
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatINRFull(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function daysUntil(date: Date | string): number {
  const target = typeof date === 'string' ? parseISO(date) : date
  return differenceInDays(target, new Date())
}

export function tripDayFromDate(tripStart: Date, date: Date): number {
  return differenceInDays(date, tripStart) + 1
}

export function formatDate(date: Date | string, fmt = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

/* ── Tibetan prayer-flag colour system ──
   Five flag colours, each mapped to a kind of activity. */
export const FLAG = {
  blue: '#2f6db5',   // plan & logistics
  red: '#d24b3e',    // culture & food
  green: '#3e9e6e',  // treks & nature
  yellow: '#e0a21b', // money & shopping
  ink: '#3a4150',    // journal & diary
} as const

export const FLAG_TINT = {
  blue: '#e7f0fa',
  red: '#fbe9e7',
  green: '#e7f4ee',
  yellow: '#fbf0d8',
  ink: '#eceef2',
} as const

export type FlagColor = keyof typeof FLAG

/** Theme (accent + tint) for a top-level section of the app. */
export const SECTION_THEME: Record<string, FlagColor> = {
  itinerary: 'blue', stays: 'blue', transport: 'blue', flights: 'blue', prep: 'blue',
  events: 'red', food: 'red',
  treks: 'green',
  budget: 'yellow', shop: 'yellow', contribute: 'yellow',
  journal: 'ink', diary: 'ink',
}

export function sectionFlag(key: string): FlagColor {
  return SECTION_THEME[key] ?? 'ink'
}

export const CATEGORY_COLORS: Record<string, string> = {
  ACCOMMODATION: FLAG.blue,
  FOOD: FLAG.red,
  TRANSPORT: '#2aa6a0',
  TREK: FLAG.green,
  PERMITS: '#6b7280',
  SHOPPING: FLAG.yellow,
  HEALTH: '#e07a50',
  WORK: '#7c5cbc',
  MISC: '#8c92a0',
}

export const CATEGORY_ICONS: Record<string, string> = {
  FLIGHTS: '✈️',
  ACCOMMODATION: '🏨',
  TRANSPORT: '🚗',
  PERMITS: '📋',
  GEAR: '🎒',
  HEALTH: '💊',
  DOCUMENTS: '🗂️',
  WORK_SETUP: '💻',
  MONEY: '💳',
  MISC: '📌',
  FOOD: '🍜',
  TREK: '🥾',
  SHOPPING: '🛍️',
}

export const PHASE_LABELS: Record<string, string> = {
  ASAP: 'Book Now',
  MONTH_BEFORE: '1 Month Before',
  TWO_WEEKS_BEFORE: '2 Weeks Before',
  WEEK_BEFORE: '1 Week Before',
  DAY_BEFORE: 'Day Before',
  ON_TRIP: 'On Trip',
}

export const PHASE_ORDER = ['ASAP', 'MONTH_BEFORE', 'TWO_WEEKS_BEFORE', 'WEEK_BEFORE', 'DAY_BEFORE', 'ON_TRIP']

export const MOOD_LABELS: Record<number, string> = {
  1: '😔 Rough',
  2: '😐 Okay',
  3: '🙂 Good',
  4: '😊 Great',
  5: '🤩 Epic',
}
