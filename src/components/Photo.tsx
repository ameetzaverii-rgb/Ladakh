import Link from 'next/link'
import { FLAG, FLAG_TINT, type FlagColor } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

/** A category card backed by a photo (falls back to a colour tint if no image). */
export function PhotoTile({
  href, src, color, icon: Icon, title, sub, className = '', heightClass = 'h-32',
}: {
  href: string
  src: string | null
  color: FlagColor
  icon: LucideIcon
  title: string
  sub?: string
  className?: string
  heightClass?: string
}) {
  return (
    <Link
      href={href}
      className={`group press relative block overflow-hidden rounded-2xl shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${heightClass} ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={title} loading="lazy" className="img-zoom absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ background: FLAG_TINT[color] }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <span
        className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl shadow"
        style={{ background: FLAG[color] }}
      >
        <Icon className="h-[18px] w-[18px] text-white" strokeWidth={2.3} />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="text-base font-extrabold leading-tight text-white drop-shadow">{title}</div>
        {sub && <div className="truncate text-xs text-white/80">{sub}</div>}
      </div>
    </Link>
  )
}

/** A photo banner for the top of a section page, with the title overlaid. */
export function CategoryHero({
  src, color, title, subtitle, icon: Icon,
}: {
  src: string | null
  color: FlagColor
  title: string
  subtitle?: string
  icon?: LucideIcon
}) {
  return (
    <div className="reveal group relative mb-6 h-40 overflow-hidden rounded-2xl shadow-soft md:h-52">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={title} className="img-zoom absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(120deg, ${FLAG[color]}, ${FLAG_TINT[color]})` }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
      <span className="absolute left-4 top-4 h-1.5 w-12 rounded-full" style={{ background: FLAG[color] }} />
      <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-5">
        {Icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow" style={{ background: FLAG[color] }}>
            <Icon className="h-6 w-6 text-white" strokeWidth={2.2} />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-extrabold leading-none text-white drop-shadow md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 max-w-xl text-sm text-white/85 drop-shadow">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
