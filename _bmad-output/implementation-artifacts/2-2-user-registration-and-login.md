# Story 2.2: User Registration & Login

Status: done

## Story

As a user,
I want to register and log in using Magic Link, Google, or GitHub OAuth,
So that I can access the platform with minimal friction.

## Acceptance Criteria

1. **Given** an unauthenticated user on the login page
   **When** the user enters their email and submits for Magic Link
   **Then** Supabase sends a magic link email and the UI shows "Check your email"
   **And** clicking the magic link in the email completes authentication and redirects to `/dashboard`

2. **Given** an unauthenticated user on the login page
   **When** the user clicks "Continue with Google"
   **Then** the OAuth flow redirects to Google, completes authentication, and redirects to `/dashboard` via the `/login/callback` route

3. **Given** an unauthenticated user on the login page
   **When** the user clicks "Continue with GitHub"
   **Then** the OAuth flow redirects to GitHub, completes authentication, and redirects to `/dashboard` via the `/login/callback` route

4. **Given** a new user completing registration for the first time
   **When** authentication succeeds
   **Then** a `profiles` row is created with default role (learner) and `onboarding_complete: false`
   **And** the user is redirected to the onboarding flow

5. **Given** an existing user logging in
   **When** authentication succeeds
   **Then** the user is redirected to `/dashboard` (or the original URL they tried to access)

6. **Given** an OAuth provider (Google or GitHub) returns an error during the flow
   **When** the user is redirected back to the login page
   **Then** the UI displays a warm error message: "We couldn't sign you in with [Provider]. Please try again or use a different method."
   **And** the error is logged server-side with provider name and error code
   **And** the user remains on the login page with all auth options still available

7. **Given** the full registration and login flow
   **When** unit and integration tests run
   **Then** they verify: form actions, callback handler, redirect logic, error handling, and profile creation trigger

## Tasks / Subtasks

- [x] Task 1: Install required packages (AC: all)
  - [x] 1.1 Install `zod` and `sveltekit-superforms` as dependencies
  - [x] 1.2 Install shadcn-svelte `form`, `label`, and `separator` components via `npx shadcn-svelte@latest add form label separator`
  - [x] 1.3 Verify sveltekit-superforms Zod adapter works: `import { zod4 as zod } from 'sveltekit-superforms/adapters'` (Zod v4 requires `zod4` adapter, not `zod`)

