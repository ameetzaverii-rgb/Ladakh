// src/lib/shopSuggestions.ts
// An ongoing repository of "things to definitely pick up in Ladakh" — surfaced
// in the shop tab's Polaroid swipe deck. Swipe right to keep one in your list.
// Add to this list any time to grow the idea bank (local shops, festival stalls…).

export interface ShopIdea {
  id: string
  name: string
  area: string        // matches the shop areas: Leh / Nubra / Pangong / Sham / Turtuk / General
  category: string    // Textiles / Food / Handicraft / Jewellery / Spiritual / Misc
  estPriceINR: number
  blurb: string
  whereToBuy: string
  wiki: string[]      // Wikipedia titles tried in order for the Polaroid photo
}

export const SHOP_IDEAS: ShopIdea[] = [
  { id: 'pashmina', name: 'Genuine Pashmina shawl', area: 'Leh', category: 'Textiles', estPriceINR: 6000, blurb: 'Feather-light Changthangi wool. Look for the GI tag and a price that reflects the real thing.', whereToBuy: 'LAHDC / GI-certified shops, Main Bazaar', wiki: ['Pashmina'] },
  { id: 'apricots', name: 'Dried apricots & jam', area: 'Nubra', category: 'Food', estPriceINR: 400, blurb: 'Sun-dried Raktsey Karpo apricots — Ladakh’s signature fruit, sweet and intense.', whereToBuy: 'Roadside stalls, Nubra & Turtuk villages', wiki: ['Apricot'] },
  { id: 'seabuckthorn', name: 'Sea-buckthorn juice', area: 'Leh', category: 'Food', estPriceINR: 400, blurb: 'Tangy high-altitude superfruit (“Leh berry”), loaded with vitamin C.', whereToBuy: 'Leh Berry / local co-ops, Main Bazaar', wiki: ['Hippophae rhamnoides', 'Hippophae'] },
  { id: 'thangka', name: 'Thangka painting', area: 'Leh', category: 'Spiritual', estPriceINR: 4500, blurb: 'Hand-painted Buddhist scroll art. Prices scale with detail and natural pigments.', whereToBuy: 'Old Town ateliers & monastery shops', wiki: ['Thangka'] },
  { id: 'prayerflags', name: 'Prayer flags (Lungta)', area: 'Leh', category: 'Spiritual', estPriceINR: 250, blurb: 'Five-colour cotton flags — a light, meaningful, very packable souvenir.', whereToBuy: 'Any Main Bazaar shop', wiki: ['Prayer flag'] },
  { id: 'turquoise', name: 'Turquoise & coral jewellery', area: 'Leh', category: 'Jewellery', estPriceINR: 3000, blurb: 'Traditional Ladakhi silver set with turquoise and coral. Haggle and check authenticity.', whereToBuy: 'Tibetan Market, Main Bazaar', wiki: ['Turquoise'] },
  { id: 'yakwool', name: 'Yak-wool blanket', area: 'Leh', category: 'Textiles', estPriceINR: 3500, blurb: 'Warm, rugged and ethically local — great for the cold desert nights.', whereToBuy: 'Co-operative & nomad craft shops', wiki: ['Domestic yak', 'Yak'] },
  { id: 'singingbowl', name: 'Singing bowl', area: 'Leh', category: 'Spiritual', estPriceINR: 2000, blurb: 'Hand-hammered metal bowl with a long resonant hum. Test the tone before buying.', whereToBuy: 'Tibetan handicraft shops', wiki: ['Standing bell'] },
  { id: 'prayerwheel', name: 'Copper prayer wheel', area: 'Leh', category: 'Handicraft', estPriceINR: 1800, blurb: 'Engraved hand-held mani wheel — beautiful craftsmanship and very giftable.', whereToBuy: 'Old Town metal-craft shops', wiki: ['Prayer wheel'] },
  { id: 'apricotoil', name: 'Apricot kernel oil', area: 'Nubra', category: 'Misc', estPriceINR: 500, blurb: 'Cold-pressed local skincare oil — a practical, lightweight take-home.', whereToBuy: 'Women’s collectives, Nubra', wiki: ['Apricot kernel', 'Apricot'] },
  { id: 'incense', name: 'Tibetan herbal incense', area: 'Leh', category: 'Spiritual', estPriceINR: 300, blurb: 'Monastery-style juniper & herb incense. Cheap, fragrant, easy to pack.', whereToBuy: 'Monastery shops & Main Bazaar', wiki: ['Incense'] },
  { id: 'mask', name: 'Cham festival mask', area: 'General', category: 'Handicraft', estPriceINR: 2500, blurb: 'Mini replica of the masked-dance faces seen at Hemis/Phyang — a vivid keepsake.', whereToBuy: 'Festival stalls & craft shops', wiki: ['Cham dance'] },
  { id: 'pottery', name: 'Likir pottery', area: 'Sham', category: 'Handicraft', estPriceINR: 1200, blurb: 'Traditional hand-thrown pottery from the Sham valley artisans.', whereToBuy: 'Likir village workshops', wiki: ['Pottery'] },
  { id: 'socks', name: 'Hand-knit wool socks & caps', area: 'Leh', category: 'Textiles', estPriceINR: 600, blurb: 'Cosy, colourful and cheap — buy a few as gifts.', whereToBuy: 'Women’s Alliance & street stalls', wiki: ['Knitting', 'Wool'] },
]
