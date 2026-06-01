import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
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

export const CATEGORY_COLORS: Record<string, string> = {
  ACCOMMODATION: '#c9993a',
  FOOD: '#6b7c5e',
  TRANSPORT: '#5a8fa3',
  TREK: '#b85c38',
  PERMITS: '#8b7355',
  SHOPPING: '#9b6b9b',
  HEALTH: '#e07050',
  WORK: '#4a8fa3',
  MISC: '#666',
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
