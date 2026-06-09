// src/lib/content/sights.ts
// Per-destination gallery "sights" (the Places gallery). Ladakh keeps using the
// PLACES list in lib/imagery; the other destinations are defined here. Each entry
// resolves a live Wikipedia photo via its `wiki` titles.

import type { FlagColor } from '@/lib/utils'

export interface Sight {
  id: string
  name: string
  blurb: string
  when: string
  region: string
  color: FlagColor
  lat: number
  lng: number
  wiki: string[]
  span?: 'wide' | 'tall' | 'big'
}

export const SIGHTS_BY_SLUG: Record<string, Sight[]> = {
  kashmir: [
    { id: 'dal', name: 'Dal Lake', blurb: 'Srinagar’s mirror lake of houseboats, shikaras and floating gardens.', when: 'Day 1', region: 'Srinagar · 1,585m', color: 'blue', span: 'big', lat: 34.1167, lng: 74.8667, wiki: ['Dal Lake'] },
    { id: 'gulmarg', name: 'Gulmarg', blurb: 'The “meadow of flowers” and its high Gondola toward Apharwat.', when: 'Day 4', region: 'Baramulla · 2,650m', color: 'green', span: 'wide', lat: 34.0498, lng: 74.38, wiki: ['Gulmarg'] },
    { id: 'pahalgam', name: 'Pahalgam', blurb: 'Pine valleys where the Lidder river meets meadows and shepherd trails.', when: 'Day 6', region: 'Anantnag · 2,740m', color: 'green', span: 'tall', lat: 34.0161, lng: 75.315, wiki: ['Pahalgam'] },
    { id: 'nishat', name: 'Mughal Gardens', blurb: 'Terraced Nishat & Shalimar Bagh stepping down to Dal Lake.', when: 'Day 2', region: 'Srinagar', color: 'red', lat: 34.124, lng: 74.881, wiki: ['Nishat Bagh', 'Shalimar Bagh, Srinagar'] },
    { id: 'sonamarg', name: 'Sonamarg', blurb: 'The “meadow of gold” and the Thajiwas glacier’s alpine snout.', when: 'Day 9', region: 'Ganderbal · 2,800m', color: 'blue', span: 'wide', lat: 34.303, lng: 75.292, wiki: ['Sonamarg'] },
    { id: 'hazratbal', name: 'Hazratbal Shrine', blurb: 'White-marble shrine on Dal Lake’s western shore.', when: 'Day 3', region: 'Srinagar', color: 'red', lat: 34.127, lng: 74.842, wiki: ['Hazratbal Shrine'] },
    { id: 'betaab', name: 'Betaab Valley', blurb: 'Lush film-famous valley of meadows under snow peaks near Pahalgam.', when: 'Day 7', region: 'Anantnag', color: 'green', lat: 34.05, lng: 75.36, wiki: ['Betaab Valley'] },
    { id: 'pari', name: 'Pari Mahal', blurb: 'Terraced “palace of fairies” with sweeping views over the city.', when: 'Optional', region: 'Srinagar', color: 'yellow', lat: 34.092, lng: 74.864, wiki: ['Pari Mahal'] },
  ],
  pokhara: [
    { id: 'phewa', name: 'Phewa Lake', blurb: 'The serene lake mirroring the Annapurnas, with Tal Barahi at its heart.', when: 'Day 1', region: 'Pokhara · 820m', color: 'blue', span: 'big', lat: 28.2096, lng: 83.9587, wiki: ['Phewa Lake'] },
    { id: 'sarangkot', name: 'Sarangkot', blurb: 'Sunrise ridge over the Annapurnas and Machhapuchhre; paragliding launch.', when: 'Day 2', region: 'Kaski · 1,592m', color: 'red', span: 'wide', lat: 28.2438, lng: 83.949, wiki: ['Sarangkot'] },
    { id: 'peace', name: 'World Peace Pagoda', blurb: 'White hilltop stupa with panoramic lake-and-mountain views.', when: 'Day 2', region: 'Pumdikot · 1,100m', color: 'red', span: 'tall', lat: 28.2003, lng: 83.945, wiki: ['World Peace Pagoda, Pokhara'] },
    { id: 'devisfall', name: 'Devi’s Fall', blurb: 'A waterfall that vanishes underground into the Gupteshwor cave.', when: 'Day 3', region: 'Pokhara', color: 'blue', lat: 28.187, lng: 83.957, wiki: ['Devi\'s Fall'] },
    { id: 'machhapuchhre', name: 'Machhapuchhre', blurb: 'The sacred unclimbed “Fishtail” peak that towers over the valley.', when: 'Always', region: 'Annapurna · 6,993m', color: 'green', span: 'wide', lat: 28.4953, lng: 83.9492, wiki: ['Machhapuchhre'] },
    { id: 'begnas', name: 'Begnas Lake', blurb: 'The quieter second lake — boating, birdsong and forest.', when: 'Day 8', region: 'Kaski · 650m', color: 'blue', lat: 28.17, lng: 84.09, wiki: ['Begnas Lake'] },
    { id: 'australian', name: 'Australian Camp', blurb: 'Ridge-top meadow camp facing the Annapurna giants.', when: 'Day 6', region: 'Kaski · 2,060m', color: 'green', lat: 28.3, lng: 83.85, wiki: ['Dhampus'] },
    { id: 'mountainmuseum', name: 'Intl. Mountain Museum', blurb: 'Himalayan mountaineering history under the peaks themselves.', when: 'Day 9', region: 'Pokhara', color: 'yellow', lat: 28.196, lng: 83.978, wiki: ['International Mountain Museum'] },
  ],
  spiti: [
    { id: 'key', name: 'Key Monastery', blurb: 'Spiti’s largest gompa, stacked like a fort above the river.', when: 'Day 4', region: 'Spiti · 4,166m', color: 'red', span: 'big', lat: 32.298, lng: 78.012, wiki: ['Key Monastery'] },
    { id: 'chandratal', name: 'Chandratal', blurb: 'The cobalt “moon lake” on the high Kunzum plateau.', when: 'Day 10', region: 'Lahaul–Spiti · 4,300m', color: 'blue', span: 'wide', lat: 32.479, lng: 77.619, wiki: ['Chandra Taal'] },
    { id: 'kibber', name: 'Kibber', blurb: 'One of the world’s highest villages and a snow-leopard haunt.', when: 'Day 4', region: 'Spiti · 4,270m', color: 'green', span: 'tall', lat: 32.333, lng: 78.01, wiki: ['Kibber'] },
    { id: 'langza', name: 'Langza', blurb: 'Fossil fields beneath a giant golden Buddha at 4,400m.', when: 'Day 6', region: 'Spiti · 4,400m', color: 'yellow', lat: 32.27, lng: 78.07, wiki: ['Langza'] },
    { id: 'dhankar', name: 'Dhankar', blurb: 'Cliff-edge monastery over the Spiti–Pin confluence, with a lake above.', when: 'Day 7', region: 'Spiti · 3,894m', color: 'red', span: 'wide', lat: 32.083, lng: 78.217, wiki: ['Dhankar Monastery'] },
    { id: 'pin', name: 'Pin Valley', blurb: 'A green-and-ochre national park of ibex and remote villages.', when: 'Day 8', region: 'Spiti · 3,650m', color: 'green', lat: 31.94, lng: 78.0, wiki: ['Pin Valley National Park'] },
    { id: 'tabo', name: 'Tabo Monastery', blurb: 'The 1,000-year-old “Ajanta of the Himalayas” and its murals.', when: 'Day 9', region: 'Spiti · 3,280m', color: 'red', lat: 32.094, lng: 78.385, wiki: ['Tabo Monastery'] },
    { id: 'kaza', name: 'Kaza', blurb: 'The valley’s lively little capital and your high-desert base.', when: 'Day 1', region: 'Spiti · 3,650m', color: 'blue', lat: 32.2264, lng: 78.0716, wiki: ['Kaza, Himachal Pradesh'] },
  ],
}
