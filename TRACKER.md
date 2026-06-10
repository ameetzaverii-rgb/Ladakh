# Tarcho — Pending Updates Tracker

A living checklist of important pending work. Claude keeps this updated and
surfaces the top items proactively. Newest priorities at the top.

_Last updated: 2026-06-10_

---

## 🔴 P0 — Most important

### 1. Per-user customisation (multi-tenancy)
**The big one.** Today the app stores ONE shared global trip (`TripConfig`),
shown to everyone regardless of login — which is why it says "41 days to trip"
even when signed out. _Not a bug; it's the current single-tenant design._

Plan:
- [x] **2a — Login-gated editing** (shipped): middleware enforces writes;
      admin = `ADMIN_EMAIL`; `useCanEdit()`; global controls gated.
- [x] **2b — User-scoped data** (shipped):
  - [x] `userId` on TripConfig/Expense/JournalEntry/ChecklistItem + `Booking`
        model (self-healing migration).
  - [x] Anonymous = read-only Ladakh demo (userId NULL rows).
  - [x] First sign-in auto-creates a starter trip cloned from the demo
        (settings + prep checklist); dashboard/budget/journal/prep read the
        signed-in user's own data; countdown reflects *their* dates.
  - [x] Writes scoped to the owner's rows; signed-in users edit their own trip;
        catalog stays admin-only.
  - [x] **Bookings**: per-user `Booking` + `/bookings` page (flights, stays,
        treks, tickets — ref, cost, link) in More.
- [ ] **Remaining polish**: hide per-page add/edit buttons for anonymous on
      budget/journal/prep (server already enforces); multi-trip per user; echo
      bookings on the matching itinerary day.
- [ ] **Requires in prod for gating/per-user to activate**: set
      `GOOGLE_CLIENT_ID/SECRET` + `ADMIN_EMAIL` in Vercel. Until then the app
      runs as the open shared demo (safe fallback).

---

## 🟠 P1 — Decisions needed

### 2. Landing page direction
- [ ] Three designs live at `/preview` (Editorial / Cinematic / Bento). Decide:
      pick one to wire up as the real landing, **or** keep opening directly to
      the Ladakh dashboard (current behaviour).

### 3. Header / logo polish
- [x] Left-aligned, responsive logo + top menus (Plan/Journal/Budget/More).
- [ ] Confirm sizing feels right; option to show top menus on phone too.

---

## 🟡 P2 — Enhancements / original roadmap

### 4. Speed
- [x] Stream home photos via Suspense + prayer-flag loaders.
- [ ] Optional: self-host key destination images to remove the Wikipedia
      round-trip entirely (faster cold loads).

### 5. Live data (from CLAUDE.md Phase 2)
- [ ] Skyscanner API for live Delhi–Leh flight pricing.
- [ ] Booking.com affiliate API for stay availability.
- [ ] Webhook endpoint for price-update triggers.
- [ ] Email notifications for availability/price changes.

---

## ✅ Recently shipped
- Tarcho brand: Marcellus wordmark + prayer-flag logo, visible across the app.
- Opens directly to the Ladakh dashboard (landing removed).
- Compact responsive header; collapsible trip type in More.
- Tarcho explainer footer on home; trip-type marked optional/pre-set.
- Trip modes (Leisure/Workation/Hybrid), one-tap destination switch, Sikkim.
