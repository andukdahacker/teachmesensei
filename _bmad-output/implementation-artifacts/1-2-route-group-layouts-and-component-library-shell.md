# Story 1.2: Route Group Layouts & Component Library Shell

Status: review

## Story

As a developer,
I want the four route groups and layout shells configured,
So that all future features have consistent navigation and layout infrastructure.

## Acceptance Criteria

1. **Given** the SvelteKit project exists from Story 1.1
   **When** I create the route group structure
   **Then** four route groups exist: `(public)`, `(app)`, `(admin)`, `(enterprise)`

2. **Given** route groups are created
   **When** I visit a `(public)` route
   **Then** `PublicShell` layout renders with basic navigation and footer

3. **Given** route groups are created
   **When** I visit an `(app)` route
   **Then** `AppShell` layout renders with sidebar placeholder

4. **Given** route groups are created
   **When** I visit `(admin)` or `(enterprise)` routes
   **Then** empty shell layouts render with placeholder pages

5. **Given** route groups are created
   **When** I visit the `(public)` landing page
   **Then** a basic placeholder landing page renders

6. **Given** shadcn-svelte is initialized from Story 1.1
   **When** I install the required components
   **Then** `Button`, `Card`, `Input`, `Dialog`, `Skeleton`, `Sonner`, `Avatar`, `Badge` components exist in `$lib/components/ui/`

7. **Given** all layouts are created
   **When** I run `npm run build` and `npm run dev`
   **Then** all layouts render without errors

> **Note:** The epic AC also states "global styles and Tailwind directives are configured in `app.css`" — this was completed in Story 1.1. No additional `app.css` work is needed in this story.

## Tasks / Subtasks