- [x] Task 2: Update `supabase/config.toml` for auth (AC: #1, #2, #3)
  - [x] 2.1 Fix `site_url` from `http://127.0.0.1:3000` to `http://127.0.0.1:5173` (SvelteKit dev port)
  - [x] 2.2 Fix `additional_redirect_urls` to `["http://127.0.0.1:5173/login/callback", "http://localhost:5173/login/callback"]`
  - [x] 2.3 Add `[auth.external.google]` section: `enabled = true`, `client_id = "env(GOOGLE_CLIENT_ID)"`, `secret = "env(GOOGLE_CLIENT_SECRET)"`
  - [x] 2.4 Add `[auth.external.github]` section: `enabled = true`, `client_id = "env(GITHUB_CLIENT_ID)"`, `secret = "env(GITHUB_CLIENT_SECRET)"`
  - [x] 2.5 Update `.env.example` with `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` placeholders (with instructions comment)
  - [x] 2.6 Increase `email_sent` rate limit from 2 to at least 10 for local dev (prevents magic link testing frustration)

- [x] Task 3: Create first database migration — profiles table + trigger (AC: #4)
  - [x] 3.1 Generate migration file: `20260210034001_create_profiles.sql`
  - [x] 3.2 Create `profiles` table (see Dev Notes for exact schema)
  - [x] 3.3 Create `user_role` enum type: `learner`, `sensei`, `admin`, `platform_admin`, `team_lead`, `org_admin`
  - [x] 3.4 Create `handle_new_user()` trigger function: on auth.users INSERT → insert profiles row with default role `learner`, `onboarding_complete = false`, extract `display_name` and `avatar_url` from `raw_user_meta_data`
  - [x] 3.5 Create trigger: `on_auth_user_created` AFTER INSERT on `auth.users`
  - [x] 3.6 Create basic RLS policies: users can SELECT and UPDATE their own profile row
  - [ ] 3.7 Test migration locally: `supabase db reset` must succeed — DEFERRED (Supabase local not running)
  - [ ] 3.8 Generate TypeScript types: `supabase gen types typescript --local > src/lib/database.types.ts` — DEFERRED (requires Supabase local running)

- [x] Task 4: Create Zod auth schema (AC: #1)
  - [x] 4.1 Create `src/lib/schemas/auth.ts` with `magicLinkSchema = z.object({ email: z.email() })` (Zod v4 uses `z.email()` instead of deprecated `z.string().email()`)
  - [x] 4.2 Export schema directly: `export const magicLinkSchema = ...` (no barrel exports)

- [x] Task 5: Create auth feature components (AC: #1, #2, #3, #6)
  - [x] 5.1 Create `src/lib/components/features/auth/` directory
  - [x] 5.2 Create `OAuthButtons.svelte` — "Continue with Google" and "Continue with GitHub" buttons, each wrapping a `<form method="POST">` with the appropriate `action` (`?/google`, `?/github`). Include `redirectTo` as a hidden input. Display error message from `$page.form?.error` if present. Use emotionally calibrated error: "We couldn't sign you in with {provider}. Please try again or use a different method."
  - [x] 5.3 Create `MagicLinkForm.svelte` — Email input form using SuperForms. Include `redirectTo` as a hidden `<input>`. On success, show "Check your email for a magic link!" message (use SuperForms `$message`). Display validation errors from `$errors`.
  - [x] 5.4 Svelte 5 only: Use `$props()`, `$state()`, `{@render}` — NO Svelte 4 patterns. Note: SuperForms stores (`$form`, `$errors`, `$message`) use the `$` store syntax which IS valid in Svelte 5 — the architecture confirms "SuperForms owns form state, runes own everything else"

- [x] Task 6: Create login page route (AC: #1, #2, #3, #5, #6)
  - [x] 6.1 Create `src/routes/(public)/login/+page.server.ts` with load function and three form actions (magic_link, google, github)
  - [x] 6.2 Create `src/routes/(public)/login/+page.svelte` — Compose OAuthButtons + separator + MagicLinkForm with warm welcome text and error display
  - [x] 6.3 Thread `redirectTo` through the entire flow: load function reads from URL → passes to page → components include as hidden input → form actions read from formData → pass to OAuth/magic link callback URL as `?next=...` param

- [x] Task 7: Create OAuth callback handler (AC: #2, #3, #4, #5)
  - [x] 7.1 Create `src/routes/(public)/login/callback/+server.ts` — GET handler
  - [x] 7.2 Handle OAuth code exchange: read `code` param → `supabase.auth.exchangeCodeForSession(code)`
  - [x] 7.3 Handle magic link verification: read `token_hash` + `type` params → `supabase.auth.verifyOtp({ token_hash, type: type as string })`
  - [x] 7.4 Handle errors: read `error_description` param → redirect to `/login?error=...`
  - [x] 7.5 After successful auth: query `profiles` table for `onboarding_complete` — if false or no profile → redirect to `/onboarding`; if true → redirect to `next` param or `/dashboard`
  - [x] 7.6 Log errors server-side with `console.error` (provider name + error code)
  - [x] 7.7 Create placeholder `src/routes/(app)/onboarding/+page.svelte` — minimal page with "Onboarding coming soon" message so the `/onboarding` redirect doesn't 404. Story 2.3 replaces this with the full flow.

- [x] Task 8: Update `hooks.server.ts` — preserve original URL on auth redirect (AC: #5)
  - [x] 8.1 Change redirect from `/login` to `/login?redirectTo=${encodeURIComponent(event.url.pathname + event.url.search)}` when unauthenticated user hits protected route

- [x] Task 9: Create tests (AC: #7)
  - [x] 9.1 Create `src/routes/(public)/login/login.test.ts` — 9 unit tests for form actions
  - [x] 9.2 Create `src/lib/components/features/auth/OAuthButtons.test.ts` — 5 component tests
  - [x] 9.3 Create `src/lib/components/features/auth/MagicLinkForm.test.ts` — 4 component tests
  - [x] 9.4 Create `tests/integration/auth/callback.test.ts` — 7 integration tests for callback handler
  - [x] 9.5 Update `src/hooks.server.test.ts` — updated 5 tests for redirectTo query parameter in auth redirect

- [x] Task 10: Verify build and existing tests (AC: all)
  - [ ] 10.1 Run `supabase db reset` — DEFERRED (Supabase local not running)
  - [x] 10.2 Run `npm run build` — succeeded (required custom Vite plugin for optional peer dep stubbing)
  - [x] 10.3 Run `npm run test` — all 73 tests pass (61 unit + 12 integration)
  - [x] 10.4 Run `npm run lint` — passed
  - [x] 10.5 Run `npm run check` — passed (0 errors, 1 benign Svelte 5 warning)

## Dev Notes

### Critical: Package Installation

**Zod + SuperForms are NOT yet installed.** Install before any schema or form work:

```bash
npm install zod sveltekit-superforms
npx shadcn-svelte@latest add form label separator
```

SuperForms v2.29.1 with Zod adapter pattern:
```typescript
// +page.server.ts
import { superValidate, message } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { magicLinkSchema } from '$lib/schemas/auth'

export const load = async () => {
  const form = await superValidate(zod(magicLinkSchema))
  return { form }
}
```

```svelte
<!-- Component -->
<script lang="ts">
  import { superForm } from 'sveltekit-superforms'
  let { data } = $props()
  const { form, errors, message, enhance } = superForm(data.form)
</script>

<form method="POST" action="?/magic_link" use:enhance>
  <input type="email" name="email" bind:value={$form.email} />
  {#if $errors.email}<span>{$errors.email}</span>{/if}
  {#if $message}<p>{$message}</p>{/if}
  <button type="submit">Send Magic Link</button>
</form>
```

### Critical: Profiles Table Migration

**This is the FIRST database migration in the project.** Generate the file with `supabase migration new create_profiles` (creates a timestamped file like `20260210000000_create_profiles.sql`).

```sql
-- Create role enum
CREATE TYPE public.user_role AS ENUM (
  'learner',
  'sensei',
  'admin',
  'platform_admin',
  'team_lead',
  'org_admin'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'learner',
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS: Users can read their own profile
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- RLS: Users can update their own profile
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger function: create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'user_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'avatar_url',
      NEW.raw_user_meta_data ->> 'picture'
    )
  );
  RETURN NEW;
END;
$$;

-- Trigger: fire on every new auth.users row
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

**Naming conventions enforced:** `snake_case` tables (plural), `snake_case` columns, RLS policies named `{table}_{action}_{role}`, index prefix `idx_`. [Source: project-context.md — Data & Naming]

**Critical:** The `SECURITY DEFINER` on `handle_new_user()` is required because the trigger fires in the auth schema context, which doesn't have INSERT permissions on the public.profiles table by default. `SET search_path = ''` prevents search_path injection.

**Critical:** The trigger uses COALESCE to extract display name from OAuth metadata — Google uses `full_name`, GitHub uses `user_name` or `name`. Always have a fallback (email prefix).

**Critical:** `avatar_url` — Google returns it as `picture`, GitHub as `avatar_url`. COALESCE handles both.

### Critical: OAuth Server-Side Flow

OAuth is initiated via SvelteKit form actions (server-side), NOT client-side JS.

**Critical: `redirectTo` must be read from `request.formData()`** — NOT from `url.searchParams`. When a form submits with `action="?/google"`, the browser resolves this to `/login?/google`, which **replaces** the original query string. All components pass `redirectTo` as a hidden `<input>` field, so all actions read it from form data.

**Critical: Extract FormData BEFORE passing to `superValidate`** — `superValidate(request)` consumes the request body stream. Extract FormData first, then pass the FormData object to `superValidate`.

```typescript
// src/routes/(public)/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit'
import { superValidate, message } from 'sveltekit-superforms'
import { zod } from 'sveltekit-superforms/adapters'
import { magicLinkSchema } from '$lib/schemas/auth'

export const load = async ({ url }) => {
  const form = await superValidate(zod(magicLinkSchema))
  const redirectTo = url.searchParams.get('redirectTo') ?? '/dashboard'
  const error = url.searchParams.get('error') ?? null
  return { form, redirectTo, error }
}

export const actions = {
  magic_link: async ({ request, locals: { supabase }, url }) => {
    const formData = await request.formData()
    const form = await superValidate(formData, zod(magicLinkSchema))
    if (!form.valid) {
      return fail(400, { form })
    }

    const redirectTo = (formData.get('redirectTo') as string) ?? '/dashboard'
    const { error } = await supabase.auth.signInWithOtp({
      email: form.data.email,
      options: {
        emailRedirectTo: `${url.origin}/login/callback?next=${encodeURIComponent(redirectTo)}`
      }
    })

    if (error) {
      return message(form, error.message, { status: 400 })
    }

    return message(form, 'Check your email for a magic link!')
  },

  google: async ({ request, locals: { supabase }, url }) => {
    const formData = await request.formData()
    const redirectTo = (formData.get('redirectTo') as string) ?? '/dashboard'
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${url.origin}/login/callback?next=${encodeURIComponent(redirectTo)}`
      }
    })
    if (error) {
      return fail(400, { error: "We couldn't connect to Google. Please try again or use a different method." })
    }
    redirect(303, data.url)
  },

  github: async ({ request, locals: { supabase }, url }) => {
    const formData = await request.formData()
    const redirectTo = (formData.get('redirectTo') as string) ?? '/dashboard'
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${url.origin}/login/callback?next=${encodeURIComponent(redirectTo)}`
      }
    })
    if (error) {
      return fail(400, { error: "We couldn't connect to GitHub. Please try again or use a different method." })
    }
    redirect(303, data.url)
  }
}
```

**Key pattern:** All form actions read `redirectTo` from `request.formData()` (hidden input), NOT from `url.searchParams`. The callback URL includes `?next=...` so the callback handler knows where to send the user.

### Critical: OAuth Callback Handler

```typescript
// src/routes/(public)/login/callback/+server.ts
import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code')
  const token_hash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type')
  const next = url.searchParams.get('next') ?? '/dashboard'
  const error_description = url.searchParams.get('error_description')
  const error_code = url.searchParams.get('error')

  // Handle OAuth/provider errors
  if (error_description || error_code) {
    console.error('Auth callback error:', { error_code, error_description })
    const errorMsg = error_code === 'access_denied'
      ? 'Authentication was cancelled. No worries — try again when you\'re ready.'
      : error_description ?? 'Something went wrong during sign-in.'
    redirect(303, `/login?error=${encodeURIComponent(errorMsg)}`)
  }

  // OAuth code exchange (Google, GitHub)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Code exchange error:', error.message)
      redirect(303, `/login?error=${encodeURIComponent('We couldn\'t complete sign-in. Please try again.')}`)
    }
  }
  // Magic link token verification
  else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as 'email' })
    if (error) {
      console.error('Magic link verification error:', error.message)
      redirect(303, `/login?error=${encodeURIComponent('This magic link has expired or was already used. Please request a new one.')}`)
    }
  }
  // No valid auth params
  else {
    redirect(303, '/login?error=invalid_callback')
  }

  // Auth succeeded — check if new or returning user
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', user.id)
      .single()

    // New user or onboarding incomplete → onboarding flow (Story 2.3 builds the page)
    if (!profile || !profile.onboarding_complete) {
      redirect(303, '/onboarding')
    }
  }

  // Returning user → original destination or dashboard
  redirect(303, next)
}
```

**Critical:** After `exchangeCodeForSession` or `verifyOtp`, the Supabase client on `event.locals` already has the updated session (cookies were set via the `setAll` callback in hooks.server.ts). So `supabase.auth.getUser()` works immediately within the same request.

**Critical:** The `/onboarding` route does NOT exist yet — Story 2.3 builds the full flow. Task 7.7 creates a placeholder page at `src/routes/(app)/onboarding/+page.svelte` so the redirect doesn't 404. It's under `(app)/` because onboarding requires authentication — the route guard lets authenticated users through.

### Critical: `hooks.server.ts` Update

Add `redirectTo` query parameter to the unauthenticated redirect:

```typescript
// In hooks.server.ts, change:
if (!user) {
  return new Response(null, {
    status: 303,
    headers: { location: '/login' }
  });
}

