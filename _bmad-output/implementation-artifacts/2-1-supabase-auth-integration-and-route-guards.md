# Story 2.1: Supabase Auth Integration & Route Guards

Status: done

## Story

As a developer,
I want Supabase Auth integrated with server-side session resolution and route guards,
So that the authentication foundation is secure and verified before building user-facing auth flows.

## Acceptance Criteria

1. **Given** the SvelteKit project with Supabase packages installed
   **When** I configure auth integration
   **Then** `hooks.server.ts` creates a Supabase server client using `@supabase/ssr` with proper cookie handling (`getAll`/`setAll` pattern)

2. **Given** the hooks server client is configured
   **When** a request arrives
   **Then** `+layout.ts` creates a Supabase browser client (via `isBrowser()` check) for client-side access

3. **Given** the root layout server load exists
   **When** a page loads
   **Then** `+layout.server.ts` passes `session`, `user`, and `cookies` to the client

4. **Given** `(app)` routes exist
   **When** an unauthenticated user navigates to `(app)/*`
   **Then** they are redirected to `/login`

5. **Given** `(admin)` routes exist
   **When** a user without `admin` or `platform_admin` role navigates to `(admin)/*`
   **Then** they receive a 403 response

6. **Given** `(enterprise)` routes exist
   **When** a user without `team_lead` or `org_admin` role navigates to `(enterprise)/*`
   **Then** they receive a 403 response

7. **Given** `(public)` routes exist
   **When** any user navigates to `(public)/*`
   **Then** the routes are accessible without authentication

8. **Given** auth is configured
   **When** server-side code needs user identity
   **Then** `auth.getUser()` is used (never trusting unencoded session)

9. **Given** the auth integration is complete
   **When** an integration test runs
   **Then** it verifies: "server-side hook correctly resolves authenticated user session"

## Tasks / Subtasks

