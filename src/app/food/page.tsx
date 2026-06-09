import { db } from '@/lib/db'
import { ReviewLinks } from '@/components/ReviewLinks'
import { CategoryHero } from '@/components/Photo'
import { getCategoryImage } from '@/lib/imagery'
import { fetchWikiImage } from '@/lib/trekMedia'
import { activeDestinationId } from '@/lib/destination'
import { UtensilsCrossed, Coffee, Soup, Croissant, Sandwich, Laptop, Wifi, type LucideIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

const TYPE_META: Record<string, { Icon: LucideIcon; label: string }> = {
  CAFE: { Icon: Coffee, label: 'Café' },
  RESTAURANT: { Icon: UtensilsCrossed, label: 'Restaurant' },
  STREET_FOOD: { Icon: Sandwich, label: 'Street food' },
  BAKERY: { Icon: Croissant, label: 'Bakery' },
  DHABA: { Icon: Soup, label: 'Dhaba' },
}

// Pick a fun, indicative food photo for a place from its must-order dishes / type.
function foodWikiTitles(place: any): string[] {
  const dishes = (place.mustOrder ?? []).map((d: string) => d.toLowerCase())
  const has = (k: string) => dishes.some((d: string) => d.includes(k))
  const t: string[] = []
  if (has('momo')) t.push('Momo (food)')
  if (has('thukpa')) t.push('Thukpa')
  if (has('tingmo')) t.push('Tingmo')
  if (has('pizza')) t.push('Pizza')
  if (has('coffee') || has('latte') || has('cappuccino') || has('espresso')) t.push('Latte')
  if (has('cake') || has('pie') || has('croissant') || has('bake') || has('pastry')) t.push('Pastry')
  if (has('noodle')) t.push('Noodle')
  if (has('thali') || has('dal') || has('curry')) t.push('Thali')
  const byType: Record<string, string> = {
    CAFE: 'Latte', RESTAURANT: 'Thukpa', STREET_FOOD: 'Momo (food)', BAKERY: 'Croissant', DHABA: 'Thali',
  }
  t.push(byType[place.type] ?? 'Tibetan cuisine', 'Momo (food)', 'Tibetan cuisine')
  return Array.from(new Set(t))
}

export default async function FoodPage() {
  const [places, heroImg] = await Promise.all([
    db.place.findMany({ where: { destinationId: await activeDestinationId() }, orderBy: { laptopFriendly: 'desc' } }),
    getCategoryImage('food'),
  ])

  // Resolve a banner photo per place (Wikipedia, cached 1 day).
  const placeImages: Record<string, string> = {}
  await Promise.all(
    places.map(async place => {
      for (const title of foodWikiTitles(place)) {
        const img = await fetchWikiImage(title)
        if (img?.src) { placeImages[place.id] = img.src; break }
      }
    })
  )

  const cafes = places.filter(p => p.type === 'CAFE')
  const restaurants = places.filter(p => p.type !== 'CAFE')

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <CategoryHero src={heroImg?.src ?? null} color="red" icon={UtensilsCrossed}
        title="Eat, Drink, Repeat" subtitle="The best cafés, restaurants, and street eats in Leh." />
      <a href="/contribute" className="mb-8 inline-block label-mono text-[0.6rem] text-sky hover:underline">🙋 Got a recommendation? Friends can add via the Collaborate page</a>

      <div className="warning-box p-4 mb-8 text-sm text-muted">
        <strong className="label-mono text-[0.65rem] text-rust block mb-2">🍜 Must Order in Ladakh</strong>
        <span className="text-sand">Thukpa</span> (Tibetan noodle soup) · <span className="text-sand">Momos</span> (steamed dumplings with chilli sauce) ·
        <span className="text-sand">Tingmo</span> (twisted steamed bread) ·
        <span className="text-sand">Yak cheese momos</span> ·
        <span className="text-sand">Sea Buckthorn juice</span> (local superfruit) ·
        <span className="text-sand">Butter tea / Gur Gur Chai</span> (salty, buttery, essential)
      </div>

      {places.length === 0 && (
        <div className="text-center py-16 text-stone">
          <div className="text-4xl mb-3">🍜</div>
          <p className="font-serif text-cream text-lg">No places loaded</p>
          <p className="text-sm">Run <code className="text-gold">npm run db:seed</code></p>
        </div>
      )}

      {cafes.length > 0 && (
        <div className="mb-10">
          <div className="label-mono text-[0.65rem] text-gold border-l-2 border-gold pl-3 mb-4">Cafés & Work Spots</div>
          <div className="grid md:grid-cols-2 gap-4">
            {cafes.map(place => <PlaceCard key={place.id} place={place} img={placeImages[place.id]} />)}
          </div>
        </div>
      )}

      {restaurants.length > 0 && (
        <div>
          <div className="label-mono text-[0.65rem] text-gold border-l-2 border-gold pl-3 mb-4">Restaurants & Street Food</div>
          <div className="grid md:grid-cols-2 gap-4">
            {restaurants.map(place => <PlaceCard key={place.id} place={place} img={placeImages[place.id]} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function PlaceCard({ place, img }: { place: any; img?: string }) {
  const meta = TYPE_META[place.type] ?? { Icon: UtensilsCrossed, label: 'Eatery' }
  const Icon = meta.Icon
  return (
    <div className="card-base overflow-hidden p-0">
      {/* Elegant photo header */}
      <div className="relative h-32 w-full bg-tint-red">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={place.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center"><Icon className="h-12 w-12 text-flag-red/50" strokeWidth={1.5} /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[0.6rem] font-bold text-cream shadow-soft">
          <Icon className="h-3 w-3" /> {meta.label}
        </span>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="label-mono text-[0.55rem] text-gold mb-0.5">{place.neighbourhood}</div>
          <h3 className="font-serif text-xl leading-tight text-white drop-shadow">{place.name}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <p className="text-muted text-sm leading-relaxed mb-3">{place.description}</p>
        {place.mustOrder.length > 0 && (
          <div className="text-xs mb-3">
            <span className="text-stone">Order: </span>
            <span className="text-sand">{place.mustOrder.join(' · ')}</span>
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          {place.laptopFriendly && <span className="pill pill-sky inline-flex items-center gap-1"><Laptop className="h-3 w-3" /> Laptop OK</span>}
          {place.wifiAvailable && <span className="pill pill-sky inline-flex items-center gap-1"><Wifi className="h-3 w-3" /> WiFi</span>}
          {place.avgBudgetINR && (
            <span className="pill pill-gold">₹{place.avgBudgetINR.toLocaleString()}/visit</span>
          )}
          {place.tags.map((tag: string, i: number) => (
            <span key={i} className="pill pill-sage">{tag}</span>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gold/10">
          <ReviewLinks name={place.name} context={`${place.neighbourhood} Leh Ladakh`} />
        </div>
      </div>
    </div>
  )
}