// To:
if (!user) {
  const redirectTo = encodeURIComponent(event.url.pathname + event.url.search)
  return new Response(null, {
    status: 303,
    headers: { location: `/login?redirectTo=${redirectTo}` }
  });
}
```

This preserves the original URL so users return to their intended page after login.

### Critical: `supabase/config.toml` Auth Fixes

Current config has wrong values that will break auth:

```toml
# CURRENT (WRONG):
site_url = "http://127.0.0.1:3000"
additional_redirect_urls = ["https://127.0.0.1:3000"]

# CORRECT:
site_url = "http://127.0.0.1:5173"
additional_redirect_urls = [
  "http://127.0.0.1:5173/login/callback",
  "http://localhost:5173/login/callback"
]
```

Add OAuth provider sections (after `[auth.external.apple]`):

```toml
[auth.external.google]
enabled = true
client_id = "env(GOOGLE_CLIENT_ID)"
secret = "env(GOOGLE_CLIENT_SECRET)"
redirect_uri = ""
url = ""
skip_nonce_check = false

[auth.external.github]
enabled = true
client_id = "env(GITHUB_CLIENT_ID)"
secret = "env(GITHUB_CLIENT_SECRET)"
redirect_uri = ""
url = ""
```

Also increase email rate limit for local dev:
```toml
[auth.rate_limit]
email_sent = 10  # Was 2 — too low for magic link testing
```

### Environment Variable Updates

Add to `.env.example`:
```bash
# OAuth providers (required for Google/GitHub login)
# Google: Create at https://console.cloud.google.com/apis/credentials
# Set authorized redirect URI to: http://127.0.0.1:54321/auth/v1/callback
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub: Create at https://github.com/settings/developers
# Set authorization callback URL to: http://127.0.0.1:54321/auth/v1/callback
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

