# Design Mockups — Leh Ladakh Workation Guide

Static PNG mockups exploring the app's visual direction. **Mockups only — not app code.**

## Chosen direction: "Prayer Flag"

Light, friendly, colour-coded. Five Tibetan prayer-flag colours each carry a fixed meaning:

| Colour | Meaning |
|--------|---------|
| 🔵 Blue | Plan & logistics (itinerary, stays, transport, flights) |
| 🔴 Red | Culture & food (festivals, cafés) |
| 🟢 Green | Treks & nature |
| 🟡 Yellow | Money & shopping (budget, shop list) |
| ⚫ Ink | Journal & diary |

### Refined sheets
- `B1.png` — core screens: Home, Itinerary, Everything (More)
- `B2.png` — detail pages: Festival, Budget, Diary, Shop

### Earlier exploration (3 directions for comparison)
- `optionA.png`, `optionB.png` (Prayer Flag, original pass), `optionC.png`

## Regenerating

These PNGs are rendered from plain JS that emits SVG, rasterised with `@resvg/resvg-js`.

```bash
npm i -D @resvg/resvg-js
node design/mockups/gen.js     # optionA/B/C.png
node design/mockups/gen_b.js   # B1.png, B2.png (refined Prayer Flag)
```

- `lib.js` — shared primitives (shapes, text, icons, SVG→PNG render)
- `gen.js` — the three initial directions
- `gen_b.js` — refined Prayer Flag screens + colour-system legend
