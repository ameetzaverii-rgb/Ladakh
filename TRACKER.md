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
- [ ] **2a — Login-gated editing**: all write APIs require auth; hide edit/add
      buttons when signed out. Admin = `ADMIN_EMAIL`. (No schema change.)
- [ ] **2b — User-scoped data**: add `userId` to `TripConfig`, `Expense`,
      `JournalEntry`, checklist state, etc. Each signed-in user gets their own
      trip(s): own dates, budget, journal, checklist. Anonymous visitors see a
      read-only Ladakh demo (or a "sign in to start your trip" prompt).
- [ ] After 2b: the dashboard countdown/budget/journal all read the *current
      user's* trip instead of the global one.

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
