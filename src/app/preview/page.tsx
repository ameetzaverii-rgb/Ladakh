// src/app/preview/page.tsx
// Brand exploration sandbox — logo options + a fused prayer-flag-ribbon + bento
// home-screen mock for the two name finalists (Khora / Tarcho). Not linked in
// the nav; open /preview to compare. Safe to delete once a direction is chosen.

import { CalendarDays, BedDouble, PartyPopper, Mountain, Wallet, BookOpen, MapPin } from 'lucide-react'

export const metadata = { title: 'Brand preview' }

// Prayer-flag palette, in the traditional left→right order.
const FLAGS = [
  { key: 'blue', hex: '#2f6db5', tint: '#e7f0fa', label: 'Sky' },
  { key: 'white', hex: '#f6f1e7', tint: '#faf7f0', label: 'Air' },
  { key: 'red', hex: '#d24b3e', tint: '#fbe9e7', label: 'Fire' },
  { key: 'green', hex: '#3e9e6e', tint: '#e7f4ee', label: 'Water' },
  { key: 'yellow', hex: '#e0a21b', tint: '#fbf0d8', label: 'Earth' },
]

// Wordmark font candidates for the font lab. `note` is the vibe in a few words.
const FONTS = [
  { name: 'Fraunces', css: "'Fraunces', serif", note: 'warm, characterful serif' },
  { name: 'Marcellus', css: "'Marcellus', serif", note: 'refined Roman caps — travel-luxe' },
  { name: 'Playfair Display', css: "'Playfair Display', serif", note: 'high-contrast editorial' },
  { name: 'Spectral', css: "'Spectral', serif", note: 'calm literary serif' },
  { name: 'Cinzel', css: "'Cinzel', serif", note: 'engraved, monumental' },
  { name: 'Syne', css: "'Syne', sans-serif", note: 'arty geometric display' },
  { name: 'Space Grotesk', css: "'Space Grotesk', sans-serif", note: 'modern techy sans' },
  { name: 'Unbounded', css: "'Unbounded', sans-serif", note: 'bold rounded display' },
]

// Google Fonts for the font lab (only loaded on /preview).
const FONT_LAB_CSS =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Marcellus&family=Playfair+Display:wght@700&family=Spectral:wght@600;700&family=Cinzel:wght@600;700&family=Syne:wght@700;800&family=Space+Grotesk:wght@600;700&family=Unbounded:wght@600;700&display=swap'

export default function PreviewPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Fonts used only by the font lab below */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={FONT_LAB_CSS} />
      <header className="mb-10 text-center">
        <div className="label-mono mb-2 text-[0.6rem] tracking-widest text-gold">BRAND EXPLORATION</div>
        <h1 className="font-serif text-3xl font-bold text-cream">Name &amp; home-screen options</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-stone">
          Two finalists, three logo treatments each, and a home screen that fuses the prayer-flag
          ribbon with a bento gallery. Pick a name + a logo and I&apos;ll theme the whole app around it.
        </p>
      </header>

      <NameBlock name="Khora" tagline="the sacred circuit — every journey, a loop"
        logos={[<KhoraRingLogo key="a" />, <KhoraBuntingLogo key="b" />, <KhoraMonolineLogo key="c" />]} />

      <div className="my-12 h-px bg-border" />

      <NameBlock name="Tarcho" tagline="a string of prayer flags on the wind"
        logos={[<TarchoStringLogo key="a" />, <TarchoPoleLogo key="b" />, <TarchoBuntingLogo key="c" />]} />

      <div className="my-12 h-px bg-border" />

      {/* ── FONT LAB ── chosen layouts (bunting above the word), each in 8 fonts ── */}
      <header className="mb-8 text-center">
        <div className="label-mono mb-2 text-[0.6rem] tracking-widest text-gold">FONT LAB</div>
        <h2 className="font-serif text-2xl font-bold text-cream">Pick the wordmark font</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-stone">
          Your chosen layouts — <strong>Khora</strong> (bunting above) and <strong>Tarcho</strong> (string above) —
          each rendered in eight fonts. Tell me the font name under any one and I&apos;ll lock it in.
        </p>
      </header>

      <FontLab name="Khora" width={140} />
      <div className="my-10 h-px bg-border" />
      <FontLab name="Tarcho" width={150} />
    </div>
  )
}

