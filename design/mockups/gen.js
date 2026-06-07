const { R, L, C, T, icon, chev, canvas, render } = require('./lib.js')

/* ---------- shared bits ---------- */
function tabbar(px, py, PW, PH, items, active, theme) {
  const h = 74, y = py + PH - h
  let s = R(px, y, PW, h, 0, theme.tabBg) + L(px, y, px + PW, y, theme.border, 1)
  const n = items.length, w = PW / n
  items.forEach((it, i) => {
    const cx = px + w * i + w / 2, on = i === active
    const col = on ? theme.accent : theme.muted
    s += icon(it.icon, cx - 11, y + 14, 22, col, 2)
    s += T(cx, y + 56, it.label, { size: 11, weight: on ? 700 : 500, fill: col, anchor: 'middle' })
  })
  return s
}
const chip = (x, y, w, h, fill, stroke, txt, tcol, ts = 12) =>
  R(x, y, w, h, h / 2, fill, stroke ? `stroke="${stroke}"` : '') + T(x + w / 2, y + h / 2 + ts * 0.36, txt, { size: ts, weight: 600, fill: tcol, anchor: 'middle' })

/* ============================================================ OPTION A — ALPINE LIGHT */
const A = {
  bg: '#F7F4EF', surface: '#FFFFFF', ink: '#23221F', muted: '#8A857C', accent: '#C2613D',
  border: '#EBE5DB', tabBg: '#FFFFFF', deviceBezel: '#1b1a18', notch: '#23221F',
  palette: ['#F7F4EF', '#FFFFFF', '#23221F', '#C2613D', '#EBE5DB'],
}
const aTabs = [{ icon: 'home', label: 'Home' }, { icon: 'cal', label: 'Plan' }, { icon: 'book', label: 'Journal' }, { icon: 'wallet', label: 'Budget' }, { icon: 'grid', label: 'More' }]
function aHome(px, py, PW, PH) {
  const x = px + 22; let s = ''
  s += T(x, py + 74, 'TUE · 22 JUL', { size: 12, weight: 700, fill: A.muted, spacing: 1.5 })
  s += T(x, py + 104, 'Good morning, Amit', { size: 23, weight: 800, fill: A.ink })
  // hero
  s += `<defs><linearGradient id="ah" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C2613D"/><stop offset="1" stop-color="#6E94A6"/></linearGradient></defs>`
  s += R(x, py + 124, PW - 44, 150, 20, 'url(#ah)')
  s += T(x + 20, py + 188, 'Leh Ladakh', { size: 26, weight: 800, fill: '#fff', family: 'Georgia, serif' })
  s += T(x + 20, py + 212, '21-day workation', { size: 14, weight: 500, fill: '#ffffffdd' })
  s += chip(x + 20, py + 232, 120, 30, '#ffffff', '', '42 days to go', '#C2613D', 13)
  // stat tiles
  const tw = (PW - 44 - 24) / 3
  ;[['42', 'days'], ['18%', 'spent'], ['7/24', 'prep']].forEach((d, i) => {
    const tx = x + i * (tw + 12)
    s += R(tx, py + 292, tw, 76, 16, A.surface, `stroke="${A.border}"`)
    s += T(tx + tw / 2, py + 330, d[0], { size: 22, weight: 800, fill: A.ink, anchor: 'middle' })
    s += T(tx + tw / 2, py + 352, d[1], { size: 12, weight: 500, fill: A.muted, anchor: 'middle' })
  })
  // quick add
  s += T(x, py + 402, 'Quick add', { size: 14, weight: 700, fill: A.ink })
  ;[['plus', 'Expense'], ['book', 'Journal']].forEach((d, i) => {
    const bx = x + i * ((PW - 44) / 2 + 0) , bw = (PW - 44 - 12) / 2, bxx = x + i * (bw + 12)
    s += R(bxx, py + 416, bw, 48, 14, A.surface, `stroke="${A.accent}" stroke-opacity="0.5"`)
    s += icon(d[0], bxx + 16, py + 428, 22, A.accent)
    s += T(bxx + 46, py + 446, d[1], { size: 15, weight: 600, fill: A.ink })
  })
  // up next list
  s += T(x, py + 502, 'Up next', { size: 14, weight: 700, fill: A.ink })
  ;[['fest', 'Phyang Tsedup Festival', 'Day 2 · 17km from Leh'], ['bag', 'Pack thermal layers', 'Prep · due this week']].forEach((d, i) => {
    const ry = py + 516 + i * 60
    s += R(x, ry, PW - 44, 52, 14, A.surface, `stroke="${A.border}"`)
    s += R(x + 10, ry + 10, 32, 32, 9, '#F2E7E0')
    s += icon(d[0], x + 16, ry + 16, 20, A.accent)
    s += T(x + 54, ry + 24, d[1], { size: 14, weight: 600, fill: A.ink })
    s += T(x + 54, ry + 41, d[2], { size: 11.5, weight: 500, fill: A.muted })
    s += chev(x + PW - 44 - 26, ry + 16, 18, A.muted)
  })
  s += tabbar(px, py, PW, PH, aTabs, 0, A)
  return s
}
function aItin(px, py, PW, PH) {
  const x = px + 22; let s = ''
  s += T(x, py + 84, 'Itinerary', { size: 26, weight: 800, fill: A.ink })
  s += T(x, py + 106, '21 days · Jul 22 – Aug 11', { size: 13, weight: 500, fill: A.muted })
  // segmented
  const segs = ['Timeline', 'Weeks', 'Map'], sw = (PW - 44) / 3
  s += R(x, py + 120, PW - 44, 40, 12, '#EFE9E0')
  segs.forEach((g, i) => {
    if (i === 0) s += R(x + 3, py + 123, sw - 6, 34, 10, A.surface, `stroke="${A.border}"`)
    s += T(x + sw * i + sw / 2, py + 145, g, { size: 13, weight: i === 0 ? 700 : 500, fill: i === 0 ? A.ink : A.muted, anchor: 'middle' })
  })
  const days = [['1', 'Arrival in Leh', 'Rest & acclimatise', '☀ 24°'], ['2', 'Phyang Festival', 'Masked Cham dances', '⛅ 22°'], ['3', 'Leh Old Town', 'Cafés & palace', '☀ 25°'], ['4', 'Shanti Stupa', 'Sunset views', '☀ 23°']]
  days.forEach((d, i) => {
    const ry = py + 180 + i * 92
    s += R(x, ry, PW - 44, 80, 16, A.surface, `stroke="${A.border}"`)
    s += C(x + 34, ry + 40, 20, '#F2E7E0')
    s += T(x + 34, ry + 46, d[0], { size: 18, weight: 800, fill: A.accent, anchor: 'middle' })
    s += T(x + 66, ry + 32, 'Day ' + d[0], { size: 11, weight: 700, fill: A.muted, spacing: 0.5 })
    s += T(x + 66, ry + 52, d[1], { size: 15.5, weight: 700, fill: A.ink })
    s += T(x + 66, ry + 70, d[2], { size: 12, weight: 500, fill: A.muted })
    s += chip(x + PW - 44 - 70, ry + 14, 58, 24, '#EEF3F4', '', d[3], '#3F7689', 11.5)
    s += chev(x + PW - 44 - 26, ry + 50, 16, A.muted)
  })
  s += tabbar(px, py, PW, PH, aTabs, 1, A)
  return s
}
function aMenu(px, py, PW, PH) {
  const x = px + 22; let s = ''
  s += T(x, py + 84, 'Menu', { size: 26, weight: 800, fill: A.ink })
  const rows = [['cal', 'Itinerary', '21-day plan'], ['book', 'Journal', 'Daily log & photos'], ['wallet', 'Budget', 'Track spend'], ['map', 'Stays', 'Hotels & guesthouses'], ['trek', 'Treks', '3 weekend hikes'], ['food', 'Food & Cafés', 'Best spots in Leh'], ['fest', 'Festivals', 'Phyang Tsedup + more'], ['bag', 'Shop list', 'What to buy where']]
  rows.forEach((d, i) => {
    const ry = py + 110 + i * 64
    s += R(x, ry, PW - 44, 56, 14, A.surface, `stroke="${A.border}"`)
    s += R(x + 12, ry + 12, 32, 32, 9, '#F2E7E0')
    s += icon(d[0], x + 18, ry + 18, 20, A.accent)
    s += T(x + 56, ry + 27, d[1], { size: 15, weight: 700, fill: A.ink })
    s += T(x + 56, ry + 44, d[2], { size: 11.5, weight: 500, fill: A.muted })
    s += chev(x + PW - 44 - 26, ry + 20, 16, A.muted)
  })
  s += tabbar(px, py, PW, PH, aTabs, 4, A)
  return s
}

