// src/lib/clothing.ts
// Turns a day's weather + altitude into a concrete packing list.
// Tuned for Ladakh: intense high-altitude sun, big day↔night temperature
// swings, and bitterly cold nights at the high lakes and passes.

export interface ClothingItem {
  icon: string
  label: string
}

export function getClothing(w: {
  tempMin: number
  tempMax: number
  label: string
  altitudeM: number
}): ClothingItem[] {
  const items: ClothingItem[] = []
  const { tempMin, tempMax, altitudeM } = w
  const cond = w.label.toLowerCase()

  // Daytime layer
  if (tempMax >= 22) items.push({ icon: '👕', label: 'T-shirt / breathable cotton for daytime' })
  else if (tempMax >= 14) items.push({ icon: '👔', label: 'Full-sleeve shirt + light fleece' })
  else items.push({ icon: '🧥', label: 'Insulated jacket even at midday — cold day' })

  // Evening / night layer (nights are cold almost everywhere here)
  if (tempMin <= 0) items.push({ icon: '🧥', label: 'Heavy down jacket — below-freezing night' })
  else if (tempMin <= 6) items.push({ icon: '🧥', label: 'Warm down/puffer jacket for the evening' })
  else items.push({ icon: '🧶', label: 'Fleece or sweater for after sunset' })

  // Extremities when it gets genuinely cold
  if (tempMin <= 3) items.push({ icon: '🧤', label: 'Gloves, woollen beanie & thermal base layer' })

  // Altitude-specific
  if (altitudeM >= 4000)
    items.push({ icon: '🥶', label: `Extra thermals — very high altitude (${altitudeM}m)` })

  // Sun is fierce at altitude regardless of temperature
  items.push({ icon: '🕶️', label: 'Sunglasses (UV400) + SPF50 sunscreen' })
  items.push({ icon: '🧢', label: 'Sun hat / cap & lip balm' })

  // Wet weather
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower') || cond.includes('thunder'))
    items.push({ icon: '🌂', label: 'Waterproof shell / poncho' })
  if (cond.includes('snow'))
    items.push({ icon: '❄️', label: 'Waterproof boots & snow-ready outer layer' })

  return items
}