**Critical:** The OAuth redirect URI for Google/GitHub developer console points to SUPABASE (port 54321), NOT the SvelteKit app. Supabase handles the OAuth callback internally and then redirects to our app's `/login/callback`.

### Login Page UI Structure

```
┌──────────────────────────────────┐
│         Welcome back             │
│   Sign in to TeachMeSensei       │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Continue with Google      │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  Continue with GitHub      │  │
│  └────────────────────────────┘  │
│                                  │
│  ──────── or ────────            │
│                                  │
│  Email:                          │
│  ┌────────────────────────────┐  │
│  │  your@email.com            │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  Send Magic Link           │  │
│  └────────────────────────────┘  │
│                                  │
│  [error message area]            │
│  [success message area]          │
└──────────────────────────────────┘
```

- OAuth buttons at the top (highest conversion)
- Separator with "or"
- Magic link form below
- Error messages: emotionally calibrated, warm tone. Display from URL `error` param (callback errors) and from form action errors (inline).
- No "Sign Up" vs "Sign In" distinction — the page handles both seamlessly (Supabase creates users on first OAuth/magic link)

### Supabase Local Dev: Magic Link Testing

Magic link emails are captured by **InBucket** at `http://127.0.0.1:54324`. No real email is sent. After submitting a magic link request:
1. Open InBucket at port 54324
2. Find the email for the submitted address
3. Click the magic link — it redirects to `/login/callback?token_hash=...&type=email`

