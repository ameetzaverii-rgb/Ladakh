// src/app/preview/page.tsx
// Landing-page exploration — three complete designs to choose from.
// Each has: About the app · Destinations · the Tarcho logo story.
// Not linked in nav; open /preview to compare. Safe to delete once chosen.

import Link from 'next/link'
import { TarchoLogo, FlagString } from '@/components/Logo'
import { FLAG, FLAG_TINT, type FlagColor } from '@/lib/utils'
import {
  CalendarDays, BookOpen, Wallet, Mountain, MapPin, ArrowRight,
  Compass, Sparkles, type LucideIcon,
} from 'lucide-react'

export const metadata = { title: 'Landing designs · Tarcho' }

const DESTS: { name: string; tagline: string; region: string; color: FlagColor }[] = [
  { name: 'Leh Ladakh', tagline: 'High-desert monasteries, lakes & passes', region: 'North India · 3,500m', color: 'blue' },
  { name: 'Kashmir', tagline: 'Dal Lake, houseboats & alpine meadows', region: 'North India · 1,600m', color: 'green' },
  { name: 'Pokhara', tagline: 'Lakeside calm under the Annapurnas', region: 'Nepal · 820m', color: 'red' },
  { name: 'Spiti Valley', tagline: 'The middle land of cliff monasteries', region: 'Himachal · 3,800m', color: 'yellow' },
  { name: 'Sikkim', tagline: 'Monasteries, Kanchenjunga & alpine lakes', region: 'Northeast India · 1,650m', color: 'green' },
]

const FEATURES: { icon: LucideIcon; title: string; text: string; color: FlagColor }[] = [
  { icon: CalendarDays, title: 'Day-by-day plan', text: 'A living itinerary with weather, treks and festivals baked in.', color: 'blue' },
  { icon: BookOpen, title: 'Journal', text: 'Capture each day — moods, photos and the small moments.', color: 'red' },
  { icon: Wallet, title: 'Budget', text: 'Track every rupee against your trip total, in real time.', color: 'yellow' },
  { icon: Mountain, title: 'Treks & culture', text: 'Curated treks, monasteries and the festivals worth timing.', color: 'green' },
]

const ELEMENTS = [
  { label: 'Sky', hex: '#2f6db5' },
  { label: 'Air', hex: '#f3ede1' },
  { label: 'Fire', hex: '#d24b3e' },
  { label: 'Water', hex: '#3e9e6e' },
  { label: 'Earth', hex: '#e0a21b' },
]

const LOGO_COPY =
  'Tarcho are the strings of Tibetan prayer flags strung across every Himalayan pass, bridge and rooftop. Each gust is said to carry a blessing on the wind. Their five colours — sky, air, fire, water and earth — are the same five we use to colour-code your whole trip.'
const ABOUT_COPY =
  'Tarcho turns the messy spreadsheet of a Himalayan trip into one calm, colourful place — plan the days, journal the journey, and keep the budget honest, all made for the mountains.'

export default function Preview() {
  return (
    <div className="pb-24">
      {/* Switcher */}
      <div className="sticky top-0 z-50 border-b border-border bg-dark/90 px-4 py-2 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <span className="label-mono text-gold">Landing designs</span>
          <nav className="flex gap-1 text-sm font-bold">
            <a href="#d1" className="rounded-full px-3 py-1 hover:bg-black/5">1 · Editorial</a>
            <a href="#d2" className="rounded-full px-3 py-1 hover:bg-black/5">2 · Cinematic</a>
            <a href="#d3" className="rounded-full px-3 py-1 hover:bg-black/5">3 · Bento</a>
          </nav>
        </div>
      </div>

      <DesignOne />
      <DesignTwo />
      <DesignThree />
    </div>
  )
}

/* ─────────────────────────  Shared  ───────────────────────── */

function DesignLabel({ id, n, name, vibe }: { id: string; n: string; name: string; vibe: string }) {
  return (
    <div id={id} className="scroll-mt-12 bg-cream px-4 py-3 text-center text-white">
      <span className="label-mono text-white/70">Design {n}</span>
      <span className="ml-2 font-display text-lg">{name}</span>
      <span className="ml-2 text-xs text-white/60">— {vibe}</span>
    </div>
  )
}

