'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Theme = 'dark' | 'light'

// Toggles between the default desert-night (dark) theme and the lighter,
// parchment "traditional Ladakh" theme. Choice persists in localStorage and
// is applied before paint by the inline script in the root layout.
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const current =
      document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
    setTheme(current)
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    if (next === 'light') document.documentElement.setAttribute('data-theme', 'light')
    else document.documentElement.removeAttribute('data-theme')
    try {
      localStorage.setItem('theme', next)
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Light (traditional) theme' : 'Dark (desert night) theme'}
      className={cn(
        'shrink-0 px-2 py-1 text-sm text-stone hover:text-gold transition-colors',
        className
      )}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