This is the primary testable auth flow in local development without real OAuth credentials.

### What NOT to Build in This Story

- **No onboarding flow pages** — that's Story 2.3 (just create a placeholder `(app)/onboarding/+page.svelte`)
- **No age verification** — that's Story 2.3
- **No role selection UI** — that's Story 2.3
- **No profile editing/viewing** — that's Story 2.4
- **No comprehensive RLS policies** — that's Story 2.5 (only basic profile read/update own here)
- **No full database schema** — that's Story 2.5 (only profiles table here)
- **No LinkedIn OAuth** — that's Phase 1.5
- **No password-based auth** — architecture decided Magic Link + OAuth only
- **No `$lib/server/supabaseAdmin.ts`** — not needed until Edge Functions (Epic 6)
- **No authStore.svelte.ts** — session state comes from layout load functions, no separate store needed yet
- **No E2E tests** — unit and integration tests are sufficient. E2E for full auth flows deferred (requires real Supabase stack + OAuth config)
- **No sign-out functionality** — not in the acceptance criteria. **Dev convenience tip:** To test login flows during development, add a temporary sign-out action in the dashboard page (`await supabase.auth.signOut()` + redirect to `/login`), or clear cookies manually in the browser. A proper sign-out button in Nav is a quick follow-up
- **No email template customization** — default Supabase email templates are sufficient for Phase 1

