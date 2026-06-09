import { db } from '@/lib/db'
import Link from 'next/link'
import { format } from 'date-fns'
import { DAY_LOCATIONS } from '@/lib/locations'
import { getDayWeather, type DayWeather } from '@/lib/weather'
import { activeDestinationId } from '@/lib/destination'

export const dynamic = 'force-dynamic'

function isoForDay(start: Date, dayNumber: number): string {
  const d = new Date(start)
  d.setUTCDate(d.getUTCDate() + (dayNumber - 1))
  return d.toISOString().slice(0, 10)
}

// A bright "look" per day so no two diary pages feel the same.
const THEMES = [
  { bg: '#fff3e0', accent: '#e8590c', ink: '#5a2a00', sticker: '🏔️' },
  { bg: '#e7f5ff', accent: '#1c7ed6', ink: '#0b3a5e', sticker: '🦋' },
  { bg: '#fff0f6', accent: '#d6336c', ink: '#5e0b35', sticker: '🌸' },
  { bg: '#ebfbee', accent: '#2f9e44', ink: '#0b3d1a', sticker: '🌿' },
  { bg: '#fff9db', accent: '#f08c00', ink: '#5e3a00', sticker: '☀️' },
  { bg: '#f3f0ff', accent: '#7048e8', ink: '#35136e', sticker: '🪕' },
  { bg: '#e6fcf5', accent: '#0ca678', ink: '#0a3d2e', sticker: '🧘' },
]
const ROTATIONS = [-1.5, 1.2, -0.8, 1.6, -1.1, 0.9, -1.4]
const PHOTO_ROT = [-5, 4, -3, 6, -4, 3]

type Journal = {
  id: string; tripDay: number; title: string | null; content: string;
  mood: number | null; highlights: string[]; photos: string[]
}
type Expense = { id: string; tripDay: number; amountINR: number; category: string; description: string }

const MOODS = ['😔', '😐', '🙂', '😊', '🤩']

