const { R, L, C, T, icon, chev, render } = require('./lib.js')
const fs = require('fs')

/* ---- palette: Tibetan prayer-flag colour system ---- */
const FLAG = { blue: '#2F6DB5', red: '#D24B3E', green: '#3E9E6E', yellow: '#E0A21B', ink: '#3A4150' }
const TINT = { blue: '#E7F0FA', red: '#FBE9E7', green: '#E7F4EE', yellow: '#FBF0D8', ink: '#ECEEF2' }
const UI = { bg: '#FBFAF7', surface: '#FFFFFF', ink: '#1E2430', muted: '#8C92A0', border: '#EDEBE5', tabBg: '#FFFFFF', deviceBezel: '#1b1a18', notch: '#1E2430' }

const shadow = (x, y, w, h, r) => R(x, y + 3, w, h, r, '#00000010')
const card = (x, y, w, h, r = 18, stroke = UI.border) => shadow(x, y, w, h, r) + R(x, y, w, h, r, UI.surface, `stroke="${stroke}"`)
function chip(x, y, w, h, fill, txt, tcol, ts = 12, stroke = '') {
  return R(x, y, w, h, h / 2, fill, stroke ? `stroke="${stroke}"` : '') + T(x + w / 2, y + h / 2 + ts * 0.35, txt, { size: ts, weight: 700, fill: tcol, anchor: 'middle' })
}
const cw = (s, ts) => 22 + s.length * ts * 0.58 // approx chip width
function lines(x, y, arr, o, lh = 17) { let s = ''; arr.forEach((t, i) => s += T(x, y + i * lh, t, o)); return s }
function tabbar(px, py, PW, PH, active) {
  const items = [{ icon: 'home', label: 'Home' }, { icon: 'cal', label: 'Plan' }, { icon: 'book', label: 'Journal' }, { icon: 'wallet', label: 'Budget' }, { icon: 'grid', label: 'More' }]
  const h = 74, y = py + PH - h; let s = R(px, y, PW, h, 0, UI.tabBg) + L(px, y, px + PW, y, UI.border, 1)
  const w = PW / items.length
  items.forEach((it, i) => { const cx = px + w * i + w / 2, on = i === active, col = on ? FLAG.red : UI.muted; s += icon(it.icon, cx - 11, y + 14, 22, col, 2); s += T(cx, y + 56, it.label, { size: 11, weight: on ? 700 : 500, fill: col, anchor: 'middle' }) })
  return s
}
// device frame + screen
function phone(px, py, PW, PH, content, caption) {
  const r = 38, clip = 'c' + px + '_' + py; let s = ''
  s += R(px - 6, py - 6, PW + 12, PH + 12, r + 6, UI.deviceBezel)
  s += `<clipPath id="${clip}"><rect x="${px}" y="${py}" width="${PW}" height="${PH}" rx="${r}"/></clipPath><g clip-path="url(#${clip})">`
  s += R(px, py, PW, PH, r, UI.bg) + content(px, py, PW, PH)
  s += T(px + 24, py + 30, '9:41', { size: 14, weight: 700, fill: UI.ink }) + R(px + PW / 2 - 28, py + 12, 56, 18, 9, UI.notch)
  s += `</g>`
  s += T(px + PW / 2, py + PH + 34, caption, { size: 16, weight: 600, fill: '#3a3a3a', anchor: 'middle' })
  return s
}