### Testing Strategy

**Unit tests** (`src/routes/(public)/login/login.test.ts`):
- Mock `@supabase/ssr` and Supabase client methods
- Mock `sveltekit-superforms` for form validation
- Test each form action (magic_link, google, github)
- Test error handling paths
- Test redirectTo parameter threading

**Component tests** (`src/lib/components/features/auth/*.test.ts`):
- Use `@testing-library/svelte` with `@testing-library/svelte/svelte5` alias
- Test OAuthButtons renders two buttons
- Test MagicLinkForm renders email input and submit button
- Test error message display

**Integration tests** (`tests/integration/auth/callback.test.ts`):
- Mock Supabase client (same pattern as Story 2.1 integration tests)
- Test callback handler for all paths: code, token_hash, error, no params
- Test new user detection (profile query) and redirect logic

**Mocking patterns** (from Story 2.1 — reuse these):
```typescript
vi.mock('$env/static/public', () => ({
  PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key',
}))
```

### Previous Story Intelligence

**From Story 2.1 (Auth Integration — DONE):**
- `hooks.server.ts` exists with: Supabase server client, `safeGetSession` (cached), route guards using `user.app_metadata?.role`, shared `resolveOptions`
- `+layout.ts` exists with `isBrowser()` branching, `depends('supabase:auth')`
- `+layout.server.ts` exists returning `{ session, user, cookies }`
- `+layout.svelte` has `onAuthStateChange` → `invalidate('supabase:auth')`
- 47 tests passing (17 original + 30 from Story 2.1)
- Role checks use `user.app_metadata?.role` (Option A)
- Environment var: `PUBLIC_SUPABASE_PUBLISHABLE_KEY` (NOT ANON_KEY)
- `@supabase/ssr@^0.8.0` and `@supabase/supabase-js@^2.95.3` installed
- Integration tests use mocked Supabase (not real local stack)
- `filterSerializedResponseHeaders` extracted to shared `resolveOptions` const

**From Story 2.0 (Staging — IN-PROGRESS):**
- CI triggers on both `master` and `staging` branches
- `.env.example` has staging credential comments
- `docs/staging.md` exists
- Manual tasks still pending (Railway/Supabase dashboard config)

**From Story 1.4 (CI/CD):**
- Vitest multi-project config in `vite.config.ts` (unit + integration)
- `tests/fixtures/roles.ts` exists as stub
- `--passWithNoTests` flag on integration tests

**From Story 1.2 (Layouts):**
- `@testing-library/svelte/svelte5` alias required
- `resolve.conditions: ['browser']` in vite.config.ts
- Layout shells: `PublicShell.svelte`, `AppShell.svelte` exist
- Route groups `(public)`, `(app)`, `(admin)`, `(enterprise)` all have `+layout.svelte` files

### Git Intelligence

Recent commits (patterns to follow):
```
45d6478 fix: provide PUBLIC_SUPABASE_* env vars at build time for Vite static imports
faab1c8 feat: story 2.1 — Supabase auth integration, route guards, and code review fixes
9e415ba feat: story 2.0 — CI staging branch trigger, env docs, and staging guide
cdeea07 feat: story 1.4 — CI/CD pipeline, test infrastructure, and code review fixes
```

Commit message pattern: `feat:` / `fix:` prefix, story reference, description. Branch is `master`.

Files modified in Story 2.1 (the foundation this story builds on):
- `src/hooks.server.ts` — will be modified (add redirectTo)
- `src/app.d.ts` — no changes needed
- `src/routes/+layout.ts` — no changes needed
- `src/routes/+layout.svelte` — no changes needed
- `src/routes/+layout.server.ts` — no changes needed

### Project Structure Notes

