# Story 3.2: Learner Claims Invite Code

Status: done

## Story

As a learner,
I want to claim a Sensei's invite code to establish a mentorship connection,
So that I can start scheduling sessions with my Sensei.

## Acceptance Criteria

1. **Given** a learner who has a Sensei's invite link
   **When** they visit the invite link URL
   **Then** they see the Sensei's public profile (name, photo, topics, bio)
   **And** a "Connect with [Sensei Name]" button is displayed

2. **Given** an authenticated learner clicking "Connect"
   **When** the invite code is valid and unused
   **Then** a `connections` row is created linking learner and Sensei
   **And** the invite code status updates to `claimed` with the learner's profile ID
   **And** the invite page re-renders showing the Sensei's profile with a success state: "You're now connected with [Sensei Name]!" (the invite page IS the Sensei's public profile for this flow — no separate redirect needed)
   **And** the Sensei sees the claimed status on their invite codes page (Story 3.1) **(Partial — Phase 1):** Proactive in-app notification deferred; Phase 1 notification is the visible status change on the invite codes page. Architecture plans a unified notification service for Phase 2+ that does not yet exist — do NOT build notification infrastructure in this story.

3. **Given** an unauthenticated visitor clicking the invite link
   **When** they arrive at the invite page
   **Then** they are prompted to register/login first via a "Login to Connect" link
   **And** after login they are redirected back to the invite page to claim the code

4. **Given** a learner trying to claim an already-used code
   **When** they submit the code
   **Then** they see a warm message: "This invite code has already been claimed"

5. **Given** the database schema
   **When** migrations are applied
   **Then** a `connections` table exists with: `id` (UUID PK), `sensei_id` (FK to profiles, ON DELETE CASCADE), `learner_id` (FK to profiles, ON DELETE CASCADE), `status` (enum: active, archived), `connected_at` (timestamptz), `last_interaction_at` (timestamptz, nullable), `created_at` (timestamptz), `updated_at` (timestamptz)
   **And** a UNIQUE constraint on `(sensei_id, learner_id)` prevents duplicate connections
   **And** RLS policies ensure Senseis see their own connections and learners see their own connections
   **And** a `claim_invite_code()` SECURITY DEFINER function atomically claims the code and creates the connection
   **And** a `get_invite_details()` SECURITY DEFINER function returns invite code + sensei profile for public page display

## Tasks / Subtasks

