# Story 2.4: Profile Management

Status: done

## Story

As a user,
I want to view and edit my profile information,
So that I can keep my details accurate and present myself to the community.

## Acceptance Criteria

1. **Given** an authenticated user on the profile page
   **When** they view their profile
   **Then** they see their name, photo, bio, role, and topic areas
   **And** the page uses the `(app)/profile/` route

2. **Given** an authenticated user editing their profile
   **When** they update name, photo, or bio and submit
   **Then** the profile is updated in the database via SuperForms form action
   **And** validation uses Zod schema from `$lib/schemas/profiles.ts`
   **And** a success toast confirms the update

3. **Given** a Sensei editing their profile
   **When** they update topic expertise areas
   **Then** the topics are saved and reflected on their profile

4. **Given** a learner editing their profile
   **When** they update topic interests
   **Then** the interests are saved and reflected on their profile

## Tasks / Subtasks

- [x] Task 0: Regenerate database types — BLOCKING PREREQUISITE (AC: all)
  - [x] 0.1 Run `npx supabase gen types typescript --local > src/lib/database.types.ts`
  - [x] 0.2 Verify `topics` (string[]) and `date_of_birth` (string | null) columns appear in the profiles Row type
  - [x] 0.3 These columns were added in Story 2.3's migration but types were never regenerated — without this step, TypeScript will error on every `.select('topics')` and `.update({ topics: ... })` call
  - [x] 0.4 Note: requires local Supabase running (`npx supabase start`). If not available, manually add the two fields to the profiles types as a temporary workaround.

