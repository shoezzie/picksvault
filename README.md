# PicksVault

**Sports picks marketplace where sellers stake their own capital on picks and buyers get auto-refunded if the pick loses.**

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Supabase, and Stripe.

---

## Features

- **Stake-backed picks** — sellers must lock money in escrow for every "insured" pick
- **Auto-refund engine** — if a pick loses, 95% is refunded automatically via Stripe
- **Live grading** — auto-grade engine polls live box scores and settles picks
- **Seller profiles** — verifiable track records, ROI, hit rates
- **Leaderboard** — ranked sellers by ROI, hit rate, and units won
- **Dark/light theme** — full light mode with CSS variable theming
- **Holographic pick cards** — 3D tilt effect, spotlight, glint animations

---

## Setup

### 1. Clone & install

```bash
cd picksvault
npm install
```

### 2. Configure environment variables

Edit `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Copy your Project URL and API keys to `.env.local`

### 4. Set up Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Enable **Stripe Connect** in your dashboard
3. Copy your publishable and secret keys to `.env.local`
4. Set up a webhook endpoint pointing to `https://yourdomain.com/api/stripe/webhook`
   - Events to listen for: `checkout.session.completed`, `payment_intent.succeeded`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. (Optional) Seed demo data

```bash
npm run db:seed
```

This creates demo sellers and picks in your Supabase database.
**Note:** Requires `tsx` — install with `npm install -D tsx`

---

## Architecture

```
src/
├── app/
│   ├── page.tsx               # Marketplace (homepage)
│   ├── picks/[id]/            # Pick detail page
│   ├── seller/[username]/     # Seller profile
│   ├── leaderboard/           # Rankings
│   ├── dashboard/             # Seller dashboard (protected)
│   ├── my-picks/              # Buyer history (protected)
│   ├── bookmarks/             # Saved picks (protected)
│   ├── grading/[id]/          # Live grading view
│   ├── how/                   # How it works
│   ├── auth/login/            # Login page
│   ├── auth/signup/           # Signup page
│   └── api/
│       ├── picks/             # GET/POST picks
│       ├── picks/[id]/        # GET/PATCH single pick
│       ├── purchases/         # POST create Stripe Checkout
│       ├── purchases/[id]/    # GET purchase status
│       ├── stripe/webhook/    # Stripe webhook handler
│       ├── bookmarks/         # GET/POST toggle bookmarks
│       ├── follows/           # POST toggle follow
│       ├── sellers/onboard/   # POST Stripe Connect onboarding
│       └── grade/[id]/        # POST grade a pick + fire refunds
├── components/
│   ├── Nav.tsx                # Navigation bar
│   ├── PickCard.tsx           # Pick card with 3D tilt
│   ├── ResultCard.tsx         # Purchase result card
│   ├── SellerCard.tsx         # Seller community card
│   ├── LeaderboardCard.tsx    # Leaderboard entry
│   ├── BuyModal.tsx           # Multi-step purchase modal
│   ├── PostPickModal.tsx      # Seller post pick form
│   ├── OnboardingModal.tsx    # Seller onboarding flow
│   ├── GradingView.tsx        # Live grading component
│   └── AuthGuard.tsx          # Protected route wrapper
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser Supabase client
│   │   ├── server.ts          # Server Supabase client
│   │   └── middleware.ts      # Auth session refresh
│   ├── seed-data.ts           # Static seed data (8 picks, 7 sellers)
│   └── seed.ts                # DB seed script
└── middleware.ts               # Route protection
```

---

## Buy Flow

1. User clicks **Unlock** on a pick card
2. `BuyModal` opens with pick details and escrow explanation
3. User clicks **Unlock for $X** → POST to `/api/purchases`
4. Stripe Checkout Session created → user redirected to Stripe
5. After payment → Stripe redirects to `/picks/[id]?purchased=true`
6. Webhook `checkout.session.completed` → purchase record confirmed in DB
7. Pick content (reasoning, book, odds) shown to user

## Auto-Refund Flow

1. Pick graded as lost via POST to `/api/grade/[id]`
2. All pending purchases fetched from DB
3. For each purchase: Stripe refund created for 95% of `amount_paid`
4. Purchase records updated to `status: 'refunded'`
5. Seller's stake balance decremented by `pick.stake`

---

## Demo Mode

If `STRIPE_SECRET_KEY` is not configured (contains "placeholder"), the app runs in demo mode:
- Purchases are simulated without real payments
- The BuyModal shows the full decrypt animation without charging
- Refunds are simulated in the UI

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:seed` | Seed database with demo data |

---

## Design System

Custom CSS variables (see `globals.css`):

| Variable | Dark | Light |
|----------|------|-------|
| `--bg` | `#07080a` | `#f7f6f1` |
| `--panel` | `#0d0e12` | `#ffffff` |
| `--panel2` | `#14161c` | `#f1efe9` |
| `--border` | `rgba(255,255,255,0.06)` | `rgba(15,23,42,0.10)` |
| `--accent` | `#22c55e` | `#22c55e` |
| `--text` | `#fafafa` | `#0b0c10` |
| `--muted` | `#6b7280` | `#5b6271` |

Theme toggle stores preference in `localStorage` and sets `data-theme` on `<html>`.
