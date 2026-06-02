import { db } from '@/lib/db'
import { formatINR } from '@/lib/utils'
import { getTrekImage, getTrekMediaConfig, youtubeSearchUrl, type TrekImage } from '@/lib/trekMedia'

export const dynamic = 'force-dynamic'
const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'pill-sage',
  MEDIUM: 'pill-gold',
  HARD: 'pill-rust',
  EXPERT: 'pill-rust',
}

export default async function TreksPage() {
  const treks = await db.trek.findMany({ orderBy: { difficulty: 'asc' } })

  // Fetch a real photo for each trek in parallel.
  const imageMap = new Map<string, TrekImage | null>()
  await Promise.all(
    treks.map(async t => {
      imageMap.set(t.id, await getTrekImage(t.name))
    })
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="label-mono text-xs text-gold mb-2">Weekend Adventures</div>
        <h1 className="section-title mb-1">Weekend <em className="text-gold italic">Treks</em></h1>
        <p className="text-stone text-sm">3 weekends, 3 journeys. July–August is peak trekking season.</p>
      </div>

      <div className="info-box p-4 mb-8 text-sm text-muted leading-relaxed">
        <strong className="label-mono text-[0.65rem] text-gold block mb-2">🥾 Season Note</strong>
        July–August is ideal. Passes are clear, wildflowers are in bloom, no technical climbing required.
        Acclimatise for 2+ days before any trek above 4,000m.
      </div>

      {treks.length === 0 && (
        <div className="text-center py-16 text-stone">
          <div className="text-4xl mb-3">🥾</div>
          <p className="font-serif text-cream text-lg">No treks loaded yet</p>
          <p className="text-sm">Run <code className="text-gold">npm run db:seed</code></p>
        </div>
      )}

      <div className="space-y-5">
        {treks.map((trek, idx) => {
          const img = imageMap.get(trek.id)
          const ytUrl = youtubeSearchUrl(getTrekMediaConfig(trek.name).youtubeQuery)
          return (
          <div key={trek.id} className="border border-sky/20 bg-sky/[0.03] overflow-hidden relative">
            {/* Photo banner */}
            {img && (
              <div className="relative h-48 md:h-56 w-full bg-deep">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={trek.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-90"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/30 to-transparent" />
                <a
                  href={img.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-1.5 right-2 label-mono text-[0.5rem] text-cream/60 hover:text-cream"
                >
                  photo: Wikipedia
                </a>
                <a
                  href={ytUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-rust/90 hover:bg-rust text-cream text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                >
                  ▶ Watch videos
                </a>
              </div>
            )}
            <div className="p-6 relative">
            <div className="absolute top-4 right-5 font-serif text-5xl text-sky/10 font-light">
              {String(idx + 1).padStart(2, '0')}
            </div>
            <div className="flex items-start gap-3 flex-wrap mb-2">
              <h3 className="font-serif text-cream text-xl">{trek.name}</h3>
              {!img && (
                <a
                  href={ytUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-rust/90 hover:bg-rust text-cream text-xs font-medium px-3 py-1 rounded-full transition-colors"
                >
                  ▶ Watch videos
                </a>
              )}
            </div>
            <div className="flex gap-2 flex-wrap mb-3">
              <span className={`pill ${DIFFICULTY_COLORS[trek.difficulty]}`}>{trek.difficulty}</span>
              <span className="pill pill-sky">{trek.durationDays}D</span>
              <span className="pill pill-gold">{trek.maxAltitudeM.toLocaleString()}m</span>
              {trek.distanceKm && <span className="pill pill-sage">{trek.distanceKm}km</span>}
              {trek.permitRequired && <span className="pill pill-rust">Permit Req.</span>}
            </div>
            <p className="text-muted text-sm leading-relaxed mb-3">{trek.description}</p>
            {trek.highlights.length > 0 && (
              <div className="mb-3">
                <div className="label-mono text-[0.55rem] text-gold mb-1.5">Highlights</div>
                <div className="flex flex-wrap gap-1.5">
                  {trek.highlights.map((h: string, i: number) => (
                    <span key={i} className="pill pill-sage">{h}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-3 gap-3 text-xs mt-3 pt-3 border-t border-gold/10">
              <div>
                <span className="text-stone">Start: </span>
                <span className="text-sand">{trek.startPoint}</span>
              </div>
              <div>
                <span className="text-stone">Season: </span>
                <span className="text-sand">{trek.season}</span>
              </div>
              <div>
                <span className="text-stone">Price: </span>
                <span className="text-gold">{formatINR(trek.priceINR)}/person</span>
              </div>
              {trek.company && (
                <div className="md:col-span-2">
                  <span className="text-stone">Agency: </span>
                  {trek.companyUrl ? (
                    <a href={trek.companyUrl} target="_blank" rel="noopener noreferrer"
                       className="text-sky hover:underline">{trek.company}</a>
                  ) : (
                    <span className="text-sand">{trek.company}</span>
                  )}
                </div>
              )}
            </div>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}