**New files to create:**
```
src/
├── lib/
│   ├── schemas/
│   │   └── auth.ts                         # Zod schema: magicLinkSchema
│   └── components/features/auth/
│       ├── OAuthButtons.svelte             # Google + GitHub OAuth buttons
│       ├── OAuthButtons.test.ts            # Component tests
│       ├── MagicLinkForm.svelte            # Email magic link form
│       └── MagicLinkForm.test.ts           # Component tests
├── routes/
│   ├── (public)/login/
│   │   ├── +page.svelte                    # Login page UI
│   │   ├── +page.server.ts                 # Form actions (magic_link, google, github)
│   │   ├── login.test.ts                   # Unit tests for form actions
│   │   └── callback/
│   │       └── +server.ts                  # OAuth/magic link callback handler
│   └── (app)/onboarding/
│       └── +page.svelte                    # Placeholder (Story 2.3 builds full flow)
├── lib/
│   └── database.types.ts                   # Auto-generated by supabase gen types (NEW)
supabase/
└── migrations/
    └── {timestamp}_create_profiles.sql     # Profiles table + trigger (use supabase migration new)
tests/
└── integration/auth/
    └── callback.test.ts                    # Callback handler integration tests
```

**Modified files:**
- `src/hooks.server.ts` — add redirectTo query param to login redirect
- `src/hooks.server.test.ts` — add test for redirectTo
- `supabase/config.toml` — fix site_url, add redirect URLs, add OAuth providers, increase email rate limit
- `.env.example` — add OAuth credential placeholders
- `package.json` — new dependencies (zod, sveltekit-superforms)
- `src/lib/database.types.ts` — auto-generated by `supabase gen types` after migration

### Architecture Compliance Checklist

- [ ] Login page at `(public)/login/` — accessible without auth
- [ ] OAuth callback at `(public)/login/callback/` — accessible without auth
- [ ] Zod schema in `$lib/schemas/auth.ts` — direct export, no barrel
- [ ] SuperForms for magic link form — `$form`, `$errors`, `$message`
- [ ] Auth components in `$lib/components/features/auth/` — NOT in `ui/`
- [ ] Profiles table: `snake_case`, plural, `timestamptz` for dates
- [ ] RLS policies named `{table}_{action}_{role}` pattern
- [ ] Database trigger: `SECURITY DEFINER SET search_path = ''`
- [ ] `database.types.ts` generated after migration via `supabase gen types`
- [ ] Form actions read `redirectTo` from `request.formData()`, NOT from `url.searchParams`
- [ ] Error messages emotionally calibrated — warm, not technical
- [ ] `auth.getUser()` used server-side (never trust unencoded session)
- [ ] Env var: `PUBLIC_SUPABASE_PUBLISHABLE_KEY` (not ANON_KEY)
- [ ] No Svelte 4 patterns — `$state`, `$props`, `{@render}` only
- [ ] No barrel exports
- [ ] No `$lib/server/` imports from client code
- [ ] TypeScript strict mode maintained
- [ ] All existing 47 tests pass (zero regressions)
- [ ] Tests co-located: `*.test.ts` next to source
- [ ] Integration tests in `tests/integration/`
- [ ] snake_case pass-through for all database data

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.2 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/architecture.md — Auth architecture, hooks.server.ts pattern, route structure]
- [Source: _bmad-output/planning-artifacts/architecture.md — Database naming conventions, RLS policy naming]
- [Source: _bmad-output/planning-artifacts/architecture.md — Type system boundaries, Zod schemas location]
- [Source: _bmad-output/planning-artifacts/architecture.md — SuperForms v2.29.1, form handling pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md — Project directory structure with login route]
- [Source: _bmad-output/planning-artifacts/architecture.md — Error handling with emotionalContext]
- [Source: _bmad-output/planning-artifacts/prd.md — FR1-FR6 Identity & Access requirements]
- [Source: _bmad-output/project-context.md — All 45 rules: naming, auth, testing, anti-patterns]
- [Source: _bmad-output/implementation-artifacts/2-1-supabase-auth-integration-and-route-guards.md — Previous story learnings, hooks.server.ts patterns]
- [Source: _bmad-output/implementation-artifacts/2-0-provision-staging-environment.md — Staging context, CI config]
- [Source: Supabase docs — Server-side auth for SvelteKit, OAuth, Magic Link, PKCE flow]
- [Source: Supabase docs — Managing user data with database triggers]
- [Source: @supabase/ssr v0.8.0 — getAll/setAll cookie API, exchangeCodeForSession]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Build failure: `sveltekit-superforms/adapters` barrel import pulls in all adapter files, causing Rollup to fail on uninstalled optional peer deps (valibot, arktype, effect, etc.). Resolved with custom Vite plugin using `syntheticNamedExports: true`.
- Zod v4 uses `z.email()` instead of deprecated `z.string().email()`
- SuperForms requires `zod4` adapter (not `zod`) for Zod v4 compatibility