- [x] Task 1: Create migration for `connections` table, RLS policies, and RPC functions (AC: #5, #2)
  - [x] 1.1 Run `npx supabase migration new create_connections_and_claim_flow` to generate timestamped file
  - [x] 1.2 Create `connection_status` enum: `('active', 'archived')`
  - [x] 1.3 Create `connections` table with all columns per AC #5 (including `updated_at` with auto-trigger, UNIQUE on `(sensei_id, learner_id)`, ON DELETE CASCADE on both FKs)
  - [x] 1.4 Add indexes: `idx_connections_sensei_id`, `idx_connections_learner_id`
  - [x] 1.5 Add `connections_updated_at` trigger reusing existing `update_updated_at()` function
  - [x] 1.6 Enable RLS on `connections`
  - [x] 1.7 Create `connections_select_own_sensei` — Senseis SELECT where `sensei_id = auth.uid()`
  - [x] 1.8 Create `connections_select_own_learner` — Learners SELECT where `learner_id = auth.uid()`
  - [x] 1.9 Create `connections_select_admin` — admin/platform_admin SELECT all
  - [x] 1.10 Create `get_invite_details(code_value text)` SECURITY DEFINER function — returns invite code status + sensei profile for public page (grants: anon + authenticated)
  - [x] 1.11 Create `claim_invite_code(code_value text)` SECURITY DEFINER function — atomically validates, claims code, creates connection (grants: authenticated only)
  - [x] 1.12 REVOKE/GRANT on both functions

- [x] Task 2: Create Zod schema for claim action (AC: #2)
  - [x] 2.1 Create `src/lib/schemas/connections.ts` with `claimInviteCodeSchema`

- [x] Task 3: Create public invite page server logic (AC: #1, #2, #3, #4)
  - [x] 3.1 Create `src/routes/(public)/invite/[invite_path]/+page.server.ts`
  - [x] 3.2 `load` function: extract code from path (last 8 chars), call `get_invite_details()` RPC, check auth status, check existing connection if authenticated
  - [x] 3.3 `claim` action: verify auth + onboarding + learner role, call `claim_invite_code()` RPC, return success/error message via SuperForms

- [x] Task 4: Create public invite page UI (AC: #1, #2, #3, #4)
  - [x] 4.1 Create `src/routes/(public)/invite/[invite_path]/+page.svelte`
  - [x] 4.2 Display sensei profile card: Avatar (large), display name, topics as badges, bio
  - [x] 4.3 State: unused + authenticated learner → "Connect with [Name]" form button
  - [x] 4.4 State: unused + unauthenticated → "Login to Connect" link to `/login?redirectTo=/invite/{path}`
  - [x] 4.5 State: claimed by current user OR already connected → success message with dashboard link
  - [x] 4.6 State: claimed by someone else → warm "already claimed" message
  - [x] 4.7 State: unused + authenticated sensei → "Only learners can claim invite codes" message
  - [x] 4.8 Page title: `<svelte:head><title>Connect with [Sensei Name] | TeachMeSensei</title></svelte:head>`
  - [x] 4.9 Empty/error state for invalid code → 404 with warm message

- [x] Task 5: Create RLS integration tests for connections table (AC: #5)
  - [x] 5.1 Create `tests/integration/rls/connections.rls.test.ts`
  - [x] 5.2 Setup: create test users via `createAuthenticatedClients()`, insert test connection via admin client
  - [x] 5.3 Test: sensei can read own connections (expect rows)
  - [x] 5.4 Test: learner can read own connections (expect rows)
  - [x] 5.5 Test: sensei cannot read another sensei's connections (expect empty array, NOT error — RLS silent filter)
  - [x] 5.6 Test: learner cannot read another learner's connections (expect empty array)
  - [x] 5.7 Test: admin can read all connections
  - [x] 5.8 Test: learner cannot INSERT connections directly (no INSERT policy — must use RPC)

- [x] Task 6: Create integration tests for claim flow RPC functions (AC: #2, #4, #5)
  - [x] 6.1 Test: `get_invite_details()` returns sensei info for valid code (anon client)
  - [x] 6.2 Test: `get_invite_details()` returns null for non-existent code
  - [x] 6.3 Test: `claim_invite_code()` successfully claims unused code — creates connection + updates invite code status
  - [x] 6.4 Test: `claim_invite_code()` rejects already-claimed code
  - [x] 6.5 Test: `claim_invite_code()` rejects when learner already connected to sensei (duplicate prevention)
  - [x] 6.6 Test: `claim_invite_code()` rejects for non-learner role (sensei trying to claim)
  - [x] 6.7 Test: `get_invite_details()` with authenticated user returns `is_connected` flag correctly

- [x] Task 7: Regenerate database types and verify (AC: all)
  - [x] 7.1 Run `npx supabase gen types typescript --local 2>/dev/null > src/lib/database.types.ts`
  - [x] 7.2 Verify `connections` table and `connection_status` enum appear in generated types
  - [x] 7.3 Run `npm run build` — must succeed
  - [x] 7.4 Run `npm run test` — all existing tests pass (zero regressions)
  - [x] 7.5 Run `npm run test:rls` — all RLS tests pass (existing + new connections + claim flow tests)
  - [x] 7.6 Run `npm run lint` and `npm run check` — pass

## Dev Notes

### Critical: Migration SQL — Exact Content

Create file via `npx supabase migration new create_connections_and_claim_flow`, then write this SQL:

```sql
-- Story 3.2: Learner claims invite code — connections table + claim flow

-- 1. Create connection_status enum
CREATE TYPE public.connection_status AS ENUM ('active', 'archived');

-- 2. Create connections table
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensei_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.connection_status NOT NULL DEFAULT 'active',
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_interaction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT connections_unique_pair UNIQUE (sensei_id, learner_id)
);

-- 3. Indexes
CREATE INDEX idx_connections_sensei_id ON public.connections(sensei_id);
CREATE INDEX idx_connections_learner_id ON public.connections(learner_id);

-- 4. Auto-update trigger (reuses existing function from profiles migration)
CREATE TRIGGER connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 5. Enable RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Senseis see their own connections (learners connected to them)
CREATE POLICY connections_select_own_sensei ON public.connections
  FOR SELECT USING (sensei_id = auth.uid());

-- Learners see their own connections (senseis they're connected to)
CREATE POLICY connections_select_own_learner ON public.connections
  FOR SELECT USING (learner_id = auth.uid());

-- Admin/platform_admin can read all connections
CREATE POLICY connections_select_admin ON public.connections
  FOR SELECT USING (
    public.get_user_role() IN ('admin', 'platform_admin')
  );

-- NO INSERT/UPDATE/DELETE policies for regular users.
-- All mutations go through SECURITY DEFINER functions (claim_invite_code).
-- This prevents users from creating arbitrary connections.

-- 7. get_invite_details() — Public invite page data loader
-- SECURITY DEFINER bypasses RLS so anon users can view invite details.
-- Returns sensei public profile + invite status + connection state for current user.
CREATE OR REPLACE FUNCTION public.get_invite_details(code_value text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_invite public.invite_codes%ROWTYPE;
  v_sensei RECORD;
  v_user_id uuid;
  v_is_connected boolean := false;
BEGIN
  -- Find invite code
  SELECT * INTO v_invite FROM public.invite_codes WHERE code = code_value;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Get sensei public profile
  SELECT id, display_name, avatar_url, bio, topics
  INTO v_sensei
  FROM public.profiles WHERE id = v_invite.sensei_id;

  -- Check if current user has existing connection with this sensei
  v_user_id := auth.uid();
  IF v_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.connections
      WHERE sensei_id = v_invite.sensei_id AND learner_id = v_user_id
    ) INTO v_is_connected;
  END IF;

  RETURN jsonb_build_object(
    'code', v_invite.code,
    'status', v_invite.status,
    'sensei_id', v_invite.sensei_id,
    'sensei_display_name', v_sensei.display_name,
    'sensei_avatar_url', v_sensei.avatar_url,
    'sensei_bio', v_sensei.bio,
    'sensei_topics', v_sensei.topics,
    'is_connected', v_is_connected
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_invite_details(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invite_details(text) TO anon, authenticated;

-- 8. claim_invite_code() — Atomic claim + connection creation
-- SECURITY DEFINER bypasses RLS to UPDATE invite_codes and INSERT connections.
-- Validates: auth, role, code exists, code unused, no duplicate connection.
-- Returns jsonb with success or error details.
CREATE OR REPLACE FUNCTION public.claim_invite_code(code_value text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid;
  v_user_role public.user_role;
  v_invite public.invite_codes%ROWTYPE;
  v_existing_connection uuid;
  v_sensei_name text;
BEGIN
  -- 1. Verify authenticated
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'not_authenticated');
  END IF;

  -- 2. Verify learner role
  SELECT role INTO v_user_role FROM public.profiles WHERE id = v_user_id;
  IF v_user_role IS NULL OR v_user_role != 'learner' THEN
    RETURN jsonb_build_object('error', 'not_learner');
  END IF;

  -- 3. Find and lock invite code (FOR UPDATE prevents race conditions)
  SELECT * INTO v_invite FROM public.invite_codes WHERE code = code_value FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  -- 4. Check code not already claimed
  IF v_invite.status = 'claimed' THEN
    RETURN jsonb_build_object('error', 'already_claimed');
  END IF;

  -- 5. Prevent self-connection (learner claiming their own code — shouldn't happen but defensive)
  IF v_invite.sensei_id = v_user_id THEN
    RETURN jsonb_build_object('error', 'self_connection');
  END IF;

  -- 6. Check no existing connection
  SELECT id INTO v_existing_connection
  FROM public.connections
  WHERE sensei_id = v_invite.sensei_id AND learner_id = v_user_id;
  IF FOUND THEN
    RETURN jsonb_build_object('error', 'already_connected');
  END IF;

  -- 7. Claim the invite code
  UPDATE public.invite_codes
  SET status = 'claimed', claimed_by = v_user_id, claimed_at = NOW()
  WHERE id = v_invite.id;

  -- 8. Create the connection
  INSERT INTO public.connections (sensei_id, learner_id, status, connected_at)
  VALUES (v_invite.sensei_id, v_user_id, 'active', NOW());

  -- 9. Get sensei name for success response
  SELECT display_name INTO v_sensei_name FROM public.profiles WHERE id = v_invite.sensei_id;

  RETURN jsonb_build_object(
    'success', true,
    'sensei_id', v_invite.sensei_id,
    'sensei_name', v_sensei_name
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_invite_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_invite_code(text) TO authenticated;
```

### Critical: Why SECURITY DEFINER Functions (Not Direct RLS)

Story 3.1 explicitly designed the invite_codes table WITHOUT an UPDATE policy, noting: "A direct UPDATE policy won't work because the learner claiming a code isn't the `sensei_id` owner. Story 3.2 should use a SECURITY DEFINER function."

The `claim_invite_code()` function:
- **Bypasses RLS** to UPDATE `invite_codes` (learner is not the sensei_id owner)
- **Bypasses RLS** to INSERT into `connections` (no INSERT policy for users)
- **Atomically** validates + claims + creates connection in a single transaction
- **Uses FOR UPDATE** row lock to prevent race conditions (two learners claiming same code simultaneously)
- **Returns jsonb** with structured error codes that the server action maps to warm messages

The `get_invite_details()` function:
- **Bypasses RLS** so unauthenticated (anon) visitors can view invite code status + sensei profile
- **Only returns public-safe fields** (display_name, avatar_url, bio, topics)
- **Returns `sensei_id` (UUID)** — needed by the load function to check connection status for authenticated users. A UUID alone is not exploitable without RLS-protected endpoints and is not PII. This is an intentional design decision.
- **Checks connection status** if caller is authenticated (avoids separate query)

**Do NOT add UPDATE policies on invite_codes or INSERT policies on connections.** All mutations must go through `claim_invite_code()`.

### Critical: `get_user_role()` and `update_updated_at()` Already Exist

- `get_user_role()` — Created in Story 2.5 migration `20260212113055_add_org_team_and_rls_policies.sql`. Used in admin SELECT policy. Do NOT recreate.
- `update_updated_at()` — Created in migration `20260210034001`. Used for `connections_updated_at` trigger. Do NOT recreate.

### Critical: `auth.uid()` Works Inside SECURITY DEFINER

In Supabase, `auth.uid()` reads from `current_setting('request.jwt.claims', true)` which is a session-level setting. It remains available inside SECURITY DEFINER functions. Both `get_invite_details()` and `claim_invite_code()` use `auth.uid()` to identify the caller.

For anon users (unauthenticated), `auth.uid()` returns NULL. `get_invite_details()` handles this by setting `is_connected = false` when user is null.

### Critical: URL Code Extraction

Invite URLs follow the format: `/invite/{slug}-{code}` (e.g., `/invite/marcus-chen-a7f9b2c1`)

Route: `src/routes/(public)/invite/[invite_path]/+page.server.ts`

Extract the code (always exactly 8 lowercase alphanumeric chars):

```typescript
const code = params.invite_path.slice(-8);
```

This works because:
- Codes are always exactly 8 chars matching `^[a-z0-9]+$` (enforced by DB CHECK constraint)
- The slug never contains 8+ consecutive alphanumeric chars without a dash
- Even if the URL is just `/invite/a7f9b2c1` (no slug), `slice(-8)` still returns the code

### Critical: Public Route — No Auth Required for Page Load

The route is under `(public)` route group. From `hooks.server.ts` (line 49-51):

```typescript
if (routeId.startsWith('/(public)') || routeId.startsWith('/api')) {
    return resolve(event, resolveOptions);
}
```

Public routes skip all auth checks. The Supabase client is still created (via `event.locals.supabase`), so:
- **Unauthenticated visitors**: client uses anon key, `auth.getUser()` returns `{ user: null }`
- **Authenticated visitors**: client has session cookie, `auth.getUser()` returns the user

The `get_invite_details()` RPC is granted to BOTH anon and authenticated, so it works for all visitors.

### Critical: Redirect Flow for Unauthenticated Users

The login system already supports `redirectTo`:

1. Invite page shows "Login to Connect" link: `/login?redirectTo=%2Finvite%2Fmarcus-chen-a7f9b2c1`
2. Login page reads `redirectTo` from URL params and stores it
3. After magic link/OAuth, callback handler at `/login/callback` reads `next` param
4. Callback redirects to `next` (the invite page URL)
5. User lands back on invite page, now authenticated, sees "Connect" button

**Known limitation for NEW users:** The callback handler checks `onboarding_complete` and redirects to `/onboarding` if false (line ~30 of callback/+server.ts). This means a brand-new user who signs up via the invite flow will be redirected to onboarding and lose the `redirectTo` path. After onboarding, they'll need to re-visit the invite link. This is acceptable for Phase 1. A future enhancement could persist the redirect URL through onboarding.

### Critical: Load Function Pattern

```typescript
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { claimInviteCodeSchema } from '$lib/schemas/connections';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase }, url }) => {
  const code = params.invite_path.slice(-8);

  // get_invite_details() is SECURITY DEFINER — works for anon + authenticated
  const { data: inviteDetails, error: rpcError } = await supabase
    .rpc('get_invite_details', { code_value: code });

  if (rpcError || !inviteDetails) {
    error(404, "We couldn't find that invite code. It may have been removed or doesn't exist.");
  }

  // Check if user is authenticated (optional on public page)
  const { data: { user } } = await supabase.auth.getUser();

  let userRole: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = profile?.role ?? null;
  }

  const form = await superValidate({ code }, zod(claimInviteCodeSchema));

  return {
    inviteDetails,
    isAuthenticated: !!user,
    userRole,
    form,
    invitePath: url.pathname
  };
};
```

**Note:** The `userRole` query uses the authenticated client, so RLS applies — the user can only read their own profile. This is a single-column, single-row, PK-indexed query. Lightweight.

### Critical: Claim Form Action Pattern

```typescript
import { fail, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { claimInviteCodeSchema } from '$lib/schemas/connections';
import type { Actions } from './$types';

export const actions: Actions = {
  claim: async ({ request, locals: { supabase } }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(303, '/login');

    const formData = await request.formData();
    const form = await superValidate(formData, zod(claimInviteCodeSchema));
    if (!form.valid) return fail(400, { form });

    // Call atomic claim function
    const { data: result, error: rpcError } = await supabase
      .rpc('claim_invite_code', { code_value: form.data.code });

    if (rpcError) {
      return message(form,
        "Something went wrong connecting you. Please try again in a moment.",
        { status: 500 }
      );
    }

    if (result?.error) {
      const errorMessages: Record<string, string> = {
        'already_claimed': "This invite code has already been claimed",
        'already_connected': "You're already connected with this Sensei!",
        'not_found': "We couldn't find that invite code",
        'not_learner': "Only learners can claim invite codes",
        'not_authenticated': "Please log in first to claim this invite code",
        'self_connection': "You can't claim your own invite code"
      };
      return message(form, errorMessages[result.error] ?? "Something went wrong. Please try again.", { status: 400 });
    }

    return message(form,
      `You're now connected with ${result.sensei_name}! Visit your dashboard to see your connections.`
    );
  }
};
```

**After successful claim:** The form action returns a success message via SuperForms. The page re-renders — the `onUpdated` callback shows a success toast. The load function re-runs and `get_invite_details()` now returns `is_connected: true` and `status: 'claimed'`, so the page shows the "Connected!" success state instead of the claim button.

### Critical: Zod Schema for Claim Action

```typescript
// src/lib/schemas/connections.ts
import { z } from 'zod';

// Validates the invite code extracted from the URL path.
// Code is always 8 lowercase alphanumeric chars (enforced by DB CHECK constraint).
export const claimInviteCodeSchema = z.object({
  code: z.string().length(8).regex(/^[a-z0-9]+$/, 'Invalid invite code format')
});
```

The form passes `code` as a hidden input. No user-editable fields.

### Critical: Page UI States

The invite page has 6 distinct states:

| State | Condition | Display |
|---|---|---|
| **Claim Ready** | `status === 'unused'` AND authenticated AND `userRole === 'learner'` | Sensei profile card + "Connect with [Name]" button |
| **Login Required** | `status === 'unused'` AND NOT authenticated | Sensei profile card + "Login to Connect" link |
| **Wrong Role** | `status === 'unused'` AND authenticated AND `userRole !== 'learner'` | Sensei profile card + "Only learners can claim invite codes" |
| **Connected** | `is_connected === true` | Sensei profile card + "You're connected with [Name]!" + dashboard link |
| **Already Claimed** | `status === 'claimed'` AND NOT `is_connected` | "This invite code has already been claimed" message |
| **Not Found** | `inviteDetails` is null | 404 error page via `error(404, ...)` in load |

**All states display the sensei profile card** (avatar, name, topics, bio) except "Not Found" which uses SvelteKit's error page.

### Critical: Page UI Implementation

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { toast } from 'svelte-sonner';
  import * as Avatar from '$lib/components/ui/avatar';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';

  let { data } = $props();

  const { enhance, submitting, message: formMessage } = superForm(data.form, {
    onUpdated({ form }) {
      if (form.message) {
        if (form.valid) {
          toast.success(form.message);
        } else {
          toast.error(form.message);
        }
      }
    }
  });

  const sensei = $derived(data.inviteDetails);
  const canClaim = $derived(
    sensei.status === 'unused' &&
    data.isAuthenticated &&
    data.userRole === 'learner' &&
    !sensei.is_connected
  );
  const showLogin = $derived(sensei.status === 'unused' && !data.isAuthenticated);
  const isConnected = $derived(sensei.is_connected);
  const alreadyClaimed = $derived(sensei.status === 'claimed' && !sensei.is_connected);
  const wrongRole = $derived(
    sensei.status === 'unused' &&
    data.isAuthenticated &&
    data.userRole !== 'learner'
  );
</script>

<svelte:head>
  <title>Connect with {sensei.sensei_display_name ?? 'a Sensei'} | TeachMeSensei</title>
</svelte:head>

<!-- Centered card layout with sensei profile -->
<!-- Use Card, Avatar, Badge, Button from shadcn-svelte -->
<!-- Hidden form input for code value: <input type="hidden" name="code" value={sensei.code} /> -->
<!-- "Login to Connect" uses: <a href="/login?redirectTo={data.invitePath}"> -->
```

**Critical UI notes:**
- Use `$derived()` for computed state (Svelte 5 runes pattern)
- Toast via `svelte-sonner` `toast.success()` / `toast.error()`
- Avatar component for sensei photo with fallback initial
- Badge components for topic tags
- `$submitting` for loading state on connect button: "Connecting..." while form is submitting
- Responsive layout: centered card, max-width for readability

### Critical: Copy-to-Clipboard NOT Needed on This Page

This is the PUBLIC claim page, not the sensei's invite management page. There are no copy-to-clipboard features here. Do not add them.

### Critical: Notification AC — Deferred Scope

The AC states "Sensei receives a notification (in-app) that a learner claimed their code." For Phase 1, this is satisfied by:

1. The invite codes page (Story 3.1) shows `claimed` status with claimer's display name
2. When sensei visits their invite codes page, they see which codes were claimed and by whom

A proactive notification system (bell icon, unread badge, toast on login) is architecturally planned (see architecture.md: "Unified notification service handling 6+ notification types") but does NOT exist yet. **Do NOT build notification infrastructure in this story.** The visible status change on the invite codes page is the Phase 1 notification mechanism.

### Critical: No org_id/team_id on Connections Table

The architecture mentions nullable `org_id` and `team_id` columns on relevant tables for Phase 1.5 compatibility. However, the epics AC for Story 3.2 does NOT include these columns, and the `connections` table is a relationship table (linking two users), not a resource table. Org/team context is derived from the users' profiles, not the connection itself. **Do NOT add `org_id`/`team_id` to `connections`.** If needed in Phase 1.5, they can be added via a new migration.

### Critical: RLS Silent Filtering Pattern

From Story 3.1 and Story 2.5: **RLS SELECT denials return empty arrays, NOT errors.** All "CANNOT read" tests must assert `expect(data).toHaveLength(0)` and `expect(error).toBeNull()`.

For example, a sensei querying connections where they are NOT the `sensei_id` will get an empty array — not an error.

### Critical: RLS Test Setup for Connections

The test setup must:
1. Create test users via `createAuthenticatedClients()` (from `tests/fixtures/roles.ts`)
2. Create an invite code for the sensei via admin client (bypass RLS)
3. Create a connection between sensei and learner via admin client (bypass RLS)
4. Then test SELECT policies with individual user clients

```typescript
// In beforeAll:
const admin = createAdminClient();

// Create invite code for sensei
await admin.from('invite_codes').insert({
  sensei_id: users.sensei.id,
  code: 'testcl01',
  shareable_url: 'http://localhost:5173/invite/test-sensei-testcl01',
  status: 'unused'
});

// Create connection via admin (bypasses RLS)
await admin.from('connections').insert({
  sensei_id: users.sensei.id,
  learner_id: users.learner.id,
  status: 'active',
  connected_at: new Date().toISOString()
});
```

### Critical: RPC Function Tests — Separate from RLS Tests

RPC function tests (`get_invite_details`, `claim_invite_code`) should be in the same test file or a separate file within `tests/integration/rls/`. They test the SECURITY DEFINER functions' business logic, not RLS policies directly. But they run against the real Supabase local stack like all integration tests.

For `claim_invite_code()` success test:
1. Create invite code via admin (status: unused)
2. Call `claim_invite_code('testcode')` via learner client
3. Assert result has `success: true`
4. Query invite_codes via admin → assert status changed to 'claimed', claimed_by = learner.id
5. Query connections via admin → assert new row with sensei_id + learner_id

For `get_invite_details()` anon test:
- Use the anon client (from `tests/fixtures/supabase.ts`) to call the RPC
- Assert it returns sensei profile data without errors

### Critical: Database Types After Migration

After running the migration, regenerate types:
```bash
npx supabase gen types typescript --local 2>/dev/null > src/lib/database.types.ts
```

Verify these appear in generated types:
- `connections` table with all columns
- `connection_status` enum: `'active' | 'archived'`
- `get_invite_details` and `claim_invite_code` in Functions section

### What NOT to Build in This Story

- **No sensei/learner list views** — Stories 3.3 and 3.4 handle those
- **No notification system** — Proactive notifications deferred (see Notification AC note above)
- **No public sensei profile page** — The invite page IS the sensei's public-facing view for this flow
- **No code recycling or revocation** — Not in any AC for Epic 3
- **No E2E tests** — RLS integration tests + RPC function tests + manual verification sufficient for Phase 1
- **No org_id/team_id on connections** — Derived from users' profiles, not needed on relationship table
- **No DELETE policy on connections** — No AC requires archiving/deleting connections yet
- **No UPDATE policy on connections** — `last_interaction_at` will be updated by future stories (Epic 4) via SECURITY DEFINER or when sessions table exists
- **No custom error page component** — Use SvelteKit's built-in `error()` function for 404
- **No slug validation** — The slug prefix in the URL is cosmetic; only the last 8 chars (code) matter for lookup

### Previous Story Intelligence

**From Story 3.1 (Invite Code Generation & Management — DONE):**
- `invite_codes` table exists with: id, sensei_id, code (unique, 8-char alphanumeric), shareable_url, status (unused/claimed), claimed_by, claimed_at, created_at, updated_at
- RLS policies: `invite_codes_select_own_sensei`, `invite_codes_select_authenticated` (any auth user can SELECT), `invite_codes_insert_own_sensei`, `invite_codes_select_admin`
- **No UPDATE policy on invite_codes** — explicitly designed for Story 3.2 to use SECURITY DEFINER function
- `generate_invite_code()` helper function exists (not needed for this story)
- `generateSlug()` utility at `$lib/utils/slug.ts` (not needed for this story — slug is already in shareable_url)
- Invite codes page at `(app)/invite-codes/` shows claimed status with claimer name via FK join `profiles!claimed_by`
- `(app)/+layout.server.ts` loads user role for sidebar (already created)
- Code generation uses `crypto.getRandomValues()` for full alphanumeric charset
- FK join `profiles!claimed_by` returns array type — use `invite.claimer?.[0]?.display_name`
- `tests/fixtures/roles.ts` has retry logic for concurrent `createAuthenticatedClients()` calls
- 217 tests currently pass (after code review fixes)

**From Story 2.5 (Database Schema, RLS & Role-Based Access — DONE):**
- `get_user_role()` SECURITY DEFINER function exists — reused in admin SELECT policy
- `update_updated_at()` function exists — reuse for connections trigger
- RLS test pattern: `createAuthenticatedClients()` returns `Record<TestRole, AuthenticatedTestUser>`
- Admin client via `createAdminClient()` from `tests/fixtures/supabase.ts` for test setup
- `supabase db reset --local` resets DB before integration tests — no cleanup needed

**From Story 2.2 (Registration & Login — DONE):**
- Login page at `(public)/login/` accepts `redirectTo` query param
- Callback handler at `(public)/login/callback/` reads `next` param for post-login redirect
- OAuth redirect pattern: `redirect(303, data.url)`

**From Story 2.3 (Onboarding — DONE):**
- Onboarding check in callback: redirects to `/onboarding` if `onboarding_complete === false`
- This means new users who sign up via invite link will complete onboarding before they can claim

**From Story 2.4 (Profile Management — DONE):**
- SuperForms pattern: `superValidate()` in load, `fail(400, { form })` / `message(form, ...)` in actions
- `zod4 as zod` adapter import: `import { zod4 as zod } from 'sveltekit-superforms/adapters'`
- Svelte 5 component pattern: `let { data } = $props()`, `$state()`, `$derived()`, `$effect()`
- `svelte-sonner` toast: `toast.success()` / `toast.error()` for user feedback

### Git Intelligence

Recent commits follow pattern: `feat: story X.Y — description with code review fixes`

```
34e8924 feat: story 3.1 — invite code generation & management with code review fixes
3f032e6 feat: story 2.5 — database schema, RLS & role-based access with code review fixes
```

Convention: single commit per story on `master` branch. Story 3.1 commit changed 16 files.

### Project Structure Notes

**New files to create:**
```
supabase/
└── migrations/
    └── <timestamp>_create_connections_and_claim_flow.sql   # connections table + RPC functions
src/
├── lib/
│   └── schemas/
│       └── connections.ts                                  # Zod schema for claim action
├── routes/
│   └── (public)/
│       └── invite/
│           └── [invite_path]/
│               ├── +page.server.ts                         # Load invite details + claim action
│               └── +page.svelte                            # Public invite claim page
tests/
└── integration/
    └── rls/
        └── connections.rls.test.ts                         # RLS + RPC function tests
```

**Modified files:**
- `src/lib/database.types.ts` — regenerated with `connections` table, `connection_status` enum, RPC function types

**Files to reference (NOT modify):**
- `supabase/migrations/20260212141846_create_invite_codes.sql` — invite_codes table (Story 3.1)
- `supabase/migrations/20260212113055_add_org_team_and_rls_policies.sql` — `get_user_role()` function
- `src/hooks.server.ts` — route protection, public route bypass
- `src/routes/(public)/login/+page.server.ts` — login with redirectTo
- `src/routes/(public)/login/callback/+server.ts` — callback with next param
- `src/routes/(app)/invite-codes/+page.server.ts` — invite code generation (Story 3.1 reference)
- `src/routes/(app)/invite-codes/+page.svelte` — invite code UI (Story 3.1 reference)
- `src/routes/(app)/profile/+page.server.ts` — SuperForms load/action pattern reference
- `src/routes/(app)/profile/+page.svelte` — Svelte 5 component pattern reference
- `src/lib/components/layout/PublicShell.svelte` — public page layout wrapper
- `tests/fixtures/roles.ts` — test fixture for RLS tests
- `tests/fixtures/supabase.ts` — admin/anon client factory
- `tests/integration/rls/invite-codes.rls.test.ts` — RLS test pattern reference

### Architecture Compliance Checklist

- [ ] Migration uses `timestamptz` for all time columns (`connected_at`, `last_interaction_at`, `created_at`, `updated_at`)
- [ ] `updated_at` column with `update_updated_at()` trigger (consistent with profiles/invite_codes pattern)
- [ ] UNIQUE constraint on `(sensei_id, learner_id)` prevents duplicate connections
- [ ] `ON DELETE CASCADE` on both FKs (cleanup on user deletion)
- [ ] SECURITY DEFINER functions use `SET search_path = ''` with fully-qualified `public.` table/type references (consistent with `get_user_role()` and `handle_new_user()` patterns — prevents search_path hijacking)
- [ ] REVOKE/GRANT on all functions (restrict to appropriate roles)
- [ ] `FOR UPDATE` row lock in `claim_invite_code()` (prevent race conditions)
- [ ] Table name is `snake_case`, plural: `connections`
- [ ] Column names are `snake_case`: `sensei_id`, `learner_id`, `connected_at`, `last_interaction_at`
- [ ] Index naming: `idx_connections_sensei_id`, `idx_connections_learner_id`
- [ ] RLS policy naming: `{table}_{action}_{role}` convention
- [ ] Enum type name: `connection_status` (snake_case)
- [ ] RLS tests in `tests/integration/rls/` directory
- [ ] RLS tests use `createAuthenticatedClients()` from `tests/fixtures/roles.ts`
- [ ] RLS SELECT denials tested as empty arrays, NOT errors
- [ ] Zod schema validates ONLY the code field (not full DB mirror)
- [ ] Schema imported directly: `import { x } from '$lib/schemas/connections'` — no barrel exports
- [ ] SuperForms `fail()` / `message()` only — no custom response envelopes
- [ ] Emotionally calibrated error messages (warm, supportive tone)
- [ ] `$derived()` / `$props()` runes — NO Svelte 4 stores
- [ ] `snake_case` throughout (database fields flow directly to TypeScript)
- [ ] `auth.getUser()` on server for all authenticated operations
- [ ] `database.types.ts` regenerated after migration
- [ ] All existing tests pass (zero regressions)
- [ ] Build, lint, check all pass
- [ ] Public route under `(public)` group — no auth required for page load
- [ ] Login redirect uses existing `redirectTo` pattern
- [ ] No custom components in `ui/` directory (shadcn-svelte primitives only)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.2 acceptance criteria (lines 649-681)]
- [Source: _bmad-output/implementation-artifacts/3-1-invite-code-generation-and-management.md — Story 3.1 complete dev notes, migration patterns, SECURITY DEFINER recommendation for Story 3.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — Route groups: (public) no auth, (app) auth required]
- [Source: _bmad-output/planning-artifacts/architecture.md — RLS policy naming: {table}_{action}_{role}]
- [Source: _bmad-output/planning-artifacts/architecture.md — Three-tier API security: RLS / session / service role]
- [Source: _bmad-output/planning-artifacts/architecture.md — SuperForms fail()/message() pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md — Emotionally calibrated error messages]
- [Source: _bmad-output/planning-artifacts/architecture.md — Database naming: snake_case plural tables, timestamptz]
- [Source: _bmad-output/planning-artifacts/architecture.md — Testing: RLS tests with canonical fixtures, co-located unit tests]
- [Source: _bmad-output/project-context.md — snake_case pass-through, timestamptz, empty states, anti-patterns]
- [Source: src/hooks.server.ts — Public route bypass (lines 49-51), auth middleware pattern]
- [Source: src/routes/(public)/login/+page.server.ts — redirectTo query param handling]
- [Source: src/routes/(public)/login/callback/+server.ts — next param redirect, onboarding check]
- [Source: tests/fixtures/roles.ts — createAuthenticatedClients() test user factory]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- All 7 tasks (48 subtasks) implemented and verified
- Migration `20260216101113_create_connections_and_claim_flow.sql` creates connections table, RLS policies, and two SECURITY DEFINER RPC functions
- `get_invite_details()` supports anon + authenticated callers; returns sensei profile + connection status
- `claim_invite_code()` atomically validates, claims code, and creates connection with FOR UPDATE row locking
- Public invite page at `(public)/invite/[invite_path]/` handles 6 distinct UI states (claim ready, login required, connected, already claimed, wrong role, not found)
- 14 new integration tests (6 RLS policy tests + 8 RPC function tests) — all pass
- 231 total tests pass (zero regressions), build/lint/check all pass

### Change Log

- 2026-02-16: Story created by SM agent (Claude Opus 4.6) — ultimate context engine analysis completed
- 2026-02-16: Validation review by SM agent (Claude Opus 4.6) — 3 critical, 2 enhancements, 1 optimization applied: C1 changed `SET search_path` from `public` to `''` with fully-qualified `public.` table references (consistent with existing SECURITY DEFINER patterns), C2 clarified AC#2 redirect — invite page IS the Sensei's public profile for this flow (no separate redirect needed), C3 marked AC#2 notification as Partial Phase 1 with explicit deferral rationale in AC section, E1 documented invite page serving as sensei public profile in AC text, E2 documented `sensei_id` UUID exposure as intentional design decision in dev notes, O1 kept explicit duplicate-connection check (better error messaging than raw constraint violation)
- 2026-02-16: Implementation completed by Dev agent (Claude Opus 4.6) — all 7 tasks implemented, 13 new tests added, 230 total tests pass
- 2026-02-16: Code review by Dev agent (Claude Opus 4.6) — 8 issues found (5 medium, 3 low), all fixed: M1 UI state overlap (if→else-if chain), M2 forward-compat invite status check (!=unused), M3 error conflation (separate 404 vs 500), M4 INSERT RLS test false-positive risk (fresh pair), M5 missing is_connected=false test, L1 h1 display_name fallback, L2 misleading test name, L3 defensive redirect redirectTo. 231 total tests pass.

### File List

**New files:**
- `supabase/migrations/20260216101113_create_connections_and_claim_flow.sql` — connections table, RLS policies, RPC functions
- `src/lib/schemas/connections.ts` — Zod schema for claim action
- `src/routes/(public)/invite/[invite_path]/+page.server.ts` — load function + claim form action
- `src/routes/(public)/invite/[invite_path]/+page.svelte` — public invite claim page UI
- `tests/integration/rls/connections.rls.test.ts` — RLS + RPC integration tests (14 tests)

**Modified files:**
- `src/lib/database.types.ts` — regenerated with connections table, connection_status enum, RPC function types
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — story status updated
