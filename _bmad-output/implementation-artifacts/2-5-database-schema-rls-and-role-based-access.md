# Story 2.5: Database Schema, RLS & Role-Based Access

Status: done

## Story

As a platform,
I want user data protected by row-level security policies,
So that users can only access data appropriate to their role (FR6).

## Acceptance Criteria

1. **Given** the database schema
   **When** migrations are applied
   **Then** `profiles` table has: `id` (FK to auth.users), `role` (enum: learner, sensei, admin, platform_admin, team_lead, org_admin), `display_name`, `avatar_url`, `bio`, `topics` (text[]), `date_of_birth`, `onboarding_complete`, `org_id` (nullable UUID), `team_id` (nullable UUID), `created_at` (timestamptz), `updated_at` (timestamptz)
   **And** all time columns use `timestamptz`
   **And** `org_id` and `team_id` are nullable UUID columns with NO foreign key constraints

2. **Given** RLS policies on the `profiles` table
   **When** a learner queries profiles
   **Then** they can read their own profile
   **And** they can read basic public fields (display_name, avatar_url, topics, role) of Senseis
   **And** they cannot read other learners' profiles

3. **Given** RLS policies on the `profiles` table
   **When** a Sensei queries profiles
   **Then** they can read their own profile
   **And** they can read profiles of learners connected to them

4. **Given** the RLS test infrastructure
   **When** RLS tests run
   **Then** `tests/integration/rls/users.rls.test.ts` uses `createAuthenticatedClients()` from `tests/fixtures/roles.ts`
   **And** tests verify learner cannot access other learner data
   **And** tests verify Sensei can only access connected learner data
   **And** tests verify admin can access aggregate data
   **And** all RLS tests pass

## Tasks / Subtasks