/* ===================== SCREENS ===================== */
function home(px, py, PW, PH) {
  const x = px + 22; let s = ''
  s += T(x, py + 76, 'Good morning, Amit', { size: 22, weight: 800, fill: UI.ink })
  s += T(x, py + 98, '22 July · 42 days to Ladakh', { size: 12.5, weight: 500, fill: UI.muted })
  s += chip(x + PW - 44 - 92, py + 62, 92, 30, TINT.blue, 'Leh 24°', FLAG.blue, 12.5)
  s += `<defs><linearGradient id="bh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2F6DB5"/><stop offset="0.5" stop-color="#D24B3E"/><stop offset="1" stop-color="#E0A21B"/></linearGradient></defs>`
  s += R(x, py + 114, PW - 44, 72, 18, 'url(#bh)')
  s += T(x + 20, py + 150, '42', { size: 32, weight: 800, fill: '#fff' })
  s += lines(x + 70, py + 144, ['days until', 'your trip begins'], { size: 13, weight: 600, fill: '#fff' }, 18)
  s += R(x + PW - 44 - 92, py + 134, 78, 32, 16, '#ffffff33') + T(x + PW - 44 - 53, py + 154, 'View plan', { size: 12, weight: 700, fill: '#fff', anchor: 'middle' })
  const tw = (PW - 44 - 14) / 2, th = 102
  const tiles = [['blue', 'cal', 'Itinerary', '21-day plan'], ['red', 'fest', 'Festivals', '2 during trip'], ['green', 'trek', 'Treks', '3 weekends'], ['yellow', 'bag', 'Shop list', '8 / 24 done']]
  tiles.forEach((t, i) => {
    const tx = x + (i % 2) * (tw + 14), ty = py + 204 + Math.floor(i / 2) * (th + 14)
    s += shadow(tx, ty, tw, th, 20) + R(tx, ty, tw, th, 20, TINT[t[0]])
    s += R(tx + 16, ty + 16, 42, 42, 12, FLAG[t[0]]) + icon(t[1], tx + 26, ty + 26, 22, '#fff', 2.2)
    s += T(tx + 16, ty + th - 28, t[2], { size: 16, weight: 800, fill: UI.ink })
    s += T(tx + 16, ty + th - 11, t[3], { size: 11.5, weight: 500, fill: '#6B7280' })
  })
  s += card(x, py + 442, PW - 44, 60)
  s += T(x + 16, py + 468, 'Log something', { size: 14, weight: 700, fill: UI.ink })
  s += T(x + 16, py + 488, 'Expense · Journal · Photo', { size: 11.5, weight: 500, fill: UI.muted })
  s += R(x + PW - 44 - 56, py + 454, 40, 36, 11, FLAG.red) + icon('plus', x + PW - 44 - 48, py + 462, 22, '#fff', 2.4)
  s += tabbar(px, py, PW, PH, 0)
  return s
}
function itinerary(px, py, PW, PH) {
  const x = px + 22; let s = ''
  s += T(x, py + 84, 'Itinerary', { size: 26, weight: 800, fill: UI.ink })
  const pills = [['All', FLAG.ink, TINT.ink], ['Festival', FLAG.red, TINT.red], ['Trek', FLAG.green, TINT.green], ['Plan', FLAG.blue, TINT.blue]]
  let cx = x; pills.forEach(p => { const w = cw(p[0], 12.5); s += chip(cx, py + 102, w, 30, p[2], p[0], p[1], 12.5); cx += w + 8 })
  const days = [['1', 'Arrival in Leh', 'blue', 'Plan', false], ['2', 'Phyang Festival', 'red', 'Festival', true], ['3', 'Leh Old Town', 'blue', 'Plan', false], ['6', 'Sham Valley Trek', 'green', 'Trek', false], ['8', 'Pangong Lake', 'yellow', 'Excursion', false]]
  days.forEach((d, i) => {
    const ry = py + 148 + i * 84
    s += card(x, ry, PW - 44, 72, 16) + R(x, ry, 6, 72, 0, FLAG[d[2]])
    s += C(x + 40, ry + 36, 19, TINT[d[2]]) + T(x + 40, ry + 42, d[0], { size: 17, weight: 800, fill: FLAG[d[2]], anchor: 'middle' })
    s += T(x + 70, ry + 32, d[1], { size: 15.5, weight: 700, fill: UI.ink })
    s += chip(x + 70, ry + 44, cw(d[3], 11), 21, TINT[d[2]], d[3], FLAG[d[2]], 11)
    if (d[4]) s += chip(x + PW - 44 - 56, ry + 12, 44, 20, '#FFF3D6', 'Today', '#B07A00', 10)
    s += chev(x + PW - 44 - 26, ry + 28, 16, UI.muted)
  })
  s += tabbar(px, py, PW, PH, 1)
  return s
}
function menu(px, py, PW, PH) {
  const x = px + 22; let s = ''
  s += T(x, py + 84, 'Everything', { size: 26, weight: 800, fill: UI.ink })
  const tiles = [['blue', 'cal', 'Itinerary'], ['red', 'fest', 'Festivals'], ['green', 'trek', 'Treks'], ['yellow', 'wallet', 'Budget'], ['blue', 'map', 'Stays'], ['red', 'food', 'Food'], ['green', 'pin', 'Transport'], ['yellow', 'bag', 'Shop'], ['blue', 'plane', 'Flights'], ['ink', 'book', 'Journal'], ['ink', 'user', 'Diary'], ['red', 'plus', 'Invite']]
  const tw = (PW - 44 - 28) / 3, th = 92
  tiles.forEach((t, i) => {
    const tx = x + (i % 3) * (tw + 14), ty = py + 110 + Math.floor(i / 3) * (th + 14)
    s += R(tx, ty, tw, th, 18, TINT[t[0]]) + R(tx + tw / 2 - 21, ty + 16, 42, 42, 12, FLAG[t[0]]) + icon(t[1], tx + tw / 2 - 11, ty + 26, 22, '#fff', 2.2)
    s += T(tx + tw / 2, ty + 78, t[2], { size: 12, weight: 700, fill: UI.ink, anchor: 'middle' })
  })
  s += tabbar(px, py, PW, PH, 4)
  return s
}
function festival(px, py, PW, PH) {
  const x = px + 20; let s = ''
  s += icon('chev', x - 2, py + 56, 22, UI.ink, 2.2) + `<g transform="translate(${x + 18},${py + 78}) scale(-1,1)"></g>`
  s += T(x + 26, py + 74, 'Festival', { size: 13, weight: 700, fill: FLAG.red, spacing: 1 })
  s += `<defs><linearGradient id="fh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D24B3E"/><stop offset="1" stop-color="#E0A21B"/></linearGradient></defs>`
  s += R(x, py + 90, PW - 40, 150, 18, 'url(#fh)')
  s += T(x + 18, py + 196, 'Phyang Tsedup', { size: 25, weight: 800, fill: '#fff', family: 'Georgia, serif' })
  s += T(x + 18, py + 220, 'Masked Cham dances & giant thangka', { size: 12.5, weight: 500, fill: '#ffffffdd' })
  let cx = x; [['Jul 22–23', TINT.red, FLAG.red], ['Free entry', TINT.green, FLAG.green], ['17 km', TINT.blue, FLAG.blue]].forEach(c2 => { const w = cw(c2[0], 12); s += chip(cx, py + 256, w, 30, c2[1], c2[0], c2[2], 12); cx += w + 8 })
  s += T(x, py + 318, 'About', { size: 15, weight: 800, fill: UI.ink })
  s += lines(x, py + 340, ['One of Ladakh’s most spectacular festivals.', 'Monks perform sacred masked dances; a giant', 'silk thangka is unfurled at dawn. Arrive early', 'for the best view from the courtyard.'], { size: 12.5, weight: 500, fill: '#566' }, 19)
  s += T(x, py + 436, 'Reviews from around the web', { size: 13, weight: 700, fill: UI.ink })
  let rx = x; ['Google Maps', 'TripAdvisor'].forEach(r => { const w = cw(r, 11.5); s += chip(rx, py + 450, w, 28, '#fff', r, UI.ink, 11.5, UI.border); rx += w + 8 })
  s += R(x, py + 502, PW - 40, 50, 14, FLAG.red) + T(x + (PW - 40) / 2, py + 533, 'Add to my itinerary', { size: 15, weight: 700, fill: '#fff', anchor: 'middle' })
  s += tabbar(px, py, PW, PH, 1)
  return s
}
function budget(px, py, PW, PH) {
  const x = px + 20; let s = ''
  s += T(x, py + 78, 'Budget', { size: 24, weight: 800, fill: UI.ink })
  // add bar on top
  s += shadow(x, py + 92, PW - 40, 52, 14) + R(x, py + 92, PW - 40, 52, 14, '#FFF8E8', `stroke="${FLAG.yellow}" stroke-opacity="0.5"`)
  s += icon('plus', x + 12, py + 108, 22, FLAG.yellow, 2.4) + T(x + 44, py + 123, 'Log an expense', { size: 14.5, weight: 700, fill: '#7A5A00' })
  s += R(x + PW - 40 - 70, py + 102, 58, 32, 16, FLAG.yellow) + T(x + PW - 40 - 41, py + 123, 'Add', { size: 13, weight: 800, fill: '#fff', anchor: 'middle' })
  // summary
  const sw = (PW - 40 - 20) / 3
  ;[['₹1.5L', 'Budget', UI.ink], ['₹27k', 'Spent', FLAG.red], ['₹1.2L', 'Left', FLAG.green]].forEach((d, i) => {
    const tx = x + i * (sw + 10); s += card(tx, py + 158, sw, 64, 14)
    s += T(tx + sw / 2, py + 192, d[0], { size: 18, weight: 800, fill: d[2], anchor: 'middle' }); s += T(tx + sw / 2, py + 212, d[1], { size: 11, weight: 600, fill: UI.muted, anchor: 'middle' })
  })
  s += T(x, py + 254, 'By category', { size: 14, weight: 800, fill: UI.ink })
  const cats = [['Stay', 'blue', 0.5], ['Food', 'red', 0.62], ['Treks', 'green', 0.3], ['Shop', 'yellow', 0.2]]
  cats.forEach((c2, i) => {
    const ry = py + 274 + i * 42
    s += T(x, ry + 12, c2[0], { size: 12.5, weight: 600, fill: UI.ink }); s += T(x + PW - 40, ry + 12, Math.round(c2[2] * 100) + '%', { size: 11.5, weight: 600, fill: UI.muted, anchor: 'end' })
    s += R(x, ry + 18, PW - 40, 8, 4, '#EEE9DF') + R(x, ry + 18, (PW - 40) * c2[2], 8, 4, FLAG[c2[1]])
  })
  s += T(x, py + 460, 'Recent', { size: 14, weight: 800, fill: UI.ink })
  ;[['Tibetan Kitchen', 'Food', 'red', '₹420'], ['Taxi to Nubra', 'Transport', 'green', '₹2,800']].forEach((d, i) => {
    const ry = py + 474 + i * 50; s += card(x, ry, PW - 40, 42, 12)
    s += C(x + 22, ry + 21, 6, FLAG[d[2]]); s += T(x + 40, ry + 26, d[0], { size: 13, weight: 600, fill: UI.ink }); s += T(x + PW - 40 - 14, ry + 26, d[3], { size: 13, weight: 700, fill: UI.ink, anchor: 'end' })
  })
  s += tabbar(px, py, PW, PH, 3)
  return s
}
function journal(px, py, PW, PH) {
  const x = px + 20; let s = ''
  s += T(x, py + 78, 'Diary', { size: 24, weight: 800, fill: UI.ink })
  s += T(x, py + 98, 'A bright page for every day', { size: 12, weight: 500, fill: UI.muted })
  // day card (colourful)
  s += shadow(x, py + 116, PW - 40, 250, 20) + R(x, py + 116, PW - 40, 250, 20, '#FFF7E9')
  s += R(x, py + 116, PW - 40, 6, 0, FLAG.yellow)
  s += T(x + 18, py + 156, '2', { size: 30, weight: 800, fill: FLAG.red, family: 'Georgia, serif' })
  s += T(x + 46, py + 144, 'WED · 23 JUL', { size: 10, weight: 700, fill: UI.muted, spacing: 1 })
  s += T(x + 46, py + 162, 'Phyang Festival day', { size: 15, weight: 700, fill: UI.ink })
  s += C(x + PW - 40 - 28, py + 150, 16, '#FFE3A3') + T(x + PW - 40 - 28, py + 156, ':)', { size: 14, weight: 800, fill: '#B07A00', anchor: 'middle' })
  // collage
  const ph = [TINT.red, TINT.blue, TINT.green]; ph.forEach((c2, i) => { s += R(x + 18 + i * 64, py + 178, 56, 56, 8, c2, `stroke="${UI.border}"`); s += icon('pin', x + 18 + i * 64 + 18, py + 196, 20, FLAG.ink, 1.8) })
  s += lines(x + 18, py + 256, ['Woke at dawn for the masked dances —', 'unreal energy. Momos after, then a slow', 'afternoon by the river.'], { size: 12, weight: 500, fill: '#566' }, 18)
  let hx = x + 18; [['Cham dances', 'red'], ['Momos', 'yellow']].forEach(h => { const w = cw(h[0], 10.5); s += chip(hx, py + 318, w, 24, TINT[h[1]], h[0], FLAG[h[1]], 10.5); hx += w + 8 })
  s += T(x + 18, py + 352, 'Spent ₹640 · 3 items', { size: 11.5, weight: 600, fill: UI.muted })
  // next day peek
  s += shadow(x, py + 380, PW - 40, 70, 18) + R(x, py + 380, PW - 40, 70, 18, '#EAF3FB') + R(x, py + 380, 6, 70, 0, FLAG.blue)
  s += T(x + 18, py + 414, '3', { size: 22, weight: 800, fill: FLAG.blue, family: 'Georgia, serif' })
  s += T(x + 46, py + 408, 'Leh Old Town', { size: 14, weight: 700, fill: UI.ink }); s += T(x + 46, py + 428, 'Add today’s entry', { size: 11.5, weight: 500, fill: UI.muted })
  s += icon('plus', x + PW - 40 - 34, py + 398, 22, FLAG.blue, 2.2)
  s += tabbar(px, py, PW, PH, 2)
  return s
}
function shop(px, py, PW, PH) {
  const x = px + 20; let s = ''
  s += T(x, py + 78, 'Shop list', { size: 24, weight: 800, fill: UI.ink })
  s += T(x, py + 98, '8 of 24 picked up', { size: 12, weight: 500, fill: UI.muted })
  s += R(x + PW - 40 - 70, py + 70, 70, 30, 15, TINT.yellow) + T(x + PW - 40 - 35, py + 89, '+ Add', { size: 12.5, weight: 800, fill: '#8A6500', anchor: 'middle' })
  let cx = x; [['All', true], ['Leh', false], ['Nubra', false], ['Pangong', false]].forEach(a => { const w = cw(a[0], 12); s += chip(cx, py + 116, w, 30, a[1] ? FLAG.yellow : TINT.yellow, a[0], a[1] ? '#fff' : '#8A6500', 12); cx += w + 8 })
  const items = [['Pashmina shawl', 'Leh · Textiles', '₹6,000', true], ['Dried apricots', 'Nubra · Food', '₹800', true], ['Thangka painting', 'Leh · Spiritual', '₹4,500', false], ['Prayer flags', 'Leh · Spiritual', '₹250', false], ['Turquoise jewellery', 'Leh · Jewellery', '₹3,000', false], ['Sea-buckthorn jam', 'Leh · Food', '₹400', false]]
  items.forEach((d, i) => {
    const ry = py + 158 + i * 62; s += card(x, ry, PW - 40, 54, 14)
    const done = d[3]
    s += C(x + 26, ry + 27, 12, done ? FLAG.green : '#fff', done ? '' : `stroke="${UI.border}" stroke-width="2"`); if (done) s += icon('plus', x + 19, ry + 20, 14, '#fff', 3)
    s += T(x + 50, ry + 24, d[0], { size: 14, weight: 700, fill: done ? UI.muted : UI.ink })
    s += T(x + 50, ry + 41, d[1], { size: 11, weight: 500, fill: UI.muted })
    s += T(x + PW - 40 - 14, ry + 31, d[2], { size: 13, weight: 700, fill: done ? UI.muted : FLAG.yellow, anchor: 'end' })
  })
  s += tabbar(px, py, PW, PH, 4)
  return s
}

