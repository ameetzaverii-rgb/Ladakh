// src/components/Logo.tsx
// The Tarcho brand mark — a string of prayer flags above (or beside) the
// wordmark, set in Marcellus. Server-safe (pure SVG + text, no client hooks).

import { cn } from '@/lib/utils'

// Prayer-flag palette in the traditional left→right order (Sky · Air · Fire · Water · Earth).
const FLAGS = ['#2f6db5', '#f6f1e7', '#d24b3e', '#3e9e6e', '#e0a21b']

/** A horizontal string of five hanging rectangular prayer flags. */
export function FlagString({ width = 140, className }: { width?: number; className?: string }) {
  const n = FLAGS.length
  const w = Math.round(width * 0.15)
  const h = Math.round(w * 1.18)
  const gap = (width - n * w) / (n - 1)
  const height = h + 6
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden>
      <line x1="0" y1="3" x2={width} y2="3" stroke="#d9cdaf" strokeWidth="1.5" />
      {FLAGS.map((hex, i) => {
        const x = i * (w + gap)
        const white = hex === '#f6f1e7'
        return (
          <rect key={i} x={x} y="3" width={w} height={h} rx="2"
            fill={hex} stroke={white ? '#d9cdaf' : 'none'} strokeWidth={white ? 1 : 0} />
        )
      })}
    </svg>
  )
}

type Size = 'sm' | 'md' | 'lg' | 'xl'
const SIZES: Record<Size, { flag: number; text: string }> = {
  sm: { flag: 64, text: 'text-lg' },
  md: { flag: 120, text: 'text-2xl' },
  lg: { flag: 168, text: 'text-4xl' },
  xl: { flag: 220, text: 'text-5xl' },
}

/**
 * The Tarcho lockup.
 * - `stacked` (default): flag string centred above the wordmark — hero / sign-in.
 * - `inline`: a compact flag string beside the wordmark — mastheads / headers.
 */
export function TarchoLogo({
  size = 'md', layout = 'stacked', className, tone = 'ink',
}: {
  size?: Size; layout?: 'stacked' | 'inline'; className?: string; tone?: 'ink' | 'light'
}) {
  const { flag, text } = SIZES[size]
  const word = cn('font-display tracking-tight', text, tone === 'light' ? 'text-white' : 'text-cream')

  if (layout === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-2', className)}>
        <FlagString width={Math.round(flag * 0.5)} />
        <span className={word}>Tarcho</span>
      </span>
    )
  }

  return (
    <span className={cn('inline-flex flex-col items-center gap-1.5', className)}>
      <FlagString width={flag} />
      <span className={word}>Tarcho</span>
    </span>
  )
}
