import { CategoryHero } from '@/components/Photo'
import { getCategoryImage } from '@/lib/imagery'
import { NATIONAL, LOCAL, PEOPLE, type Contact } from '@/lib/emergency'
import { FLAG, FLAG_TINT } from '@/lib/utils'
import { Phone, ShieldAlert, HeartPulse, Users, Pencil } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Emergency · Leh Ladakh' }

function ContactCard({ c }: { c: Contact }) {
  const hasNumber = c.number.trim().length > 0
  const inner = (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: hasNumber ? FLAG_TINT.red : '#f1efe9' }}>
        <Phone className="h-5 w-5" style={{ color: hasNumber ? FLAG.red : '#8c92a0' }} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-cream">{c.name}</div>
        {c.note && <div className="text-[0.72rem] leading-snug text-stone">{c.note}</div>}
      </div>
      {hasNumber ? (
        <span className="shrink-0 rounded-full bg-flag-red px-3 py-1.5 text-sm font-bold tabular-nums text-white">{c.number}</span>
      ) : (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-[0.7rem] font-medium text-muted">
          <Pencil className="h-3 w-3" /> add
        </span>
      )}
    </div>
  )
  return hasNumber ? (
    <a href={`tel:${c.number.replace(/\s/g, '')}`} className="press block card-base p-3">{inner}</a>
  ) : (
    <div className="card-base p-3 opacity-90">{inner}</div>
  )
}

function Section({ title, icon: Icon, items }: { title: string; icon: typeof Phone; items: Contact[] }) {
  return (
    <section className="mb-7">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-cream">
        <Icon className="h-5 w-5 text-flag-red" /> {title}
      </h2>
      <div className="space-y-2">
        {items.map(c => <ContactCard key={c.name} c={c} />)}
      </div>
    </section>
  )
}

export default async function EmergencyPage() {
  const heroImg = await getCategoryImage('events') // a dramatic Ladakh banner

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <CategoryHero src={heroImg?.src ?? null} color="red" icon={ShieldAlert}
        title="Emergency" subtitle="Tap any number to call. Save these before you lose signal." />

      <div className="warning-box mb-6 p-4 text-sm text-sand">
        <strong className="block text-cream">Good to know</strong>
        <span className="text-stone">112 reaches police, fire and ambulance anywhere in India. In Ladakh mobile
        coverage is patchy beyond Leh — confirm the local & personal numbers below with your accommodation on arrival.</span>
      </div>

      <Section title="National emergency" icon={ShieldAlert} items={NATIONAL} />
      <Section title="Local — Ladakh" icon={HeartPulse} items={LOCAL} />
      <Section title="Your people" icon={Users} items={PEOPLE} />

      <p className="mt-2 text-center text-[0.7rem] text-muted">
        Edit local &amp; personal contacts in <code className="text-stone">src/lib/emergency.ts</code> — tell me the
        numbers and I&apos;ll fill them in.
      </p>
    </div>
  )
}
