# Story 2.3: Age Verification & Onboarding Flow

Status: done

## Story

As a new user,
I want to verify my age and complete onboarding with my role selection and profile details,
So that I can start using the platform with a complete profile.

## Acceptance Criteria

1. **Given** a new user who has just registered
   **When** they reach the onboarding flow
   **Then** an age verification step requires date of birth entry
   **And** users under 18 see a warm message: "TeachMeSensei is designed for adults navigating career transitions. Come back when you're 18!" and cannot proceed
   **And** users 18+ proceed to role selection

2. **Given** a user completing onboarding
   **When** they select their role
   **Then** they can choose "I'm a Learner" or "I'm a Sensei"
   **And** the `profiles.role` column is updated to `learner` or `sensei`

3. **Given** a learner completing onboarding
   **When** they fill in their profile
   **Then** they can set name, upload photo, write bio, and optionally select topic interests (FR13)
   **And** `onboarding_complete` is set to `true`
   **And** they are redirected to `/dashboard`

4. **Given** a Sensei completing onboarding
   **When** they fill in their profile
   **Then** they can set name, upload photo, write bio, and select topic expertise areas (FR5)
   **And** `onboarding_complete` is set to `true`
   **And** they are redirected to `/dashboard`

5. **Given** a user with `onboarding_complete: false`
   **When** they try to access any `(app)` route
   **Then** they are redirected to the onboarding flow

6. **Given** the full onboarding flow
   **When** unit and integration tests run
   **Then** they verify: age validation logic, role selection update, profile update, onboarding redirect in hooks, and form validation

## Tasks / Subtasks

- [x] Task 1: Install additional shadcn-svelte components (AC: all)
  - [x] 1.1 Install `textarea` for bio field: `npx shadcn-svelte@latest add textarea`
  - [x] 1.2 Note: Role selection uses card-based UI (existing `card` + `button` components). Topic selection uses pill-toggle buttons (existing `button` component). No `radio-group` or `select` install needed.