export default async function DiaryPage() {
  const destinationId = await activeDestinationId()
  const [itinerary, journals, expenses, config] = await Promise.all([
    db.itineraryDay.findMany({ where: { destinationId }, orderBy: { dayNumber: 'asc' } }),
    db.journalEntry.findMany({ where: { destinationId }, orderBy: { date: 'asc' } }) as unknown as Promise<Journal[]>,
    db.expense.findMany({ where: { destinationId } }) as unknown as Promise<Expense[]>,
    db.tripConfig.findFirst().catch(() => null),
  ])

  const startDate = config?.tripStartDate ?? new Date('2026-07-22')
  const totalDays = Math.max(itinerary.filter((d: any) => !d.isCustom).length, 21)

  // Live weather per day (parallel, same as the itinerary page).
  const weather: Record<number, DayWeather | null> = {}
  await Promise.all(
    Array.from({ length: totalDays }, (_, i) => i + 1).map(async n => {
      const loc = DAY_LOCATIONS[n]
      if (loc) weather[n] = await getDayWeather(loc.lat, loc.lng, isoForDay(startDate, n))
    })
  )

  const days = Array.from({ length: totalDays }, (_, i) => i + 1)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="label-mono text-xs text-gold mb-2">Daily Scrapbook</div>
        <h1 className="section-title mb-1">The <em className="text-gold italic">21-Day Diary</em></h1>
        <p className="text-stone text-sm">
          One bright page per day — your journal, photos, mood, spend and highlights, collaged together.
          Pages fill in automatically as you log things in the Journal &amp; Budget.
        </p>
      </div>

      <div className="space-y-8">
        {days.map(n => {
          const theme = THEMES[(n - 1) % THEMES.length]
          const rot = ROTATIONS[(n - 1) % ROTATIONS.length]
          const itin = itinerary.find(d => d.dayNumber === n)
          const js = journals.filter(j => j.tripDay === n)
          const photos = js.flatMap(j => j.photos).slice(0, 6)
          const exps = expenses.filter(e => e.tripDay === n)
          const spend = exps.reduce((s, e) => s + e.amountINR, 0)
          const mood = js.find(j => j.mood)?.mood ?? null
          const highlights = js.flatMap(j => j.highlights).slice(0, 6)
          const loc = DAY_LOCATIONS[n]
          const w = weather[n]
          const blurb = js.map(j => j.content).join(' ').trim() || itin?.description || ''
          const headline = js.find(j => j.title)?.title || itin?.title || `Day ${n}`
          const hasLog = js.length > 0 || exps.length > 0

          return (
            <article
              key={n}
              style={{ background: theme.bg, color: theme.ink, transform: `rotate(${rot}deg)` }}
              className="relative rounded-2xl shadow-xl p-6 md:p-8"
            >
              {/* tape */}
              <div className="absolute -top-2 left-8 w-16 h-5 bg-white/50 rotate-[-4deg] rounded-sm shadow-sm" />
              <div className="absolute top-4 right-5 text-3xl select-none">{theme.sticker}</div>

              {/* header */}
              <div className="flex items-end gap-3 mb-3">
                <div className="font-serif font-light leading-none" style={{ color: theme.accent, fontSize: '3.5rem' }}>
                  {n}
                </div>
                <div className="pb-1">
                  <div className="font-mono text-[0.6rem] uppercase tracking-widest opacity-70">
                    {format(new Date(isoForDay(startDate, n)), 'EEEE · MMM d')}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {loc && <span>📍 {loc.name}</span>}
                    {w && <span className="opacity-80">{w.icon} {w.tempMax}°/{w.tempMin}°</span>}
                  </div>
                </div>
                <div className="ml-auto flex gap-1 text-lg pb-1">
                  {itin?.isWorkDay && <span title="Work">🖥️</span>}
                  {itin?.isTrekDay && <span title="Trek">🥾</span>}
                  {itin?.isFestivalDay && <span title="Festival">🎭</span>}
                  {itin?.isExcursionDay && <span title="Excursion">🌄</span>}
                  {mood && <span className="text-2xl">{MOODS[mood - 1]}</span>}
                </div>
              </div>

              <h2 className="font-serif text-2xl md:text-3xl mb-3" style={{ color: theme.accent }}>
                {headline}
              </h2>

              {/* photo collage */}
              {photos.length > 0 ? (
                <div className="flex flex-wrap gap-3 mb-4">
                  {photos.map((src, i) => (
                    <div
                      key={i}
                      style={{ transform: `rotate(${PHOTO_ROT[i % PHOTO_ROT.length]}deg)` }}
                      className="bg-white p-1.5 pb-5 shadow-md rounded-sm"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-28 h-28 md:w-32 md:h-32 object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-4 border-2 border-dashed rounded-xl p-5 text-center text-xs opacity-60"
                     style={{ borderColor: theme.accent }}>
                  📷 Photos you add to this day’s Journal entry will collage here
                </div>
              )}

              {/* blurb */}
              {blurb && (
                <p className="text-sm leading-relaxed mb-4 opacity-90"
                   style={{ fontFamily: 'var(--font-body, inherit)' }}>
                  {blurb.length > 320 ? blurb.slice(0, 320) + '…' : blurb}
                </p>
              )}

              {/* highlights stickers */}
              {highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {highlights.map((h, i) => (
                    <span
                      key={i}
                      style={{ background: theme.accent }}
                      className="text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm rotate-[-1deg]"
                    >
                      ✦ {h}
                    </span>
                  ))}
                </div>
              )}

              {/* footer: spend receipt + links */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-black/10">
                <div className="font-mono text-xs">
                  {spend > 0 ? (
                    <span>🧾 Spent <strong style={{ color: theme.accent }}>₹{spend.toLocaleString('en-IN')}</strong> · {exps.length} item{exps.length !== 1 ? 's' : ''}</span>
                  ) : (
                    <span className="opacity-50">🧾 No spend logged</span>
                  )}
                </div>
                <div className="flex gap-2 font-mono text-[0.6rem] uppercase tracking-wider">
                  <Link href="/itinerary" className="px-2.5 py-1 rounded-full bg-black/5 hover:bg-black/10">Plan</Link>
                  {itin?.isFestivalDay && <Link href="/events" className="px-2.5 py-1 rounded-full bg-black/5 hover:bg-black/10">Festival ↗</Link>}
                  {itin?.isTrekDay && <Link href="/treks" className="px-2.5 py-1 rounded-full bg-black/5 hover:bg-black/10">Trek ↗</Link>}
                  <Link href="/journal" className="px-2.5 py-1 rounded-full text-white" style={{ background: theme.accent }}>
                    {hasLog ? 'Edit log' : '+ Add'}
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
