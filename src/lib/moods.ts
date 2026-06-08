// src/lib/moods.ts
// Shared mood scale rendered as lucide faces (no emoji).
import { Angry, Frown, Meh, Smile, Laugh, type LucideIcon } from 'lucide-react'

export interface Mood {
  value: number
  Icon: LucideIcon
  color: string
  label: string
}

export const MOODS: Mood[] = [
  { value: 1, Icon: Angry, color: '#d24b3e', label: 'Rough' },
  { value: 2, Icon: Frown, color: '#e0a21b', label: 'Meh' },
  { value: 3, Icon: Meh, color: '#8c92a0', label: 'Okay' },
  { value: 4, Icon: Smile, color: '#3e9e6e', label: 'Good' },
  { value: 5, Icon: Laugh, color: '#2f6db5', label: 'Great' },
]

export function moodFor(value: number | null | undefined): Mood | null {
  if (!value) return null
  return MOODS.find(m => m.value === value) ?? null
}
