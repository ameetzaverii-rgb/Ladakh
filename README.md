# Leh Ladakh — 21-Day Workation Manager 🏔️

A full-stack interactive trip management tool for a solo 21-day Leh Ladakh workation.
Built on the gstack format: Next.js 14 + Prisma + Neon PostgreSQL + Vercel.

## What This Does

- **Dashboard** — Countdown to trip, live budget snapshot, checklist progress
- **Preparation Checklist** — 40+ tiered items (ASAP → 1 Month → 1 Week → Day Before → On Trip)
- **21-Day Itinerary** — Full day-by-day plan, editable from Admin
- **Trip Journal** — Daily log with mood, highlights, photos, location
- **Budget Tracker** — Log every expense, category breakdown vs estimate
- **Stays / Treks / Transport / Food / Events / Flights** — All from DB, live-editable
- **Command Bar** (⌘K) — `spent 350 food tibetan kitchen` or `journal today was amazing`
- **Mobile Quick-Entry Forms** — Tap to log expenses and journal entries from phone
- **Admin Panel** (`/admin`) — Full CRUD for all models, no auth in dev

## Stack

- **Next.js 14** (App Router, ISR)
- **PostgreSQL** via [Neon](https://neon.tech) (serverless, free tier)
- **Prisma** ORM
- **NextAuth.js** (admin authentication)
- **Tailwind CSS**
- **Vercel** (deployment)

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/leh-ladakh-guide.git
cd leh-ladakh-guide
npm install
```

### 2. Set up Neon database

1. Go to [neon.tech](https://neon.tech) → Create account → New Project
2. Name it `leh-ladakh-guide`, region: `AWS / ap-south-1 (Mumbai)` 
3. Copy the **Connection string** from the dashboard

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://..." # Your Neon connection string
DIRECT_URL="postgresql://..."   # Same string for Neon
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="your@email.com"
ADMIN_PASSWORD_HASH="$(node -e "require('bcryptjs').hash('yourpassword', 10).then(console.log)")"
```

### 4. Push schema and seed data

```bash
npm run db:push    # Create all tables
npm run db:seed    # Seed with all guide data
```

### 5. Run locally

```bash
npm run dev
# → http://localhost:3000        (guide)
# → http://localhost:3000/admin  (admin panel — login with your env credentials)
```

---

## Deploy to Vercel

### Option A: CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts, then add environment variables:

```bash
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production   # Set to your Vercel URL
vercel env add ADMIN_EMAIL production
vercel env add ADMIN_PASSWORD_HASH production
vercel --prod
```

### Option B: GitHub Integration (Recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project → Connect GitHub repo
3. Add all environment variables in the Vercel dashboard
4. Vercel auto-deploys on every push to `main`

### Post-deploy: seed production database

```bash
DATABASE_URL="your-production-neon-url" npm run db:seed
```

Or run from Vercel's dashboard → Functions → Run script.

---

## API Reference

All endpoints return JSON. Write operations require admin auth (future: API key).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flights?origin=DEL` | List flights, filter by origin |
| GET | `/api/stays?coworking=true` | List stays, filter by coworking |
| GET | `/api/treks` | List all available treks |
| GET | `/api/events?upcoming=true` | List upcoming festivals/events |
| GET | `/api/transport?type=TAXI` | List transport options |
| POST | `/api/flights` | Add a new flight (admin) |
| POST | `/api/stays` | Add a new stay (admin) |
| PATCH | `/api/flights/[id]` | Update flight price/availability |
| PATCH | `/api/stays/[id]` | Update stay availability |

### Example: Update a flight price

```bash
curl -X PATCH https://your-app.vercel.app/api/flights/clxxx \
  -H "Content-Type: application/json" \
  -d '{"priceINR": 7500, "available": true}'
```

---

## Admin Panel

Visit `/admin/login` → sign in with your `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` credentials.

Admin panel provides:
- CRUD for all data models (flights, stays, treks, events, transport)
- Price update forms
- Availability toggles
- Bulk data refresh

---

## Data Update Patterns

### Scheduled price updates
Set up a Vercel Cron Job (free tier: 1/day) in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/refresh-prices",
    "schedule": "0 6 * * *"
  }]
}
```

### On-demand revalidation
After any admin update, the app calls `revalidatePath()` to purge ISR cache.

### ISR strategy
| Data type | Revalidate interval |
|-----------|---------------------|
| Flight prices | 5 minutes |
| Stay availability | 1 hour |
| Trek schedules | 24 hours |
| Events/festivals | 24 hours |
| Itinerary content | On-demand (admin) |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              ← Main guide (SSR + ISR)
│   ├── admin/
│   │   ├── login/page.tsx    ← Admin login
│   │   └── dashboard/        ← CRUD admin panel
│   └── api/
│       ├── flights/route.ts
│       ├── stays/route.ts
│       ├── treks/route.ts
│       ├── events/route.ts
│       └── transport/route.ts
├── components/
│   ├── ui/                   ← Reusable UI primitives
│   └── sections/             ← Guide section components
├── lib/
│   ├── db.ts                 ← Prisma singleton
│   └── auth.ts               ← NextAuth config
└── types/index.ts            ← Shared TypeScript types
```

---

## Design System

Colours (from original HTML artifact):
```css
--sand: #e8d9bc
--rust: #b85c38
--gold: #c9993a
--deep: #1a1208
--stone: #8b7355
--sky: #5a8fa3
--sage: #6b7c5e
--cream: #f5ede0
--dark: #0f0b06
```

Fonts:
- **Headings:** Cormorant Garamond (Google Fonts)
- **Labels/Mono:** Space Mono (Google Fonts)
- **Body:** Outfit (Google Fonts)

The original static HTML artifact is in `public/leh-ladakh-21day-plan.html` — use as
reference for all section content, component hierarchy, and visual design.

---

## License

Private. Personal travel guide project.
