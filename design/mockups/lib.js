/* Prototype mockup generator — renders 3 design directions as PNGs.
   Each canvas shows 3 mobile views (Home / Itinerary / Menu) in that style. */
// dev dependency, install with: npm i -D @resvg/resvg-js
const { Resvg } = require('@resvg/resvg-js')
const fs = require('fs')

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const R = (x, y, w, h, r, fill, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${fill}" ${extra}/>`
const L = (x1, y1, x2, y2, stroke, w = 1) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}"/>`
const C = (cx, cy, r, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`
function T(x, y, s, o = {}) {
  const { size = 14, fill = '#000', weight = 400, family = 'Inter, Arial, sans-serif', anchor = 'start', spacing = 0, italic = false } = o
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}" ${italic ? 'font-style="italic"' : ''}>${esc(s)}</text>`
}
// simple 24-grid stroke icons
function icon(name, x, y, sz, stroke, sw = 2) {
  const s = sz / 24, g = `transform="translate(${x},${y}) scale(${s})" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`
  const P = {
    home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
    cal: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    book: '<path d="M4 4h12a2 2 0 012 2v14H6a2 2 0 01-2-2z"/><path d="M6 4v14"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12h3M3 9h18"/>',
    map: '<path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z"/><path d="M9 3v15M15 6v15"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    trek: '<path d="M3 20h18M7 20l5-13 5 13M10 11l4 0"/>',
    food: '<path d="M5 3v8M8 3v8M5 8h3M6.5 11v9M18 3c-2 1-3 4-3 7h3z M18 10v10"/>',
    fest: '<path d="M12 3v4M5 8l3 2M19 8l-3 2M6 21l6-9 6 9z"/>',
    bag: '<path d="M6 8h12l-1 12H7zM9 8a3 3 0 016 0"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    plane: '<path d="M2 12l20-7-7 20-3-8-10-5z"/>',
    pin: '<path d="M12 21s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  }
  return `<g ${g}>${P[name] || ''}</g>`
}
const chev = (x, y, sz, st) => icon('chev', x, y, sz, st, 2)

// Phone frame; content is an SVG string already positioned at (px,py) screen origin.
function phone(px, py, theme, content, caption) {
  const PW = 360, PH = 740, r = 38
  const clipId = 'c' + px + py
  let s = ''
  s += R(px - 6, py - 6, PW + 12, PH + 12, r + 6, theme.deviceBezel) // bezel
  s += `<clipPath id="${clipId}"><rect x="${px}" y="${py}" width="${PW}" height="${PH}" rx="${r}"/></clipPath>`
  s += `<g clip-path="url(#${clipId})">`
  s += R(px, py, PW, PH, r, theme.bg)
  s += content(px, py, PW, PH)
  // status bar
  s += T(px + 24, py + 30, '9:41', { size: 14, weight: 700, fill: theme.ink })
  s += R(px + PW / 2 - 28, py + 12, 56, 18, 9, theme.notch)
  s += `</g>`
  s += T(px + PW / 2, py + PH + 36, caption, { size: 16, weight: 600, fill: '#3a3a3a', anchor: 'middle' })
  return s
}

function canvas(title, sub, principles, theme, screens) {
  const W = 1260, H = 1020
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
  s += R(0, 0, W, H, 0, '#efeae2')
  s += R(28, 24, W - 56, 118, 18, '#ffffff', 'stroke="#e3ddd2"')
  s += R(28, 24, 8, 118, 4, theme.accent)
  s += T(56, 64, title, { size: 30, weight: 800, fill: '#1c1b19' })
  s += T(56, 94, sub, { size: 16, weight: 400, fill: '#5b5750' })
  s += T(56, 122, principles, { size: 13, weight: 600, fill: theme.accent, spacing: 0.3 })
  // palette swatches
  theme.palette.forEach((c, i) => { s += R(W - 60 - i * 46, 52, 34, 34, 8, c, 'stroke="#0001"') })
  const xs = [60, 460, 860], names = ['Home', 'Itinerary', 'Menu']
  screens.forEach((fn, i) => { s += phone(xs[i], 200, theme, fn, names[i]) })
  s += `</svg>`
  return s
}

function render(svg, file) {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: 2520 }, font: { loadSystemFonts: true } })
  fs.writeFileSync(file, r.render().asPng())
  console.log('wrote', file)
}

module.exports = { esc, R, L, C, T, icon, chev, phone, canvas, render }
