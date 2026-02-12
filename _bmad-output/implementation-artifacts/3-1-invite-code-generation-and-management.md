# Story 3.1: Invite Code Generation & Management

Status: done

## Story

As a Sensei,
I want to generate and manage up to 5 invite codes,
So that I can control who joins the platform and bring my existing mentees on board.

## Acceptance Criteria

1. **Given** an authenticated Sensei
   **When** they visit their invite codes page
   **Then** they see up to 5 invite codes with status: unused, claimed (with claimer name)
   **And** each code is displayed as both a shareable link (`teachmesensei.com/invite/{sensei_slug}-{code}`) and an individual code value
   **And** the Sensei can tap to copy any individual code or shareable link (FR9: "via link or individual codes")

2. **Given** a Sensei with fewer than 5 codes
   **When** they request a new invite code
   **Then** a new code is generated and displayed

3. **Given** a Sensei with 5 existing codes
   **When** they try to generate another code
   **Then** they see a message: "You've reached your 5 invite code limit"

4. **Given** the database schema
   **When** migrations are applied
   **Then** an `invite_codes` table exists with: `id` (UUID PK), `sensei_id` (FK to profiles, ON DELETE CASCADE), `code` (text, unique, CHECK 8-char alphanumeric), `shareable_url` (text), `status` (enum: unused, claimed), `claimed_by` (FK to profiles, nullable, ON DELETE SET NULL), `claimed_at` (timestamptz, nullable), `created_at` (timestamptz), `updated_at` (timestamptz)
   **And** RLS policies ensure Senseis can only see and manage their own codes

## Tasks / Subtasks

