# Arketa — Community Wellness Platform

A community-first wellness platform where creators run private communities, sell structured programs/cohorts, host classes, and engage their members.

## Tech Stack

- **Backend**: [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage, Edge Functions, Realtime)
- **Web**: Next.js 16 + Tailwind CSS v4 + TanStack Query
- **Mobile**: Expo SDK 52 + Expo Router
- **Payments**: [RevenueCat](https://revenuecat.com) (Apple IAP + Google Play Billing)
- **Monorepo**: Turborepo + pnpm workspaces
- **Shared**: TypeScript types + Zod validation

## Project Structure

```
arketa/
├── apps/
│   ├── web/              # Next.js web app (creator dashboard + member)
│   └── mobile/           # Expo mobile app (member-first, purchases here)
├── packages/
│   └── shared/           # Shared types, validation, constants
├── supabase/
│   ├── migrations/       # SQL schema + RLS policies
│   └── functions/        # Edge Functions (RevenueCat webhook)
└── turbo.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- A [Supabase](https://supabase.com) project (free tier works)
- A [RevenueCat](https://revenuecat.com) account (free tier available)
- Apple Developer / Google Play Console (for in-app purchases)

### 1. Clone and install

```bash
git clone <repo-url> arketa
cd arketa
pnpm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/migrations/00001_initial_schema.sql`
3. Copy your project URL and anon key from **Settings > API**

### 3. Set up RevenueCat

1. Create a project at [app.revenuecat.com](https://app.revenuecat.com)
2. Add your iOS and/or Android app
3. Configure products in App Store Connect / Google Play Console:
   - **Community Membership** — auto-renewable subscription
   - **Program enrollment** — non-consumable (one-time purchase) per program
4. Map products to entitlements in RevenueCat
5. Set up the webhook:
   - Go to **Project Settings > Integrations > Webhooks**
   - URL: `https://<your-project>.supabase.co/functions/v1/revenuecat-webhook`
   - Auth Header: `Bearer <REVENUECAT_WEBHOOK_SECRET>`
6. Copy your API keys:
   - iOS: **App Settings > iOS** → Public API Key
   - Android: **App Settings > Android** → Public API Key

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
REVENUECAT_WEBHOOK_SECRET=your-webhook-secret
```

For the mobile app, create `apps/mobile/.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_RC_IOS_KEY=appl_xxxxxxxxxxxx
EXPO_PUBLIC_RC_ANDROID_KEY=goog_xxxxxxxxxxxx
```

### 5. Deploy the webhook Edge Function

```bash
supabase functions deploy revenuecat-webhook --project-ref <your-project-ref>
supabase secrets set REVENUECAT_WEBHOOK_SECRET=your-secret --project-ref <your-project-ref>
```

### 6. Run the web app

```bash
pnpm dev:web
```

Open [http://localhost:3000](http://localhost:3000).

### 7. Run the mobile app

```bash
pnpm dev:mobile
```

Scan the QR code with Expo Go (note: in-app purchases require a dev build, not Expo Go).

For testing purchases, create a **Development Build**:

```bash
cd apps/mobile
npx eas build --profile development --platform ios
```

## Test Accounts

After running the migration, create test users via Supabase Dashboard > Auth > Users:

| Email | Password | Role |
|-------|----------|------|
| creator@arketa.dev | password123 | creator |
| member1@arketa.dev | password123 | member |

When creating users, add this to the user metadata:
```json
{ "name": "Sarah Wellness", "role": "creator" }
```

## Payment Flow

### How it works

1. **Creator** configures products in App Store Connect / Google Play Console
2. **Creator** maps RevenueCat product IDs to their community (membership) or programs in Arketa settings
3. **Member** opens the mobile app and taps "Enroll" or "Join"
4. **RevenueCat SDK** presents the native App Store / Play Store purchase sheet
5. On success, the app immediately enrolls the member locally
6. **RevenueCat webhook** fires → Supabase Edge Function updates `purchases`, `memberships`, and `program_members` tables
7. **Web app** shows enrollment status (purchases happen on mobile)

### Free vs Paid

- **Free communities/programs**: Members join directly, no purchase required
- **Paid communities**: Creator sets a `membership_entitlement_id` in Settings
- **Paid programs**: Creator sets a `rc_product_id` on the program

### Why RevenueCat?

- Stripe has stopped operations in India
- RevenueCat works globally via Apple/Google app stores
- Handles subscription lifecycle, receipts, refunds automatically
- Free tier supports up to $2.5k/month MTR

## Features

- **Community Feed** — Posts, comments, likes, engagement streaks
- **Programs & Cohorts** — Time-bound programs with enrollment, capacity, weekly prompts
- **Classes** — Scheduled events (Zoom or in-person) with booking
- **In-App Purchases** — RevenueCat for memberships and program enrollments
- **Creator Dashboard** — Active members, enrollments, revenue, engagement metrics
- **Member Profiles** — Activity summary, program enrollments, streak tracking
- **Private Notes** — Creator-only notes on individual members
- **Row Level Security** — All data access controlled at the database level

## Deploying

### Web (Vercel)

```bash
cd apps/web
vercel
```

### Mobile (EAS Build)

```bash
cd apps/mobile
npx eas build --platform all
```

### Edge Functions

```bash
supabase functions deploy revenuecat-webhook
```