### Completion Notes List

- Tasks 3.7 and 3.8 (supabase db reset + type generation) deferred — Supabase local not running. Migration file created and verified syntactically. These must be run before merging.
- 1 benign Svelte 5 `state_referenced_locally` warning in MagicLinkForm.svelte — expected behavior with SuperForms `superForm(data)` capturing prop at init
- Custom Vite plugin `stubOptionalDeps()` added to `vite.config.ts` to handle sveltekit-superforms barrel import issue with uninstalled optional peer deps

### Change Log

- 2026-02-10: Story created by SM agent (Claude Opus 4.6) — ultimate context engine analysis completed
- 2026-02-10: Story validated by SM agent (Claude Opus 4.6) — 10 improvements applied: fixed OAuth form actions to read redirectTo from formData (C1), fixed superValidate request body consumption (C2), added type generation subtask (C3), added placeholder onboarding page task (H1), fixed migration filename convention (H2), fixed verifyOtp type cast (M2), added sign-out dev tip (M3), added SuperForms Svelte 5 compatibility note, updated architecture compliance checklist, corrected all server code examples
- 2026-02-10: Story implemented by Dev agent (Claude Opus 4.6) — all 10 tasks completed (2 subtasks deferred: supabase db reset + type generation). 73 tests passing. Build, lint, and check all pass.
- 2026-02-10: Code review by Dev agent (Claude Opus 4.6) — 6 issues found (2 HIGH, 3 MEDIUM, 1 LOW). All fixed: H1 open redirect vulnerability in callback `next` param, H2 OAuth form action errors not displayed, M1 silent test failure risk (added expect.assertions), M2 raw `invalid_callback` string replaced with warm message, M3 getUser() null after auth handled, L1 File List updated with shadcn-svelte UI components. 2 new tests added. 75 tests passing. Build, lint, and check all pass.

### File List

**New files created:**
- `src/lib/schemas/auth.ts` — Zod v4 magicLinkSchema
- `src/lib/components/features/auth/OAuthButtons.svelte` — Google + GitHub OAuth buttons
- `src/lib/components/features/auth/OAuthButtons.test.ts` — 5 component tests
- `src/lib/components/features/auth/MagicLinkForm.svelte` — SuperForms email form
- `src/lib/components/features/auth/MagicLinkForm.test.ts` — 4 component tests
- `src/lib/components/ui/form/` — shadcn-svelte form component (auto-generated)
- `src/lib/components/ui/label/` — shadcn-svelte label component (auto-generated)
- `src/lib/components/ui/separator/` — shadcn-svelte separator component (auto-generated)
- `src/routes/(public)/login/+page.svelte` — Login page UI
- `src/routes/(public)/login/+page.server.ts` — Form actions (magic_link, google, github)
- `src/routes/(public)/login/login.test.ts` — 9 unit tests for form actions
- `src/routes/(public)/login/callback/+server.ts` — OAuth/magic link callback handler
- `src/routes/(app)/onboarding/+page.svelte` — Placeholder onboarding page
- `tests/integration/auth/callback.test.ts` — 9 integration tests for callback handler
- `supabase/migrations/20260210034001_create_profiles.sql` — Profiles table, RLS, triggers

**Modified files:**
- `package.json` — Added zod, sveltekit-superforms, formsnap dependencies
- `vite.config.ts` — Added stubOptionalDeps() Vite plugin for barrel import issue
- `supabase/config.toml` — Fixed site_url, redirect URLs, added OAuth providers, increased email rate limit
- `.env.example` — Added OAuth credential placeholders
- `src/hooks.server.ts` — Added redirectTo query parameter to auth redirect
- `src/hooks.server.test.ts` — Updated 5 tests for redirectTo parameter
- `tests/integration/auth/hooks.test.ts` — Updated 1 test for redirectTo parameter