- [x] Task 1: Create migration for `invite_codes` table, enum, and RLS policies (AC: #4)
  - [x] 1.1 Run `npx supabase migration new create_invite_codes` to generate timestamped file
  - [x] 1.2 Create `invite_status` enum: `('unused', 'claimed')`
  - [x] 1.3 Create `invite_codes` table with all columns per AC #4 (including `updated_at` with auto-trigger, CHECK constraint on `code` format, `ON DELETE SET NULL` on `claimed_by`)
  - [x] 1.4 Add index `idx_invite_codes_sensei_id` on `sensei_id` (UNIQUE on `code` auto-creates its own btree index)
  - [x] 1.5 Add `invite_codes_updated_at` trigger reusing existing `update_updated_at()` function
  - [x] 1.6 Enable RLS on `invite_codes`
  - [x] 1.7 Create `invite_codes_select_own_sensei` — Senseis SELECT their own codes
  - [x] 1.8 Create `invite_codes_insert_own_sensei` — Senseis INSERT codes where `sensei_id = auth.uid()` AND role check via `get_user_role()`
  - [x] 1.9 Create `invite_codes_select_by_code` — any authenticated user can SELECT (needed for claim flow in Story 3.2; add now to avoid a second migration)
  - [x] 1.10 Create `invite_codes_select_admin` — admin/platform_admin explicit policy (forward-compatible if broad policy is later restricted)
  - [x] 1.11 Create helper function `generate_invite_code()` with REVOKE/GRANT (8-char lowercase alphanumeric codes)

- [x] Task 2: Create Zod schema for invite code generation (AC: #2)
  - [x] 2.1 Create `src/lib/schemas/invites.ts` with `generateInviteCodeSchema` (empty body — form action with no user input fields, just the action trigger)

- [x] Task 3: Create invite codes page server logic (AC: #1, #2, #3)
  - [x] 3.1 Create `src/routes/(app)/invite-codes/+page.server.ts`
  - [x] 3.2 `load` function: verify user is sensei (check `profiles.role`), load invite codes with claimed-by display names via join, return codes + form
  - [x] 3.3 `generate_code` action: verify sensei role, check count < 5, generate code + shareable URL, insert row, return updated form
  - [x] 3.4 Role check: if user is not a sensei, redirect to `/dashboard` (not an error — graceful redirect)

- [x] Task 4: Create invite codes page UI (AC: #1, #2, #3)
  - [x] 4.1 Create `src/routes/(app)/invite-codes/+page.svelte`
  - [x] 4.2 Display list of invite codes using Card components — each shows: individual code value (e.g., `a7f9b2c1`), shareable link, status badge (unused/claimed), claimer name if claimed
  - [x] 4.3 Two copy-to-clipboard buttons per code: one for individual code, one for shareable link. Use `navigator.clipboard.writeText()` with personalized toast: "Code copied — your learner can use this to connect with you!" / "Invite link copied — ready to share!"
  - [x] 4.4 "Generate New Code" button (disabled at 5 codes with warm limit message: "You've shared all 5 invite codes! If you need more, reach out to us.")
  - [x] 4.5 Empty state when 0 codes: "No invite codes yet — generate one to start connecting with learners!"
  - [x] 4.6 Page title: `<svelte:head><title>Invite Codes | TeachMeSensei</title></svelte:head>`

- [x] Task 5: Add Invite Codes link to Sidebar for Senseis (AC: #1)
  - [x] 5.1 Update `src/routes/(app)/+layout.server.ts` (create if doesn't exist) to load user role from profiles and pass to layout
  - [x] 5.2 Update `src/routes/(app)/+layout.svelte` to pass user role to AppShell/Sidebar
  - [x] 5.3 Update `src/lib/components/layout/Sidebar.svelte` to accept `role` prop and conditionally show "Invite Codes" link (with `Ticket` icon from lucide) when role is `sensei`

- [x] Task 6: Create RLS integration tests (AC: #4)
  CRITICAL: RLS SELECT denials return empty arrays, NOT errors. All "CANNOT read" tests must assert `expect(data).toHaveLength(0)` and `expect(error).toBeNull()`. RLS tests run with a fresh database via `supabase db reset --local` — no cleanup needed.
  - [x] 6.1 Create `tests/integration/rls/invite-codes.rls.test.ts`
  - [x] 6.2 Setup: in `beforeAll`, create test users via `createAuthenticatedClients()`, then insert 1-2 invite codes for the sensei user via admin client (service role bypasses RLS)
  - [x] 6.3 Test: sensei can read own invite codes (expect 1+ rows)
  - [x] 6.4 Test: authenticated users can read all invite codes (broad SELECT policy for claim flow; query as 1st sensei for 2nd sensei's codes — expect rows returned)
  - [x] 6.5 Test: sensei can insert an invite code for themselves (INSERT succeeds)
  - [x] 6.6 Test: sensei CANNOT insert an invite code for another sensei (INSERT fails — RLS blocks)
  - [x] 6.7 Test: learner can read invite code by exact `code` value (query `.eq('code', testCode)` — expect 1 row; simulates claim flow lookup)
  - [x] 6.8 Test: learner CANNOT insert invite codes (INSERT fails — RLS blocks, `get_user_role()` returns 'learner')
  - [x] 6.9 Test: platform_admin can read ALL invite codes via `invite_codes_select_admin` policy (query without filter — expect all rows including other senseis' codes)

- [x] Task 7: Regenerate database types and verify (AC: all)
  - [x] 7.1 Run `npx supabase gen types typescript --local 2>/dev/null > src/lib/database.types.ts`
  - [x] 7.2 Verify `invite_codes` table and `invite_status` enum appear in generated types
  - [x] 7.3 Run `npm run build` — must succeed
  - [x] 7.4 Run `npm run test` — all existing tests pass (zero regressions)
  - [x] 7.5 Run `npm run test:rls` — all RLS tests pass (existing + new invite_codes tests)
  - [x] 7.6 Run `npm run lint` and `npm run check` — pass

## Dev Notes

### Critical: Migration SQL — Exact Content

Create file via `npx supabase migration new create_invite_codes`, then write this SQL:

```sql
-- Story 3.1: Invite code generation & management

-- 1. Create invite_status enum
CREATE TYPE public.invite_status AS ENUM ('unused', 'claimed');

-- 2. Create invite_codes table
CREATE TABLE public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensei_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE CONSTRAINT invite_codes_code_format
    CHECK (length(code) = 8 AND code ~ '^[a-z0-9]+$'),
  shareable_url TEXT NOT NULL,
  status public.invite_status NOT NULL DEFAULT 'unused',
  claimed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: The UNIQUE constraint on `code` automatically creates a btree index.
-- This index is used by the claim flow (Story 3.2) for lookups by code value.
-- No additional idx_invite_codes_code needed.

-- 3. Indexes
CREATE INDEX idx_invite_codes_sensei_id ON public.invite_codes(sensei_id);

-- 4. Auto-update trigger (reuses existing function from profiles migration)
CREATE TRIGGER invite_codes_updated_at
  BEFORE UPDATE ON public.invite_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 5. Enable RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Senseis can see their own invite codes (with claimer profile join via application layer)
CREATE POLICY invite_codes_select_own_sensei ON public.invite_codes
  FOR SELECT USING (sensei_id = auth.uid());

-- Any authenticated user can look up invite codes by code value.
-- Required for the claim flow (Story 3.2) — learner visits /invite/{slug}-{code}
-- and needs to read the code record to display sensei info and claim it.
-- RLS returns the full row; application layer controls what is displayed.
CREATE POLICY invite_codes_select_by_code ON public.invite_codes
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin/platform_admin can read all invite codes (for moderation).
-- Note: Currently redundant with invite_codes_select_by_code (any authenticated
-- user can SELECT). Added explicitly for forward-compatibility — if the broad
-- policy is later restricted to code-specific lookups, this ensures admin access
-- continues without migration.
CREATE POLICY invite_codes_select_admin ON public.invite_codes
  FOR SELECT USING (
    public.get_user_role() IN ('admin', 'platform_admin')
  );

-- Senseis can create invite codes for themselves only
-- Role check ensures only senseis can insert, not just any authenticated user
CREATE POLICY invite_codes_insert_own_sensei ON public.invite_codes
  FOR INSERT WITH CHECK (
    sensei_id = auth.uid()
    AND public.get_user_role() = 'sensei'
  );

-- UPDATE policy: Only the claim flow (Story 3.2) updates invite codes.
-- Story 3.2 will add the UPDATE policy. No UPDATE policy in this story.
-- NOTE for Story 3.2: A learner claiming a code needs to update another sensei's
-- row (set claimed_by, claimed_at, status). A direct UPDATE policy won't work
-- because the learner isn't the sensei_id owner. Story 3.2 should use a
-- SECURITY DEFINER function (e.g., claim_invite_code(code_value)) that validates
-- the code, checks it's unused, sets the fields, and creates the connection row
-- atomically. This is more secure than a broad UPDATE policy.

-- No DELETE policy — invite codes cannot be deleted by users.

-- 7. Helper function to generate 8-char lowercase alphanumeric codes
-- Uses gen_random_uuid() and extracts hex chars. VOLATILE because each call
-- must return a different value (gen_random_uuid() is non-deterministic).
-- Called from application layer or available for seed scripts/admin tools.
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE sql
VOLATILE
AS $$
  SELECT lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
$$;

-- Restrict function execution to authenticated users only
REVOKE EXECUTE ON FUNCTION public.generate_invite_code() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_invite_code() TO authenticated;
```

**Critical: `get_user_role()` already exists.** The SECURITY DEFINER function was created in Story 2.5 migration `20260212113055_add_org_team_and_rls_policies.sql`. The INSERT policy and admin policy reuse it. Do NOT recreate it.

**Critical: `generate_invite_code()` has REVOKE/GRANT.** Following the same security pattern as `get_user_role()`, the function restricts execution to authenticated users only. Without this, anonymous/public roles could call the function.

**Critical: `invite_codes_select_by_code` allows any authenticated user to SELECT all rows.** This is intentional — the claim flow (Story 3.2) needs to look up codes by code value. RLS is row-level only; the application layer restricts what data is exposed. For Phase 1 with invite-only growth and low user volume, this is acceptable. If code enumeration becomes a concern, restrict to code-specific lookups via a server-side RPC function in a future security story. The explicit `invite_codes_select_admin` policy exists for forward-compatibility — if the broad policy is later restricted, admin access continues without migration.

**Critical: No UPDATE policy in this story.** The `claimed_by`, `claimed_at`, and `status` fields are updated during the claim flow (Story 3.2). That story will add the necessary mechanism. **Important for Story 3.2:** A direct UPDATE policy won't work because the learner claiming a code isn't the `sensei_id` owner. Story 3.2 should use a SECURITY DEFINER function (e.g., `claim_invite_code(code_value)`) that validates the code, checks it's unused, sets `claimed_by`/`claimed_at`/`status`, and creates the connection row atomically. This is more secure than a broad UPDATE policy.

**Critical: FK ON DELETE behaviors.**
- `sensei_id` → `ON DELETE CASCADE`: if a sensei's profile is deleted (future feature), their invite codes are automatically cleaned up.
- `claimed_by` → `ON DELETE SET NULL`: if a learner's profile is deleted (GDPR/admin), the invite code stays but `claimed_by` becomes null. The UI should handle this gracefully — show "Claimed by [deleted user]" or just "Claimed".

**Critical: `updated_at` column and trigger.** The `invite_codes` table includes `updated_at` with the same `update_updated_at()` trigger used by `profiles`. This provides an audit trail for when codes are modified (Story 3.2 claim flow). The existing `update_updated_at()` function was created in migration `20260210034001` and is reused here — do NOT recreate it.

**Critical: CHECK constraint on `code` column.** The constraint `CHECK (length(code) = 8 AND code ~ '^[a-z0-9]+$')` enforces that all codes are exactly 8 lowercase alphanumeric characters. This prevents manual insertion of non-conforming codes and ensures Story 3.2's "extract last 8 chars from URL" approach always works.

**Critical: UNIQUE constraint on `code` auto-creates a btree index.** PostgreSQL automatically indexes UNIQUE columns. The claim flow (Story 3.2) looks up by `code` value — this implicit index handles that query. Do NOT add a redundant `idx_invite_codes_code`.

### Critical: Shareable URL Generation

The shareable URL format from the AC is: `teachmesensei.com/invite/{sensei_slug}-{code}`

**How the slug is generated (application layer, NOT database):**

```typescript
function generateSlug(displayName: string): string {
  return displayName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '-')           // Spaces to dashes
    .replace(/-+/g, '-')            // Collapse multiple dashes
    .slice(0, 30);                  // Limit length
}

// Example: "Marcus Chen" → "marcus-chen"
// Full URL: "teachmesensei.com/invite/marcus-chen-a7f9b2c1"
```

**The slug is NOT stored as a separate column.** It's embedded in `shareable_url` at code creation time. The `code` column stores only the random part (e.g., `a7f9b2c1`). When resolving the URL in Story 3.2, the route parameter includes the full `{slug}-{code}` string; extract the code by splitting on the last `-` of the known code length, or by querying with a `LIKE '%{last_8_chars}'` pattern.

**Recommended approach for Story 3.2 URL resolution:** Use the route `(public)/invite/[invite_path]/+page.server.ts`. Extract the last 8 characters as the code and look up by `code` column. The slug prefix is ignored during lookup — it's purely for URL readability.

**Critical: Use `PUBLIC_APP_URL` environment variable** for the domain in shareable URLs, NOT a hardcoded `teachmesensei.com`. In development this will be `http://localhost:5173`, in staging it's the staging domain, in production it's the real domain. Add `PUBLIC_APP_URL` to `.env` and `$env/static/public`.

### Critical: Code Generation Flow

The `generate_code` form action in `+page.server.ts` must:

1. Verify user is authenticated: `await supabase.auth.getUser()`
2. Verify user role is sensei: query `profiles.role` and `display_name`
3. Count existing codes: `supabase.from('invite_codes').select('id', { count: 'exact' }).eq('sensei_id', user.id)`
4. If count >= 5: return `message(form, "You've shared all 5 invite codes! If you need more, reach out to us — we'd love to help you grow your mentorship circle.", { status: 400 })`
5. Generate code and insert with retry loop (max 3 attempts):
   ```typescript
   const MAX_RETRIES = 3;
   for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
     const code = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
     const slug = generateSlug(profile.display_name ?? 'sensei');
     const shareable_url = `${PUBLIC_APP_URL}/invite/${slug}-${code}`;
     const { error: insertError } = await supabase
       .from('invite_codes')
       .insert({ sensei_id: user.id, code, shareable_url });
     if (!insertError) return message(form, 'Invite code created!');
     // Supabase returns code '23505' for unique constraint violation
     if (insertError.code !== '23505') {
       return message(form, "Something went wrong creating your invite code. Please try again in a moment.", { status: 500 });
     }
     // Code collision — retry with new random code
   }
   return message(form, "Something went wrong creating your invite code. Please try again in a moment.", { status: 500 });
   ```
6. Return success with toast

**Why use `supabase.rpc('generate_invite_code')` instead of client-side generation?** Keeps code generation server-side, uses PostgreSQL's `gen_random_uuid()` which is cryptographically random. Alternatively, generate in the form action using Node.js `crypto.randomUUID()` — either approach is fine. The RPC approach keeps it in a single round-trip if combined with the insert.

**Simpler alternative:** Generate the code in the server action using `crypto.randomUUID().replace(/-/g, '').slice(0, 8)`. This avoids the RPC call. The database `generate_invite_code()` function exists as a utility but doesn't need to be called from the application — it's available for future use (e.g., seed scripts, admin tools).

### Critical: Load Function — Join for Claimer Names

The load function needs to show claimer names on claimed codes. Use a Supabase select with a foreign key join:

```typescript
const { data: inviteCodes, error } = await supabase
  .from('invite_codes')
  .select(`
    id,
    code,
    shareable_url,
    status,
    claimed_by,
    claimed_at,
    created_at,
    claimer:profiles!claimed_by(display_name, avatar_url)
  `)
  .eq('sensei_id', user.id)
  .order('created_at', { ascending: true });
```

**Critical: The join `profiles!claimed_by` uses the FK hint syntax.** Since `invite_codes` has two FKs to `profiles` (`sensei_id` and `claimed_by`), Supabase needs the hint to disambiguate. Without it, the query fails with an ambiguous relationship error.

**Critical: The `claimer` alias will be `null` for unused codes** (where `claimed_by` is null). Handle this in the UI — show claimer name only when `status === 'claimed'`.

### Critical: Copy to Clipboard

Use the Clipboard API with toast feedback:

```typescript
async function copyToClipboard(text: string, type: 'code' | 'link') {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(
      type === 'code'
        ? 'Code copied — your learner can use this to connect with you!'
        : 'Invite link copied — ready to share!'
    );
  } catch {
    toast.error("Couldn't copy — try selecting and copying manually");
  }
}
```

Each invite code card should display TWO copy targets:
1. **Individual code value** (e.g., `a7f9b2c1`) — a compact code the sensei can share verbally or via text
2. **Full shareable link** (e.g., `teachmesensei.com/invite/marcus-chen-a7f9b2c1`) — the full clickable URL

This matches FR9: "share invite codes **via link or individual codes**" and the PRD Marcus persona journey which shows both formats side by side.

**Critical: `navigator.clipboard.writeText()` requires a secure context (HTTPS or localhost).** This works in development (`localhost:5173`) and production (HTTPS). No polyfill needed.

### Critical: Role-Based Route Protection

The `(app)` route group requires authentication via `hooks.server.ts` but does NOT check roles. The invite codes page must verify the user is a sensei in the load function:

```typescript
export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(303, '/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'sensei') {
    redirect(303, '/dashboard');
  }

  // Load invite codes...
};
```

**Do NOT add role checks to `hooks.server.ts` for this.** The invite codes page is the only sensei-specific (app) route for now. Inline role verification in the page server is the correct pattern — same as how profile pages check role for sensei-specific validation.

### Critical: Sidebar Conditional Navigation

The Sidebar currently shows static links. To conditionally show "Invite Codes" for senseis:

1. **Create `src/routes/(app)/+layout.server.ts`** to load user role:

```typescript
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { supabase } }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { userRole: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return { userRole: profile?.role ?? null };
};
```

2. **Update `+layout.svelte`** to pass role to Sidebar via AppShell
3. **Update Sidebar.svelte** to accept optional `role` prop and conditionally render the invite codes link

**Critical: This layout server load runs on EVERY (app) page navigation.** The profile role query is lightweight (single column, single row, indexed by PK) and is cached by Supabase's connection pool. The `hooks.server.ts` already queries profiles for onboarding check on every request, so this adds one more lightweight query. Acceptable for Phase 1.

**Alternative: Use `hooks.server.ts` to set role on `event.locals`.** This avoids the extra query in layout server load since hooks already has the user. However, the current hooks only check `onboarding_complete`, not `role`. Adding role to locals is a cleaner long-term pattern but requires modifying hooks — defer to a future story if needed. For now, the layout server load approach is simpler and isolated.

### Critical: Environment Variable — PUBLIC_APP_URL

**`PUBLIC_APP_URL` already exists** in `.env` (line 19) and `.env.example` (line 30), set to `http://localhost:5173`. No new env var needed — reuse the existing one.

In production (Railway), this is set to `https://teachmesensei.com` (or the actual domain).

Import in server code:
```typescript
import { PUBLIC_APP_URL } from '$env/static/public';
```

**If `PUBLIC_APP_URL` is not set**, fall back to constructing from the request URL in the form action:
```typescript
const baseUrl = PUBLIC_APP_URL || `${url.origin}`;
```

**Do NOT create a new `PUBLIC_BASE_URL` — use the existing `PUBLIC_APP_URL`.** This is a `PUBLIC_` prefixed variable because it may be needed client-side in future stories for sharing/redirect logic.

### Critical: SuperForms Pattern for Code Generation

The "Generate Code" action has no user input fields — it's a button-triggered server action. Use SuperForms with an empty schema:

```typescript
// Schema: no fields needed — the button click itself IS the action.
// Do NOT add fields for code/shareable_url — these are generated server-side.
// An empty schema is the correct pattern for action-only forms with no user input.
export const generateInviteCodeSchema = z.object({});
```

```svelte
<!-- In +page.svelte -->
<form method="POST" action="?/generate_code" use:generateEnhance>
  <Button type="submit" disabled={codes.length >= 5 || $generating}>
    {$generating ? 'Generating...' : 'Generate Invite Code'}
  </Button>
</form>
```

**Alternative approach without SuperForms for simple actions:** Since there are no form fields, a regular `<form method="POST">` with `use:enhance` from SvelteKit works too. However, SuperForms provides consistent `onUpdated` handling for toast messages, which is the established pattern.

### Critical: Known Limitation — 5-Code Lifetime Cap

The 5-code limit counts ALL codes (unused + claimed). Once a sensei has 5 codes — even if all are claimed — they cannot generate more. This is a **lifetime cap, not a concurrent-unused cap**. The PRD does not specify behavior for requesting a 6th code after all 5 are claimed. This is acceptable for Phase 1 (invite-only, small user base). If the limit needs to change, a future story should either: (a) allow recycling claimed codes, (b) raise the limit, or (c) add an admin override.

### What NOT to Build in This Story

- **No claim flow** — Story 3.2 handles learner claiming invite codes
- **No connections table** — Story 3.2 creates the `connections` table when a code is claimed
- **No public `/invite/[code]` route** — Story 3.2 creates the public-facing claim page
- **No UPDATE policy on invite_codes** — Story 3.2 adds it via a SECURITY DEFINER function (see migration SQL comments)
- **No in-app notifications** — Story 3.2 mentions sensei notification on claim; no notification infrastructure exists yet (Story 3.2 will need to address this, possibly with a simple in-app alert or toast on next login)
- **No code revocation/deletion** — not in any AC for Epic 3
- **No slug column on profiles** — slug is computed on-the-fly and embedded in `shareable_url`
- **No E2E tests** — RLS integration tests + manual verification sufficient for Phase 1
- **No code expiration** — not in AC; codes are permanent until claimed
- **No code recycling** — claimed codes stay claimed forever (see Known Limitation above)

### Previous Story Intelligence

**From Story 2.5 (Database Schema, RLS & Role-Based Access — DONE):**
- `get_user_role()` SECURITY DEFINER function exists — reuse in INSERT policy
- RLS silent filtering pattern: SELECT returns empty for denied rows, not errors
- `REVOKE EXECUTE FROM PUBLIC; GRANT EXECUTE TO authenticated` pattern for helper functions
- Migration timestamp generated via `npx supabase migration new` — do NOT hand-craft
- `database.types.ts` regeneration: `2>/dev/null` to suppress stderr warnings
- Test fixtures `createAuthenticatedClients()` creates real auth users with assigned roles
- All 196 tests currently pass (171 unit + 11 RLS + 14 auth integration)

**From Story 2.4 (Profile Management — DONE):**
- SuperForms pattern: `superValidate()` in load, `fail(400, { form })` / `message(form, ...)` in actions
- `zod4 as zod` adapter import: `import { zod4 as zod } from 'sveltekit-superforms/adapters'`
- Svelte 5 component pattern: `let { data } = $props()`, `$state()`, `$derived()`, `$effect()`
- `svelte-sonner` toast: `toast.success()` / `toast.error()` for user feedback
- Profile `display_name` is available — use for slug generation

**From Story 2.2 (Registration & Login — DONE):**
- `handle_new_user()` trigger creates profile on auth signup — no invite_codes created at signup
- OAuth redirect pattern: `redirect(303, data.url)`

**From Story 1.2 (Route Group Layouts — DONE):**
- Sidebar component at `src/lib/components/layout/Sidebar.svelte` — static links with lucide icons
- AppShell wraps content with Sidebar
- No `+layout.server.ts` in `(app)` group currently — this story creates one

**From Story 1.4 (CI/CD — DONE):**
- Vitest multi-project: unit (jsdom) + integration (node)
- `test:rls` runs `supabase db reset --local && vitest run --project integration`
- New RLS test files are auto-discovered by the integration project glob

### Git Intelligence

Recent commits follow pattern: `feat: story X.Y — description with code review fixes`

```
3f032e6 feat: story 2.5 — database schema, RLS & role-based access with code review fixes
3f331e3 feat: story 2.4 — profile management with code review fixes
db25661 feat: story 2.3 — age verification & onboarding flow with code review fixes
```

Convention: single commit per story on `master` branch.

### Project Structure Notes

**New files to create:**
```
supabase/
└── migrations/
    └── <timestamp>_create_invite_codes.sql          # invite_codes table + RLS
src/
├── lib/
│   └── schemas/
│       └── invites.ts                               # Zod schema for generate action
├── routes/
│   └── (app)/
│       ├── +layout.server.ts                        # NEW: loads user role for sidebar
│       └── invite-codes/
│           ├── +page.server.ts                      # Load + generate_code action
│           └── +page.svelte                         # Invite codes management UI
tests/
└── integration/
    └── rls/
        └── invite-codes.rls.test.ts                 # RLS data isolation tests
```

**Modified files:**
- `src/routes/(app)/+layout.svelte` — pass `userRole` to AppShell/Sidebar
- `src/lib/components/layout/Sidebar.svelte` — add conditional "Invite Codes" link for senseis
- `src/lib/components/layout/AppShell.svelte` — pass role prop through to Sidebar
- `src/lib/database.types.ts` — regenerated with `invite_codes` table and `invite_status` enum
- `.env` / `.env.example` — `PUBLIC_APP_URL` already exists, no changes needed

**Files to reference (NOT modify):**
- `supabase/migrations/20260212113055_add_org_team_and_rls_policies.sql` — `get_user_role()` function
- `src/hooks.server.ts` — route protection (no changes needed)
- `src/routes/(app)/profile/+page.server.ts` — reference pattern for load/actions
- `src/routes/(app)/profile/+page.svelte` — reference pattern for SuperForms + Svelte 5
- `tests/fixtures/roles.ts` — test fixture for RLS tests
- `tests/fixtures/supabase.ts` — admin/anon client factory
- `tests/integration/rls/users.rls.test.ts` — reference pattern for RLS tests

### Architecture Compliance Checklist

- [ ] Migration uses `timestamptz` for all time columns (`claimed_at`, `created_at`, `updated_at`)
- [ ] `updated_at` column with `update_updated_at()` trigger (consistent with `profiles` table pattern)
- [ ] CHECK constraint on `code` column enforces 8-char lowercase alphanumeric
- [ ] `ON DELETE SET NULL` on `claimed_by` FK (graceful learner deletion)
- [ ] `ON DELETE CASCADE` on `sensei_id` FK (cleanup on sensei deletion)
- [ ] REVOKE/GRANT on `generate_invite_code()` function (restrict to authenticated)
- [ ] Table name is `snake_case`, plural: `invite_codes`
- [ ] Column names are `snake_case`: `sensei_id`, `shareable_url`, `claimed_by`, `claimed_at`, `created_at`
- [ ] Index naming: `idx_invite_codes_sensei_id`
- [ ] RLS policy naming: `{table}_{action}_{role}` convention
- [ ] Enum type name: `invite_status` (snake_case)
- [ ] FK references use `{table_singular}_id` pattern
- [ ] RLS tests in `tests/integration/rls/` directory
- [ ] RLS tests use `createAuthenticatedClients()` from `tests/fixtures/roles.ts`
- [ ] Zod schema validates ONLY user-editable fields (not full DB mirror)
- [ ] Schema imported directly: `import { x } from '$lib/schemas/invites'` — no barrel exports
- [ ] Custom components in `features/` directory, NOT in `ui/`
- [ ] SuperForms `fail()` / `message()` only — no custom response envelopes
- [ ] Emotionally calibrated error messages
- [ ] Empty state with CTA on invite codes page
- [ ] `$state()` / `$derived()` / `$props()` runes — NO Svelte 4 stores
- [ ] `snake_case` throughout (database fields flow directly to TypeScript)
- [ ] `auth.getUser()` on server for all authenticated operations
- [ ] `database.types.ts` regenerated after migration
- [ ] All existing tests pass (zero regressions)
- [ ] Build, lint, check all pass
- [ ] `Skeleton` placeholder for loading states, never full-page spinner
- [ ] No `select('*')` in production queries — select specific columns

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.1 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/prd.md — FR8 (generate up to 5 invite codes), FR9 (share via link or individual codes)]
- [Source: _bmad-output/planning-artifacts/prd.md — Marcus persona: invite code UX, shareable link format `marcus-7x9k`]
- [Source: _bmad-output/planning-artifacts/architecture.md — Database naming conventions, RLS policy naming `{table}_{action}_{role}`]
- [Source: _bmad-output/planning-artifacts/architecture.md — Three-tier API security: RLS / session / service role]
- [Source: _bmad-output/planning-artifacts/architecture.md — Component organization: features/{domain}/ for custom components]
- [Source: _bmad-output/planning-artifacts/architecture.md — SuperForms `fail()` / `message()` pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md — Empty state with CTA requirement]
- [Source: _bmad-output/project-context.md — snake_case pass-through, timestamptz, testing rules, anti-patterns]
- [Source: _bmad-output/implementation-artifacts/2-5-database-schema-rls-and-role-based-access.md — get_user_role() SECURITY DEFINER, RLS test patterns, migration patterns]
- [Source: _bmad-output/implementation-artifacts/2-5-database-schema-rls-and-role-based-access.md — Sensei→connected-learner policy deferred to Epic 3]
- [Source: src/routes/(app)/profile/+page.server.ts — SuperForms load/action pattern]
- [Source: src/routes/(app)/profile/+page.svelte — Svelte 5 component pattern with runes]
- [Source: src/lib/components/layout/Sidebar.svelte — Navigation link pattern with lucide icons]
- [Source: src/hooks.server.ts — Route protection, onboarding redirect, role checks]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed race condition in `tests/fixtures/roles.ts` — `createAuthenticatedClients()` now retries on transient "Database error" when multiple test files run concurrently against same Supabase auth service
- Supabase FK join `profiles!claimed_by` returns array type in generated types — used `invite.claimer?.[0]?.display_name` to handle correctly

### Completion Notes List

- Task 1: Migration `20260212141846_create_invite_codes.sql` — invite_status enum, invite_codes table, indexes, trigger, RLS policies (4 SELECT + 1 INSERT), generate_invite_code() helper with REVOKE/GRANT
- Task 2: Zod schema `src/lib/schemas/invites.ts` — empty schema for action-only form
- Task 3: Server logic `+page.server.ts` — load function with sensei role check + FK join for claimer names, generate_code action with count check, retry on collision
- Task 4: Page UI `+page.svelte` — Card-based invite code list with dual copy buttons (code + link), status badges, empty state, limit message
- Task 5: Sidebar integration — created `(app)/+layout.server.ts` for role loading, updated AppShell and Sidebar to conditionally show "Invite Codes" link for senseis with Ticket icon
- Task 6: RLS tests — 7 tests covering sensei read/insert own codes, cross-sensei visibility (broad SELECT policy), learner lookup by code, learner insert blocked, admin read all
- Task 7: Types regenerated, build passes, 203 tests pass (171 unit + 32 integration), lint clean (pre-existing warnings only), svelte-check 0 errors
- Infrastructure fix: `tests/fixtures/roles.ts` updated with retry logic for concurrent `createAuthenticatedClients()` calls to prevent race conditions in parallel RLS test files
- Code Review Fix H1: Extracted `generateSlug()` to `$lib/utils/slug.ts` with 11 co-located unit tests covering edge cases (empty string, Unicode, special chars, long names)
- Code Review Fix M1: Added 3 Sidebar tests — sensei sees "Invite Codes", null/learner don't
- Code Review Fix M2: Load error now throws `error(500, ...)` instead of silently returning empty array
- Code Review Fix M3: Changed `??` to `||` for `display_name` fallback to catch empty strings
- Code Review Fix M4: Renamed misleading RLS test to "authenticated users can read all invite codes (broad SELECT policy for claim flow)"
- Code Review Fix L1: Code generation uses full alphanumeric charset (`crypto.getRandomValues`) instead of hex-only (`crypto.randomUUID`)
- Code Review Fix L2: Renamed RLS policy `invite_codes_select_by_code` → `invite_codes_select_authenticated` in migration

### Change Log

- 2026-02-12: Story created by SM agent (Claude Opus 4.6) — ultimate context engine analysis completed
- 2026-02-12: Validation review by SM agent (Claude Opus 4.6) — 4 critical, 6 enhancements, 4 optimizations applied: C1 fixed env var name PUBLIC_APP_URL (was PUBLIC_BASE_URL), C2 added GRANT/REVOKE for generate_invite_code(), C3 added explicit invite_codes_select_admin policy and clarified test 6.9, C4 added individual code display format per FR9/PRD, E1 added updated_at column and trigger, E2 added CHECK constraint on code format, E3 documented 5-code lifetime cap limitation, E4 specified collision retry with error code 23505 and max 3 attempts, E5 added RLS silent filtering guidance in test task, E6 documented Story 3.2 SECURITY DEFINER approach for UPDATE, O1 emotionally calibrated limit message, O2 personalized copy-to-clipboard toasts, O3 documented UNIQUE constraint as index, O4 changed claimed_by FK to ON DELETE SET NULL
- 2026-02-12: Implementation completed by Dev agent (Claude Opus 4.6) — all 7 tasks complete, 203 tests passing (171 unit + 32 integration), 0 regressions, build/lint/check clean
- 2026-02-12: Code review by Dev agent (Claude Opus 4.6) — 7 issues found (1H, 4M, 2L), all fixed: H1 extracted generateSlug() to $lib/utils/slug.ts with 11 unit tests, M1 added 3 Sidebar tests for userRole prop, M2 replaced silent error with SvelteKit error(), M3 fixed empty string edge case (??→||), M4 renamed misleading RLS test, L1 changed code generation to full alphanumeric, L2 renamed misleading RLS policy. 217 tests passing, build/lint/check clean.

### File List

**New files:**
- `supabase/migrations/20260212141846_create_invite_codes.sql` — invite_codes table, enum, RLS, helper function
- `src/lib/schemas/invites.ts` — Zod schema for generate action
- `src/lib/utils/slug.ts` — generateSlug() utility for URL-friendly slugs (extracted from +page.server.ts during code review)
- `src/lib/utils/slug.test.ts` — 11 unit tests for generateSlug() edge cases
- `src/routes/(app)/+layout.server.ts` — loads user role for sidebar
- `src/routes/(app)/invite-codes/+page.server.ts` — load + generate_code action
- `src/routes/(app)/invite-codes/+page.svelte` — invite codes management UI
- `tests/integration/rls/invite-codes.rls.test.ts` — 7 RLS integration tests

**Modified files:**
- `src/routes/(app)/+layout.svelte` — passes userRole to AppShell
- `src/lib/components/layout/AppShell.svelte` — accepts and passes userRole prop to Sidebar
- `src/lib/components/layout/Sidebar.svelte` — conditional "Invite Codes" link for senseis with Ticket icon
- `src/lib/components/layout/Sidebar.test.ts` — added 3 tests for userRole-conditional "Invite Codes" link
- `src/lib/database.types.ts` — regenerated with invite_codes table and invite_status enum
- `tests/fixtures/roles.ts` — added retry logic for concurrent createAuthenticatedClients() calls