/* ===================== SHEETS ===================== */
function legendHeader(W, theme, title, sub) {
  let s = R(0, 0, W, 168, 0, '#efeae2')
  s += shadow(28, 24, W - 56, 124, 16) + R(28, 24, W - 56, 124, 16, '#fff', 'stroke="#e3ddd2"') + R(28, 24, 8, 124, 4, FLAG.red)
  s += T(56, 60, title, { size: 26, weight: 800, fill: '#1c1b19' })
  s += T(56, 86, sub, { size: 14, weight: 400, fill: '#5b5750' })
  // colour legend
  const leg = [['blue', 'Plan & logistics'], ['red', 'Culture & food'], ['green', 'Treks & nature'], ['yellow', 'Money & shopping'], ['ink', 'Journal & diary']]
  let lx = 56
  leg.forEach(l => { s += R(lx, 104, 18, 18, 5, FLAG[l[0]]); s += T(lx + 26, 118, l[1], { size: 12.5, weight: 600, fill: '#3a3a3a' }); lx += 34 + l[1].length * 7.4 })
  return s
}
function sheet(file, title, sub, screens, perRow) {
  const PW = perRow === 4 ? 300 : 360, PH = perRow === 4 ? 640 : 740
  const gap = 44, margin = 40
  const W = margin * 2 + PW * perRow + gap * (perRow - 1)
  const H = 168 + 40 + PH + 60
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
  s += R(0, 0, W, H, 0, '#efeae2')
  s += legendHeader(W, null, title, sub)
  screens.forEach((sc, i) => { const px = margin + i * (PW + gap), py = 208; s += phone(px, py, PW, PH, sc.fn, sc.name) })
  s += `</svg>`
  render(s, file)
}

sheet(__dirname + '/B1.png', 'Prayer Flag — refined  ·  the core', 'Light, friendly, colour-coded. Five flag colours map to the five kinds of things you do.',
  [{ fn: home, name: 'Home' }, { fn: itinerary, name: 'Itinerary' }, { fn: menu, name: 'Everything (More)' }], 3)
sheet(__dirname + '/B2.png', 'Prayer Flag — refined  ·  detail pages', 'Same system on the deeper screens — each page wears its category colour.',
  [{ fn: festival, name: 'Festival detail' }, { fn: budget, name: 'Budget' }, { fn: journal, name: 'Diary' }, { fn: shop, name: 'Shop list' }], 4)
console.log('done')
