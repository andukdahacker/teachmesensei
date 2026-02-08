---
project_name: 'TeachMeSensei'
user_name: 'Ducdo'
date: '2026-02-07'
sections_completed:
  ['technology_stack', 'data_naming', 'architecture_patterns', 'testing_quality', 'reference']
status: 'complete'
rule_count: 45
optimized_for_llm: true
source: '_bmad-output/planning-artifacts/architecture.md'
---

# Project Context for AI Agents

_Critical rules and patterns for TeachMeSensei. Read this before implementing any code. For full architectural decisions, see `_bmad-output/planning-artifacts/architecture.md`._

## Technology Stack

| Technology | Version | Notes |
|---|---|---|
| SvelteKit | 2.50.2 | `adapter-node`, SSR/SPA hybrid |
| Svelte 5 | Runes API | `$state`, `$derived`, `$effect`, `$props` — NO Svelte 4 stores |
| Supabase | v1.26.01 | Postgres, Auth, Realtime, Storage, Edge Functions (Deno) |
| TypeScript | strict mode | All SvelteKit code |
| Tailwind CSS | latest | Via `@tailwindcss/vite` |
| shadcn-svelte | 1.1.1 | UI primitives (Radix-based) |

Additional: Zod (validation), sveltekit-superforms 2.29.1 (forms), Vitest (tests), Playwright (E2E), Daily.co (video), Polar.sh (payments). See architecture doc for full details.

## Data & Naming

### Data Format — snake_case Pass-Through

**THE #1 RULE:** Database `snake_case` flows directly into TypeScript with NO conversion.

```typescript
// CORRECT
user.created_at
session.sensei_id

// WRONG — never do this
user.createdAt
session.senseiId
```

### Naming Conventions

| What | Convention | Example |
|---|---|---|
| DB tables | `snake_case`, plural | `users`, `sessions`, `job_queue` |
| DB columns | `snake_case` | `user_id`, `created_at` |
| DB indexes | `idx_{table}_{columns}` | `idx_users_email` |
| RLS policies | `{table}_{action}_{role}` | `sessions_select_own_learner` |
| Svelte components | `PascalCase.svelte` | `SenseiCard.svelte` |
| TS files | `camelCase.ts` | `realtime.ts`, `errors.ts` |
| Svelte modules | `camelCase.svelte.ts` | `authStore.svelte.ts` |
| Functions | `camelCase` | `getUserProfile()` |
| Types/interfaces | `PascalCase` | `UserProfile`, `SessionState` |
| Zod schemas | `camelCase` + `Schema` | `loginSchema` |
| Constants | `SCREAMING_SNAKE` | `MAX_RETRY_COUNT` |

### Type System Boundaries

| Purpose | Tool | Location |
|---|---|---|
| Database row shapes | `supabase gen types` (auto) | `$lib/database.types.ts` |
| Input validation | Zod schemas (manual) | `$lib/schemas/{feature}.ts` |

- Supabase types have ALL columns. Zod schemas validate ONLY user-editable fields.
- **NEVER** generate a Zod schema that mirrors a full database type.
- Import schemas directly: `import { loginSchema } from '$lib/schemas/auth'` — no barrel exports.
- After every migration: `supabase gen types typescript --local > src/lib/database.types.ts` — automated as CI step + git hook. Never manually edit `database.types.ts`.

## Architecture & Patterns

### Where New Files Go

```
New component?      → $lib/components/features/{domain}/
New schema?         → $lib/schemas/{feature}.ts
New store?          → $lib/stores/{name}.svelte.ts
New util?           → $lib/utils/{name}.ts
New server util?    → $lib/server/{name}.ts
New migration?      → supabase/migrations/
New Edge Function?  → supabase/functions/{name}/index.ts
New unit test?      → Co-located next to source file ({name}.test.ts)
New RLS test?       → tests/integration/rls/{table}.rls.test.ts
New E2E test?       → tests/e2e/{feature}.spec.ts
```

### Component Boundaries

- `$lib/components/ui/` — **shadcn-svelte primitives ONLY.** Never put custom components here. Custom components go in `features/`.
- `$lib/components/features/{domain}/` — Domain-grouped custom components
- `$lib/server/` — **Server-only.** NEVER import from client code (`+page.svelte`, `+layout.svelte`). Only import in `+page.server.ts`, `+server.ts`, `hooks.server.ts`. Importing from client causes cryptic build failure.

### State Management

- **Component-local:** `$state()` runes
- **Shared/page:** `$props()` or `setContext`/`getContext`
- **App-wide:** `.svelte.ts` reactive modules in `$lib/stores/`
- **Form state:** SuperForms owns it (`$form`, `$errors`) — runes own everything else
- **NO** external state libraries. **NO** Svelte 4 writable stores.

