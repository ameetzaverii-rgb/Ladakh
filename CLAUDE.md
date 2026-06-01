# Leh Ladakh Workation Guide — Claude Code Handover

## Project Overview

This is a **dynamic Next.js 14 travel guide app** for a 21-day Leh Ladakh workation.
It replaces a static HTML artifact with a fully database-backed application deployable on Vercel.

The app surfaces live data for: flights, accommodation availability, trek bookings, festival/event
tickets, and local transport — all editable via an admin panel or API.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 (App Router) | Vercel-native, SSR + ISR, API routes |
| Database | PostgreSQL via Neon (serverless) | Free tier, Vercel integration |
| ORM | Prisma | Type-safe, easy migrations |
| Auth (admin) | NextAuth.js | Simple credential auth for admin panel |
| Styling | Tailwind CSS | Utility-first, matches existing design |
| UI Components | shadcn/ui | Accessible, unstyled base |
| Deployment | Vercel | Zero-config, preview deployments |

---

## Repository Structure

```
leh-ladakh-guide/
├── CLAUDE.md                    ← You are here
├── README.md
├── .env.local                   ← Never commit. See .env.example
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── prisma/
│   ├── schema.prisma            ← Database schema
│   └── seed.ts                  ← Seed with static data from HTML
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             ← Main guide (replaces HTML artifact)
│   │   ├── admin/               ← Protected admin panel
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── flights/
│   │   │   │   └── route.ts     ← GET/POST flights
│   │   │   ├── stays/
│   │   │   │   └── route.ts
│   │   │   ├── treks/
│   │   │   │   └── route.ts
│   │   │   ├── events/
│   │   │   │   └── route.ts
│   │   │   └── transport/
│   │   │       └── route.ts
│   │   ├── flights/
│   │   │   └── page.tsx
│   │   ├── stays/
│   │   │   └── page.tsx
│   │   ├── treks/
│   │   │   └── page.tsx
│   │   ├── transport/
│   │   │   └── page.tsx
│   │   └── events/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                  ← shadcn components
│   │   └── sections/            ← Guide section components
│   ├── lib/
│   │   ├── db.ts                ← Prisma client singleton
│   │   ├── auth.ts              ← NextAuth config
│   │   └── utils.ts
│   └── types/
│       └── index.ts             ← Shared TypeScript types
└── package.json
```

---

## Database Schema (Prisma)

See `prisma/schema.prisma`. Key models:

- **Flight** — route, airline, price, availability, departure date
- **Stay** — name, type, pricePerNight, wifiRating, hasCoworking, viewType, availability
- **Trek** — name, difficulty, duration, maxAltitude, company, price, nextDeparture
- **Event** — name, dates, location, type (festival/cultural), ticketRequired, ticketUrl
- **Transport** — type (taxi/bike), destination, rateINR, permitRequired, notes
- **ItineraryDay** — dayNumber, title, description, mealSuggestions (linked to static 21-day plan)

---

## Environment Variables

```env
# .env.local (never commit)
DATABASE_URL="postgresql://..."          # Neon connection string
NEXTAUTH_SECRET="..."                    # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"     # Change to prod URL on Vercel
ADMIN_EMAIL="your@email.com"
ADMIN_PASSWORD_HASH="..."               # bcrypt hash

# Optional: external data sources
SKYSCANNER_API_KEY="..."               # For live flight data
BOOKING_COM_API_KEY="..."             # For stay availability
```

---

## Setup Instructions for Claude Code

### 1. Install dependencies
```bash
npm install
```

### 2. Set up database (Neon)
1. Create free account at neon.tech
2. Create project "leh-ladakh-guide"
3. Copy connection string to `.env.local` as `DATABASE_URL`

### 3. Run migrations and seed
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Run locally
```bash
npm run dev
# → http://localhost:3000
```

### 5. Deploy to Vercel
```bash
npm i -g vercel
vercel
# Follow prompts, add env vars in Vercel dashboard
```

---

## Key Tasks for Claude Code

### Immediate (MVP)
- [ ] Implement all API routes (`src/app/api/*/route.ts`)
- [ ] Build the main guide page converting the HTML artifact to React components
- [ ] Build admin panel for CRUD operations on all data models
- [ ] Implement Prisma seed script from the static data in `prisma/seed.ts`
- [ ] Add ISR (revalidate: 3600) to all data-fetching pages

### Phase 2 (Dynamic Data)
- [ ] Integrate Skyscanner API for live Delhi–Leh flight pricing
- [ ] Add Booking.com affiliate API for stay availability
- [ ] Webhook endpoint for price update triggers
- [ ] Email notifications for availability changes

### Design
- The visual language is defined in `src/app/globals.css` — desert/mountain palette:
  - `--sand: #e8d9bc`, `--rust: #b85c38`, `--gold: #c9993a`, `--deep: #1a1208`
  - Font stack: Cormorant Garamond (headings) + Space Mono (labels) + Outfit (body)
- Reference the existing HTML artifact (`leh-ladakh-21day-plan.html`) for all section
  content, layout logic, and component structure

---

## Data Update Patterns

### Manual updates via admin panel
`/admin` → protected by NextAuth → CRUD interface for all models

### Programmatic updates via API
```bash
# Update a flight price
curl -X PATCH https://your-app.vercel.app/api/flights/[id] \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"price": 8500, "availability": true}'
```

### Bulk seed/refresh
```bash
npx prisma db seed   # Re-runs seed.ts
```

---

## ISR Strategy

Pages that display live data use Next.js ISR:
```typescript
export const revalidate = 3600; // Revalidate every hour
```

For near-real-time (flight prices), use `revalidate = 300` (5 min).
Admin mutations call `revalidatePath()` to purge on-demand.

---

## Notes for Claude Code

1. The original HTML file is at `public/leh-ladakh-21day-plan.html` — use it as the
   source of truth for all static content (itinerary text, café descriptions, etc.)
2. All static text content should be seeded into the DB so it's editable without deploys
3. The admin panel does NOT need to be beautiful — functional table CRUD is enough
4. Vercel's free tier supports this entire stack (Neon free + Vercel hobby = zero cost)
5. Add `VERCEL_URL` env var logic so NextAuth works in preview deployments
