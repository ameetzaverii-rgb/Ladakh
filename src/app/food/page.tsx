import { db } from '@/lib/db'

export const revalidate = 3600

const TYPE_ICONS: Record<string, string> = {
  CAFE: '☕',
  RESTAURANT: '🍜',
  STREET_FOOD: '🥟',
  BAKERY: '🥐',
  DHABA: '🍲',
}

export default async function FoodPage() {
  const places = await db.place.findMany({ orderBy: { laptopFriendly: 'desc' } })

  const cafes = places.filter(p => p.type === 'CAFE')
  const restaurants = places.filter(p => p.type !== 'CAFE')

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="label-mono text-xs text-gold mb-2">Food & Cafés</div>
        <h1 className="section-title mb-1">Eat, Drink,<br /><em className="text-gold italic">Repeat</em></h1>
        <p className="text-stone text-sm">The best cafés, restaurants, and street eats in Leh.</p>
      </div>

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
            {cafes.map(place => <PlaceCard key={place.id} place={place} />)}
          </div>
        </div>
      )}

      {restaurants.length > 0 && (
        <div>
          <div className="label-mono text-[0.65rem] text-gold border-l-2 border-gold pl-3 mb-4">Restaurants & Street Food</div>
          <div className="grid md:grid-cols-2 gap-4">
            {restaurants.map(place => <PlaceCard key={place.id} place={place} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function PlaceCard({ place }: { place: any }) {
  return (
    <div className="card-base p-5">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="label-mono text-[0.55rem] text-gold mb-0.5">{place.neighbourhood}</div>
          <h3 className="font-serif text-cream text-lg">{place.name}</h3>
        </div>
        <span className="text-xl ml-2 shrink-0">{TYPE_ICONS[place.type] ?? '🍴'}</span>
      </div>
      <p className="text-muted text-xs leading-relaxed mb-3">{place.description}</p>
      {place.mustOrder.length > 0 && (
        <div className="text-xs mb-3">
          <span className="text-stone">Order: </span>
          <span className="text-sand">{place.mustOrder.join(' · ')}</span>
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {place.laptopFriendly && <span className="pill pill-sky">💻 Laptop OK</span>}
        {place.wifiAvailable && <span className="pill pill-sky">WiFi</span>}
        {place.avgBudgetINR && (
          <span className="pill pill-gold">₹{place.avgBudgetINR.toLocaleString()}/visit</span>
        )}
        {place.tags.map((tag: string, i: number) => (
          <span key={i} className="pill pill-sage">{tag}</span>
        ))}
      </div>
    </div>
  )
}