- [x] Task 1: Create route group directory structure (AC: #1)
  - [x] 1.1 Create `src/routes/(public)/` directory with `+layout.svelte` and `+page.svelte`
  - [x] 1.2 Create `src/routes/(app)/` directory with `+layout.svelte` (NO root `+page.svelte` — see Dev Notes on route conflicts)
  - [x] 1.3 Create `src/routes/(admin)/` directory with `+layout.svelte` (NO root `+page.svelte`)
  - [x] 1.4 Create `src/routes/(enterprise)/` directory with `+layout.svelte` (NO root `+page.svelte`)
  - [x] 1.5 Move current root `+page.svelte` content into `(public)/+page.svelte` as the landing page placeholder
  - [x] 1.6 Delete `src/routes/+page.svelte` — it conflicts with `(public)/+page.svelte` since both resolve to `/`. The root `+layout.svelte` stays.

- [x] Task 2: Install shadcn-svelte components (AC: #6)
  - [x] 2.1 Install `Button` component: `npx shadcn-svelte@latest add button --yes`
  - [x] 2.2 Install `Card` component: `npx shadcn-svelte@latest add card --yes`
  - [x] 2.3 Install `Input` component: `npx shadcn-svelte@latest add input --yes`
  - [x] 2.4 Install `Dialog` component: `npx shadcn-svelte@latest add dialog --yes`
  - [x] 2.5 Install `Skeleton` component: `npx shadcn-svelte@latest add skeleton --yes`
  - [x] 2.6 Install `Sonner` component: `npx shadcn-svelte@latest add sonner --yes`
  - [x] 2.7 Install `Avatar` component: `npx shadcn-svelte@latest add avatar --yes`
  - [x] 2.8 Install `Badge` component: `npx shadcn-svelte@latest add badge --yes`
  - [x] 2.9 Verify all components exist in `src/lib/components/ui/` with correct structure

- [x] Task 3: Create layout shell components (AC: #2, #3, #4)
  - [x] 3.1 Create `src/lib/components/layout/` directory
  - [x] 3.2 Create `PublicShell.svelte` — basic nav (logo + nav links) + content slot + footer
  - [x] 3.3 Create `AppShell.svelte` — sidebar placeholder + main content area
  - [x] 3.4 Create `Nav.svelte` — top navigation bar for public pages
  - [x] 3.5 Create `Footer.svelte` — simple footer for public pages
  - [x] 3.6 Create `Sidebar.svelte` — sidebar placeholder for app pages (links TBD in later stories)

- [x] Task 4: Wire layouts to route groups (AC: #2, #3, #4)
  - [x] 4.1 `(public)/+layout.svelte` — imports and renders `PublicShell`
  - [x] 4.2 `(app)/+layout.svelte` — imports and renders `AppShell`
  - [x] 4.3 `(admin)/+layout.svelte` — minimal placeholder layout with "Admin" heading (no shell component yet — architecture says no layout chrome until Phase 1.5+)
  - [x] 4.4 `(enterprise)/+layout.svelte` — minimal placeholder layout with "Enterprise" heading (same rationale)

- [x] Task 5: Create placeholder pages (AC: #4, #5)
  - [x] 5.1 `(public)/+page.svelte` — landing page placeholder with welcome content (owns the `/` route)
  - [x] 5.2 `(app)/dashboard/+page.svelte` — placeholder dashboard page at `/dashboard`
  - [x] 5.3 `(admin)/admin/+page.svelte` — placeholder at `/admin` with "Admin dashboard coming soon"
  - [x] 5.4 `(enterprise)/enterprise/+page.svelte` — placeholder at `/enterprise` with "Enterprise features coming soon"

- [x] Task 6: Add Sonner toast provider to root layout (AC: #6)
  - [x] 6.1 Import `Toaster` from `$lib/components/ui/sonner` in root `+layout.svelte`
  - [x] 6.2 Add `<Toaster />` component to root layout so toasts work app-wide

- [x] Task 7: Verify build and rendering (AC: #7)
  - [x] 7.1 Run `npm run build` — must complete without errors
  - [x] 7.2 Run `npm run dev` and verify each route group renders its layout
  - [x] 7.3 Verify `(public)` route shows PublicShell (nav + footer)
  - [x] 7.4 Verify `(app)` route shows AppShell (sidebar placeholder)
  - [x] 7.5 Verify `(admin)` and `(enterprise)` routes show placeholder layouts

## Dev Notes

### CRITICAL: Route Group + Root Page Interaction

SvelteKit route groups are URL-transparent: `(public)/+page.svelte` maps to `/`, same as a root `+page.svelte`. You **cannot** have both `src/routes/+page.svelte` AND `src/routes/(public)/+page.svelte` — they conflict for the `/` route.

**Solution:** Remove `src/routes/+page.svelte` and put the landing page at `src/routes/(public)/+page.svelte`. The root `+layout.svelte` stays at `src/routes/+layout.svelte` (it's the global layout wrapping all route groups).

### Route Group Layout Hierarchy

```
src/routes/+layout.svelte          ← Root layout (global: CSS, favicon, Toaster)
├── (public)/+layout.svelte        ← PublicShell (nav + footer)
│   └── (public)/+page.svelte      ← Landing page (/)
├── (app)/+layout.svelte           ← AppShell (sidebar)
│   └── (app)/dashboard/+page.svelte ← Dashboard (/dashboard)
├── (admin)/+layout.svelte         ← Minimal placeholder
│   └── (admin)/admin/+page.svelte ← Placeholder (/admin)
└── (enterprise)/+layout.svelte    ← Minimal placeholder
    └── (enterprise)/enterprise/+page.svelte ← Placeholder (/enterprise)
```

**Important:** `(app)/+page.svelte` maps to `/` too, which conflicts with `(public)/+page.svelte`. To avoid this, the `(app)` route group should NOT have a `+page.svelte` at its root. Instead, use a nested path. The correct approach:

```
src/routes/(app)/dashboard/+page.svelte  → /dashboard
src/routes/(admin)/admin/+page.svelte    → /admin
src/routes/(enterprise)/enterprise/+page.svelte → /enterprise
```

The `(public)/+page.svelte` owns the `/` route. Other route groups need nested paths to avoid conflict.

### Architecture Doc Route Conflict — Intentional Deviation

The architecture document's directory tree (lines 901-963) shows `(admin)/dashboard/+page.svelte` and `(app)/dashboard/+page.svelte`. Both resolve to `/dashboard` — this is a **build-breaking route conflict** in SvelteKit. This story resolves it by using `(admin)/admin/` and `(enterprise)/enterprise/` as nested path prefixes. **Do NOT "correct" this back to the architecture doc's structure.**

### Layout Shell Components — What to Build

**`PublicShell.svelte`** — Public-facing layout:
- Top nav bar with: logo/brand text (left), nav links placeholder (right)
- Main content area (children slot)
- Footer with basic copyright text
- Uses Tailwind for styling, shadcn `Button` for nav items if needed
- Mobile-responsive: nav links collapse on small screens (can be a simple responsive hide/show, no hamburger menu needed yet)

**`AppShell.svelte`** — Authenticated app layout:
- Sidebar on left (desktop) with placeholder navigation links
- Main content area taking remaining width
- No auth checks in the layout component itself — auth is handled in `hooks.server.ts` (Story 2.1)
- Sidebar should use a basic flex layout. The shadcn `Sidebar` component can be installed later if needed.
- Sidebar CSS variables are already configured in `app.css` (`--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`, `--sidebar-ring`) with light/dark mode values. Use Tailwind classes like `bg-sidebar`, `text-sidebar-foreground` for consistent theming.
- `@lucide/svelte` icons are already installed (`^0.563.1` from Story 1.1). Use Lucide icons for placeholder nav items in Nav and Sidebar components (e.g., `import { Home, Settings } from '@lucide/svelte'`).

**`(admin)` and `(enterprise)` layouts** — Per architecture: "No layout chrome built until features populate them in Phase 1.5+". These are **empty shells** — just a minimal wrapper with a heading. Do NOT build nav/sidebar for these yet.

### shadcn-svelte Component Installation

Run each install command separately. The CLI will create component directories under `src/lib/components/ui/`:

```bash
npx shadcn-svelte@latest add button --yes
npx shadcn-svelte@latest add card --yes
npx shadcn-svelte@latest add input --yes
npx shadcn-svelte@latest add dialog --yes
npx shadcn-svelte@latest add skeleton --yes
npx shadcn-svelte@latest add sonner --yes
npx shadcn-svelte@latest add avatar --yes
npx shadcn-svelte@latest add badge --yes
```

**Use `--yes` to skip interactive prompts** — Story 1.1 learned that interactive CLI prompts block automation.

Each command will auto-install peer dependencies. Expect these additions to `package.json`:
- `bits-ui` — headless UI primitives (used by Dialog, Avatar, etc.)
- `svelte-sonner` — toast notification library (used by Sonner)
- `label` component may auto-install as a dependency of `input`

After all installs, `src/lib/components/ui/` will contain the 8 requested directories plus any auto-installed dependencies (e.g., `label/`). This is expected — do NOT delete auto-installed components.

**DO NOT** manually create component files — always use the CLI. The CLI generates Svelte 5 runes-compatible components with correct Tailwind v4 styling.

### Sonner Toast Integration

After installing the `sonner` component, the root `+layout.svelte` needs the `Toaster` provider:

```svelte
<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import { Toaster } from '$lib/components/ui/sonner';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
<Toaster />
```

### Svelte 5 Layout Pattern

All layouts MUST use Svelte 5 runes syntax. Pattern for route group layouts:

```svelte
<script lang="ts">
  import PublicShell from '$lib/components/layout/PublicShell.svelte';
  let { children } = $props();
</script>

<PublicShell>
  {@render children()}
</PublicShell>
```

**NEVER** use Svelte 4 `<slot />` — always use `{@render children()}` with `$props()`.

### Component Snippet Pattern (Svelte 5)

Shell components accepting content use the Svelte 5 `Snippet` type:

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>

<div>
  {@render children()}
</div>
```

### What NOT to Build in This Story

- **No auth guards** — `hooks.server.ts` auth middleware belongs to Story 2.1
- **No `+layout.server.ts` files** — server-side data loading for layouts belongs to Story 2.1+
- **No real navigation links** — just placeholder text/structure. Actual links come with feature pages
- **No hamburger menu** — mobile nav complexity is deferred
- **No shadcn `Sidebar` component** — use a simple div-based sidebar. The shadcn sidebar can be installed later if the team decides it's needed
- **No `navigation-menu`** — overkill for placeholders. Basic nav links are sufficient.
- **No dark mode toggle** — dark mode CSS vars exist in `app.css` but the toggle UI is not in scope

### Architecture Compliance Checklist

- [x] Route groups: `(public)`, `(app)`, `(admin)`, `(enterprise)` created
- [x] `(public)/+layout.svelte` uses `PublicShell` component
- [x] `(app)/+layout.svelte` uses `AppShell` component
- [x] `(admin)` and `(enterprise)` are empty shells — minimal header only, no nav/sidebar/footer chrome
- [x] Shell components live in `$lib/components/layout/` (NOT in `ui/` or `features/`)
- [x] All shadcn components installed via CLI (NOT manually created)
- [x] shadcn components in `$lib/components/ui/` ONLY
- [x] No custom components mixed into `$lib/components/ui/`
- [x] Svelte 5 runes used everywhere (`$props()`, `{@render children()}`)
- [x] No Svelte 4 patterns (`<slot />`, `export let`, `$:`, `writable()`)
- [x] No barrel exports added
- [x] Builds without errors

### Project Structure After This Story

```
src/
├── app.css                          # (unchanged) Global styles + Tailwind + OKLCH tokens
├── app.d.ts                         # (unchanged)
├── app.html                         # (unchanged)
├── lib/
│   ├── assets/
│   │   └── favicon.svg              # (unchanged)
│   ├── components/
│   │   ├── layout/                  # NEW — shell components
│   │   │   ├── AppShell.svelte
│   │   │   ├── PublicShell.svelte
│   │   │   ├── Nav.svelte
│   │   │   ├── Footer.svelte
│   │   │   └── Sidebar.svelte
│   │   └── ui/                      # POPULATED — shadcn components
│   │       ├── avatar/
│   │       ├── badge/
│   │       ├── button/
│   │       ├── card/
│   │       ├── dialog/
│   │       ├── input/
│   │       ├── skeleton/
│   │       └── sonner/
│   ├── hooks/                       # (unchanged, empty)
│   ├── index.test.ts                # (unchanged)
│   ├── index.ts                     # (unchanged)
│   └── utils.ts                     # (unchanged)
├── routes/
│   ├── +layout.svelte               # MODIFIED — add Toaster
│   ├── (public)/
│   │   ├── +layout.svelte           # NEW — PublicShell wrapper
│   │   └── +page.svelte             # NEW — landing page placeholder (was root +page.svelte)
│   ├── (app)/
│   │   ├── +layout.svelte           # NEW — AppShell wrapper
│   │   └── dashboard/
│   │       └── +page.svelte         # NEW — placeholder dashboard
│   ├── (admin)/
│   │   ├── +layout.svelte           # NEW — minimal placeholder
│   │   └── admin/
│   │       └── +page.svelte         # NEW — placeholder
│   └── (enterprise)/
│       ├── +layout.svelte           # NEW — minimal placeholder
│       └── enterprise/
│           └── +page.svelte         # NEW — placeholder
```

**Root `+page.svelte`:** REMOVED (landing page moved to `(public)/+page.svelte`)

### Previous Story Intelligence (Story 1.1)

Key learnings from Story 1.1 implementation:
- `sv create` interactive addons were problematic — may need `--yes` or explicit flags for shadcn CLI too
- `shadcn-svelte init` required all alias flags to avoid interactive prompts: same applies to `add` commands — use `--yes` flag if available
- Tailwind v4 uses `@import "tailwindcss"` and `@theme` directive — already configured in `app.css`
- Architecture doc shows `tailwind.config.ts` in directory tree — **this file does NOT exist** and should never be created (Tailwind v4)
- `prettier-plugin-svelte` is v3.4.1 (not v4.x) — be aware for formatting

### Git Intelligence

Recent commit: `feat: story 1.1 — SvelteKit scaffold with Supabase, shadcn-svelte, and tooling`
- 31 files created establishing the full project scaffold
- `components.json` configured with correct aliases
- `src/lib/components/ui/` directory created (empty, awaiting component installs)
- `src/lib/utils.ts` has `cn()` utility
- Root layout uses `$props()` runes pattern

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Route structure, lines 383, 460-462]
- [Source: _bmad-output/planning-artifacts/architecture.md — Layout components, lines 850-855]
- [Source: _bmad-output/planning-artifacts/architecture.md — shadcn component inventory, lines 285-300]
- [Source: _bmad-output/planning-artifacts/architecture.md — Component boundaries, lines 1026-1035]
- [Source: _bmad-output/planning-artifacts/architecture.md — Directory structure, lines 901-963]
- [Source: _bmad-output/planning-artifacts/architecture.md — Frontend architecture decisions, lines 453-462]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1, Story 1.2, lines 368-385]
- [Source: _bmad-output/project-context.md — Component boundaries, architecture patterns]
- [Source: _bmad-output/implementation-artifacts/1-1-repository-setup-and-sveltekit-scaffold.md — Previous story learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Svelte 5 component testing required `resolve.conditions: ['browser']` in vite.config.ts to force client bundle resolution in jsdom
- `@testing-library/svelte/svelte5` alias required for Svelte 5 runes compatibility
- shadcn CLI `dialog` install added `bits-ui` (13 packages); `sonner` install added `svelte-sonner` (6 packages)
- `tw-animate-css` produces harmless CSS warning: `"file" is not a known CSS property` — not from our code

### Completion Notes List

- All 7 tasks and 31 subtasks completed
- 4 route groups created: `(public)`, `(app)`, `(admin)`, `(enterprise)`
- 5 layout shell components: `PublicShell`, `AppShell`, `Nav`, `Footer`, `Sidebar` in `$lib/components/layout/`
- 8 shadcn components installed via CLI: button, card, input, dialog, skeleton, sonner, avatar, badge
- Toaster provider added to root layout
- Root `+page.svelte` deleted; landing page at `(public)/+page.svelte`
- Route conflict resolved: `(app)/dashboard/`, `(admin)/admin/`, `(enterprise)/enterprise/` nested paths
- Component tests added: Nav (2 tests), Footer (1 test), Sidebar (4 tests) — all passing
- Vitest configured for Svelte 5 component testing with jsdom + browser conditions
- Dev dependencies added: `@testing-library/svelte`, `@testing-library/jest-dom`, `jsdom`
- `npm run build` passes; all 10 tests pass (2 existing + 8 new)

### Change Log

- 2026-02-08: Story created by SM agent — ultimate context engine analysis completed
- 2026-02-08: Quality review applied — 9 improvements across 3 categories (3 critical, 4 enhancements, 2 optimizations)
- 2026-02-08: Implementation complete — all tasks done, 9/9 tests passing, build clean
- 2026-02-08: Code review — 9 findings (3 critical, 3 medium, 3 low), all fixes applied: Settings href fix, Settings href test added, resolve.conditions commented, stale diagram updated, compliance checklist checked, sprint-status.yaml added to file list. 10/10 tests passing.

### File List

New files:
- src/routes/(public)/+layout.svelte
- src/routes/(public)/+page.svelte
- src/routes/(app)/+layout.svelte
- src/routes/(app)/dashboard/+page.svelte
- src/routes/(admin)/+layout.svelte
- src/routes/(admin)/admin/+page.svelte
- src/routes/(enterprise)/+layout.svelte
- src/routes/(enterprise)/enterprise/+page.svelte
- src/lib/components/layout/PublicShell.svelte
- src/lib/components/layout/AppShell.svelte
- src/lib/components/layout/Nav.svelte
- src/lib/components/layout/Footer.svelte
- src/lib/components/layout/Sidebar.svelte
- src/lib/components/layout/Nav.test.ts
- src/lib/components/layout/Footer.test.ts
- src/lib/components/layout/Sidebar.test.ts
- src/lib/components/ui/button/ (shadcn CLI)
- src/lib/components/ui/card/ (shadcn CLI)
- src/lib/components/ui/input/ (shadcn CLI)
- src/lib/components/ui/dialog/ (shadcn CLI)
- src/lib/components/ui/skeleton/ (shadcn CLI)
- src/lib/components/ui/sonner/ (shadcn CLI)
- src/lib/components/ui/avatar/ (shadcn CLI)
- src/lib/components/ui/badge/ (shadcn CLI)

Modified files:
- src/routes/+layout.svelte (added Toaster import and component)
- vite.config.ts (added jsdom environment, Svelte 5 testing config)
- package.json (shadcn peer deps + testing libs)
- package-lock.json
- _bmad-output/implementation-artifacts/sprint-status.yaml (status → review)

Deleted files:
- src/routes/+page.svelte (moved to (public)/+page.svelte)