function FontLab({ name, width }: { name: string; width: number }) {
  return (
    <section>
      <h3 className="mb-5 font-serif text-xl font-bold text-cream">{name}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FONTS.map(f => (
          <div key={f.name} className="flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-white p-5 shadow-soft">
            <div className="flex flex-1 flex-col items-center justify-center gap-1.5">
              <FlagBunting width={width} />
              <span className="text-3xl font-bold tracking-tight text-cream" style={{ fontFamily: f.css }}>{name}</span>
            </div>
            <span className="label-mono text-[0.6rem] text-cream">{f.name}</span>
            <span className="text-[0.62rem] italic text-stone">{f.note}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function NameBlock({ name, tagline, logos }: { name: string; tagline: string; logos: React.ReactNode[] }) {
  return (
    <section>
      <div className="mb-6 flex flex-wrap items-baseline gap-3">
        <h2 className="font-serif text-2xl font-bold text-cream">{name}</h2>
        <span className="text-sm italic text-stone">{tagline}</span>
      </div>

      {/* Logo options */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {logos.map((logo, i) => (
          <div key={i} className="flex min-h-[150px] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-white p-5 shadow-soft">
            {logo}
            <span className="label-mono text-[0.55rem] text-stone">Option {String.fromCharCode(65 + i)}</span>
          </div>
        ))}
      </div>

      {/* Home-screen mock */}
      <div className="flex justify-center">
        <HomeMock name={name} />
      </div>
    </section>
  )
}

/* ─────────────────────────  HOME-SCREEN MOCK  ───────────────────────── */

function HomeMock({ name }: { name: string }) {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-[2rem] border-[6px] border-deep bg-cream shadow-soft">
      <div className="px-5 pb-6 pt-5">
        {/* Masthead */}
        <div className="mb-4 flex items-center justify-between">
          <span className="font-serif text-xl font-bold text-cream">{name}</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tint-blue text-flag-blue">
            <MapPin className="h-4 w-4" />
          </span>
        </div>
        <h3 className="text-2xl font-semibold leading-tight" style={{ color: FLAGS[0].hex }}>Good morning, Amit</h3>
        <p className="mt-0.5 text-sm text-stone">12 days to Ladakh · Thu, Jun 18</p>

        {/* Prayer-flag ribbon nav */}
        <FlagRibbon />

        {/* Bento gallery */}
        <BentoGrid />
      </div>
    </div>
  )
}

function FlagRibbon() {
  const items = [
    { f: FLAGS[0], Icon: CalendarDays, label: 'Plan' },
    { f: FLAGS[1], Icon: BedDouble, label: 'Stay' },
    { f: FLAGS[2], Icon: PartyPopper, label: 'Culture' },
    { f: FLAGS[3], Icon: Mountain, label: 'Treks' },
    { f: FLAGS[4], Icon: Wallet, label: 'Budget' },
  ]
  return (
    <div className="relative mt-5">
      {/* the string */}
      <div className="absolute left-1 right-1 top-0 h-px bg-border" />
      <div className="flex gap-1.5 pt-1.5">
        {items.map(({ f, Icon, label }) => {
          const dark = f.key === 'white'
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-1 rounded-b-lg pb-2 pt-2.5"
              style={{ background: f.hex, border: dark ? '1px solid #e6ddc9' : 'none' }}>
              <Icon className="h-4 w-4" style={{ color: dark ? '#7a6f57' : '#fff' }} />
              <span className="text-[0.6rem] font-bold" style={{ color: dark ? '#7a6f57' : '#fff' }}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BentoGrid() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2.5">
      {/* big hero tile */}
      <div className="relative col-span-2 h-28 overflow-hidden rounded-2xl"
        style={{ background: `linear-gradient(110deg, ${FLAGS[0].hex}, ${FLAGS[2].hex} 60%, ${FLAGS[4].hex})` }}>
        <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
          <span className="text-[0.6rem] font-semibold uppercase tracking-wide opacity-90">Today · Day 3</span>
          <span className="text-base font-extrabold leading-tight drop-shadow">Work morning + Old Town</span>
        </div>
      </div>
      <BentoTile f={FLAGS[2]} Icon={PartyPopper} title="Festivals" sub="Phyang Tsedup" />
      <BentoTile f={FLAGS[3]} Icon={Mountain} title="Treks" sub="Sham Valley" />
      <BentoTile f={FLAGS[4]} Icon={Wallet} title="Budget" sub="₹42k of ₹1.5L" />
      <BentoTile f={FLAGS[0]} Icon={BookOpen} title="Journal" sub="3 entries" />
    </div>
  )
}

function BentoTile({ f, Icon, title, sub }: { f: typeof FLAGS[number]; Icon: typeof Wallet; title: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-3 shadow-soft">
      <span className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: f.tint }}>
        <Icon className="h-4 w-4" style={{ color: f.hex }} />
      </span>
      <div className="text-sm font-bold text-cream">{title}</div>
      <div className="text-[0.68rem] text-stone">{sub}</div>
    </div>
  )
}

/* ─────────────────────────  KHORA LOGOS  ───────────────────────── */
// A ring of five flag-coloured arcs — the circumambulation (khora).
function KhoraRing({ size = 40 }: { size?: number }) {
  const r = 15
  const c = 2 * Math.PI * r
  const seg = c / 5
  const gap = seg * 0.16
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      {FLAGS.map((f, i) => (
        <circle key={f.key} cx="20" cy="20" r={r} fill="none"
          stroke={f.key === 'white' ? '#d9cdaf' : f.hex} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${seg - gap} ${c - seg + gap}`}
          transform={`rotate(${i * 72 - 90} 20 20)`} />
      ))}
    </svg>
  )
}

function KhoraRingLogo() {
  return (
    <div className="flex items-center gap-3">
      <KhoraRing size={44} />
      <span className="font-serif text-3xl font-bold tracking-tight text-cream">Khora</span>
    </div>
  )
}

function KhoraBuntingLogo() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <FlagBunting width={140} />
      <span className="font-serif text-3xl font-bold tracking-tight text-cream">Khora</span>
    </div>
  )
}

function KhoraMonolineLogo() {
  return (
    <div className="flex flex-col items-center">
      <span className="font-serif text-3xl font-semibold tracking-[0.18em] text-cream">KHORA</span>
      <div className="mt-1.5 flex gap-1">
        {FLAGS.map(f => (
          <span key={f.key} className="h-1.5 w-6 rounded-full"
            style={{ background: f.hex, border: f.key === 'white' ? '1px solid #d9cdaf' : 'none' }} />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────  TARCHO LOGOS  ───────────────────────── */
// A horizontal string of hanging rectangular flags.
function FlagBunting({ width = 150 }: { width?: number }) {
  const n = 5
  const w = 22, h = 26, gap = (width - n * w) / (n - 1)
  return (
    <svg width={width} height="36" viewBox={`0 0 ${width} 36`} aria-hidden>
      <line x1="0" y1="4" x2={width} y2="4" stroke="#d9cdaf" strokeWidth="1.5" />
      {FLAGS.map((f, i) => {
        const x = i * (w + gap)
        return (
          <g key={f.key}>
            <rect x={x} y="4" width={w} height={h} rx="2"
              fill={f.hex} stroke={f.key === 'white' ? '#d9cdaf' : 'none'} />
          </g>
        )
      })}
    </svg>
  )
}

function TarchoStringLogo() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <FlagBunting width={150} />
      <span className="font-serif text-3xl font-bold tracking-tight text-cream">Tarcho</span>
    </div>
  )
}

function TarchoPoleLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="26" height="46" viewBox="0 0 26 46" aria-hidden>
        <line x1="3" y1="2" x2="3" y2="44" stroke="#3a4150" strokeWidth="2.5" strokeLinecap="round" />
        {FLAGS.slice(0, 4).map((f, i) => (
          <polygon key={f.key} points={`3,${5 + i * 9} 24,${9 + i * 9} 3,${13 + i * 9}`}
            fill={f.hex} stroke={f.key === 'white' ? '#d9cdaf' : 'none'} />
        ))}
      </svg>
      <span className="font-serif text-3xl font-bold tracking-tight text-cream">Tarcho</span>
    </div>
  )
}

function TarchoBuntingLogo() {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-serif text-3xl font-bold tracking-tight text-cream">Tarcho</span>
      <svg width="150" height="22" viewBox="0 0 150 22" aria-hidden>
        <line x1="2" y1="3" x2="148" y2="3" stroke="#d9cdaf" strokeWidth="1.5" />
        {FLAGS.map((f, i) => {
          const x = 10 + i * 28
          return <polygon key={f.key} points={`${x},3 ${x + 18},3 ${x + 9},20`}
            fill={f.hex} stroke={f.key === 'white' ? '#d9cdaf' : 'none'} />
        })}
      </svg>
    </div>
  )
}
