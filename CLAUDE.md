# CLAUDE.md

## What is Aghor

Aghor is a **community wellness SaaS platform** (monorepo). Two user roles:
- **Creator** — manages communities, programs, classes, collects payments
- **Member** — joins communities, books classes, buys programs

Payments: **Razorpay** (India/domestic) + **Stripe** (international). Webhook is the source of truth for all payment state — never trust client-side payment confirmation.

---

## Monorepo Structure

```
apps/
  web/        → Next.js 15 (creator dashboard + member portal)
  mobile/     → Expo/React Native (member-facing only)
packages/
  shared/     → @aghor/shared — types, Zod schemas, constants
supabase/
  migrations/ → Sequential SQL files (00001_, 00002_, ...)
  functions/  → Edge Functions (Deno)
  seed/       → Test data
```

> Note: shared package is imported as `@aghor/shared` in both apps.

---

## Commands

Run from repo root unless noted:

```bash
pnpm dev           # All apps in parallel
pnpm dev:web       # Next.js only → localhost:3000
pnpm dev:mobile    # Expo only
pnpm build         # Build all via Turborepo
pnpm lint          # ESLint across monorepo
pnpm format        # Prettier (write)
pnpm format:check  # Prettier (check only)

# Database (requires Supabase CLI)
pnpm db:migrate    # Push migrations
pnpm db:reset      # Reset DB
pnpm db:seed       # Seed test data
```

From `apps/mobile/`:
```bash
npm run android    # Android emulator
npm run ios        # iOS simulator
```

---

## Architecture

### Database (Supabase + PostgreSQL)

**Core tables:**
| Table | Description |
|---|---|
| `users` | Auth users — role stored in `user_metadata` (`creator` \| `member`) |
| `communities` | Creator-owned communities |
| `programs` | Programs inside a community |
| `classes` | Schedulable classes inside a community |
| `memberships` | Member ↔ community subscriptions |
| `program_members` | Member ↔ program enrollments |
| `purchases` | Payment records (Razorpay + Stripe) |
| `bookings` | Member class bookings |

**RLS is the security boundary.** Every new table MUST have RLS policies. Never rely on application-level checks alone. Always ask: "What does the RLS policy look like for this table?"

**Migrations:** Add new files as `supabase/migrations/000XX_description.sql`. Never edit existing migration files.

### Web App (`apps/web`)

- **Framework:** Next.js 15 App Router — use React Server Components by default; only use `'use client'` when you need browser APIs, event handlers, or hooks
- **Data fetching:** TanStack Query v5 for client-side; Server Components for SSR
- **Auth:** `@supabase/ssr` — use helpers from `lib/auth.ts`. Never roll your own session logic.
- **State:** Zustand at `lib/ui-store.ts` — UI-only state (modals, sidebar open/close). No server state in Zustand.
- **Styling:** Tailwind CSS v4
- **Path alias:** `@/*` = `src/*`

**File placement rules:**
```
src/
  app/                       → Pages and layouts (App Router)
    (dashboard)/             → Creator routes
    (portal)/                → Member routes
  components/
    ui/                      → Primitives (Button, Input, Modal, etc.)
    dashboard/               → Creator feature components
    portal/                  → Member feature components
  lib/
    auth.ts                  → Auth helpers
    ui-store.ts              → Zustand store
    supabase.ts              → Supabase client
```

**When creating a new page:** Place under `app/(dashboard)/` for creator flows or `app/(portal)/` for member flows.

**When creating a new component:** Primitives → `components/ui/`. Feature-specific → `components/dashboard/` or `components/portal/`.

### Mobile App (`apps/mobile`)

- **Framework:** Expo SDK 52 + Expo Router v4 (file-based, same mental model as Next.js App Router)
- **Navigation:** Tab-based — `app/(tabs)/` has 4 tabs: `home`, `classes`, `programs`, `profile`
- **Payments:** RevenueCat SDK — all purchase logic lives in `lib/purchases.ts`. Do not call Razorpay/Stripe directly from mobile.
- **Auth tokens:** `expo-secure-store` only. Never store tokens in AsyncStorage.

### Shared Package (`packages/shared`)

Imported as `@aghor/shared` in both apps.

```
src/
  types/       → TypeScript interfaces for all DB entities
  validation/  → Zod schemas (use for all form + API input validation)
  constants/   → Shared enums and limits
```

**When adding a new entity:** Add its TypeScript interface to `types/` and its Zod schema to `validation/` first, before writing any feature code.

### Payment Flow

```
Client initiates payment
  → Create order via API route (apps/web/app/api/)
  → Razorpay or Stripe checkout
  → Webhook fires → supabase/functions/razorpay-webhook/ (or stripe-webhook/)
  → Webhook updates: purchases → memberships / program_members
  → Client polls or listens for DB change via Supabase realtime
```

**Never** update `purchases`, `memberships`, or `program_members` directly from client code. The webhook is the only writer for payment state.

---

## Code Conventions

**TypeScript**
- Strict mode everywhere — no `any`, no `// @ts-ignore` without a comment explaining why
- All DB entity types live in `@aghor/shared/types` — import from there, never redefine locally
- All input validation uses Zod schemas from `@aghor/shared/validation`

**Formatting (Prettier)**
```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

**Error handling**
- API routes: always return `{ error: string }` with appropriate HTTP status on failure
- Client: TanStack Query handles loading/error states — use `isLoading`, `isError`, never raw try/catch in components
- Webhooks: return `200` immediately, process async — never let a webhook time out

**Naming**
- DB tables: `snake_case`
- TypeScript types/interfaces: `PascalCase`
- React components: `PascalCase`
- Functions and variables: `camelCase`
- Zod schemas: `camelCase` + `Schema` suffix (e.g. `createClassSchema`)

---

## DO / DON'T

| DO | DON'T |
|---|---|
| Add RLS policy for every new table | Skip RLS and rely on app-level checks |
| Use `@aghor/shared` types for all entities | Redefine entity types locally |
| Use webhook as source of truth for payments | Trust client-side payment callbacks |
| Use Server Components by default in Next.js | Add `'use client'` unless necessary |
| Add migration as a new SQL file | Edit existing migration files |
| Store auth tokens in `expo-secure-store` | Use AsyncStorage for sensitive data |
| Validate all inputs with Zod schemas | Trust raw request bodies |

---

## When in Doubt

1. **New feature?** → Define the DB schema + RLS policy first, then types in `@aghor/shared`, then API, then UI
2. **Payment logic?** → Touch only API routes and webhook handlers. Never client-side.
3. **Shared logic between web and mobile?** → It belongs in `packages/shared`
4. **New table?** → New migration file + RLS policy + type in shared + Zod schema in shared