- [x] Task 1: Create `src/hooks.server.ts` with Supabase server client and route guards (AC: #1, #4, #5, #6, #7, #8)
  - [x] 1.1 Import `createServerClient` from `@supabase/ssr`
  - [x] 1.2 Create server client with `getAll`/`setAll` cookie configuration (see Dev Notes for exact code)
  - [x] 1.3 Implement `safeGetSession` helper on `event.locals` — calls `auth.getUser()` first (trusted), then `auth.getSession()` for session metadata
  - [x] 1.4 Implement route guard logic in the `handle` function:
    - Extract route group from `event.url.pathname` and `event.route.id`
    - `(public)` routes: no check, pass through
    - `(app)` routes: if no user, redirect 303 to `/login`
    - `(admin)` routes: if no user, redirect 303 to `/login`; if user but role not `admin`/`platform_admin`, return 403
    - `(enterprise)` routes: if no user, redirect 303 to `/login`; if user but role not `team_lead`/`org_admin`, return 403
    - API routes (`/api/*`): pass through (individual endpoints handle their own auth)
  - [x] 1.5 Add `filterSerializedResponseHeaders` to allow `content-range` and `x-supabase-api-version`
  - [x] 1.6 Update `src/app.d.ts` with `App.Locals` types: `supabase`, `safeGetSession`

- [x] Task 2: Create `src/routes/+layout.ts` — browser client initialization (AC: #2)
  - [x] 2.1 Import `createBrowserClient`, `createServerClient`, `isBrowser` from `@supabase/ssr`
  - [x] 2.2 Use `depends('supabase:auth')` for reactive invalidation
  - [x] 2.3 Use `isBrowser()` to branch: `createBrowserClient` on client, `createServerClient` (with `getAll` from `data.cookies`) on server
  - [x] 2.4 Call `supabase.auth.getSession()` to extract session
  - [x] 2.5 Return `{ supabase, session }` from load function

- [x] Task 3: Create `src/routes/+layout.server.ts` — session data passing (AC: #3)
  - [x] 3.1 Call `safeGetSession()` from `locals`
  - [x] 3.2 Return `{ session, user, cookies: cookies.getAll() }` — cookies needed for SSR client in `+layout.ts`

- [x] Task 4: Update `src/routes/+layout.svelte` — wire auth state (AC: #2)
  - [x] 4.1 Accept `data` prop with `supabase` and `session`
  - [x] 4.2 Set up `onAuthStateChange` listener to call `invalidate('supabase:auth')` when auth state changes
  - [x] 4.3 Clean up listener on component destroy
  - [x] 4.4 Preserve existing Toaster setup

- [x] Task 5: Create auth integration test (AC: #9)
  - [x] 5.1 Create `tests/integration/auth/hooks.test.ts`
  - [x] 5.2 Test: server-side hook correctly resolves authenticated user session
  - [x] 5.3 Test: unauthenticated request to `(app)` route gets redirected to `/login`
  - [x] 5.4 Test: `(public)` route accessible without auth
  - [x] 5.5 Test: role-gated routes return 403 for wrong role

- [x] Task 6: Create unit tests for route guard logic (AC: #4, #5, #6, #7)
  - [x] 6.1 Create `src/hooks.server.test.ts` (co-located with source)
  - [x] 6.2 Test route group detection logic
  - [x] 6.3 Test redirect behavior per route group
  - [x] 6.4 Test 403 for role mismatches
  - [x] 6.5 Mock Supabase client using `vi.mock('@supabase/ssr')`

- [x] Task 7: Verify build and existing tests (AC: all)
  - [x] 7.1 Run `npm run build` — must succeed
  - [x] 7.2 Run `npm run test:unit` — all existing 17 tests + new tests pass
  - [x] 7.3 Run `npm run lint` — must pass
  - [x] 7.4 Run `npm run check` — must pass (zero type errors)

## Dev Notes

### Critical: `@supabase/ssr` Cookie API (Current as of v0.8.x)

The architecture doc's `+layout.ts` example is **outdated**. The current API uses `getAll`/`setAll` (NOT the old `parse(document.cookie)` pattern). Here is the current canonical pattern:

**`src/hooks.server.ts`:**
```typescript
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public'
import { createServerClient } from '@supabase/ssr'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' })
        })
      },
    },
  })

  event.locals.safeGetSession = async () => {
    const { data: { user }, error } = await event.locals.supabase.auth.getUser()
    if (error) {
      return { session: null, user: null }
    }
    const { data: { session } } = await event.locals.supabase.auth.getSession()
    return { session, user }
  }

  // --- Route guards go here (see route guard section below) ---

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version'
    },
  })
}
```

**`src/routes/+layout.ts`:**
```typescript
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import type { LayoutLoad } from './$types'
import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth')

  const supabase = isBrowser()
    ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
        global: { fetch },
      })
    : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
        global: { fetch },
        cookies: {
          getAll() {
            return data.cookies
          },
        },
      })

  const { data: { session } } = await supabase.auth.getSession()

  return { supabase, session }
}
```

**`src/routes/+layout.server.ts`:**
```typescript
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, cookies }) => {
  const { session, user } = await safeGetSession()
  return {
    session,
    user,
    cookies: cookies.getAll(),
  }
}
```

### Route Guard Implementation Pattern

Route guards are centralized in `hooks.server.ts`. Detect route group from `event.route.id`:

```typescript
// Inside handle function, after creating supabase client and safeGetSession:
const { session, user } = await event.locals.safeGetSession()

const routeId = event.route.id ?? ''

// Public routes — always accessible
if (routeId.startsWith('/(public)') || routeId.startsWith('/api')) {
  return resolve(event, { filterSerializedResponseHeaders(name) { ... } })
}

// All other routes require authentication
if (!user) {
  return new Response(null, {
    status: 303,
    headers: { location: '/login' },
  })
}

// Admin routes — require admin or platform_admin role
if (routeId.startsWith('/(admin)')) {
  // Role check requires profile data — for now check user.app_metadata or
  // a future profile lookup. In Phase 1 admin routes are empty shells,
  // so this guard prevents accidental access.
  // TODO: Story 2.5 will create the profiles table with role column.
  // For now, block all non-admin access with a 403.
}

// Enterprise routes — require team_lead or org_admin role
if (routeId.startsWith('/(enterprise)')) {
  // Same pattern as admin — gated by role from profile.
}
```

**Important:** In Story 2.1, the `profiles` table does not yet exist (that's Story 2.5). The route guard should be structured to support role checks but can use a placeholder strategy:
- Option A: Check `user.app_metadata.role` (set during registration in Story 2.2)
- Option B: Guard admin/enterprise routes with a blanket 403 since they're empty shells — implement actual role lookup when profiles table exists in Story 2.5
- **Recommended: Option B** — simpler, no premature profile queries, admin/enterprise routes are empty shells in Phase 1 anyway

### `src/app.d.ts` — Type Declarations

```typescript
import type { Session, SupabaseClient, User } from '@supabase/supabase-js'

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient
      safeGetSession: () => Promise<{ session: Session | null; user: User | null }>
    }
    interface PageData {
      session: Session | null
      user: User | null
    }
  }
}

export {}
```

### Auth State Change Listener in `+layout.svelte`

The root `+layout.svelte` needs to listen for auth state changes and invalidate the Supabase dependency:

```svelte
<script lang="ts">
  import { invalidate } from '$app/navigation'
  import { onMount } from 'svelte'
  import { Toaster } from '$lib/components/ui/sonner'

  let { data, children } = $props()

  onMount(() => {
    const { data: { subscription } } = data.supabase.auth.onAuthStateChange((event, session) => {
      invalidate('supabase:auth')
    })

    return () => subscription.unsubscribe()
  })
</script>

<Toaster />
{@render children()}
```

### Environment Variable Naming

The project uses `PUBLIC_SUPABASE_PUBLISHABLE_KEY` (not `PUBLIC_SUPABASE_ANON_KEY`). This was standardized in Story 1.3 code review. Verify `.env.example` and all references use the correct name.

Existing `.env.example` already has:
```
PUBLIC_SUPABASE_URL=http://localhost:54321
PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key
```

### What NOT to Build in This Story

- **No login/signup UI** — that's Story 2.2
- **No OAuth callback route** — that's Story 2.2
- **No database migrations** — that's Story 2.5
- **No profiles table or RLS** — that's Story 2.5
- **No onboarding flow** — that's Story 2.3
- **No Supabase admin client** (`supabaseAdmin.ts`) — not needed until Edge Functions (Epic 6)
- **No `$lib/server/supabaseClient.ts`** — the server client is created per-request in hooks; a factory file is not needed yet
- **No E2E tests** — integration tests in `tests/integration/` are sufficient for this infrastructure story

### Testing Strategy

**Unit tests** (`src/hooks.server.test.ts`):
- Mock `@supabase/ssr` `createServerClient`
- Mock `event.cookies.getAll()`, `event.cookies.set()`
- Test route group detection (extract into a pure function for testability)
- Test redirect logic per route group
- Test 403 responses for admin/enterprise without role

**Integration tests** (`tests/integration/auth/hooks.test.ts`):
- Requires Supabase local stack running (`supabase start`)
- Create a real Supabase server client
- Test session resolution with valid/invalid cookies
- Test the full handle chain

**Mocking pattern** (from Story 1.3 learnings):
```typescript
// Use vi.mock for @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    }
  }))
}))

// For $env/static/public — use vi.mock with getter pattern
vi.mock('$env/static/public', () => ({
  PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key',
}))
```

### Previous Story Intelligence

**From Story 1.4 (CI/CD Pipeline):**
- 17 tests currently passing (15 original + 2 fixture tests)
- CI workflow triggers on `master` branch (not `main`)
- `vitest run --project integration` uses `--passWithNoTests` flag
- Vitest multi-project config in `vite.config.ts` (unit + integration)
- `tests/fixtures/roles.ts` exists as a stub — will need real Supabase auth in Epic 2

**From Story 1.3 (Deployment):**
- `$env/dynamic/*` uses getter pattern for per-test mocking
- `.nvmrc` = Node 22
- Health endpoint validates Supabase connectivity

**From Story 1.2 (Layouts):**
- `@testing-library/svelte/svelte5` alias required for Svelte 5 runes
- `resolve.conditions: ['browser']` in vite.config.ts for component tests
- Layout shells: `PublicShell.svelte`, `AppShell.svelte` already exist in `$lib/components/layout/`
- Route groups `(public)`, `(app)`, `(admin)`, `(enterprise)` already have `+layout.svelte` files

### Current Codebase State

```
src/
├── hooks.server.ts          # DOES NOT EXIST — create in this story
├── app.d.ts                 # EXISTS — update with Locals types
├── routes/
│   ├── +layout.svelte       # EXISTS — update with auth state listener
│   ├── +layout.ts           # DOES NOT EXIST — create in this story
│   ├── +layout.server.ts    # DOES NOT EXIST — create in this story
│   ├── (public)/
│   │   ├── +layout.svelte   # EXISTS (wraps PublicShell)
│   │   └── +page.svelte     # EXISTS (landing page)
│   ├── (app)/
│   │   ├── +layout.svelte   # EXISTS (wraps AppShell)
│   │   └── dashboard/
│   │       └── +page.svelte # EXISTS
│   ├── (admin)/
│   │   ├── +layout.svelte   # EXISTS
│   │   └── admin/+page.svelte # EXISTS
│   ├── (enterprise)/
│   │   ├── +layout.svelte   # EXISTS
│   │   └── enterprise/+page.svelte # EXISTS
│   └── api/health/
│       ├── +server.ts       # EXISTS
│       └── server.test.ts   # EXISTS (5 tests)
├── lib/
│   ├── components/layout/   # EXISTS (AppShell, PublicShell, Nav, Footer, Sidebar)
│   ├── components/ui/       # EXISTS (shadcn components)
│   ├── hooks/               # EXISTS (empty directory)
│   └── utils.ts             # EXISTS (cn() utility)
```

### Installed Packages (already available)

- `@supabase/ssr@^0.8.0` — SSR auth integration
- `@supabase/supabase-js@^2.95.3` — Supabase client
- `@sveltejs/kit@^2.50.2` — SvelteKit framework
- `svelte@^5.49.2` — Svelte 5 with runes

### Files Created/Modified by This Story

**New files:**
- `src/hooks.server.ts` — Supabase server client + route guards
- `src/routes/+layout.ts` — Browser client initialization
- `src/routes/+layout.server.ts` — Session data passing
- `src/hooks.server.test.ts` — Unit tests for hooks (co-located)
- `tests/integration/auth/hooks.test.ts` — Integration test for session resolution

**Modified files:**
- `src/app.d.ts` — Add `App.Locals` types
- `src/routes/+layout.svelte` — Add auth state change listener

### Architecture Compliance Checklist

- [ ] `hooks.server.ts` uses `createServerClient` from `@supabase/ssr` with `getAll`/`setAll`
- [ ] `+layout.ts` uses `isBrowser()` branching pattern
- [ ] `auth.getUser()` used on server for trusted user data
- [ ] `(public)` routes accessible without auth
- [ ] `(app)` routes redirect unauthenticated to `/login`
- [ ] `(admin)` routes return 403 for non-admin roles
- [ ] `(enterprise)` routes return 403 for non-org roles
- [ ] `filterSerializedResponseHeaders` allows `content-range` and `x-supabase-api-version`
- [ ] `depends('supabase:auth')` in `+layout.ts`
- [ ] `onAuthStateChange` listener in `+layout.svelte` calls `invalidate('supabase:auth')`
- [ ] Environment vars use `PUBLIC_SUPABASE_PUBLISHABLE_KEY` (not ANON_KEY)
- [ ] No Svelte 4 patterns (`$state`, `$props`, `{@render}` only)
- [ ] No barrel exports added
- [ ] TypeScript strict mode maintained
- [ ] All existing 17 tests pass (zero regressions)
- [ ] No `$lib/server/` imported from client-side code

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Auth architecture, hooks.server.ts pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md — Route group structure and guard mapping]
- [Source: _bmad-output/planning-artifacts/architecture.md — Type system boundaries, Supabase client patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md — Testing architecture four tiers]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2 Story 2.1 acceptance criteria]
- [Source: _bmad-output/project-context.md — Auth & security rules, testing rules, naming conventions]
- [Source: _bmad-output/implementation-artifacts/1-4-ci-cd-pipeline-and-test-infrastructure.md — Previous story learnings]
- [Source: Supabase docs — Server-side auth for SvelteKit (https://supabase.com/docs/guides/auth/server-side/sveltekit)]
- [Source: Supabase docs — Creating SSR client (https://supabase.com/docs/guides/auth/server-side/creating-a-client)]
- [Source: Supabase tutorial — SvelteKit integration (https://supabase.com/docs/guides/getting-started/tutorials/with-sveltekit)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Build initially failed due to missing `.env` file — copied `.env.example` to `.env` (gitignored) to provide `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY` at build time
- svelte-check caught `PageData` interface conflict — removed manual `PageData` declaration from `app.d.ts` since SvelteKit auto-generates these types from load functions
- ESLint flagged unused params in mock resolve functions — fixed by removing explicit param types from simple mocks, using `eslint-disable-next-line` for the typed resolve needed in filterSerializedResponseHeaders test
- `filterSerializedResponseHeaders` type expects 2 args `(name, value)` — updated test to pass empty string as second arg

### Completion Notes List

- Implemented Supabase auth integration following canonical `@supabase/ssr` v0.8.x pattern with `getAll`/`setAll` cookie API
- Route guards centralized in `hooks.server.ts`: `(public)` + `/api` pass-through, `(app)` requires auth, `(admin)` requires admin/platform_admin role, `(enterprise)` requires team_lead/org_admin role
- Role checks use `user.app_metadata.role` (Option A from Dev Notes — chosen over recommended Option B because it provides complete guard logic that will work correctly once registration sets roles in Story 2.2, avoiding a future rewrite; admin/enterprise routes correctly return 403 for any user without the required role, including new users with no role set)
- `safeGetSession` calls `auth.getUser()` first (trusted server-side) then `auth.getSession()` for session metadata; result is cached per-request to avoid redundant Supabase API calls
- `filterSerializedResponseHeaders` extracted to shared `resolveOptions` const (DRY — used by both public and authenticated resolve paths)
- `+layout.ts` uses `isBrowser()` branching pattern with `depends('supabase:auth')` for reactive invalidation
- `+layout.svelte` updated with `onAuthStateChange` listener calling `invalidate('supabase:auth')`, cleanup on destroy, Toaster preserved
- 30 new tests: 25 unit tests (co-located `hooks.server.test.ts`) + 5 mock-based integration tests (`tests/integration/auth/hooks.test.ts`)
- Integration tests use mocked Supabase (not a real local stack) — they verify the full handle chain end-to-end but do not test real cookie/session resolution. Real Supabase integration tests deferred to Story 2.5 when local stack is required for RLS testing.
- All 47 tests pass (17 original + 30 new), zero regressions
- Build, lint, and svelte-check all pass with zero errors

### Change Log

- 2026-02-09: Story created by SM agent (Claude Opus 4.6) — ultimate context engine analysis completed
- 2026-02-09: Story implemented by Dev agent (Claude Opus 4.6) — all 7 tasks complete, 22 tests added, all quality gates pass
- 2026-02-09: Code review by Dev agent (Claude Opus 4.6) — 3 HIGH, 4 MEDIUM, 2 LOW issues found; fixed: safeGetSession caching (H1), filterSerializedResponseHeaders DRY extraction (M1), 8 new edge-case tests (H3+M2), documentation corrections (H2+M3+M4); all 47 tests pass

### File List

**New files:**
- `src/hooks.server.ts` — Supabase server client + centralized route guards (with session caching and shared resolveOptions)
- `src/routes/+layout.ts` — Browser/server client initialization with isBrowser() branching
- `src/routes/+layout.server.ts` — Session data passing (session, user, cookies)
- `src/hooks.server.test.ts` — 25 unit tests for route guard logic (includes edge cases for no-group routes, undefined app_metadata, session caching)
- `tests/integration/auth/hooks.test.ts` — 5 mock-based integration tests for auth hooks

**Modified files:**
- `src/app.d.ts` — Added App.Locals types (supabase, safeGetSession)
- `src/routes/+layout.svelte` — Added auth state change listener with onMount/invalidate