/* ============================================================ OPTION B — PRAYER FLAG */
const B = {
  bg: '#FBFAF7', surface: '#FFFFFF', ink: '#1E2430', muted: '#8C92A0', accent: '#D24B3E',
  border: '#ECEAE4', tabBg: '#FFFFFF', deviceBezel: '#1b1a18', notch: '#1E2430',
  palette: ['#2F6DB5', '#FFFFFF', '#D24B3E', '#3E9E6E', '#E8B33D'],
}
const FLAG = { blue: '#2F6DB5', red: '#D24B3E', green: '#3E9E6E', yellow: '#E8B33D' }
const tint = { blue: '#E7F0FA', red: '#FBE9E7', green: '#E7F4EE', yellow: '#FCF3DE' }
const bTabs = [{ icon: 'home', label: 'Home' }, { icon: 'cal', label: 'Plan' }, { icon: 'book', label: 'Journal' }, { icon: 'wallet', label: 'Budget' }, { icon: 'grid', label: 'More' }]
function bTile(x, y, w, h, color, tn, ic, label, sub) {
  let s = R(x, y, w, h, 22, tn)
  s += R(x + 16, y + 16, 44, 44, 13, color)
  s += icon(ic, x + 27, y + 27, 22, '#fff', 2.2)
  s += T(x + 16, y + h - 30, label, { size: 16, weight: 800, fill: '#1E2430' })
  s += T(x + 16, y + h - 12, sub, { size: 11.5, weight: 500, fill: '#6B7280' })
  return s
}
function bHome(px, py, PW, PH) {
  const x = px + 22; let s = ''
  s += T(x, py + 78, 'Good morning, Amit', { size: 22, weight: 800, fill: B.ink })
  s += T(x, py + 100, '22 July · 42 days to Ladakh', { size: 13, weight: 500, fill: B.muted })
  s += chip(x + PW - 44 - 96, py + 64, 96, 30, tint.blue, '', '☀ 24° Leh', FLAG.blue, 12.5)
  // countdown banner
  s += `<defs><linearGradient id="bh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2F6DB5"/><stop offset="0.5" stop-color="#D24B3E"/><stop offset="1" stop-color="#E8B33D"/></linearGradient></defs>`
  s += R(x, py + 116, PW - 44, 70, 18, 'url(#bh)')
  s += T(x + 18, py + 150, '42', { size: 30, weight: 800, fill: '#fff' })
  s += T(x + 64, py + 146, 'days until', { size: 13, weight: 600, fill: '#ffffffee' })
  s += T(x + 64, py + 164, 'your trip begins', { size: 13, weight: 600, fill: '#ffffffee' })
  // 2-col tiles
  const tw = (PW - 44 - 14) / 2, th = 104
  const tiles = [['blue', 'cal', 'Itinerary', '21-day plan'], ['red', 'fest', 'Festivals', '2 during trip'], ['green', 'trek', 'Treks', '3 weekends'], ['yellow', 'wallet', 'Budget', '₹1.5L plan']]
  tiles.forEach((t, i) => {
    const tx = x + (i % 2) * (tw + 14), ty = py + 204 + Math.floor(i / 2) * (th + 14)
    s += bTile(tx, ty, tw, th, FLAG[t[0]], tint[t[0]], t[1], t[2], t[3])
  })
  // quick add
  s += R(x, py + 446, PW - 44, 60, 16, B.surface, `stroke="${B.border}"`)
  s += T(x + 16, py + 472, 'Log something', { size: 14, weight: 700, fill: B.ink })
  s += T(x + 16, py + 492, 'Expense · Journal · Photo', { size: 11.5, weight: 500, fill: B.muted })
  s += R(x + PW - 44 - 56, py + 458, 40, 36, 11, FLAG.red)
  s += icon('plus', x + PW - 44 - 48, py + 466, 22, '#fff', 2.4)
  s += tabbar(px, py, PW, PH, bTabs, 0, { ...B, accent: FLAG.red })
  return s
}
function bItin(px, py, PW, PH) {
  const x = px + 22; let s = ''
  s += T(x, py + 84, 'Itinerary', { size: 26, weight: 800, fill: B.ink })
  // pills
  const pills = [['All', '#1E2430', '#EAE7E0'], ['Festival', FLAG.red, tint.red], ['Trek', FLAG.green, tint.green], ['Work', FLAG.blue, tint.blue]]
  let cx2 = x
  pills.forEach((p, i) => { const w = 30 + p[0].length * 9; s += chip(cx2, py + 104, w, 30, p[2], '', p[0], p[1], 12.5); cx2 += w + 8 })
  const days = [['1', 'Arrival in Leh', 'blue', 'Work'], ['2', 'Phyang Festival', 'red', 'Festival'], ['3', 'Leh Old Town', 'blue', 'Work'], ['6', 'Sham Valley Trek', 'green', 'Trek'], ['8', 'Pangong Lake', 'yellow', 'Excursion']]
  days.forEach((d, i) => {
    const ry = py + 150 + i * 86
    s += R(x, ry, PW - 44, 74, 16, B.surface, `stroke="${B.border}"`)
    s += R(x, ry, 6, 74, 0, FLAG[d[2]])
    s += C(x + 38, ry + 37, 19, tint[d[2]])
    s += T(x + 38, ry + 43, d[0], { size: 17, weight: 800, fill: FLAG[d[2]], anchor: 'middle' })
    s += T(x + 68, ry + 33, d[1], { size: 15.5, weight: 700, fill: B.ink })
    s += chip(x + 68, ry + 44, 30 + d[3].length * 8, 22, tint[d[2]], '', d[3], FLAG[d[2]], 11)
    s += chev(x + PW - 44 - 26, ry + 29, 16, B.muted)
  })
  s += tabbar(px, py, PW, PH, bTabs, 1, { ...B, accent: FLAG.red })
  return s
}
function bMenu(px, py, PW, PH) {
  const x = px + 22; let s = ''
  s += T(x, py + 84, 'Everything', { size: 26, weight: 800, fill: B.ink })
  const tiles = [['blue', 'cal', 'Itinerary'], ['red', 'fest', 'Festivals'], ['green', 'trek', 'Treks'], ['yellow', 'wallet', 'Budget'], ['blue', 'map', 'Stays'], ['green', 'food', 'Food'], ['red', 'bag', 'Shop'], ['yellow', 'plane', 'Flights'], ['blue', 'book', 'Journal']]
  const tw = (PW - 44 - 28) / 3, th = 96
  tiles.forEach((t, i) => {
    const tx = x + (i % 3) * (tw + 14), ty = py + 110 + Math.floor(i / 3) * (th + 14)
    s += R(tx, ty, tw, th, 18, tint[t[0]])
    s += R(tx + tw / 2 - 22, ty + 16, 44, 44, 13, FLAG[t[0]])
    s += icon(t[1], tx + tw / 2 - 11, ty + 27, 22, '#fff', 2.2)
    s += T(tx + tw / 2, ty + 80, t[2], { size: 12.5, weight: 700, fill: B.ink, anchor: 'middle' })
  })
  s += tabbar(px, py, PW, PH, bTabs, 4, { ...B, accent: FLAG.red })
  return s
}