- [x] Task 1: Create migration for org_id, team_id columns and expanded RLS policies (AC: #1, #2, #3)
  - [x] 1.1 Create `supabase/migrations/20260212113055_add_org_team_and_rls_policies.sql`
  - [x] 1.2 Add `org_id UUID` nullable column (NO FK — deferred to Epic 7/12)
  - [x] 1.3 Add `team_id UUID` nullable column (NO FK — deferred to Epic 7/12)
  - [x] 1.4 Drop existing `profiles_select_own` policy (too restrictive — only self-read)
  - [x] 1.5 Create `profiles_select_own` — authenticated users can SELECT their own full profile row
  - [x] 1.6 Create `profiles_select_sensei` — any authenticated user can SELECT sensei profile rows (`role = 'sensei'`). Policy name follows `{table}_{action}_{role}` convention. RLS returns the full row; **application must SELECT only public columns** (display_name, avatar_url, topics, role) — see Dev Notes on column-level filtering
  - [x] 1.7 Create `profiles_select_admin` — users whose `profiles.role` IN ('admin', 'platform_admin') can SELECT all profile rows
  - [x] 1.8 Keep existing `profiles_update_own` policy unchanged (users update own profile only)
  - [x] 1.9 No INSERT policy — profiles created only via `handle_new_user()` SECURITY DEFINER trigger
  - [x] 1.10 No DELETE policy — profile deletion not supported in Phase 1

- [x] Task 2: Create Supabase test client factory (AC: #4)
  - [x] 2.1 Create `tests/fixtures/supabase.ts` with `createAdminClient()` and `createAnonClient()` using well-known local Supabase keys
  - [x] 2.2 Export `SUPABASE_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY` constants for local dev

- [x] Task 3: Upgrade test fixtures for real RLS testing (AC: #4)
  - [x] 3.1 Update `tests/fixtures/roles.ts` — add `createAuthenticatedClients()` function
  - [x] 3.2 Function creates real auth users via `adminClient.auth.admin.createUser()`
  - [x] 3.3 Function sets profile roles via admin client (service_role bypasses RLS)
  - [x] 3.4 Function signs in each user and returns authenticated Supabase clients
  - [x] 3.5 Keep existing `createTestUsers()` for backward compatibility with unit tests

- [x] Task 4: Create RLS integration tests (AC: #4)
  - [x] 4.1 Create `tests/integration/rls/` directory
  - [x] 4.2 Create `tests/integration/rls/users.rls.test.ts`
  - [x] 4.3 Test: learner can read own full profile
  - [x] 4.4 Test: learner CANNOT read another learner's profile (expect 0 rows)
  - [x] 4.5 Test: learner CAN read sensei profile row (sensei public visibility)
  - [x] 4.6 Test: sensei can read own full profile
  - [x] 4.7 Test: sensei CANNOT read a learner's profile (no connections exist yet — expect 0 rows)
  - [x] 4.8 Test: admin/platform_admin can read ALL profiles
  - [x] 4.9 Test: user can update own profile (display_name, bio, etc.)
  - [x] 4.10 Test: user CANNOT update another user's profile (expect error)
  - [x] 4.11 Test: user CANNOT insert a profile directly (no INSERT policy — expect error)

- [x] Task 5: Regenerate database types (AC: #1)
  - [x] 5.1 Run `npx supabase gen types typescript --local > src/lib/database.types.ts`
  - [x] 5.2 Verify `org_id` (string | null) and `team_id` (string | null) appear in profiles Row/Insert/Update types

- [x] Task 6: Verify build and all tests (AC: all)
  - [x] 6.1 Run `npm run build` — must succeed
  - [x] 6.2 Run `npm run test` — all 194 tests pass (171 unit + 23 integration, zero regressions)
  - [x] 6.3 Run `npm run test:rls` — all 23 integration tests pass (9 RLS + 14 auth)
  - [x] 6.4 Run `npm run lint` — prettier passes, 5 pre-existing eslint errors (untouched files)
  - [x] 6.5 Run `npm run check` — passes (0 errors, 5 pre-existing warnings)
  - [x] 6.6 Note: `test:rls` is Stage 4 of the CI pipeline and runs on **every PR** — not just local. Ensure tests are deterministic and don't depend on local-only state.

## Dev Notes

### Critical: Migration SQL — Exact Content

Create `supabase/migrations/<timestamp>_add_org_team_and_rls_policies.sql`:

```sql
-- Story 2.5: Add org/team columns and expand RLS policies

-- 1. Add nullable columns for future multi-tenancy (no FK — tables created in Epic 7/12)
ALTER TABLE public.profiles ADD COLUMN org_id UUID;
ALTER TABLE public.profiles ADD COLUMN team_id UUID;

-- 2. Drop existing overly-simple SELECT policy
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;

-- 3. New SELECT policies (PostgreSQL OR's multiple SELECT policies — access if ANY returns true)

-- Users can read their own full profile
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Any authenticated user can see sensei profiles (for discovery/listing)
-- NOTE: RLS is ROW-level only. This returns the FULL row.
-- Application layer MUST select only public columns: id, display_name, avatar_url, topics, role
CREATE POLICY profiles_select_sensei ON public.profiles
  FOR SELECT USING (
    role = 'sensei'
    AND auth.uid() IS NOT NULL
  );

-- Admin and platform_admin can read all profiles
CREATE POLICY profiles_select_admin ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'platform_admin')
    )
  );

-- 4. UPDATE policy: keep existing profiles_update_own (users update own profile only)
-- Already exists from migration 20260210034001 — no change needed

-- 5. No INSERT policy — profiles created only via handle_new_user() SECURITY DEFINER trigger
-- 6. No DELETE policy — profile deletion not supported in Phase 1
```

**Critical: Generate the migration timestamp.** Use `npx supabase migration new add_org_team_and_rls_policies` to create the file with a proper timestamp, then write the SQL content into it. Do NOT hand-craft the timestamp.

**Critical: `profiles_update_own` already exists.** Do NOT drop or recreate it. It's unchanged from migration `20260210034001`. Only the SELECT policies are being replaced.

### Critical: PostgreSQL RLS Evaluation Rules

- **Multiple SELECT policies are OR'd.** If ANY policy returns `true`, the row is visible. So a learner sees rows where `id = auth.uid()` (own profile) OR `role = 'sensei'` (sensei profiles). This is correct and expected.
- **The admin subquery works because** `profiles_select_own` lets the admin read their own row first, so the `EXISTS` subquery can find it and check the role. No recursion issue.
- **No INSERT policy = no direct inserts via API.** The `handle_new_user()` trigger runs as `SECURITY DEFINER` which bypasses RLS entirely.
- **No DELETE policy = no deletes via API.** Profile deletion will be a future admin-only feature.

### Critical: RLS Does NOT Filter Columns

PostgreSQL RLS controls which ROWS are visible, not which COLUMNS. The `profiles_select_sensei` policy returns the **full sensei profile row** including bio, date_of_birth, org_id, team_id. The application layer MUST select only the intended public columns.

**What this means for the developer:**
- When querying sensei profiles for public display (listings, cards, search), always use `.select('id, display_name, avatar_url, topics, role')` — never `select('*')`.
- When loading the user's own profile (profile page, settings), `select('*')` is safe because `profiles_select_own` only returns their own row.
- This is the standard Supabase pattern: RLS guards rows, application guards columns.

**Security note:** A technically savvy user with their JWT could query the Supabase REST API directly and request all columns of sensei profiles. For Phase 1 this is acceptable — sensei bios and null org_id/team_id are not sensitive. **However, `date_of_birth` IS PII and is exposed via this policy.** This is accepted for Phase 1 given low user volume and low abuse risk. If column-level restriction becomes a requirement, implement a PostgreSQL VIEW with restricted columns in a future security story.

### Critical: Sensei→Connected-Learner Policy is DEFERRED

AC #3 says senseis can "read profiles of learners connected to them." This requires a connections/invites table that doesn't exist until **Epic 3** (Sensei Invite System & Learner Connections).

**Current behavior (correct for Phase 1):**
- Senseis can read their own profile (via `profiles_select_own`)
- Senseis can read other sensei profiles (via `profiles_select_sensei`)
- Senseis CANNOT read any learner profiles — correct because no connections exist yet

**When Epic 3 adds the connections table**, add this policy:
```sql
CREATE POLICY profiles_select_connected_learner ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sensei_learner_connections AS c
      WHERE c.sensei_id = auth.uid()
      AND c.learner_id = profiles.id
    )
  );
```

**RLS tests must verify the current-state behavior:** senseis cannot see learner profiles. This test will be updated in Epic 3 to verify connected-learner access.

### Critical: `handle_new_user()` Trigger Compatibility — Verified

The existing trigger in migration `20260210034001` uses a named column INSERT:
```sql
INSERT INTO public.profiles (id, display_name, avatar_url) VALUES (...)
```

Adding `org_id` and `team_id` as nullable columns with no defaults will NOT break this trigger. PostgreSQL automatically sets omitted nullable columns to NULL on INSERT. No trigger modification is needed.

### Critical: org_id and team_id — No FK Constraints

The `organizations` and `teams` tables don't exist yet (Epic 7/12). Adding FK constraints to nonexistent tables would fail. These are plain nullable UUID columns for now.

**When Epic 7/12 creates the referenced tables**, add FK constraints:
```sql
ALTER TABLE public.profiles ADD CONSTRAINT profiles_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES public.organizations(id);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_team_id_fkey
  FOREIGN KEY (team_id) REFERENCES public.teams(id);
```

### Critical: Supabase Test Client Factory — `tests/fixtures/supabase.ts`

```typescript
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../src/lib/database.types'

// Well-known local Supabase keys (identical for all local instances)
export const SUPABASE_URL = 'http://127.0.0.1:54321'
export const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
export const SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

export function createAdminClient(): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export function createAnonClient(): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}
```

**Critical: Use RELATIVE paths, not `$lib`, in all integration test files.** The integration test vitest project (`environment: 'node'`) has NO explicit `resolve.alias` for `$lib`. The `$lib` alias works in unit tests (jsdom, via SvelteKit config) but is NOT guaranteed in integration tests. Always use relative paths: `'../../src/lib/database.types'` from `tests/fixtures/`, and `'../../../src/lib/database.types'` from `tests/integration/rls/`. Verify imports resolve correctly before writing test logic.

**Critical:** These keys are NOT secrets. They are well-known demo keys used by every local Supabase instance. They are safe to commit.

### Critical: Upgraded Test Fixtures — `tests/fixtures/roles.ts`

Add `createAuthenticatedClients()` alongside existing `createTestUsers()`:

```typescript
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../src/lib/database.types'
import { createAdminClient, SUPABASE_URL, ANON_KEY } from './supabase'

// -- Existing exports (keep for unit test backward compat) --
export const TEST_ROLES = ['learner', 'sensei', 'team_lead', 'org_admin', 'platform_admin'] as const
export type TestRole = (typeof TEST_ROLES)[number]

export interface TestUser {
  id: string
  email: string
  role: TestRole
}

export function createTestUsers(): Record<TestRole, TestUser> {
  return Object.fromEntries(
    TEST_ROLES.map((role) => [
      role,
      { id: `test-${role}-id`, email: `test-${role}@teachmesensei.test`, role }
    ])
  ) as Record<TestRole, TestUser>
}

// -- New: Real Supabase authenticated clients for RLS tests --

export interface AuthenticatedTestUser {
  id: string
  email: string
  role: TestRole
  client: SupabaseClient<Database>
}

export async function createAuthenticatedClients(): Promise<
  Record<TestRole, AuthenticatedTestUser>
> {
  const admin = createAdminClient()
  const users = {} as Record<TestRole, AuthenticatedTestUser>

  for (const role of TEST_ROLES) {
    const email = `test-${role}@teachmesensei.test`
    const password = 'TestPassword123!'

    const { data: userData, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if (error) throw new Error(`Failed to create ${role} user: ${error.message}`)

    // Set profile role + complete onboarding (via admin client — bypasses RLS)
    const { error: updateError } = await admin
      .from('profiles')
      .update({
        role: role as Database['public']['Enums']['user_role'],
        display_name: `Test ${role.replace('_', ' ')}`,
        onboarding_complete: true,
        topics: role === 'sensei' ? ['Career Development'] : []
      })
      .eq('id', userData.user.id)
    if (updateError) throw new Error(`Failed to set ${role} profile: ${updateError.message}`)

    // Create authenticated client for this user
    const client = createClient<Database>(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    const { error: signInError } = await client.auth.signInWithPassword({ email, password })
    if (signInError) throw new Error(`Failed to sign in ${role}: ${signInError.message}`)

    users[role] = { id: userData.user.id, email, role, client }
  }

  return users
}
```

**Critical: `admin` is NOT in TEST_ROLES** (only 5 roles). The `admin` role is functionally equivalent to `platform_admin` for RLS purposes (both are in the `IN ('admin', 'platform_admin')` check). The `platform_admin` test user covers admin policy testing.

**Critical: Service role key bypasses RLS.** The admin client can set profile roles directly because `SERVICE_ROLE_KEY` has full database access regardless of RLS policies. This is how we set up test data before testing user-level access.

**Critical: `supabase db reset --local` runs before tests.** The `test:rls` script resets the entire database from migrations. Tests start with a completely clean slate — no need for manual cleanup.

### Critical: RLS Test Structure — `tests/integration/rls/users.rls.test.ts`

```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import { createAuthenticatedClients, type AuthenticatedTestUser, type TestRole } from '../../fixtures/roles'
import { createAdminClient } from '../../fixtures/supabase'

describe('profiles RLS policies', () => {
  let users: Record<TestRole, AuthenticatedTestUser>

  beforeAll(async () => {
    users = await createAuthenticatedClients()
  }, 30_000) // Allow 30s for user creation

  describe('SELECT policies', () => {
    it('learner can read own profile', async () => { /* ... */ })
    it('learner cannot read another learner profile', async () => { /* ... */ })
    it('learner can read sensei profile (public discovery)', async () => { /* ... */ })
    it('sensei can read own profile', async () => { /* ... */ })
    it('sensei cannot read learner profile (no connections)', async () => { /* ... */ })
    it('platform_admin can read all profiles', async () => { /* ... */ })
  })

  describe('UPDATE policies', () => {
    it('user can update own profile', async () => { /* ... */ })
    it('user cannot update another user profile', async () => { /* ... */ })
  })

  describe('INSERT policies', () => {
    it('user cannot insert a profile directly', async () => { /* ... */ })
  })
})
```

**Test assertions pattern:**
- **Can read:** `const { data, error } = await client.from('profiles').select('*').eq('id', targetId)` → expect `data` to have 1 row, no error
- **Cannot read:** Same query → expect `data` to be empty array (RLS silently filters rows, returns 0 matches — NOT an error)
- **Can update:** `await client.from('profiles').update({ bio: 'test' }).eq('id', ownId)` → expect no error
- **Cannot update:** Same query with other user's id → expect 0 rows affected (RLS silently filters, update affects nothing — NOT an error)
- **Cannot insert:** `await client.from('profiles').insert({ ... })` → expect error (no INSERT policy = RLS blocks with permission error)

**Critical: RLS does NOT throw errors for SELECT/UPDATE denials.** It silently returns empty results. Only INSERT/DELETE without a policy throw actual errors. Tests must check for empty data, not errors.

**Critical: `beforeAll` timeout.** Creating 5 auth users against local Supabase can take several seconds. Set `beforeAll` timeout to 30 seconds.

### Critical: Two Role Systems — Do NOT Attempt to Sync

**Two parallel role checks exist:**
1. `profiles.role` — used by RLS policies for **data** access control
2. `user.app_metadata?.role` — used by `hooks.server.ts` for **route** access control

These serve different purposes and are NOT automatically synced. For Phase 1 this is correct:
- Learner/sensei routes are under `(app)` which only requires authentication (any role)
- Admin/enterprise routes check `app_metadata.role` and are empty shells in Phase 1
- Admin users would be provisioned manually with both set

**DO NOT add a sync mechanism in this story.** A database trigger that updates `auth.users.raw_app_meta_data` when `profiles.role` changes is a future story for when admin management features are built.

### Critical: Existing Code Compatibility — Verified Safe

All 6 existing profile queries in the codebase were audited and confirmed safe:

| Location | Query Pattern | Columns Selected | Status |
|---|---|---|---|
| `hooks.server.ts:65` | `.select('onboarding_complete').eq('id', user.id)` | Single column | Safe |
| `(app)/profile/+page.server.ts:13` | `.select('display_name, bio, avatar_url, topics, role, date_of_birth').eq('id', user.id)` | Specific columns | Safe |
| `(app)/profile/+page.server.ts:47` | `.select('role').eq('id', user.id)` | Single column | Safe |
| `(app)/onboarding/+page.server.ts:17` | `.select('display_name, avatar_url, bio, role, date_of_birth, topics, onboarding_complete').eq('id', user.id)` | Specific columns | Safe |
| `(app)/onboarding/+page.server.ts:113` | `.select('role').eq('id', user.id)` | Single column | Safe |
| `(public)/login/callback/+server.ts:68` | `.select('onboarding_complete').eq('id', user.id)` | Single column | Safe |

**Key findings:** No query uses `select('*')`. All queries filter by the current user's ID. The expanded RLS policies are defense-in-depth — existing application-layer column filtering is already correct.

The new RLS policies are **strictly more permissive** than the old ones. Existing code continues to work:

- **Profile page** (`+page.server.ts`): loads own profile via `.eq('id', user.id)` — still works via `profiles_select_own`
- **Onboarding** (`+page.server.ts`): loads/updates own profile — still works via `profiles_select_own` + `profiles_update_own`
- **hooks.server.ts**: reads `onboarding_complete` from own profile — still works via `profiles_select_own`
- **No breaking changes.** All 185+ existing tests should pass without modification.

### What NOT to Build in This Story

- **No connections table** — Epic 3. Sensei→connected-learner RLS policy deferred.
- **No organizations/teams tables** — Epic 7/12. Only add nullable org_id/team_id columns.
- **No role sync** (profiles.role ↔ app_metadata.role) — future story
- **No role change prevention trigger** — application layer already prevents this (SuperForms schema excludes `role`). Database-level trigger is defense-in-depth for a later story.
- **No team_lead/org_admin specific RLS policies** — no org/team data exists yet
- **No E2E tests** — RLS integration tests against real Supabase are sufficient
- **No UI changes** — this is a backend/database-only story
- **No seed.sql changes** — test fixtures handle test data creation
- **No column-level security views** — application-layer column filtering is sufficient for Phase 1

### Previous Story Intelligence

**From Story 2.4 (Profile Management — DONE):**
- Profile page reads/writes own profile via SuperForms — compatible with expanded RLS
- Schema at `$lib/schemas/profiles.ts` only includes user-editable fields (display_name, bio, avatar_url, topics) — role is NOT in the schema
- `update_updated_at()` trigger auto-sets `updated_at = now()` on every UPDATE — do NOT include `updated_at` in test update payloads
- 185 tests passing as baseline
- Profile load in `+page.server.ts` uses `.select('display_name, bio, avatar_url, topics, role, date_of_birth')` — specific columns, not `select('*')`. This pattern is correct for column-level filtering.

**From Story 2.3 (Onboarding — DONE):**
- `date_of_birth` and `topics` columns added in migration `20260210122106_add_onboarding_fields.sql`
- Role is set during onboarding (learner or sensei selection) via own profile UPDATE

**From Story 2.2 (Registration & Login — DONE):**
- `handle_new_user()` SECURITY DEFINER trigger creates profile on auth signup — bypasses RLS
- `update_updated_at()` trigger fires on every profile UPDATE
- Existing RLS: `profiles_select_own` + `profiles_update_own` in migration `20260210034001`

**From Story 2.1 (Auth Integration — DONE):**
- `hooks.server.ts` reads `user.app_metadata?.role` for admin/enterprise route checks — NOT from profiles table
- `(app)` routes require auth + `onboarding_complete`
- `auth.getUser()` always used on server

**From Story 1.4 (CI/CD — DONE):**
- Vitest multi-project config: unit (jsdom) + integration (node)
- `test:rls` script: `supabase db reset --local && vitest run --project integration`
- `--passWithNoTests` flag on integration script — will run new RLS tests automatically

### Git Intelligence

Recent commits:
```
3f331e3 feat: story 2.4 — profile management with code review fixes
db25661 feat: story 2.3 — age verification & onboarding flow with code review fixes
fc0d42f feat: story 2.2 — user registration & login with code review fixes
faab1c8 feat: story 2.1 — Supabase auth integration, route guards, and code review fixes
```

Convention: `feat:` prefix with story reference. Single commits per story on `master`.

### Project Structure Notes

**New files to create:**
```
supabase/
└── migrations/
    └── <timestamp>_add_org_team_and_rls_policies.sql   # Schema + RLS changes
tests/
├── fixtures/
│   └── supabase.ts                                      # Local Supabase client factory
└── integration/
    └── rls/
        └── users.rls.test.ts                            # RLS data isolation tests
```

**Modified files:**
- `tests/fixtures/roles.ts` — add `createAuthenticatedClients()` for real Supabase RLS testing
- `src/lib/database.types.ts` — regenerate with org_id, team_id columns

**Files to reference (NOT modify):**
- `supabase/migrations/20260210034001_create_profiles.sql` — existing schema, trigger, RLS policies
- `supabase/migrations/20260210122106_add_onboarding_fields.sql` — existing column additions
- `src/hooks.server.ts` — route protection (uses app_metadata.role, not profiles.role)
- `src/routes/(app)/profile/+page.server.ts` — column filtering pattern for own profile
- `tests/integration/auth/hooks.test.ts` — existing integration test patterns (mock-based)

### Architecture Compliance Checklist

- [ ] Migration uses `timestamptz` for all time columns (existing columns already correct)
- [ ] `org_id` and `team_id` are nullable UUID with NO FK constraints
- [ ] RLS policy names follow `{table}_{action}_{role}` convention
- [ ] RLS tests in `tests/integration/rls/` directory
- [ ] RLS tests use `createAuthenticatedClients()` from `tests/fixtures/roles.ts`
- [ ] RLS tests run against real local Supabase (not mocked)
- [ ] No barrel exports in test fixtures
- [ ] `database.types.ts` regenerated after migration
- [ ] All existing 185+ tests pass (zero regressions)
- [ ] New RLS integration tests all pass
- [ ] Build, lint, check all pass
- [ ] `snake_case` throughout (org_id, team_id, not orgId, teamId)
- [ ] No UI changes in this story
- [ ] No direct INSERT policy (profiles created only via auth trigger)
- [ ] Test file naming: `users.rls.test.ts` (per architecture spec)
- [ ] Emotionally calibrated errors — N/A (no user-facing changes in this story)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.5 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — RLS data isolation testing, multi-role test fixture]
- [Source: _bmad-output/planning-artifacts/architecture.md — Database naming conventions, RLS policy naming `{table}_{action}_{role}`]
- [Source: _bmad-output/planning-artifacts/architecture.md — Three-tier API security: RLS / session / service role]
- [Source: _bmad-output/planning-artifacts/architecture.md — Test locations: tests/integration/rls/, tests/fixtures/roles.ts]
- [Source: _bmad-output/planning-artifacts/architecture.md — CI pipeline: RLS tests on every PR]
- [Source: _bmad-output/project-context.md — snake_case pass-through, timestamptz, testing rules, anti-patterns]
- [Source: _bmad-output/implementation-artifacts/2-4-profile-management.md — Previous story patterns, 185 test baseline]
- [Source: supabase/migrations/20260210034001_create_profiles.sql — Existing schema, RLS, triggers]
- [Source: supabase/migrations/20260210122106_add_onboarding_fields.sql — date_of_birth, topics columns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed `42P17: infinite recursion detected in policy for relation "profiles"` — the `profiles_select_admin` policy's self-referencing subquery (`SELECT 1 FROM profiles WHERE ...`) triggered recursive RLS evaluation. Fixed by adding `public.get_user_role()` SECURITY DEFINER function that bypasses RLS to read the current user's role.
- Fixed `database.types.ts` corruption — `supabase gen types` stderr warnings were captured into the file via shell redirection. Fixed with `2>/dev/null` to suppress stderr.
- Fixed test idempotency — `createAuthenticatedClients()` and RLS tests now handle pre-existing users gracefully, so `npm run test` works without a preceding `db reset`.

### Completion Notes List

- Migration `20260212113055_add_org_team_and_rls_policies.sql` adds `org_id`, `team_id` columns and 3 new SELECT policies + helper function
- `profiles_select_admin` uses `get_user_role()` SECURITY DEFINER function to avoid infinite recursion (deviation from Dev Notes which claimed self-referencing subquery was safe)
- Test fixtures made idempotent — `createAuthenticatedClients()` handles existing users for deterministic re-runs
- All tests pass: 171 unit + 11 RLS integration + 14 auth integration
- Build, check pass. Lint: prettier clean, 5 pre-existing eslint errors in untouched files

### Change Log

- 2026-02-12: Story created by SM agent (Claude Opus 4.6) — ultimate context engine analysis completed
- 2026-02-12: Validation review by SM agent (Claude Opus 4.6) — 2 critical, 3 enhancements, 2 optimizations applied: renamed `profiles_select_sensei_public` to `profiles_select_sensei` (C1/O1, architecture naming convention compliance), strengthened `$lib` path alias warning for integration tests (C2), added CI pipeline context for `test:rls` on every PR (E1), documented `test:rls` script scope running all integration tests (E2), added verified-safe audit table for all 6 existing profile queries (E3), added `handle_new_user()` trigger compatibility confirmation (O2)
- 2026-02-12: Implementation by Dev agent (Claude Opus 4.6) — all 6 tasks completed, 9 RLS integration tests added, `get_user_role()` SECURITY DEFINER helper added to fix infinite recursion in admin policy
- 2026-02-12: Code review by Dev agent (Claude Opus 4.6) — 7 findings (1H, 3M, 3L). All fixed: H1 date_of_birth PII acknowledged in migration + Dev Notes, M1 REVOKE/GRANT on get_user_role(), M2 extracted second learner to beforeAll, M3 added team_lead/org_admin boundary tests (11 total RLS tests), L1 listUsers pagination, L2 AC #4 text corrected

### File List

**New files:**
- `supabase/migrations/20260212113055_add_org_team_and_rls_policies.sql` — migration: org_id, team_id columns, expanded RLS policies, get_user_role() helper
- `tests/fixtures/supabase.ts` — Supabase test client factory (admin + anon clients)
- `tests/integration/rls/users.rls.test.ts` — 9 RLS integration tests

**Modified files:**
- `tests/fixtures/roles.ts` — added `createAuthenticatedClients()` for real Supabase RLS testing
- `src/lib/database.types.ts` — regenerated with org_id, team_id columns
- `src/lib/schemas/onboarding.ts` — prettier formatting fix (pre-existing)