function CTAButtons({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link href="/start" className="press inline-flex items-center gap-2 rounded-full bg-flag-blue px-6 py-3 text-sm font-bold text-white shadow-soft">
        <Sparkles className="h-4 w-4" /> Start your trip
      </Link>
      <Link href="/" className={`press inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-soft ${tone === 'dark' ? 'bg-white/10 text-white' : 'border border-border bg-white text-cream'}`}>
        See a live demo <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

/* ─────────────────────────  Design 1 — Editorial / warm  ───────────────────────── */

function DesignOne() {
  return (
    <section>
      <DesignLabel id="d1" n="1" name="Editorial" vibe="warm, magazine-like, calm" />
      <div className="bg-dark">
        <div className="mx-auto max-w-3xl px-5 pb-10 pt-14 text-center">
          <TarchoLogo size="xl" layout="stacked" className="mx-auto" />
          <p className="mt-5 font-display text-xl italic text-stone">a string of prayer flags on the wind</p>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight text-cream">Plan your Himalayan escape, beautifully.</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-stone">{ABOUT_COPY}</p>
          <div className="mt-7"><CTAButtons /></div>
        </div>

        <div className="mx-auto max-w-4xl px-5 py-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(f => (
              <div key={f.title} className="rounded-2xl border border-border bg-white p-4 shadow-soft">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: FLAG_TINT[f.color] }}>
                  <f.icon className="h-5 w-5" style={{ color: FLAG[f.color] }} />
                </span>
                <div className="font-bold text-cream">{f.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-stone">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-5 py-8">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <div className="label-mono text-gold">◈ Where to ◈</div>
              <h2 className="font-display text-3xl text-cream">Five Himalayan starts</h2>
            </div>
            <span className="hidden text-sm text-stone sm:block">…and a blank canvas for your own.</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DESTS.map(d => (
              <div key={d.name} className="press group overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
                <div className="relative h-28" style={{ background: `linear-gradient(135deg, ${FLAG[d.color]}, ${FLAG.ink})` }}>
                  <div className="absolute inset-0 flex items-end p-3">
                    <h3 className="font-display text-2xl text-white drop-shadow">{d.name}</h3>
                  </div>
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[0.55rem] font-bold text-cream">
                    <MapPin className="h-3 w-3" />{d.region}
                  </span>
                </div>
                <p className="p-3 text-xs text-stone">{d.tagline}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-5 py-10">
          <div className="grid items-center gap-6 rounded-3xl border border-border bg-white p-7 shadow-soft sm:grid-cols-[auto,1fr]">
            <div className="flex flex-col items-center gap-3">
              <FlagString width={180} />
              <span className="font-display text-3xl text-cream">Tarcho</span>
            </div>
            <div>
              <div className="label-mono text-gold">Why “Tarcho”?</div>
              <p className="mt-2 text-sm leading-relaxed text-sand">{LOGO_COPY}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {ELEMENTS.map(e => (
                  <span key={e.label} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-semibold text-stone">
                    <span className="h-3 w-3 rounded-sm" style={{ background: e.hex, border: e.label === 'Air' ? '1px solid #d9cdaf' : 'none' }} />
                    {e.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────  Design 2 — Dark cinematic  ───────────────────────── */

function DesignTwo() {
  return (
    <section>
      <DesignLabel id="d2" n="2" name="Cinematic" vibe="dark, bold, premium" />
      <div style={{ background: '#101319' }} className="text-white">
        <div className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${FLAG.blue}, #f6f1e7, ${FLAG.red}, ${FLAG.green}, ${FLAG.yellow})` }} />
          <div className="mx-auto max-w-3xl px-5 pb-14 pt-16 text-center">
            <TarchoLogo size="xl" layout="stacked" tone="light" className="mx-auto" />
            <h1 className="mx-auto mt-6 max-w-2xl font-display text-5xl leading-[1.05]">
              Your Himalayan trip,
              <span className="block bg-gradient-to-r from-[#5b9be0] via-[#e98a5c] to-[#e0a21b] bg-clip-text text-transparent">beautifully planned.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/65">{ABOUT_COPY}</p>
            <div className="mt-7"><CTAButtons tone="dark" /></div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-5 py-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(f => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: FLAG[f.color] }}>
                  <f.icon className="h-5 w-5 text-white" />
                </span>
                <div className="font-bold">{f.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-white/55">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="py-8">
          <div className="mx-auto mb-4 max-w-4xl px-5">
            <div className="label-mono text-[#e0a21b]">◈ Destinations ◈</div>
            <h2 className="font-display text-3xl">Pick a Himalaya</h2>
          </div>
          <div className="scrollbar-none flex gap-4 overflow-x-auto px-5 pb-2">
            {DESTS.map(d => (
              <div key={d.name} className="relative h-56 w-64 shrink-0 overflow-hidden rounded-3xl" style={{ background: `linear-gradient(160deg, ${FLAG[d.color]}, #101319)` }}>
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <span className="flex w-fit items-center gap-1 rounded-full bg-black/30 px-2 py-0.5 text-[0.6rem] font-bold text-white/85"><MapPin className="h-3 w-3" />{d.region}</span>
                  <h3 className="mt-2 font-display text-3xl leading-tight">{d.name}</h3>
                  <p className="mt-1 text-xs text-white/75">{d.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-5 py-14 text-center">
          <div className="mb-6 flex justify-center gap-2">
            {ELEMENTS.map((e, i) => (
              <span key={e.label} className="animate-flag h-12 w-9 rounded-[3px]" style={{ background: e.hex, border: e.label === 'Air' ? '1px solid #d9cdaf' : 'none', animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
          <div className="label-mono text-[#e0a21b]">The name</div>
          <h2 className="mt-1 font-display text-4xl">Tarcho</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/65">{LOGO_COPY}</p>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────  Design 3 — Playful bento  ───────────────────────── */

function DesignThree() {
  return (
    <section>
      <DesignLabel id="d3" n="3" name="Bento" vibe="colourful, modern, playful" />
      <div className="bg-dark">
        <div className="mx-auto max-w-4xl px-5 py-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="col-span-2 row-span-2 flex flex-col justify-between rounded-3xl p-6 text-white" style={{ background: `linear-gradient(140deg, ${FLAG.blue}, ${FLAG.red} 55%, ${FLAG.yellow})` }}>
              <FlagString width={150} />
              <div>
                <div className="font-display text-5xl leading-none">Tarcho</div>
                <p className="mt-2 max-w-xs text-sm text-white/85">Plan, journal & budget your Himalayan trip — one calm, colourful place.</p>
              </div>
              <div className="mt-4"><Link href="/start" className="press inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-cream"><Sparkles className="h-4 w-4 text-flag-blue" /> Start your trip</Link></div>
            </div>

            {FEATURES.map(f => (
              <div key={f.title} className="col-span-1 rounded-3xl border border-border bg-white p-4 shadow-soft">
                <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: FLAG_TINT[f.color] }}>
                  <f.icon className="h-[18px] w-[18px]" style={{ color: FLAG[f.color] }} />
                </span>
                <div className="text-sm font-bold text-cream">{f.title}</div>
                <p className="mt-0.5 text-[0.68rem] leading-snug text-stone">{f.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-3xl border border-border bg-white/60 p-6 text-center">
            <Compass className="mx-auto mb-2 h-6 w-6 text-flag-blue" />
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-sand">{ABOUT_COPY}</p>
          </div>

          <div className="mb-3 mt-8 flex items-center gap-2">
            <FlagString width={56} />
            <h2 className="font-display text-2xl text-cream">Choose a destination</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {DESTS.map((d, i) => (
              <div key={d.name} className={`press relative overflow-hidden rounded-2xl p-4 text-white ${i === 0 ? 'col-span-2 sm:col-span-1' : ''}`}
                style={{ background: `linear-gradient(150deg, ${FLAG[d.color]}, ${FLAG.ink})`, minHeight: 120 }}>
                <span className="flex w-fit items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[0.55rem] font-bold"><MapPin className="h-3 w-3" />{d.region}</span>
                <h3 className="mt-6 font-display text-2xl leading-tight">{d.name}</h3>
                <p className="text-[0.68rem] text-white/80">{d.tagline}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl p-7 text-white" style={{ background: '#141821' }}>
            <div className="grid items-center gap-5 sm:grid-cols-[1fr,auto]">
              <div>
                <div className="label-mono text-[#e0a21b]">What it means</div>
                <h2 className="mt-1 font-display text-3xl">Tarcho — the prayer flags</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">{LOGO_COPY}</p>
              </div>
              <div className="flex gap-1.5">
                {ELEMENTS.map((e, i) => (
                  <span key={e.label} className="flex flex-col items-center gap-1">
                    <span className="animate-flag h-10 w-7 rounded-[3px]" style={{ background: e.hex, border: e.label === 'Air' ? '1px solid #d9cdaf' : 'none', animationDelay: `${i * 120}ms` }} />
                    <span className="text-[0.55rem] text-white/60">{e.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