/* ============================================================ OPTION C — EDITORIAL */
const SERIF = "Georgia, 'Times New Roman', serif"
const Cc = {
  bg: '#FAF6EE', surface: '#FFFFFF', ink: '#171410', muted: '#9A9286', accent: '#34406B',
  gold: '#B0832B', border: '#E6DECF', tabBg: '#FAF6EE', deviceBezel: '#1b1a18', notch: '#171410',
  palette: ['#FAF6EE', '#34406B', '#B0832B', '#171410', '#E6DECF'],
}
const cTabs = [{ icon: 'home', label: 'Today' }, { icon: 'cal', label: 'Plan' }, { icon: 'book', label: 'Journal' }, { icon: 'grid', label: 'More' }]
function cHome(px, py, PW, PH) {
  const x = px + 26; let s = ''
  s += T(px + PW / 2, py + 72, 'L E H · L A D A K H', { size: 13, weight: 700, fill: Cc.gold, anchor: 'middle', spacing: 3 })
  s += L(x, py + 86, px + PW - 26, py + 86, Cc.border, 1)
  // hero
  s += `<defs><linearGradient id="ch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b6a93"/><stop offset="1" stop-color="#222a44"/></linearGradient></defs>`
  s += R(x, py + 104, PW - 52, 220, 6, 'url(#ch)')
  s += T(x + 22, py + 250, 'The', { size: 26, weight: 400, fill: '#fff', family: SERIF, italic: true })
  s += T(x + 22, py + 286, 'Workation', { size: 40, weight: 700, fill: '#fff', family: SERIF })
  s += T(x + 22, py + 310, '42 DAYS UNTIL DEPARTURE', { size: 11, weight: 700, fill: '#ffffffcc', spacing: 2 })
  // stat columns
  const cols = [['42', 'Days'], ['21', 'Nights'], ['₹1.5L', 'Budget']], cw = (PW - 52) / 3
  cols.forEach((d, i) => {
    const tx = x + i * cw
    if (i) s += L(tx, py + 350, tx, py + 404, Cc.border, 1)
    s += T(tx + cw / 2, py + 384, d[0], { size: 26, weight: 700, fill: Cc.ink, anchor: 'middle', family: SERIF })
    s += T(tx + cw / 2, py + 402, d[1], { size: 11, weight: 600, fill: Cc.muted, anchor: 'middle', spacing: 1 })
  })
  s += L(x, py + 426, px + PW - 26, py + 426, Cc.border, 1)
  s += T(x, py + 456, 'Today', { size: 20, weight: 700, fill: Cc.ink, family: SERIF })
  const items = [['01', 'Phyang Tsedup Festival', 'Masked dances · 17km'], ['02', 'Pack thermal layers', 'Prep · due this week']]
  items.forEach((d, i) => {
    const ry = py + 476 + i * 56
    s += T(x, ry + 26, d[0], { size: 18, weight: 700, fill: Cc.gold, family: SERIF })
    s += T(x + 40, ry + 20, d[1], { size: 14.5, weight: 600, fill: Cc.ink })
    s += T(x + 40, ry + 38, d[2], { size: 11.5, weight: 500, fill: Cc.muted })
    s += chev(x + PW - 52 - 22, ry + 14, 16, Cc.muted)
    s += L(x, ry + 50, px + PW - 26, ry + 50, Cc.border, 1)
  })
  s += tabbar(px, py, PW, PH, cTabs, 0, Cc)
  return s
}
function cItin(px, py, PW, PH) {
  const x = px + 26; let s = ''
  s += T(x, py + 96, 'Itinerary', { size: 30, weight: 700, fill: Cc.ink, family: SERIF })
  s += T(x, py + 120, 'TWENTY-ONE DAYS · JUL–AUG', { size: 10.5, weight: 700, fill: Cc.muted, spacing: 1.5 })
  s += L(x, py + 138, px + PW - 26, py + 138, Cc.ink, 1.5)
  const days = [['01', 'Arrival in Leh', 'Rest & acclimatise'], ['02', 'Phyang Festival', 'Masked Cham dances'], ['03', 'Leh Old Town', 'Cafés & palace walk'], ['04', 'Shanti Stupa', 'Sunset over the valley'], ['05', 'Thiksey Gompa', 'Dawn prayers']]
  days.forEach((d, i) => {
    const ry = py + 150 + i * 78
    s += T(x, ry + 44, d[0], { size: 30, weight: 700, fill: i === 1 ? Cc.gold : Cc.accent, family: SERIF })
    s += T(x + 62, ry + 36, d[1], { size: 17, weight: 600, fill: Cc.ink, family: SERIF })
    s += T(x + 62, ry + 56, d[2], { size: 12, weight: 500, fill: Cc.muted })
    s += chev(x + PW - 52 - 20, ry + 30, 16, Cc.muted)
    s += L(x, ry + 70, px + PW - 26, ry + 70, Cc.border, 1)
  })
  s += tabbar(px, py, PW, PH, cTabs, 1, Cc)
  return s
}
function cMenu(px, py, PW, PH) {
  const x = px + 26; let s = ''
  s += T(x, py + 96, 'Sections', { size: 30, weight: 700, fill: Cc.ink, family: SERIF })
  s += L(x, py + 116, px + PW - 26, py + 116, Cc.ink, 1.5)
  const groups = [['PLAN', [['Itinerary', '21-day plan'], ['Stays', 'Hotels & guesthouses'], ['Transport', 'Taxis & permits']]], ['DO', [['Treks', '3 weekend hikes'], ['Festivals', 'Phyang Tsedup + more'], ['Food & Cafés', 'Best spots in Leh']]], ['TRACK', [['Budget', 'Every rupee'], ['Journal', 'Daily log & photos'], ['Shop list', 'What to buy where']]]]
  let yy = py + 138
  groups.forEach(g => {
    s += T(x, yy + 18, g[0], { size: 10.5, weight: 700, fill: Cc.gold, spacing: 2 })
    yy += 28
    g[1].forEach(r => {
      s += T(x, yy + 16, r[0], { size: 15.5, weight: 600, fill: Cc.ink, family: SERIF })
      s += T(x, yy + 33, r[1], { size: 11.5, weight: 500, fill: Cc.muted })
      s += chev(x + PW - 52 - 20, yy + 8, 15, Cc.muted)
      s += L(x, yy + 44, px + PW - 26, yy + 44, Cc.border, 1)
      yy += 52
    })
    yy += 8
  })
  s += tabbar(px, py, PW, PH, cTabs, 3, Cc)
  return s
}

/* ---------- render all ---------- */
render(canvas('Option A — “Alpine Light”', 'Calm, minimal, lots of whitespace. One warm accent on a soft off-white. Bottom tab bar of 5.', 'PRINCIPLES:  airy whitespace · single accent · clear tap targets · sentence case · 5-item nav', A, [aHome, aItin, aMenu]), __dirname + '/optionA.png')
render(canvas('Option B — “Prayer Flag”', 'Friendly & colour-coded using the five Tibetan flag colours. Big tappable tiles, app-launcher feel.', 'PRINCIPLES:  colour-coded categories · large tiles · playful + scannable · bottom tab bar', B, [bHome, bItin, bMenu]), __dirname + '/optionB.png')
render(canvas('Option C — “Editorial”', 'Refined travel-magazine look. Serif display, hairline rules, big numerals, generous space.', 'PRINCIPLES:  editorial hierarchy · serif headings · hairline dividers · premium restraint', Cc, [cHome, cItin, cMenu]), __dirname + '/optionC.png')
console.log('done')