- [x] Task 1: Create profile update Zod schema (AC: #2)
  - [x] 1.1 Create `src/lib/schemas/profiles.ts`
  - [x] 1.2 `updateProfileSchema`: `display_name` (required, min 2, max 100, trimmed), `bio` (optional, max 500), `avatar_url` (optional URL or empty string), `topics` (string array, default `[]`)
  - [x] 1.3 Follow Zod v4 patterns from `$lib/schemas/onboarding.ts` (use `z.email()` style, `z.url()`, etc.)
  - [x] 1.4 Export schema directly — no barrel exports

- [x] Task 2: Create profile page server logic (AC: #1, #2, #3, #4)
  - [x] 2.1 Create `src/routes/(app)/profile/+page.server.ts`
  - [x] 2.2 `load` function: `auth.getUser()` → fetch full profile row → `superValidate` with existing data → return `{ profile, form }`
  - [x] 2.3 `update_profile` form action: validate with `updateProfileSchema`, enforce sensei topics min 1 server-side, update `profiles` table, return success message
  - [x] 2.4 On error: return emotionally calibrated message via `message()`. On success: return success message (NOT redirect — user stays on profile page)
  - [x] 2.5 Use `auth.getUser()` in every action — never trust client session

- [x] Task 3: Create profile page UI (AC: #1, #2, #3, #4)
  - [x] 3.1 Create `src/routes/(app)/profile/+page.svelte`
  - [x] 3.2 Profile header: Avatar display + display_name + role badge (read-only)
  - [x] 3.3 Edit form: display_name input, bio textarea, avatar_url input, topic selection (reuse pill-toggle pattern from onboarding)
  - [x] 3.4 Role displayed as read-only badge — NOT editable (set during onboarding)
  - [x] 3.5 Pre-fill all form fields from current profile data via `superValidate` with existing values
  - [x] 3.6 Show success toast via Sonner on successful update — use `import { toast } from 'svelte-sonner'` (this is the FIRST toast usage in the codebase — establishes the pattern)
  - [x] 3.7 Show `$message` for errors inline
  - [x] 3.8 Svelte 5 only: `$props()`, `$state()`, `$derived()`, `$effect()` — NO Svelte 4
  - [x] 3.9 Add `<svelte:head><title>Profile | TeachMeSensei</title></svelte:head>` for proper browser tab title
  - [x] 3.10 Topic section label: "Your Expertise" for senseis, "Your Interests" for learners (role-contextual)

- [x] Task 4: Update sidebar navigation (AC: #1)
  - [x] 4.1 Add "Profile" link to `src/lib/components/layout/Sidebar.svelte`
  - [x] 4.2 Import `User` from `@lucide/svelte` (NOT `lucide-svelte` — the codebase uses the `@lucide/svelte` scoped package)
  - [x] 4.3 Use `<User class="h-4 w-4" />` — matches existing `Home` and `Settings` icon size
  - [x] 4.4 Place between Dashboard and Settings in the nav order
  - [x] 4.5 Note: sidebar currently has NO active link detection — do NOT add it for just the Profile link (would be inconsistent). Active link detection is a separate enhancement for all sidebar links.

- [x] Task 5: Create tests (AC: #1, #2, #3, #4)
  - [x] 5.1 Create `src/lib/schemas/profiles.test.ts` — unit tests: display_name min/max/trim, bio max, avatar_url validation, topics array
  - [x] 5.2 Create `src/routes/(app)/profile/profile.test.ts` — unit tests for `update_profile` action: validation, successful update, sensei topic enforcement, error handling
  - [x] 5.3 All tests co-located with source (`.test.ts` files)
  - [x] 5.4 Never import from Playwright in `.test.ts` files

- [x] Task 6: Verify build and existing tests (AC: all)
  - [x] 6.1 Run `npm run build` — must succeed
  - [x] 6.2 Run `npm run test` — all 185 tests pass (154 existing + 31 new, zero regressions)
  - [x] 6.3 Run `npm run lint` — passes (pre-existing onboarding.ts formatting warning unrelated to this story)
  - [x] 6.4 Run `npm run check` — passes (0 errors, 5 warnings: 4 pre-existing + 1 new consistent superForm(data) pattern)

## Dev Notes

### Critical: Reuse Patterns from Story 2.3 (Onboarding)

The profile page is essentially the **edit version** of onboarding's profile setup step. Reuse these exact patterns:

**Reusable from onboarding:**
- `AVAILABLE_TOPICS` from `$lib/constants/topics.ts` — same topic list, same pill-toggle UI pattern
- SuperForms + Zod form pattern (see `ProfileSetupStep.svelte` for reference)
- Topic selection component pattern: `$state` for `selectedTopics`, `$effect` to sync to `$form.topics`, hidden inputs for array submission
- Emotionally calibrated error messages

**DO NOT duplicate:**
- Do NOT copy `profileSetupSchema` from onboarding. Create a fresh `updateProfileSchema` in `$lib/schemas/profiles.ts`. The schema is similar but lives in its own feature file per architecture rules.
- Do NOT create a new topics constant file — import from existing `$lib/constants/topics.ts`

### Critical: Schema Definition — `$lib/schemas/profiles.ts`

```typescript
import { z } from 'zod'

export const updateProfileSchema = z.object({
  display_name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or less'),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional().default(''),
  avatar_url: z.url('Please enter a valid URL').optional().or(z.literal('')),
  topics: z.array(z.string()).default([])
})
```

**Critical:** Use `z.url()` (Zod v4 pattern), NOT `z.string().url()`. Confirmed working in Story 2.3.

**Critical:** Topics are optional at the Zod level (same for both roles). Sensei-specific min 1 enforcement is done server-side in the form action, exactly like onboarding's `complete_profile` action.

### Critical: Server Load + Action Pattern — `+page.server.ts`

```typescript
import { error, fail, redirect } from '@sveltejs/kit'
import { superValidate, message } from 'sveltekit-superforms'
import { zod4 as zod } from 'sveltekit-superforms/adapters'
import { updateProfileSchema } from '$lib/schemas/profiles'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(303, '/login')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('display_name, bio, avatar_url, topics, role, date_of_birth')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    error(500, "We're having trouble loading your profile. Please try again.")
  }

  const form = await superValidate(
    {
      display_name: profile.display_name ?? '',
      bio: profile.bio ?? '',
      avatar_url: profile.avatar_url ?? '',
      topics: profile.topics ?? []
    },
    zod(updateProfileSchema)
  )

  return { profile, form }
}

export const actions: Actions = {
  update_profile: async ({ request, locals: { supabase } }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(303, '/login')

    const formData = await request.formData()
    const form = await superValidate(formData, zod(updateProfileSchema))
    if (!form.valid) return fail(400, { form })

    // Sensei topic enforcement (same pattern as onboarding)
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
        topics: form.data.topics
      })
      .eq('id', user.id)

    if (error) {
      return message(form, "We're having trouble updating your profile. Please try again.", { status: 500 })
    }

    return message(form, 'Profile updated successfully!')
  }
}
```

**Critical:** Import `zod4 as zod` from `sveltekit-superforms/adapters` — confirmed working pattern from Stories 2.2 and 2.3.

**Critical:** On success, return `message(form, '...')` — do NOT redirect. User stays on profile page and sees toast/inline success message.

**Critical:** `bio` and `avatar_url` — save `null` when empty string, not empty string. Database expects nullable fields.

**Critical:** Do NOT include `updated_at` in the `.update()` payload — the `update_updated_at()` DB trigger (created in Story 2.2's migration) auto-sets `updated_at = now()` on every UPDATE.

### Critical: Profile Page UI — `+page.svelte`

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms'
  import { toast } from 'svelte-sonner'
  import * as Form from '$lib/components/ui/form'
  import { Input } from '$lib/components/ui/input'
  import { Textarea } from '$lib/components/ui/textarea'
  import { Button } from '$lib/components/ui/button'
  import { Badge } from '$lib/components/ui/badge'
  import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar'
  import { AVAILABLE_TOPICS } from '$lib/constants/topics'

  let { data } = $props()
  const sf = superForm(data.form, {
    onUpdated({ form }) {
      if (form.message) {
        if (form.valid) {
          toast.success(form.message)
        } else {
          toast.error(form.message)
        }
      }
    }
  })
  const { form, enhance, message, errors } = sf

  let selectedTopics = $state<string[]>($form.topics ?? [])

  $effect(() => {
    $form.topics = selectedTopics
  })
</script>
```

**Critical: Toast pattern** — Use `superForm`'s `onUpdated` callback to trigger Sonner toasts. When `form.valid` is true + message exists → `toast.success()`. When `form.valid` is false + message exists → `toast.error()`. This is the FIRST toast usage in the codebase — it establishes the pattern for all future toast usage. Import toast from `'svelte-sonner'` (the library), NOT from the shadcn `$lib/components/ui/sonner` (that exports only the `Toaster` component). The `Toaster` is already mounted in root `+layout.svelte`.

**Critical: Form.Field template** — Use this exact pattern for each editable field (display_name, bio, avatar_url). This is the established shadcn-svelte + SuperForms snippet pattern:

```svelte
<Form.Field form={sf} name="display_name">
  <Form.Control>
    {#snippet children({ props })}
      <Form.Label>Display Name</Form.Label>
      <Input {...props} type="text" placeholder="Your name" bind:value={$form.display_name} />
    {/snippet}
  </Form.Control>
  <Form.FieldErrors />
</Form.Field>

<Form.Field form={sf} name="bio">
  <Form.Control>
    {#snippet children({ props })}
      <Form.Label>Bio</Form.Label>
      <Textarea {...props} placeholder="Tell the community about yourself" bind:value={$form.bio} />
      <Form.Description>Optional. Max 500 characters.</Form.Description>
    {/snippet}
  </Form.Control>
  <Form.FieldErrors />
</Form.Field>

<Form.Field form={sf} name="avatar_url">
  <Form.Control>
    {#snippet children({ props })}
      <Form.Label>Photo URL</Form.Label>
      <Input {...props} type="text" placeholder="https://example.com/photo.jpg" bind:value={$form.avatar_url} />
      <Form.Description>Paste a link to your profile photo.</Form.Description>
    {/snippet}
  </Form.Control>
  <Form.FieldErrors />
</Form.Field>
```

**Critical:** The `{#snippet children({ props })}` pattern is REQUIRED — `props` must be spread onto the input element (`{...props}`) for accessibility and form binding. Do NOT skip this.

**Critical: Avatar display** — Use shadcn-svelte `Avatar` + `AvatarImage` + `AvatarFallback`. Show initials from display_name as fallback when no avatar_url. Avatar default size is `size-8` — use a larger size for the profile header (e.g., `class="size-20"`).

**Critical: Role badge** — Display role as a read-only `Badge` component. Senseis see "Sensei", learners see "Learner". NOT editable. Use `variant="secondary"` for subtle styling.

**Critical: Topic section** — Label contextually: "Your Expertise" for senseis, "Your Interests (optional)" for learners. Use `data.profile.role` to determine which label. Pattern identical to onboarding `ProfileSetupStep.svelte`:
```svelte
{#each selectedTopics as topic}
  <input type="hidden" name="topics" value={topic} />
{/each}

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
```

### Critical: Sidebar Update

**File:** `src/lib/components/layout/Sidebar.svelte`

Add `User` to the existing icon import and insert a Profile link between Dashboard and Settings:

```svelte
<script lang="ts">
  import { Home, Settings, User } from '@lucide/svelte';
</script>

<!-- Insert this <a> block BETWEEN the Dashboard and Settings links -->
<a
  href="/profile"
  class="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
>
  <User class="h-4 w-4" />
  Profile
</a>
```

**Critical:** Import from `@lucide/svelte` (scoped package) — NOT `lucide-svelte`. Use `User` (not `UserIcon`). Icon size `h-4 w-4` (not `h-5 w-5`). These match the existing `Home` and `Settings` pattern exactly.

**Note:** The sidebar currently has NO active link detection for any link. Do NOT add active-state styling for just the Profile link — that would be inconsistent. Active link detection for all sidebar links is a separate future enhancement.

### What NOT to Build in This Story

- **No public Sensei profile page** (`(public)/sensei/[id]/`) — that's a later feature for Epic 3+
- **No file upload for avatar** — URL text input for Phase 1. Supabase Storage not configured yet.
- **No style tags** (DJ, Sherpa, Provocateur) — Phase 2, Epic 10
- **No behavioral trust signals** (return rate, session extensions) — Phase 2, Epic 10
- **No role change** — role is set during onboarding and is READ-ONLY on profile page
- **No date of birth editing** — set during onboarding, read-only (display only if needed)
- **No password/email change** — that's account settings, not profile management
- **No avatar cropping/resizing** — future enhancement
- **No comprehensive RLS policies** — that's Story 2.5. Keep existing select/update own policies.
- **No E2E tests** — unit and component tests sufficient for this story
- **No constellation visualization** — Phase 2
- **No new database migration** — profiles table already has all needed columns from Stories 2.2 and 2.3

### Previous Story Intelligence

**From Story 2.3 (Age Verification & Onboarding — DONE):**
- `ProfileSetupStep.svelte` — reference implementation for the edit form (same fields: display_name, bio, avatar_url, topics)
- `profileSetupSchema` in `$lib/schemas/onboarding.ts` — reference for validation rules. Profile management schema is similar but in its own file.
- Topic selection UI: pill-toggle buttons with `$state` tracking and hidden input array submission — reuse this exact pattern
- SuperForms + Zod v4: `import { zod4 as zod } from 'sveltekit-superforms/adapters'`
- SuperForms `{#snippet children({ props })}` pattern for Form.Control
- `Form.Field`, `Form.Control`, `Form.Label`, `Form.FieldErrors` from shadcn-svelte form components
- Emotionally calibrated error messages pattern established
- 154 tests passing as baseline

**From Story 2.3 — Files to reference (NOT modify):**
- `src/lib/components/features/onboarding/ProfileSetupStep.svelte` — form pattern reference
- `src/lib/schemas/onboarding.ts` — schema pattern reference
- `src/lib/constants/topics.ts` — IMPORT this, don't recreate

**From Story 2.2 (User Registration & Login — DONE):**
- `handle_new_user()` trigger auto-creates profile on signup with OAuth display_name/avatar_url
- `update_updated_at()` trigger auto-sets `updated_at = now()` on every profile UPDATE — do NOT manually set `updated_at` in update payloads
- Profiles table has all needed columns (but `database.types.ts` is STALE — see Task 0)
- SuperForms `$form`, `$errors`, `$message` store syntax works in Svelte 5
- Custom Vite plugin `stubOptionalDeps()` handles barrel import issue — already in vite.config.ts

**From Story 2.1 (Auth Integration — DONE):**
- `hooks.server.ts` handles route protection — `(app)/profile/` is automatically protected
- Onboarding guard: users with `onboarding_complete: false` are redirected to `/onboarding` — profile page is only accessible after onboarding complete
- `auth.getUser()` on server always — never trust client session

**From Story 1.2 (Layouts — DONE):**
- `@testing-library/svelte/svelte5` alias for component tests
- `resolve.conditions: ['browser']` in vite.config.ts
- AppShell + Sidebar layout already wraps all `(app)` routes

### Git Intelligence

Recent commit pattern:
```
db25661 feat: story 2.3 — age verification & onboarding flow with code review fixes
fc0d42f feat: story 2.2 — user registration & login with code review fixes
faab1c8 feat: story 2.1 — Supabase auth integration, route guards, and code review fixes
```

Convention: `feat:` prefix with story reference. Branch: `master`.

### Project Structure Notes

**New files to create:**
```
src/
├── lib/
│   ├── schemas/
│   │   └── profiles.ts                              # updateProfileSchema
│   │   └── profiles.test.ts                          # Schema validation tests
├── routes/(app)/profile/
│   ├── +page.svelte                                  # Profile view/edit page
│   ├── +page.server.ts                               # Load function + update action
│   └── profile.test.ts                               # Form action tests
```

**Modified files:**
- `src/lib/database.types.ts` — regenerate via `npx supabase gen types` (Task 0 prerequisite)
- `src/lib/components/layout/Sidebar.svelte` — add Profile nav link

**Files to reference (NOT modify):**
- `src/lib/components/features/onboarding/ProfileSetupStep.svelte` — form pattern
- `src/lib/schemas/onboarding.ts` — schema pattern
- `src/lib/constants/topics.ts` — import AVAILABLE_TOPICS
- `src/lib/components/ui/` — shadcn-svelte components (Avatar, Badge, Form, Input, Textarea, Button)

### Architecture Compliance Checklist

- [x] Profile page at `(app)/profile/` — requires authentication (handled by hooks.server.ts)
- [x] Zod schema in `$lib/schemas/profiles.ts` — direct export, no barrel
- [x] No custom components placed in `ui/` — profile components go in `features/profiles/` if extracted
- [x] SuperForms for form handling — `$form`, `$errors`, `$message`
- [x] `auth.getUser()` in load function and form action
- [x] Error messages emotionally calibrated
- [x] Svelte 5 only: `$state`, `$props`, `$derived`, `$effect` — NO Svelte 4
- [x] snake_case pass-through for all database data
- [x] No barrel exports
- [x] No `$lib/server/` imports from client code
- [x] TypeScript strict mode
- [x] Tests co-located: `*.test.ts` next to source
- [x] All existing 154+ tests pass (zero regressions) + new tests
- [x] Build, lint, check all pass
- [x] Sonner toast for success feedback (already integrated globally)
- [x] Topics: required for sensei (min 1 server-side), optional for learner
- [x] Role is READ-ONLY on profile page
- [x] Avatar: URL input (no file upload in Phase 1)
- [x] Pre-fill all form fields from current profile data
- [x] Profile load failure handled with emotionally calibrated error page
- [x] `database.types.ts` regenerated with `topics` and `date_of_birth` columns present
- [x] `<svelte:head>` with page title set
- [x] Topic section uses role-contextual label ("Your Expertise" vs "Your Interests")
- [ ] Optional: SuperForms `tainted` field detection for unsaved-changes warning (nice-to-have, not required)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.4 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/prd.md — FR4 Profile management, FR5 Sensei topics, FR13 Learner interests]
- [Source: _bmad-output/planning-artifacts/architecture.md — SuperForms v2.29.1, Zod schema pattern, component structure]
- [Source: _bmad-output/planning-artifacts/architecture.md — Route: (app)/profile/, Schema: $lib/schemas/profiles.ts]
- [Source: _bmad-output/planning-artifacts/architecture.md — Component: features/profiles/, Avatar+Card components]
- [Source: _bmad-output/planning-artifacts/architecture.md — Error handling: emotionalContext, warm messages]
- [Source: _bmad-output/planning-artifacts/architecture.md — State management: Svelte 5 runes, no Svelte 4]
- [Source: _bmad-output/project-context.md — All 45 rules: naming, auth, testing, anti-patterns]
- [Source: _bmad-output/implementation-artifacts/2-3-age-verification-and-onboarding-flow.md — Previous story patterns and learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 0: Regenerated `database.types.ts` via `npx supabase gen types typescript --local` after DB reset. Confirmed `topics` (string[] | null) and `date_of_birth` (string | null) present in profiles Row/Insert/Update types.
- Task 1: Created `src/lib/schemas/profiles.ts` with `updateProfileSchema` using Zod v4 patterns (`z.url()`, `z.array(z.string()).default([])`). 18 unit tests all passing.
- Task 2: Created `src/routes/(app)/profile/+page.server.ts` with `load` (fetch profile + superValidate pre-fill) and `update_profile` action (Zod validation, sensei topic enforcement server-side, emotionally calibrated messages). 12 unit tests all passing.
- Task 3: Created `src/routes/(app)/profile/+page.svelte` with Avatar+Badge header, SuperForms edit form, Sonner toast integration (`onUpdated` callback pattern), pill-toggle topics with role-contextual labels, `<svelte:head>` title. All Svelte 5 runes.
- Task 4: Updated `Sidebar.svelte` — added `User` icon import from `@lucide/svelte`, inserted Profile link between Dashboard and Settings with matching styles.
- Task 5: Tests co-located: `profiles.test.ts` (18 tests) + `profile.test.ts` (12 tests) = 30 new tests. No Playwright imports.
- Task 6: Build, test (185 pass), lint (clean on new files), check (0 errors, 5 warnings) all verified.
- Code Review Fixes (Claude Opus 4.6):
  - H1: Removed dead inline error block (`!$form` always false) — toast handles all messages
  - M1: Added role-fetch error handling in `update_profile` action — prevents silent bypass of sensei topic enforcement + 1 new test
  - L2: Added `(key)` to both `{#each}` blocks for topics
  - L3: Added `submitting` disabled state + "Saving..." text to submit button
  - L1: Checked off architecture compliance checklist in story
  - M2: Corrected Task 6.4 warning count claim (4 pre-existing + 1 new)

### Change Log

- 2026-02-10: Story created by SM agent (Claude Opus 4.6) — ultimate context engine analysis completed
- 2026-02-10: Validation review by SM agent (Claude Opus 4.6) — 3 critical, 4 enhancements, 3 optimizations applied: fixed @lucide/svelte import (C1), added Task 0 for stale database.types.ts regeneration (C2), exact sidebar classes/pattern (C3), toast first-usage guidance (E1), updated_at trigger note (E2), complete Form.Field template (E3), svelte:head page title (E4), role-contextual topic labels (O1), tainted form detection note (O2), profile load error handling (O3)
- 2026-02-11: Implementation by Dev agent (Claude Opus 4.6) — all 7 tasks completed (Tasks 0-6), 30 new tests added (184 total passing), build/lint/check all green
- 2026-02-11: Code review by Dev agent (Claude Opus 4.6) — 6 issues found (1H, 2M, 3L), all fixed: dead inline error block removed, role-fetch error handling added, submit button loading state, each-block keys, compliance checklist checked, warning count corrected. 185 tests passing.

### File List

**New files:**
- `src/lib/schemas/profiles.ts` — updateProfileSchema (Zod v4)
- `src/lib/schemas/profiles.test.ts` — 18 schema unit tests
- `src/routes/(app)/profile/+page.server.ts` — load + update_profile action
- `src/routes/(app)/profile/+page.svelte` — profile view/edit UI
- `src/routes/(app)/profile/profile.test.ts` — 12 server action unit tests

**Modified files:**
- `src/lib/database.types.ts` — regenerated with topics + date_of_birth columns
- `src/lib/components/layout/Sidebar.svelte` — added Profile nav link with User icon
