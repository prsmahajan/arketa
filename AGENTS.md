# Agent Instructions

> This file is mirrored across CLAUDE.md, AGENTS.md, and GEMINI.md so the same instructions load in any AI environment.

## What is Aghor

Aghor is a **community wellness SaaS platform**. Two user roles:
- **Creator** — manages communities, programs, classes, collects payments
- **Member** — joins communities, books classes, buys programs

Payments: **Razorpay** (domestic/India) + **Stripe** (international). Webhook is the source of truth for all payment state — never trust client-side payment confirmation.

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9.7.0
- Supabase CLI
- Expo CLI (for mobile)

### Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` — For Edge Functions
   - `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` — Domestic payments
   - `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` — International payments

3. **Start database:**
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

4. **Run dev:**
   ```bash
   pnpm dev          # All apps
   pnpm dev:web      # Next.js only → localhost:3000
   pnpm dev:mobile   # Expo only
   ```

---

## Monorepo Structure

```
apps/
  web/        → Next.js 15 (creator dashboard + member portal)
  mobile/     → Expo/React Native (member-facing only)
packages/
  shared/     → @aghor/shared — types, Zod schemas, constants
supabase/
  migrations/ → Sequential SQL (00001_, 00002_, ...)
  functions/  → Edge Functions (Deno runtime)
  seed/       → Test data
```

---

## The Architecture

**Layer 1: Database (Source of Truth)**
- PostgreSQL + RLS — security enforced at DB level, not app level
- Supabase Auth — user role (`creator` | `member`) in `user_metadata`
- Every new table requires RLS policies before any app code touches it

**Layer 2: Edge Functions (Event-Driven Logic)**
- Webhook handlers live in `supabase/functions/`
- Payment webhooks are the ONLY writers for `purchases`, `memberships`, `program_members`
- Never update payment state from client or API routes

**Layer 3: Applications**
- `apps/web` — Next.js 15, React Server Components, TanStack Query v5
- `apps/mobile` — Expo SDK 52, Expo Router v4, RevenueCat for purchases

**Layer 4: Shared Package**
- `@aghor/shared` — single source of truth for types + validation
- Define entity types and Zod schemas here FIRST, before writing features

**Why this layering matters:** Security lives in the DB (RLS). Payment truth lives in webhooks. Types live in shared. Breaking this layering = bugs that are hard to trace.

---

## Commands

```bash
# Development
pnpm dev              # All apps in parallel
pnpm dev:web          # Next.js → localhost:3000
pnpm dev:mobile       # Expo

# Build & quality
pnpm build            # Turborepo build
pnpm lint             # ESLint across monorepo
pnpm format           # Prettier (write)
pnpm format:check     # Prettier (check only)

# Database
pnpm db:migrate       # Push migrations (supabase db push)
pnpm db:reset         # Reset DB
pnpm db:seed          # Seed test data
```

From `apps/mobile/`:
```bash
npm run android       # Android emulator
npm run ios           # iOS simulator
```

---

## Data Model

| Table | Description |
|---|---|
| `users` | Auth users — role in `user_metadata` |
| `communities` | Creator-owned communities |
| `programs` | Programs inside a community |
| `classes` | Schedulable classes inside a community |
| `memberships` | Member ↔ community subscriptions |
| `program_members` | Member ↔ program enrollments |
| `purchases` | Payment records (Razorpay + Stripe) |
| `bookings` | Member class bookings |

**When adding a new table:**
1. Write migration → `supabase/migrations/000XX_description.sql`
2. Add RLS policies in the same migration
3. Add TypeScript interface → `packages/shared/src/types/`
4. Add Zod schema → `packages/shared/src/validation/`
5. Then write feature code

Never edit existing migration files.

---

## File Placement Rules

### Web (`apps/web/src/`)
```
app/
  (dashboard)/     → Creator routes
  (portal)/        → Member routes
  api/             → API route handlers
components/
  ui/              → Primitives (Button, Input, Modal)
  dashboard/       → Creator feature components
  portal/          → Member feature components
lib/
  auth.ts          → Auth helpers (@supabase/ssr)
  supabase.ts      → Supabase client
  ui-store.ts      → Zustand (UI state only)
```

### Shared (`packages/shared/src/`)
```
types/             → TypeScript interfaces for all DB entities
validation/        → Zod schemas (suffix: Schema e.g. createClassSchema)
constants/         → Shared enums and limits
```

---

## Payment Flow

```
Client initiates payment
  → API route creates order (apps/web/app/api/)
  → Razorpay or Stripe checkout
  → Webhook fires → supabase/functions/razorpay-webhook/ (or stripe-webhook/)
  → Webhook updates: purchases → memberships / program_members
  → Client listens via Supabase Realtime for state change
```

**Rule:** Only webhook handlers write to `purchases`, `memberships`, `program_members`. No exceptions.

---

## Design & Build Workflow

When building any non-trivial feature, follow this order:

1. **Schema first** — Write migration SQL + RLS policy
2. **Types second** — Add interface to `@aghor/shared/types`
3. **Validation third** — Add Zod schema to `@aghor/shared/validation`
4. **API / Edge Function** — Backend logic
5. **UI last** — Wire components to API
6. **Edge cases** — Empty states, error states, loading states