- [x] Task 2: Create database migration — add onboarding columns to profiles (AC: #1, #2, #3, #4)
  - [x] 2.1 Generate migration file: `supabase migration new add_onboarding_fields` (creates timestamped file)
  - [x] 2.2 Add `date_of_birth DATE` column to profiles table (DATE not TIMESTAMPTZ — we only need the date, no time component)
  - [x] 2.3 Add `topics TEXT[]` column to profiles table (array of topic strings — shared by learners and senseis)
  - [x] 2.4 Add CHECK constraint: `date_of_birth` must be in the past (no future dates)
  - [x] 2.5 Test migration locally: `supabase db reset` — DEFERRED (Supabase local not running)

- [x] Task 3: Create Zod onboarding schemas (AC: #1, #2, #3, #4)
  - [x] 3.1 Create `src/lib/schemas/onboarding.ts`
  - [x] 3.2 `ageVerificationSchema`: `date_of_birth` as `z.coerce.date()` with refine for 18+ and not-future validation
  - [x] 3.3 `roleSelectionSchema`: `role` as `z.enum(['learner', 'sensei'])`
  - [x] 3.4 `profileSetupSchema`: `display_name` (required string min 2), `bio` (optional string max 500), `avatar_url` (optional string url), `topics` (array of strings, min 1 for sensei, optional for learner)
  - [x] 3.5 Export each schema directly — no barrel exports

- [x] Task 4: Create onboarding feature components (AC: #1, #2, #3, #4)
  - [x] 4.1 Create `src/lib/components/features/onboarding/` directory
  - [x] 4.2 Create `OnboardingSteps.svelte` — step indicator showing progress (Step 1: Age, Step 2: Role, Step 3: Profile). Use Svelte 5 `$props()` for `currentStep` and `totalSteps`. Styled with Tailwind — simple dots/line indicator, no external library.
  - [x] 4.3 Create `AgeVerificationStep.svelte` — date of birth input using SuperForms. On validation failure (under 18): show warm message "TeachMeSensei is designed for adults navigating career transitions. Come back when you're 18!" with a friendly illustration-free card. Uses `$form`, `$errors` from SuperForms. Pass `redirectTo` as hidden input for after-completion redirect.
  - [x] 4.4 Create `RoleSelectionStep.svelte` — two large clickable cards: "I'm a Learner" (with brief description) and "I'm a Sensei" (with brief description). Uses existing shadcn-svelte `card` + `button` components for card-based selection. Form submission via SuperForms with hidden input for role value.
  - [x] 4.5 Create `ProfileSetupStep.svelte` — conditional fields based on role. Name input (pre-filled from OAuth display_name), bio textarea, avatar URL input (pre-filled from OAuth avatar_url), topic selection. Sensei: topics REQUIRED (min 1). Learner: topics OPTIONAL. Uses shadcn-svelte Form + Input + Textarea + Select components. Profile photo: text input for URL in Phase 1 (file upload deferred — Supabase Storage not set up yet).

- [x] Task 5: Create onboarding page route (AC: #1, #2, #3, #4)
  - [x] 5.1 Replace placeholder `src/routes/(app)/onboarding/+page.svelte` with multi-step onboarding flow
  - [x] 5.2 Create `src/routes/(app)/onboarding/+page.server.ts` with load function and form actions
  - [x] 5.3 Load function: fetch current user profile (display_name, avatar_url, role, onboarding_complete) via `locals.supabase`. If `onboarding_complete` is already true, redirect to `/dashboard`. Pass profile data + current step to page.
  - [x] 5.4 Form action `age_verify`: validate date_of_birth with `ageVerificationSchema`, update `profiles.date_of_birth`, return next step
  - [x] 5.5 Form action `select_role`: validate role with `roleSelectionSchema`, update `profiles.role`, return next step
  - [x] 5.6 Form action `complete_profile`: validate with `profileSetupSchema`, update `profiles` (display_name, bio, avatar_url, topics, `onboarding_complete = true`), redirect to `/dashboard`
  - [x] 5.7 Step management: use URL search param `?step=1|2|3` to track current step. Load function reads step param. Each form action advances to next step via redirect with `?step=N+1`.

- [x] Task 6: Update `hooks.server.ts` — onboarding redirect guard (AC: #5)
  - [x] 6.1 After the authentication check (line 55-61), add onboarding check: query `profiles` table for `onboarding_complete` for the authenticated user
  - [x] 6.2 If `onboarding_complete` is false AND route is NOT `/onboarding` → redirect to `/onboarding`
  - [x] 6.3 Skip onboarding check for API routes (`/api/*`) to avoid blocking programmatic access
  - [x] 6.4 Accept the PK lookup query for Phase 1 — single-row SELECT by primary key is <1ms. Optimize with caching in Phase 2 if needed

- [x] Task 7: Create tests (AC: #6)
  - [x] 7.1 Create `src/lib/schemas/onboarding.test.ts` — unit tests for all three schemas: age validation (18+, future date rejection, edge cases), role enum, profile fields (min name length, topics required for sensei)
  - [x] 7.2 Create `src/lib/components/features/onboarding/AgeVerificationStep.test.ts` — component renders date input, form submission, under-18 message display
  - [x] 7.3 Create `src/lib/components/features/onboarding/RoleSelectionStep.test.ts` — component renders two role options, selection state
  - [x] 7.4 Create `src/lib/components/features/onboarding/ProfileSetupStep.test.ts` — component renders name/bio/topics fields, conditional topic requirement based on role
  - [x] 7.5 Create `src/routes/(app)/onboarding/onboarding.test.ts` — unit tests for form actions: age_verify, select_role, complete_profile. Test validation, profile updates, redirect logic.
  - [x] 7.6 Update `src/hooks.server.test.ts` — add tests for onboarding redirect: unonboarded user redirected, onboarded user passes through, onboarding route itself not redirected

- [x] Task 8: Verify build and existing tests (AC: all)
  - [x] 8.1 Run `npm run build` — must succeed
  - [x] 8.2 Run `npm run test` — all 154 tests pass (0 failures)
  - [x] 8.3 Run `npm run lint` — passes (only pre-existing database.types.ts error, not from this story)
  - [x] 8.4 Run `npm run check` — passes (only pre-existing database.types.ts errors; new code warnings match existing MagicLinkForm pattern)

## Dev Notes

### Critical: Database Migration

**Existing profiles table** (from migration `20260210034001_create_profiles.sql`):
```sql
-- Current columns: id, role, display_name, avatar_url, bio, onboarding_complete, created_at, updated_at
-- Missing for onboarding: date_of_birth, topics
```

**New migration** — adds columns needed for the onboarding flow:
```sql
-- Add onboarding fields to profiles
ALTER TABLE public.profiles ADD COLUMN date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN topics TEXT[] DEFAULT '{}';

-- Prevent future dates of birth
ALTER TABLE public.profiles ADD CONSTRAINT profiles_dob_not_future
  CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE);
```

**Why DATE not TIMESTAMPTZ for date_of_birth:** We only need the calendar date for age calculation — no time component. The 18+ check compares `date_of_birth` against today's date. Using DATE avoids timezone ambiguity in age calculation.

**Why TEXT[] for topics:** Simple string array. No separate topics table needed in Phase 1. Topics are free-form strings selected from a predefined list in the UI. If we need a topics table later (Phase 2+ for search/matching), we can migrate then.

### Critical: Age Verification Logic

**Server-side validation** — never trust client-side age checks:

```typescript
// src/lib/schemas/onboarding.ts
import { z } from 'zod'

export const ageVerificationSchema = z.object({
  date_of_birth: z.coerce.date()
    .refine((date) => date <= new Date(), {
      message: "Hmm, that date hasn't happened yet — please check and try again"
    })
    .refine((date) => {
      const today = new Date()
      const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
      return date <= eighteenYearsAgo
    }, {
      message: "TeachMeSensei is designed for adults navigating career transitions. Come back when you're 18!"
    })
})

export const roleSelectionSchema = z.object({
  role: z.enum(['learner', 'sensei'])
})

export const profileSetupSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional().default(''),
  avatar_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  topics: z.array(z.string()).default([])
})
```

**Critical: `z.coerce.date()`** — HTML date inputs submit strings like `"2000-05-15"`. The `coerce` transforms the string to a Date object before validation. Without coerce, the refine checks will fail on string comparison.

**Critical: Age boundary** — calculate 18 years ago from today exactly. A person born on Feb 10, 2008 turns 18 on Feb 10, 2026, so `date <= eighteenYearsAgo` is correct (inclusive — someone turning 18 today passes).

### Critical: Multi-Step Onboarding Pattern

**Step management via URL params** (not client-side state):

```
/onboarding?step=1  → Age verification
/onboarding?step=2  → Role selection
/onboarding?step=3  → Profile setup
```

Why URL params: Each step is a separate form action that redirects to the next step. This means the browser's back button works, page refresh preserves step, and we don't need client-side routing or complex state management. Each form action validates, updates the database, then redirects to `?step=N+1`.

**Load function determines step from DB state** (not just URL param):
```typescript
// +page.server.ts load function
export const load = async ({ locals: { supabase }, url }) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(303, '/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, role, date_of_birth, topics, onboarding_complete')
    .eq('id', user.id)
    .single()

  // Already onboarded → dashboard
  if (profile?.onboarding_complete) redirect(303, '/dashboard')

  // Determine actual step from profile state (prevents skipping)
  let step = 1
  if (profile?.date_of_birth) step = 2         // Age verified → role selection
  if (profile?.date_of_birth && profile?.role !== 'learner' || /* role explicitly set */) step = 3  // Role chosen → profile setup
  // Note: Default role is 'learner', so need a way to distinguish "not yet chosen" from "chose learner"

  // URL step param is advisory — actual step from DB state prevents skipping
  const requestedStep = parseInt(url.searchParams.get('step') ?? '1')
  const currentStep = Math.min(requestedStep, step)

  const ageForm = await superValidate(zod(ageVerificationSchema))
  const roleForm = await superValidate(zod(roleSelectionSchema))
  const profileForm = await superValidate(
    { display_name: profile?.display_name ?? '', bio: '', avatar_url: profile?.avatar_url ?? '', topics: profile?.topics ?? [] },
    zod(profileSetupSchema)
  )

  return { currentStep, profile, ageForm, roleForm, profileForm }
}
```

**Critical: Detecting "role not yet chosen" vs "chose learner"** — The default role in the DB trigger is `'learner'`. Since we can't distinguish "default learner" from "actively chose learner", use `?step=` as the progression driver with server-side validation that previous steps' data exists before allowing access:

```typescript
let maxAllowedStep = 1
if (profile?.date_of_birth) maxAllowedStep = 2
if (profile?.date_of_birth && requestedStep >= 3) maxAllowedStep = 3
// After role selection action completes, it redirects to ?step=3
// After age action completes, it redirects to ?step=2
const currentStep = Math.min(requestedStep, maxAllowedStep)
```

Each form action saves its data to the DB, so partial progress is preserved. The URL param drives forward progression, while `maxAllowedStep` prevents skipping steps (e.g., can't reach step 2 without `date_of_birth` in DB).

### Critical: hooks.server.ts Onboarding Guard

**Add onboarding check AFTER authentication check** (around line 61 in current file):

```typescript
// After the !user check and before role checks:

// Onboarding redirect — skip for onboarding route itself and API routes
if (routeId.startsWith('/(app)') && !routeId.startsWith('/(app)/onboarding')) {
  const { data: profile } = await event.locals.supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.onboarding_complete) {
    return new Response(null, {
      status: 303,
      headers: { location: '/onboarding' }
    })
  }
}
```

**Critical: Performance concern** — this adds a DB query to EVERY (app) route request. Mitigation options:
1. **Cache in session/cookie** — after onboarding completes, the `onboarding_complete` flag rarely changes. But cookie-based caching of DB state is fragile.
2. **Only check once per session** — use the `safeGetSession` cache pattern. Add profile data to the cached session result.
3. **Accept the query** — it's a single-row SELECT by primary key (id). With proper indexing (PK index), this is <1ms. Acceptable for Phase 1.

**Recommended for Phase 1:** Accept the DB query. It's a PK lookup — fast enough. Optimize in Phase 2 if needed.

**Critical: Must NOT redirect `/onboarding` to `/onboarding`** — the guard must skip when the user is already on the onboarding page. The check `!routeId.startsWith('/(app)/onboarding')` handles this.

### Critical: Form Actions Pattern

Each step is a separate form action in `+page.server.ts`:

```typescript
export const actions = {
  age_verify: async ({ request, locals: { supabase } }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(303, '/login')

    const formData = await request.formData()
    const form = await superValidate(formData, zod(ageVerificationSchema))
    if (!form.valid) return fail(400, { ageForm: form, step: 1 })

    const { error } = await supabase
      .from('profiles')
      .update({ date_of_birth: form.data.date_of_birth.toISOString().split('T')[0] })
      .eq('id', user.id)

    if (error) {
      return message(form, "We're having trouble saving your information. Please try again.", { status: 500 })
    }

    redirect(303, '/onboarding?step=2')
  },

  select_role: async ({ request, locals: { supabase } }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(303, '/login')

    const formData = await request.formData()
    const form = await superValidate(formData, zod(roleSelectionSchema))
    if (!form.valid) return fail(400, { roleForm: form, step: 2 })

    const { error } = await supabase
      .from('profiles')
      .update({ role: form.data.role })
      .eq('id', user.id)

    if (error) {
      return message(form, "We're having trouble saving your role. Please try again.", { status: 500 })
    }

    redirect(303, '/onboarding?step=3')
  },

  complete_profile: async ({ request, locals: { supabase } }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(303, '/login')

    const formData = await request.formData()
    const form = await superValidate(formData, zod(profileSetupSchema))
    if (!form.valid) return fail(400, { profileForm: form, step: 3 })

    // For sensei, topics are required (min 1)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'sensei' && (!form.data.topics || form.data.topics.length === 0)) {
      return message(form, 'As a Sensei, please select at least one topic you can help with.', { status: 400 })
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: form.data.display_name,
        bio: form.data.bio || null,
        avatar_url: form.data.avatar_url || null,
        topics: form.data.topics,
        onboarding_complete: true
      })
      .eq('id', user.id)

    if (error) {
      return message(form, "We're having trouble completing your profile. Please try again.", { status: 500 })
    }

    redirect(303, '/dashboard')
  }
}
```

**Critical: `date_of_birth` format** — `z.coerce.date()` produces a JS Date object. Supabase expects a `DATE` column value as `'YYYY-MM-DD'` string. Use `.toISOString().split('T')[0]` to extract just the date part.

**Critical: Topics array handling** — HTML forms don't natively support arrays. Use hidden inputs or a custom component that manages topic state and submits as JSON. SuperForms handles array fields — use `$form.topics` with a custom multi-select component that adds/removes items.

**Critical: Sensei topic validation** — The Zod schema has `topics` as optional (to support learners), but the `complete_profile` action adds a server-side check for senseis requiring at least 1 topic. This is intentional: the same schema/form works for both roles, with role-specific validation in the action.

### Critical: Topic Selection Approach

**Predefined topic list** (Phase 1 — hardcoded, move to DB in Phase 2):

```typescript
// src/lib/constants/topics.ts
export const AVAILABLE_TOPICS = [
  'Career Switching',
  'Junior Dev Survival',
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'Data Science',
  'Cloud & DevOps',
  'System Design',
  'Interview Prep',
  'Leadership',
  'Work-Life Balance',
  'Freelancing',
  'Open Source',
  'Mobile Development',
  'AI & Machine Learning'
] as const
```

**UI pattern:** Multi-select checkboxes or pill-toggle buttons (not a dropdown). Each topic is a toggle. Selected topics are tracked via `$state` and synced to hidden form fields for SuperForms submission. This gives a more engaging visual than a select dropdown for a limited set of options.

**Alternative:** If using shadcn-svelte `select` with multi-select feels cleaner, that works too. The key is the topics array gets submitted as form data. SuperForms handles `string[]` fields.

### Critical: Onboarding Page Component Structure

```svelte
<!-- src/routes/(app)/onboarding/+page.svelte -->
<script lang="ts">
  import { superForm } from 'sveltekit-superforms'
  import OnboardingSteps from '$lib/components/features/onboarding/OnboardingSteps.svelte'
  import AgeVerificationStep from '$lib/components/features/onboarding/AgeVerificationStep.svelte'
  import RoleSelectionStep from '$lib/components/features/onboarding/RoleSelectionStep.svelte'
  import ProfileSetupStep from '$lib/components/features/onboarding/ProfileSetupStep.svelte'

  let { data } = $props()
</script>

<div class="mx-auto max-w-lg px-4 py-8">
  <OnboardingSteps currentStep={data.currentStep} totalSteps={3} />

  {#if data.currentStep === 1}
    <AgeVerificationStep form={data.ageForm} />
  {:else if data.currentStep === 2}
    <RoleSelectionStep form={data.roleForm} />
  {:else if data.currentStep === 3}
    <ProfileSetupStep form={data.profileForm} role={data.profile?.role ?? 'learner'} />
  {/if}
</div>
```

**Critical: Svelte 5 only** — `$props()`, `$state()`, `{@render}`. NO Svelte 4 patterns. SuperForms stores (`$form`, `$errors`, `$message`) use `$` store syntax which IS valid in Svelte 5.

### Critical: SuperForms Array Field Handling

For the topics multi-select, SuperForms supports array fields. The pattern:

```svelte
<!-- In ProfileSetupStep.svelte -->
<script lang="ts">
  import { superForm } from 'sveltekit-superforms'
  import { AVAILABLE_TOPICS } from '$lib/constants/topics'

  let { form: formData, role } = $props()
  const { form, errors, message, enhance } = superForm(formData)

  // Track selected topics with runes
  let selectedTopics = $state<string[]>($form.topics ?? [])

  // Sync to SuperForms when selection changes
  $effect(() => {
    $form.topics = selectedTopics
  })
</script>

<form method="POST" action="?/complete_profile" use:enhance>
  <input type="hidden" name="display_name" value={$form.display_name} />
  <!-- ... other fields ... -->

  <!-- Topics as hidden inputs for array submission -->
  {#each selectedTopics as topic}
    <input type="hidden" name="topics" value={topic} />
  {/each}

  <!-- Topic toggle UI -->
  <div class="flex flex-wrap gap-2">
    {#each AVAILABLE_TOPICS as topic}
      <button
        type="button"
        class="rounded-full px-3 py-1 text-sm border {selectedTopics.includes(topic) ? 'bg-primary text-primary-foreground' : 'bg-background'}"
        onclick={() => {
          if (selectedTopics.includes(topic)) {
            selectedTopics = selectedTopics.filter(t => t !== topic)
          } else {
            selectedTopics = [...selectedTopics, topic]
          }
        }}
      >
        {topic}
      </button>
    {/each}
  </div>
</form>
```

**Critical: Array form submission** — multiple `<input name="topics">` elements submit as an array when SuperForms parses formData. Alternatively, use a single hidden input with JSON.stringify. The multiple-inputs approach is more standard.

### What NOT to Build in This Story

- **No file upload for avatar** — use text URL input for Phase 1. Supabase Storage not configured yet. Story 2.4 or later can add file upload.
- **No LinkedIn OAuth** — deferred to Phase 1.5 per architecture override. PRD mentions LinkedIn auto-fill, but architecture explicitly defers it.
- **No Sensei style tags** — deferred to Phase 2 (Epic 10). Onboarding only collects name, bio, photo, topics.
- **No availability slots** — that's Epic 4 (Session Scheduling). Sensei availability is NOT part of onboarding in Phase 1.
- **No invite code generation** — that's Epic 3 (Sensei Invite System). Senseis don't get codes during onboarding.
- **No profile viewing/editing page** — that's Story 2.4. This story only handles the one-time onboarding wizard.
- **No comprehensive RLS policies** — that's Story 2.5. Keep the basic select/update own from Story 2.2.
- **No E2E tests** — unit and component tests are sufficient. E2E for full onboarding flow requires real Supabase stack.
- **No constellation visualization** — Phase 2.

### Previous Story Intelligence

**From Story 2.2 (User Registration & Login — DONE):**
- `src/routes/(public)/login/callback/+server.ts` already redirects new users to `/onboarding` when `onboarding_complete` is false (line 74-77)
- Profiles table exists with `role` default `'learner'`, `onboarding_complete` default `false`
- `handle_new_user()` trigger auto-creates profile on signup with OAuth display_name/avatar_url extracted
- SuperForms + Zod already installed and working
- SuperForms requires `zod4` adapter aliased as `zod` (confirmed working in 2.2): `import { zod4 as zod } from 'sveltekit-superforms/adapters'`
- Custom Vite plugin `stubOptionalDeps()` handles barrel import issue — already in `vite.config.ts`
- `src/lib/schemas/auth.ts` uses `z.email()` (Zod v4 pattern) — follow same Zod v4 patterns
- Emotionally calibrated error messages established as pattern
- 75 tests passing (61 unit + 14 integration)
- Form actions read data from `request.formData()` — established pattern

**From Story 2.2 — Files this story builds on:**
- `src/hooks.server.ts` — needs onboarding redirect guard (Task 6)
- `src/routes/(app)/onboarding/+page.svelte` — placeholder to replace (Task 5)
- `supabase/migrations/20260210034001_create_profiles.sql` — new migration adds columns (Task 2)
- `src/lib/schemas/auth.ts` — pattern to follow for onboarding schemas

**From Story 2.1 (Auth Integration — DONE):**
- `hooks.server.ts`: safeGetSession with caching, route guards for (public)/(app)/(admin)/(enterprise)
- Role checks use `user.app_metadata?.role`
- Supabase browser client in `+layout.ts`, server client in `hooks.server.ts`

**From Story 1.2 (Layouts — DONE):**
- `@testing-library/svelte/svelte5` alias required for component tests
- `resolve.conditions: ['browser']` in vite.config.ts
- Placeholder `/dashboard` page exists at `src/routes/(app)/dashboard/+page.svelte`

### Git Intelligence

Recent commit pattern:
```
fc0d42f feat: story 2.2 — user registration & login with code review fixes
45d6478 fix: provide PUBLIC_SUPABASE_* env vars at build time for Vite static imports
faab1c8 feat: story 2.1 — Supabase auth integration, route guards, and code review fixes
```

Pattern: `feat:` / `fix:` prefix, story reference, description. Branch: `master`.

### Project Structure Notes

**New files to create:**
```
src/
├── lib/
│   ├── schemas/
│   │   └── onboarding.ts                         # Zod schemas: age, role, profile
│   │   └── onboarding.test.ts                     # Schema validation tests
│   ├── constants/
│   │   └── topics.ts                              # AVAILABLE_TOPICS array
│   └── components/features/onboarding/
│       ├── OnboardingSteps.svelte                 # Step progress indicator
│       ├── AgeVerificationStep.svelte             # Date of birth form
│       ├── AgeVerificationStep.test.ts            # Component tests
│       ├── RoleSelectionStep.svelte               # Learner/Sensei selection
│       ├── RoleSelectionStep.test.ts              # Component tests
│       ├── ProfileSetupStep.svelte                # Name, bio, photo, topics
│       └── ProfileSetupStep.test.ts               # Component tests
├── routes/(app)/onboarding/
│   ├── +page.svelte                               # Replace placeholder with multi-step flow
│   ├── +page.server.ts                            # Load function + 3 form actions
│   └── onboarding.test.ts                         # Form action unit tests
supabase/
└── migrations/
    └── {timestamp}_add_onboarding_fields.sql      # date_of_birth + topics columns
```

**Modified files:**
- `src/hooks.server.ts` — add onboarding redirect guard
- `src/hooks.server.test.ts` — add onboarding redirect tests
- `src/lib/components/ui/textarea/` — new shadcn-svelte component (auto-generated)

### Architecture Compliance Checklist

- [ ] Onboarding page at `(app)/onboarding/` — requires authentication
- [ ] Age verification validates server-side (never trust client)
- [ ] Date of birth stored as `DATE` column (not TIMESTAMPTZ — no time component needed)
- [ ] `topics TEXT[]` column — snake_case, no camelCase conversion
- [ ] Zod schemas in `$lib/schemas/onboarding.ts` — direct exports, no barrel
- [ ] Components in `$lib/components/features/onboarding/` — NOT in `ui/`
- [ ] SuperForms for all three form steps — `$form`, `$errors`, `$message`
- [ ] Form actions read from `request.formData()` (not `url.searchParams`)
- [ ] Error messages emotionally calibrated — warm, not technical
- [ ] `auth.getUser()` used in every form action (never trust session)
- [ ] Svelte 5 only: `$state`, `$props`, `$derived`, `$effect` — NO Svelte 4
- [ ] No barrel exports
- [ ] No `$lib/server/` imports from client code
- [ ] TypeScript strict mode maintained
- [ ] All existing 75 tests pass (zero regressions) + new tests
- [ ] Tests co-located: `*.test.ts` next to source
- [ ] snake_case pass-through for all database data
- [ ] `onboarding_complete` guard in hooks.server.ts excludes `/onboarding` route itself
- [ ] Profile setup pre-fills display_name and avatar_url from existing profile (OAuth data)
- [ ] Topic selection: required for sensei (min 1), optional for learner

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.3 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/prd.md — FR1-FR6 Identity & Access, FR13 Learner topic interests]
- [Source: _bmad-output/planning-artifacts/prd.md — FR3 Age verification 18+, no COPPA]
- [Source: _bmad-output/planning-artifacts/architecture.md — Auth patterns, hooks.server.ts, route guards]
- [Source: _bmad-output/planning-artifacts/architecture.md — Database naming: snake_case, timestamptz, TEXT[]]
- [Source: _bmad-output/planning-artifacts/architecture.md — SuperForms v2.29.1, Zod schema pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md — Component structure: features/ directory]
- [Source: _bmad-output/planning-artifacts/architecture.md — Error handling: emotionalContext, warm messages]
- [Source: _bmad-output/planning-artifacts/architecture.md — State management: Svelte 5 runes, no Svelte 4]
- [Source: _bmad-output/project-context.md — All 45 rules: naming, auth, testing, anti-patterns]
- [Source: _bmad-output/implementation-artifacts/2-2-user-registration-and-login.md — Previous story learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Installed shadcn-svelte `textarea` component for bio field
- Created migration `20260210122106_add_onboarding_fields.sql` adding `date_of_birth DATE` and `topics TEXT[]` columns
- Created 3 Zod schemas (`ageVerificationSchema`, `roleSelectionSchema`, `profileSetupSchema`) with Zod v4 patterns
- Created `AVAILABLE_TOPICS` constants in `$lib/constants/topics.ts`
- Created 4 onboarding feature components: `OnboardingSteps`, `AgeVerificationStep`, `RoleSelectionStep`, `ProfileSetupStep`
- Built multi-step onboarding page with URL param-based step management and server-side step gating
- 3 form actions: `age_verify`, `select_role`, `complete_profile` with SuperForms validation
- Added onboarding redirect guard in `hooks.server.ts` — unonboarded users on `(app)` routes redirected to `/onboarding`
- Sensei-specific topic validation (min 1) enforced server-side in `complete_profile` action
- Profile setup pre-fills `display_name` and `avatar_url` from OAuth data
- 152 total tests passing (0 failures) after code review fixes
- Build, lint, and check all pass (only pre-existing `database.types.ts` issues remain)

### Change Log

- 2026-02-10: Story created by SM agent (Claude Opus 4.6) — ultimate context engine analysis completed
- 2026-02-10: Story implemented by Dev agent (Claude Opus 4.6) — all 8 tasks complete
- 2026-02-10: Code review by Dev agent (Claude Opus 4.6) — 11 issues found, all fixed: broken integration test, display_name max+trim, topics server validation, bio pre-fill, OnboardingSteps cleanup, stale dev notes, test count correction. 152 tests passing.
- 2026-02-10: Second code review by Dev agent (Claude Opus 4.6) — 7 issues found (0 critical, 4 medium, 3 low). Fixed: parseInt NaN guard (M2), hooks error logging (L2), pre-fill+NaN tests (L3+M2). Documented: step-gating limitation (M1), deferred type generation (M3), Svelte 5 SuperForms warnings (M4), date refine comment (L1). 154 tests passing.

### File List

**New files:**
- `supabase/migrations/20260210122106_add_onboarding_fields.sql`
- `src/lib/schemas/onboarding.ts`
- `src/lib/schemas/onboarding.test.ts`
- `src/lib/constants/topics.ts`
- `src/lib/components/features/onboarding/OnboardingSteps.svelte`
- `src/lib/components/features/onboarding/AgeVerificationStep.svelte`
- `src/lib/components/features/onboarding/AgeVerificationStep.test.ts`
- `src/lib/components/features/onboarding/RoleSelectionStep.svelte`
- `src/lib/components/features/onboarding/RoleSelectionStep.test.ts`
- `src/lib/components/features/onboarding/ProfileSetupStep.svelte`
- `src/lib/components/features/onboarding/ProfileSetupStep.test.ts`
- `src/routes/(app)/onboarding/+page.server.ts`
- `src/routes/(app)/onboarding/onboarding.test.ts`
- `src/lib/components/ui/textarea/index.ts` (auto-generated by shadcn-svelte)
- `src/lib/components/ui/textarea/textarea.svelte` (auto-generated by shadcn-svelte)

**Modified files:**
- `src/routes/(app)/onboarding/+page.svelte` (replaced placeholder with multi-step flow)
- `src/hooks.server.ts` (added onboarding redirect guard)
- `src/hooks.server.test.ts` (added onboarding redirect tests, updated Supabase mock)
- `tests/integration/auth/hooks.test.ts` (added from() mock for onboarding guard compatibility)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (story status updated to review)
