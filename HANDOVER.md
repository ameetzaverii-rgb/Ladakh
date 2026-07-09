# Tarcho — Handover (for a new chat)

_Last updated: 2026-06-10. Read alongside `CLAUDE.md` (original brief) and
`TRACKER.md` (live pending list)._

## What this is
**Tarcho** — a Next.js 14 (App Router) Himalayan trip planner: plan, journal,
budget, bookings. Postgres (Neon) + Prisma, NextAuth (Google), Tailwind,
deployed on Vercel. Public URL: **https://ladakh-sage.vercel.app**.

## Current state (all shipped to `main`)
- **Brand = Tarcho**: Marcellus wordmark + prayer-flag string logo. Logo lockup
  is **wordmark above the flags** (`src/components/Logo.tsx`), shown app-wide via
  a left-aligned responsive top bar (`src/components/BrandHeader.tsx`) with
  Plan/Journal/Budget/More on tablet+.
- **App opens directly to the Ladakh dashboard at `/`** (no landing page). Full
  dashboard = `src/app/page.tsx`. Bottom `TabBar` Home → `/`.
- **Prayer-flag loaders** for route transitions (`src/app/loading.tsx`,
  `src/components/FlagLoader.tsx`) + Suspense-streamed home photos for speed.
- **Phase 2a (login-gated editing)** + **Phase 2b (per-user trips)** — see below.
- **Bookings**: `/bookings` page + per-user `Booking` model.
- **Health check**: `GET /api/health` reports config booleans (no secrets).
- Three **landing-page design mockups** exist at `/preview` (Editorial /
  Cinematic / Bento) — NOT wired in; awaiting a pick.

## ⚠️ ONE ACTION OUTSTANDING (do this first)
`/api/health` currently returns `"mode":"open shared demo"`, `gatingActive:false`,
`missing:["ADMIN_EMAIL"]`. Everything else (Google, NEXTAUTH_SECRET/URL, DB) is set.
**To turn on sign-in + per-user mode:** add env var `ADMIN_EMAIL=amitzave@gmail.com`
in Vercel (Settings → Environment Variables, Production — add to BOTH `ladakh`
and `ladakhnew` projects if both exist), then redeploy. Re-check `/api/health` →
should flip to `"per-user"`, `gatingActive:true`, `missing:[]`.

## Architecture: per-user model (2b)
- **Ownership** lives in `src/lib/owner.ts`: `currentOwnerId()` = signed-in
  user id or `null` (= shared demo). `ensureUserTrip(userId)` lazily clones the
  demo trip + prep checklist into the user's own rows on first sign-in.
- `src/lib/destination.ts` `getActiveContext()` returns `{ dest, cfg, ownerId,
  enabledMenus, ... }`; all personal reads filter by `userId: ctx.ownerId`.
- **Personal (per-user) models**: `TripConfig`, `Expense`, `JournalEntry`,
  `ChecklistItem`, `Booking` — all have a nullable `userId`. `null` rows = the
  read-only Ladakh demo shown to anonymous visitors.
- **Curated catalog stays shared/admin-only**: destinations, itinerary,
  events, treks, stays, flights, transport, shop.
- **Auth gate** = `src/middleware.ts`: writes need sign-in; personal paths
  (`/api/{expenses,journal,checklist,booking,trip}`) allow any signed-in user
  (handlers scope to `{id, userId}`); catalog paths need admin. **Safe
  fallback**: if `ADMIN_EMAIL`+Google aren't set, gating is OFF (app fully open).
- Admin = `ADMIN_EMAIL` (auth.ts promotes that email to role ADMIN; session
  exposes `isAdmin`). Client hooks: `useCanEdit()` / `useIsAdmin()` in
  `src/components/EditMode.tsx`.
- **Schema self-heals**: `src/lib/migrations.ts` runs idempotent `IF NOT EXISTS`
  SQL on boot (`ensureSchema()` in `layout.tsx`). Add new columns/tables there —
  no manual Neon migration. Also update `prisma/schema.prisma` for Client types.

## Git / deploy workflow
- Dev branch: **`claude/keen-mendel-sd4kx`**. Never commit to `main` directly.
- Ship = push branch → open PR to `main` → wait for BOTH Vercel checks
  (`ladakh` + `ladakhnew`) green → squash-merge.
- After each merge: `git fetch origin main && git reset --hard origin/main` and
  force-push the dev branch to keep it clean (avoids recurring conflicts).
- Commit author must be `Claude <noreply@anthropic.com>` (a stop-hook enforces
  it; `git commit --amend --reset-author` if flagged).

## Known gotchas
- **Stale container**: on resuming, the local checkout is sometimes an OLD
  commit. ALWAYS `git fetch origin main && git reset --hard origin/main` before
  new work, and confirm a recent file (e.g. `src/lib/owner.ts`) exists.
- **Two Vercel projects** (`ladakh`, `ladakhnew`) both deploy every PR; both must
  be green. Env vars must be set on whichever serves `ladakh-sage.vercel.app`
  (set on both to be safe).
- Home/other pages are `force-dynamic`; images come from Wikipedia (cached 1 day)
  — first load after deploy is slowest.

## Top of the backlog (see TRACKER.md)
1. **Set `ADMIN_EMAIL`** in Vercel to activate per-user mode (above).
2. Decide the **landing**: wire a `/preview` design or keep direct-to-dashboard.
3. Polish: hide read-only add/edit buttons on budget/journal/prep for anon;
   multi-trip per user; echo bookings on the matching itinerary day.
4. Self-host key images for speed. Original roadmap: live flights (Skyscanner),
   stays (Booking.com), price webhooks, email notifications.

## Good first prompt for the new chat
"Read CLAUDE.md, TRACKER.md and HANDOVER.md. We're on branch
`claude/keen-mendel-sd4kx`; sync it to origin/main first. Confirm `/api/health`
status, then continue with [the next item]."