For React components:
- Default to Server Components — only add `'use client'` when you need hooks, event handlers, or browser APIs
- TanStack Query for client-side async state — use `isLoading`, `isError`
- Zustand (`lib/ui-store.ts`) for UI-only state (modals, drawers) — never server state

---

## Skills

Skills live in `.claude/skills/`. Claude auto-activates them based on request context.

### Available Skills

- `saas-project-context` — Full product context for Aghor. Read this FIRST on every task.
- `saas-product-spec-writer` — Converts feature ideas into structured specs. Triggers before building any new feature, screen, or endpoint.
- `frontend-design` — Production-grade UI generation. Triggers on any component, page, or dashboard request.

### Rule

Always read `.claude/skills/saas-project-context/SKILL.md` before starting any task. No exceptions.

---

## Parallel Execution

When tasks are independent, spawn them as parallel subagents. Don't run sequentially what can run simultaneously.

### Always parallelize:
- Migration + TypeScript interface + Zod schema for a new entity (all 3 at once)
- Multiple independent API endpoints
- Lint + type-check + test
- UI component + its API route (when API shape is already defined)

### Never parallelize:
- Tasks where output of one feeds into another
- Migration → feature code (migration must apply first)
- Type definition → code that imports that type (types must exist first)
- Schema first → API → UI (this sequence is strict)

### How to invoke:
List numbered independent tasks — Claude spawns subagents automatically.
Subagents have isolated contexts — they don't share state with each other, only report back to parent.

### Example for Aghor:
```
"In parallel:
1. Create bookings table migration with RLS
2. Add Booking TypeScript interface to @aghor/shared/types
3. Add createBookingSchema to @aghor/shared/validation"
```

---

## UI Replication Rule

When given a screenshot or design image to replicate, target 98% visual match before presenting output.

### Process:
1. **Analyze first** — extract from image:
   - Layout structure (sidebar, topbar, grid, stack)
   - Every color value (sample precisely — no approximations)
   - Typography (size, weight, line-height hierarchy)
   - Spacing rhythm
   - Every visible component, icon, badge, chip

2. **Build** — implement everything extracted, no shortcuts

3. **Self-review checklist:**
   - [ ] Layout structure matches
   - [ ] Colors match exactly
   - [ ] Font sizes and weights match
   - [ ] Spacing and padding match
   - [ ] All components present
   - [ ] Empty/loading/error states match
   - [ ] Icons and imagery match

4. **Score yourself** — state match % honestly. If below 98%:
   - List exact gaps ("button padding is 8px not 12px")
   - Fix them
   - Re-score

5. **Present only at 98%+** — never show first-pass as final

---

## Self-Annealing Loop

When something breaks:
1. Read the full error + stack trace
2. Fix the root cause (not just the symptom)
3. Test the fix
4. If it was a pattern error — note it below

**Known gotchas:**
- `@supabase/ssr` session helpers must be used server-side — don't import in Client Components
- RLS blocks queries silently — if data isn't returning, check policies first
- Turborepo caches aggressively — run `pnpm build --force` if stale output suspected
- Expo Router v4 — `_layout.tsx` is required at every route group level

---

## Operating Principles

**1. RLS is the security boundary**
Never rely on application-level access checks alone. Every table has policies.

**2. Webhook is the payment source of truth**
Client callbacks lie. Only trust what the webhook wrote to the DB.

**3. Shared package first**
Before writing a feature, check if the type or schema already exists in `@aghor/shared`. Don't redefine locally.

**4. Server Components by default**
`'use client'` is opt-in, not default. Keeps bundle small and data fetching on the server.

**5. One migration = one logical change**
Don't bundle unrelated schema changes. Makes rollback clean.

**6. Parallelize independent work**
If tasks don't depend on each other's output, run them as parallel subagents. Sequential execution of independent tasks wastes time.

**7. UI replication targets 98% match**
Never present a first-pass implementation as final when replicating a design. Self-review, score, fix, repeat.

---

## DO / DON'T

| DO | DON'T |
|---|---|
| Add RLS policy for every new table | Skip RLS and rely on app checks |
| Use `@aghor/shared` types for all entities | Redefine entity types locally |
| Use webhook as source of truth for payments | Trust client-side payment callbacks |
| Use Server Components by default | Add `'use client'` unless necessary |
| Add migration as a new SQL file | Edit existing migration files |
| Store auth tokens in `expo-secure-store` | Use AsyncStorage for sensitive data |
| Validate all inputs with Zod schemas | Trust raw request bodies |
| Write types + schemas before feature code | Build UI before defining the data shape |

---

## Code Conventions

**TypeScript:** Strict mode everywhere. No `any`. No `// @ts-ignore` without explanation.

**Prettier:**
```json
{ "singleQuote": true, "semi": true, "trailingComma": "all", "printWidth": 100, "tabWidth": 2 }
```

**Naming:**
- DB tables → `snake_case`
- TypeScript interfaces → `PascalCase`
- React components → `PascalCase`
- Functions + variables → `camelCase`
- Zod schemas → `camelCase` + `Schema` suffix

**Error handling:**
- API routes → return `{ error: string }` + correct HTTP status
- Client → use TanStack Query `isError` states, not raw try/catch in components
- Webhooks → return `200` immediately, process async

---

Be pragmatic. Be reliable. Self-anneal.