### Auth & Security

- **Centralized route protection** in `hooks.server.ts` — one file guards all routes
- **Always `auth.getUser()`** on server — never trust client session
- Supabase browser client in `src/routes/+layout.ts`, server client in `hooks.server.ts` — verify pattern against current `@supabase/ssr` docs
- `(public)`: no auth. `(app)`: auth required. `(admin)`: admin role. `(enterprise)`: org/team role
- **NEVER** expose `SUPABASE_SECRET_KEY` to the client

### Form & API Patterns

- **Forms:** SuperForms `fail()` and `message()` only. Same Zod schema client + server.
- **Custom `+server.ts`:** success = direct data, error = `{ error: { code, message } }`
- **NO** `{ success: true, data: ... }` envelopes

### Date/Time

- **Always `timestamptz`** — NEVER `timestamp` without timezone
- **Always ISO 8601** in JSON, **always UTC** for storage
- Client display via `$lib/utils/dates.ts` using `Intl.DateTimeFormat`

### Error Handling

- **Emotionally calibrated messages** — non-negotiable
- `$lib/errors.ts` maps errors with `emotionalContext` field
- "We're still looking for your Sensei..." NOT "Error: match timeout"
- Component errors: inline. Page errors: `+error.svelte`. Never a blank screen.

## Testing & Quality

### Testing Rules

| Tier | Location | Naming | Mocking | Trigger |
|---|---|---|---|---|
| Unit/component | Co-located | `*.test.ts` | Mock Supabase client + external APIs | Every PR |
| RLS/integration | `tests/integration/` | `*.rls.test.ts` | REAL Supabase local stack, mock nothing | Every PR |
| Edge Functions | `supabase/functions/*/` | `index.test.ts` | REAL function logic, mock external APIs | Every PR |
| E2E + a11y | `tests/e2e/` | `*.spec.ts` | REAL everything against local Supabase | Pre-merge |

- **ALL** RLS tests use `tests/fixtures/roles.ts` — no ad-hoc test users
- Co-located `.test.ts` must **NEVER** import from Playwright
- Every collection page **MUST** have a designed empty state with CTA

### Real-Time Patterns

| Feature | Channel Type | Pattern |
|---|---|---|
| Flash Help matching | Broadcast | `flash-help:{user_id}` |
| Sensei availability | Presence | `presence:senseis` |
| Job status | Postgres Changes | `jobs:{session_id}` |
| Admin dashboards | Postgres Changes | `admin:{org_id}` |

Managed in `$lib/realtime.ts`. Always clean up on component destroy.

### Event Naming

- Completed: `resource.past_tense` — `session.created`, `note.completed`
- Transitions: `resource.present_progressive` — `match.searching`, `match.live`
- Payload: `{ event, timestamp, data }` — data uses snake_case
- Max one dot in event names

### Edge Functions & Retry

- Job queue: `pending → processing → completed | failed | retry`
- AI pipeline: 5 retries, exponential (1m, 2m, 4m, 8m, 16m)
- Webhooks: NEVER retry — process idempotently, `idempotency_key` on job table
- Validate: verify webhook signature BEFORE parsing body

### Validation

- Validate at boundaries, trust internals
- **NEVER** validate inside `$lib/` utility functions
- Postgres constraints are safety nets, not primary validation

## Reference

### PRD Overrides

**Architecture overrides PRD in:** LinkedIn OAuth → Phase 1.5, Stripe → Polar.sh, FR50 (Sensei payouts) deferred to Phase 3+, AI retry: 5 (not 3), RLS tests: every PR (not just migrations).

### Anti-Patterns

| Do This | NOT This |
|---|---|
| `user.created_at` | `user.createdAt` |
| `return json({ user_id })` | `return json({ success: true, data: { userId } })` |
| `import { x } from '$lib/schemas/auth'` | `import { x } from '$lib/schemas'` |
| Zod for editable fields only | Zod mirroring all DB columns |
| `timestamptz` | `timestamp` or `varchar` for dates |
| Custom component in `features/` | Custom component in `ui/` |
| Import `$lib/server/` in `+page.server.ts` | Import `$lib/server/` in `+page.svelte` |
| `Skeleton` placeholder | Full-page spinner |
| "No sessions yet — schedule one!" | Blank empty area |
| "We're still looking..." | "Error: match timeout" |
| `createTestUsers()` from fixtures | Ad-hoc test user creation |
| `$state()` / `.svelte.ts` modules | Svelte 4 `writable()` stores |
