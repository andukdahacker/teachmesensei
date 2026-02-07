---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2026-02-07'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/product-brief-teachmesensei-2026-02-05.md'
  - '_bmad-output/planning-artifacts/research/market-online-tutoring-mentorship-research-2026-02-05.md'
  - '_bmad-output/analysis/brainstorming-session-2026-02-05.md'
  - '_bmad-output/analysis/brainstorming-session-2026-02-06.md'
workflowType: 'architecture'
project_name: 'TeachMeSensei'
user_name: 'Ducdo'
date: '2026-02-06'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Table of Contents

1. [Implementation Roadmap](#implementation-roadmap)
2. [Project Context Analysis](#project-context-analysis)
3. [Starter Template Evaluation](#starter-template-evaluation)
4. [Core Architectural Decisions](#core-architectural-decisions)
5. [Implementation Patterns & Consistency Rules](#implementation-patterns--consistency-rules)
6. [Project Structure & Boundaries](#project-structure--boundaries)
7. [Architecture Validation Results](#architecture-validation-results)

## Implementation Roadmap

**Step 0: Repository Setup**
- Create GitHub repo, `.gitignore`, `.env.example`
- GitHub Actions CI pipeline skeleton (lint, types, test, build)
- README with local dev setup instructions

**Step 1: Project Scaffold**
- `npx sv create teachmesensei` (TypeScript, Tailwind, ESLint, Prettier, Vitest, Playwright)
- Install `@supabase/supabase-js` + `@supabase/ssr`
- `npx supabase init` + `npx shadcn-svelte@latest init`
- Configure `adapter-node` in `svelte.config.js`
- Create `Dockerfile` for Railway

**Step 2: Auth Integration**
- `hooks.server.ts` + `+layout.ts` (Supabase browser client)
- First integration test: "server-side hook resolves authenticated session"
- OAuth providers: Google + GitHub + Magic Link
- Route guard middleware in hooks

**Step 3: Database Schema + RLS**
- Initial migrations (users, profiles, sessions, consent)
- RLS policies with data isolation tests
- `supabase gen types` automation (CI step + git hook)

**Step 4: Component Library + Layout**
- shadcn-svelte components, AppShell, PublicShell
- Route group layouts: `(public)`, `(app)`, `(admin)` shell, `(enterprise)` shell

**Step 5: Production Deploy**
- `/health` endpoint
- Railway deployment config
- Environment variables in Railway

**Step 6: Real-Time Infrastructure**
- `$lib/realtime.ts` subscription manager
- Presence and Broadcast channel patterns

**Step 7: Edge Functions + Job Queue**
- Job queue table + Edge Function patterns
- AI pipeline skeleton (process-recording → transcribe → summarize)

**Step 8: CI/CD Pipeline**
- GitHub Actions: lint, types, unit, RLS, Edge Function, build
- Playwright E2E + axe-core accessibility
- Railway auto-deploy on merge to main

**Step 9: Polar.sh Integration (Phase 2)**
- Polar.sh webhook endpoint + payment flows (learner-pays-platform only)
- FR49 (Flash Help micro-transactions), FR51 (refunds), subscriptions, team plans
- FR50 (Sensei payouts) deferred to Phase 3+ — Senseis volunteer per core positioning

**Note:** Steps 0-9 cover Phase 1 implementation. Phase 1.5 (Team & Enterprise enablement — populating org_id/team_id, team creation flows) and Phase 2 (Flash Help matching, Payments, Trust & Reputation) are separate roadmap exercises during epic/story planning.

## Project Context Analysis

### Requirements Overview

**Functional Requirements (78 FRs across 15 capability groups):**

| Capability Group | FR Range | Phase | Architectural Weight |
|---|---|---|---|
| Identity & Access | FR1-FR6 | 1 | Foundation — auth, roles, RLS |
| Sensei Management | FR7-FR12 | 1 | Invite system, availability, profile |
| Learner Management | FR13-FR14 | 1 | Lightweight — session history, connections |
| Session Scheduling | FR15-FR20 | 1 | Timezone handling, email notifications |
| Video Sessions | FR21-FR26 | 1 | Daily.co integration, recording lifecycle, consent state machine |
| AI-Powered Session Notes | FR27-FR33 | 1 | Async pipeline — heaviest backend complexity |
| Flash Help & AI Triage | FR34-FR41 | 2 | Real-time matching event sequence, AI emotional detection, warm-hold |
| Trust & Reputation | FR42-FR45 | 2 | Behavioral signal aggregation |
| Safety & Moderation | FR46-FR48 | 2 | Flag taxonomy, no-show detection |
| Payments | FR49, FR51 | 2 | Polar.sh (Merchant of Record), micro-transactions. FR50 (Sensei payouts) deferred to Phase 3+ |
| Constellation & Growth | FR52-FR54 | 2 | Graph data model (nodes + edges), visualization (d3/Threlte) |
| Admin Operations | FR55-FR58 | 1-2 | Aggregate dashboard, flag management |
| Data Privacy & Ownership | FR59-FR61 | 1 | GDPR deletion, portability, consent state machine |
| Team & Enterprise Management | FR62-FR74 | 1.5-3 | Multi-tenancy, team/org hierarchy, billing, pre-aggregated dashboards |
| Enterprise Intelligence | FR75-FR78 | 3-4 | Heat map (materialized views), coaching analysis, retention signals |

**Non-Functional Requirements driving architecture:**

- **Performance:** Public pages <2s (CDN), app interactions <500ms, matching <60s, video join <3s, AI notes <30min
- **Security:** TLS 1.2+, AES-256 at rest, signed URLs for recordings, RLS on all tables, escalation protocol for transcript access
- **Multi-tenancy:** Org-level and team-level data isolation via Supabase RLS — same infrastructure, logical separation
- **Scalability:** Phase 1: 10 pairs → Phase 2: 100 users + 50-person teams → Phase 4: 500-person orgs
- **Reliability:** 99.5% uptime, >99% video completion, graceful degradation (never show error to vulnerable user)
- **Enterprise SSO:** SAML deferred to Phase 4 (Supabase Auth supports it natively)

**Scale & Complexity:**

- Primary domain: Full-stack web application (SvelteKit SSR/SPA hybrid)
- Complexity level: Medium-high
- Estimated architectural components: ~14 major subsystems (auth, profiles, scheduling, video orchestration, AI pipeline, real-time matching, payments, trust signals, admin dashboard, team/org management, constellation visualization, notification pipeline, job queue, enterprise reporting/aggregation)

### Technical Constraints & Dependencies

| Constraint | Source | Impact |
|---|---|---|
| Solo developer | Resource reality | Every choice must maximize shipping speed; managed services over custom infra |
| SvelteKit + Supabase | PRD tech stack decision | Full-stack framework + managed BaaS; no separate API server |
| Supabase Singapore | Data residency | 300-400ms for US users — acceptable for MVP, optimize at scale |
| Daily.co for video | PRD tech stack decision | WebRTC handled externally; platform orchestrates rooms/recordings |
| Polar.sh for payments | Merchant of Record | Polar.sh handles tax/VAT globally (4% + $0.40/txn); learner-pays-platform only (Phase 2). Sensei payouts deferred to Phase 3+ — not needed for core "mentorship community, not marketplace" positioning |
| Whisper + LLM APIs | AI pipeline | External API dependency; async processing with persistent queue required |
| 90-day video retention | Privacy policy | Supabase Storage lifecycle expiration; explicit save to override |

### Cross-Cutting Concerns Identified

1. **Row-Level Security (RLS) + Data Isolation Testing** — The single most critical architectural pattern. Every table, every query must respect role-based boundaries: learner → own data, Sensei → own learners, team lead → team aggregates, org admin → org aggregates, platform admin → cross-org metrics. B2B multi-tenancy is layered on the same RLS infrastructure. **Every RLS policy must have a corresponding data-isolation test that verifies a user in role X cannot access data belonging to role Y. These tests run on every migration.** A single missing policy on a platform handling emotionally vulnerable and enterprise-confidential data is catastrophic.

2. **AI Processing Pipeline (Plugin Architecture)** — Shared infrastructure for post-session processing, designed as an extensible processing chain: recording → transcription (Whisper) → [processing steps] → delivery. Phase 1 processing steps: summarization only. Phase 2+: emotional detection, coaching pattern tagging. Phase 4: coaching mirror analysis, retention signal detection. The plugin architecture ensures intelligence layers slot in without re-architecting the pipeline. **Resilience requirement:** Postgres-backed job queue for async processing, resilient to multi-hour external API outages (not just transient failures). If Whisper goes down for 4 hours, queued jobs retry automatically when service restores — no session notes are permanently lost.

3. **Real-Time Communication (Multi-Pattern)** — Supabase Realtime WebSockets serve multiple patterns:
   - **Flash Help matching:** Multi-step event sequence — "searching" → "found match" → "Sensei profile data" → "connecting" → "live." 4-5 incremental state transitions required for the UX to feel alive, not dead.
   - **Sensei presence/availability:** Live status for matching and dashboard.
   - **Admin/manager dashboards:** Live updates for session counts, flags, team activity.
   - **Job queue triggers:** Realtime subscriptions on job status for pipeline monitoring.

4. **Multi-Tenancy (Phase 1 Schema, Phase 1.5 Features)** — Org → Team → User hierarchy. **Critical design decision:** `org_id` and `team_id` columns are added to relevant tables in Phase 1 (nullable). Phase 1.5 populates them — no migration required. RLS policies in Phase 1 gracefully handle null org/team (B2C user = no org). This prevents a schema migration at the Phase 1 → 1.5 boundary.

5. **Consent State Machine** — Video recording consent is not a boolean flag. It requires a state machine with audit trail: consent_given → recording_active → consent_withdrawn (triggers recording deletion) → consent_expired (90-day lifecycle). Per-participant, per-session. Must support retroactive deletion if consent is withdrawn post-session. Audit log captures every state transition for legal compliance.

6. **Notification Pipeline** — Unified notification service handling 6+ notification types across multiple channels:
   - Email: session confirmations, reminders, AI note delivery, flag alerts
   - In-app: matching status, nudges, admin alerts, team activity
   - Future: push notifications, Slack integration
   - Architecture: single notification dispatch service with channel adapters, template system, and delivery tracking.

7. **Pre-Aggregated Data & Background Jobs** — Enterprise dashboards (heat map, team comparisons, org-wide metrics) and the constellation visualization require pre-computed data. Computing from raw session data on each request is too slow and expensive. Architecture needs: materialized views or periodic aggregation tables, a background job scheduling pattern (Postgres-based cron or Supabase Edge Function on schedule), and a graph-friendly data format (nodes + edges) for constellation visualization.

8. **Privacy & Data Ownership** — Recording consent (two-party, state machine), deletion rights (either party, with notification), data portability (GDPR), and B2B data ownership (individual session data portable across jobs; org retains anonymized aggregates). Audit logging required for any escalation access to raw transcripts.

## Starter Template Evaluation

### Technical Preferences (From PRD & Project Context)

| Category | Decision | Source |
|---|---|---|
| **Framework** | SvelteKit (SSR/SPA hybrid) | PRD |
| **Backend/BaaS** | Supabase (Postgres, Auth, Realtime, Storage, Edge Functions) | PRD |
| **Language** | TypeScript | PRD |
| **Video** | Daily.co | PRD |
| **Payments** | Polar.sh (Merchant of Record) | PRD (updated from Stripe) |
| **AI Pipeline** | Whisper + LLM APIs | PRD |
| **Skill Level** | Intermediate | Config |
| **Team Size** | Solo developer | PRD |

### Primary Technology Domain

**Full-stack web application** — SvelteKit as the full-stack framework with Supabase as managed BaaS. No separate API server. This narrows our search to SvelteKit starters with Supabase compatibility.

### UX Requirements Consideration

From PRD and cross-cutting concerns:
- **Real-time features** — Supabase Realtime WebSockets (Flash Help matching, presence, dashboards)
- **Rich visualization** — Constellation graph (d3/Threlte) in Phase 2
- **Accessible UI components** — Emotionally vulnerable users require careful, non-intimidating design
- **Multi-step flows** — Consent state machine, matching event sequences
- **Emotional entry points** — "I'm stuck" / "I'm curious" / "I'm preparing" are custom UX — no component library provides these

### Starter Options Evaluated

#### Option 1: Official `sv` CLI (Selected)

**Command:** `npx sv create`

The official SvelteKit CLI (replaced the older `create-svelte`). Interactive wizard with modular add-ons.

**Available add-ons relevant to TeachMeSensei:**
- `tailwindcss` — Utility-first CSS
- `eslint` + `prettier` — Code quality
- `vitest` — Unit/component testing
- `playwright` — E2E testing
- `paraglide` — i18n (Vietnam market = future need)

**What it does NOT include:** Database provider, auth provider, UI component library. You add these separately — which is exactly what we want, because we're using Supabase (not Drizzle/Lucia).

**Architectural fit:** Maximizes control. Every add-on is your choice. No opinions that conflict with Supabase's built-in Postgres + PostgREST + Auth.

#### Option 2: CMSaasStarter (2.1k GitHub stars)

**What it is:** Full SaaS boilerplate — SvelteKit + Supabase + DaisyUI + blog + auth + pricing page.

**Strengths:** Working auth UI flows (sign up, sign in, forgot password, email verification, OAuth), pricing page scaffolding, subscription management. These are real Phase 1 implementation costs that a starter could hand you for free.

**Why not selected:** Uses DaisyUI (locks into a design system that limits emotional UX control for vulnerable users), includes blog engine and marketing pages that don't map to Phase 1, and "subtract then add" is slower than "start clean, add what you need" for a solo developer. The auth UI flows are valuable but tightly coupled to DaisyUI's component patterns — extracting them requires rewriting them anyway.

**Trade-off acknowledged:** Going clean-slate means building auth UI flows as explicit Phase 1 implementation work. This is a known cost, accepted for the benefit of full design control over the emotional UX layer.

#### Option 3: engageintellect/sveltekit-supabase

**What it is:** Minimal Svelte 5 + Supabase + shadcn-svelte starter.

**Why not selected:** Small community project, unclear maintenance cadence. The pieces it combines (Supabase + shadcn-svelte) are trivial to set up manually with the official CLI.

#### Option 4: supastarter ($349 premium)

**What it is:** Commercial starter with everything — auth, payments, admin, i18n.

**Why not selected:** Adds Prisma ORM (conflicts with Supabase's PostgREST approach), commercial license, more infrastructure than needed.

#### Option 5: Vercel SvelteKit SaaS Starter

**What it is:** Open-source template with Supabase auth + Stripe.

**Why not selected:** Optimized for Vercel deployment adapter, which isn't the target hosting.

### Selected Starter: Official `sv` CLI + Manual Supabase Integration

**Rationale:**

1. **No opinion conflicts** — Community starters add ORMs (Drizzle, Prisma) that fight Supabase's built-in PostgREST. The official CLI adds zero conflicting opinions.
2. **Supabase integration is trivial** — Two packages (`@supabase/supabase-js` + `@supabase/ssr`), one hook file, one layout file.
3. **shadcn-svelte for UI** — Copy-paste accessible components built on Radix UI primitives. Full design control for emotionally-aware UX.
4. **Solo developer advantage** — Understanding every file in your project from day one.
5. **Add-on modularity** — Need i18n later? `npx sv add paraglide`. Each add-on slots in without surgery.

**Known cost:** Auth UI flows (sign up, sign in, forgot password, OAuth) are Phase 1 implementation work, not provided by the starter. This is the explicit trade-off for full UX control.

**Initialization Command:**

```bash
# Step 1: Create SvelteKit project (deterministic selections)
npx sv create teachmesensei
#   Template: SvelteKit minimal
#   Type checking: TypeScript
#   Add-ons: tailwindcss, eslint, prettier, vitest, playwright

# Step 2: Install Supabase packages
cd teachmesensei
npm install @supabase/supabase-js @supabase/ssr

# Step 3: Initialize Supabase local development
npx supabase init

# Step 4: Install shadcn-svelte UI components
npx shadcn-svelte@latest init

# Step 5: Start Supabase local stack (Docker required, ~7GB RAM)
npx supabase start
```

**Note:** The exact `sv create` add-on selections above must be treated as deterministic — the first implementation story should reproduce this sequence exactly, not re-discover it interactively.

### Architectural Decisions Provided by This Setup

**Language & Runtime:**
- TypeScript with strict mode
- Svelte 5 with Runes (opt-in reactivity API: `$state`, `$derived`, `$effect`, `$props`)
- Node.js runtime for SvelteKit server, Deno runtime for Supabase Edge Functions

**Styling Solution:**
- Tailwind CSS via `@tailwindcss/vite` plugin
- shadcn-svelte for accessible, customizable component primitives

**shadcn-svelte Component Inventory for Phase 1:**

| Phase 1 UI Pattern | shadcn-svelte Component | Status |
|---|---|---|
| Consent dialogs (state machine) | Dialog | Available |
| Session scheduling | Calendar / Date Picker | Available |
| Sensei profiles | Avatar + Card | Available |
| Real-time status updates | Toast / Sonner | Available |
| Onboarding forms | Form + Input + Select | Available |
| Availability grid | Toggle Group + custom | Partial — grid layout is custom |
| Video session controls | Button + Badge | Available |
| Navigation | Navigation Menu + Sidebar | Available |
| "I'm stuck" entry points | **Fully custom** | Custom — emotional UX, no library provides this |
| Invite code flow | Input + Button + Alert | Available |

**Gap analysis:** Most Phase 1 UI patterns map to existing shadcn-svelte components. The availability grid requires custom layout work on top of primitives. The three emotional entry points ("I'm stuck" / "I'm curious" / "I'm preparing") are fully custom UX — this is the core product design work, not a component library concern.

**Build Tooling:**
- Vite (SvelteKit's built-in bundler) — HMR, tree-shaking, code splitting
- SvelteKit adapter (configurable per deployment target)

**Testing Architecture (Three Tiers):**

| Tier | Tool | Scope | Docker Required | Trigger |
|---|---|---|---|---|
| **Unit + Component** | Vitest + `@testing-library/svelte` | Component logic, utilities, stores | No | Every commit |
| **Database + RLS Integration** | Vitest + Supabase local stack | RLS policy isolation, migration validation, multi-role data access assertions | Yes | Every migration, CI pipeline |
| **E2E** | Playwright | Full user flows, auth flows, real-time features | Yes (Supabase stack) | Pre-merge, CI pipeline |

**Critical testing note:** The Supabase CLI (`supabase start`, `supabase db reset --local`) is a **testing dependency**, not just a development tool. RLS data isolation tests require a running local Supabase stack with multiple test users in different roles (learner, Sensei, team lead, org admin, platform admin) asserting cross-role data boundaries. These tests run on every migration.

**Code Organization:**
- SvelteKit file-based routing (`src/routes/`)
- Server-side logic in `+page.server.ts`, `+layout.server.ts`
- Shared utilities in `src/lib/`
- Supabase migrations in `supabase/migrations/`
- Edge Functions in `supabase/functions/`

**Critical Integration Pattern — `hooks.server.ts` Auth Setup:**

The `@supabase/ssr` cookie configuration in `hooks.server.ts` is the most error-prone setup in the SvelteKit + Supabase integration. Auth can appear to work client-side while server-side session resolves to null. **The first integration test before any other work:** "server-side hook correctly resolves authenticated user session." This test validates that `createServerClient` in `hooks.server.ts` correctly reads cookies and returns a valid session.

**Development Workflow Scripts (`package.json`):**

```json
{
  "scripts": {
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:reset": "supabase db reset --local",
    "db:types": "supabase gen types typescript --local > src/lib/database.types.ts",
    "db:migrate": "supabase db diff -f",
    "db:seed": "supabase db reset --local",
    "test:unit": "vitest run",
    "test:integration": "vitest run --project integration",
    "test:e2e": "playwright test",
    "test:rls": "supabase db reset --local && vitest run --project rls"
  }
}
```

These scripts are foundational dev workflow decisions — they define how the solo developer interacts with the database, generates types, and runs the three testing tiers daily. `db:types` should run automatically after every migration to keep `src/lib/database.types.ts` in sync with the schema.

**Supabase Local Development (CLI v2.75.0):**
- `supabase init` → creates `supabase/config.toml` + `migrations/` + `seed.sql`
- `supabase start` → Docker containers for all services (Postgres, Auth, Realtime, Storage, Edge Functions, Studio, SMTP)
- `supabase db diff -f migration_name` → captures schema changes as SQL migration files
- `supabase db reset --local` → clean slate from migrations + seed
- `supabase gen types typescript --local > src/lib/database.types.ts` → auto-generated types
- Supabase Studio available at `localhost:54323` for local database browsing

**Auth Integration (via `@supabase/ssr`):**
- `createServerClient` in `hooks.server.ts` — server-side session via cookies
- `createBrowserClient` in layout — client-side Supabase access
- Session available throughout entire SvelteKit stack (pages, layouts, server hooks)
- Critical: Always use `auth.getUser()` on server for trusted user data (never trust unencoded session)

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data validation: Zod + sveltekit-superforms v2.29.1
- Data modeling: Database-first with Supabase CLI migrations
- Auth methods: Magic Link + Google + GitHub OAuth (Phase 1); LinkedIn OAuth (Phase 1.5)
- Route protection: Centralized hooks.server.ts guards
- API security: Three-tier model (RLS / session / service role key)
- State management: Svelte 5 runes-first, no external library
- Hosting: Railway (Singapore region)

**Important Decisions (Shape Architecture):**
- Caching: SvelteKit-native (load functions + HTTP headers + Realtime)
- Error handling: Typed responses + graceful degradation + emotional calibration
- Edge Function patterns: Three standardized patterns with Postgres job queue
- Real-time: Three Supabase Realtime channel types mapped to features
- Component organization: Domain-grouped in `src/lib/components/features/`
- Route structure: Four route groups — (public), (app), (admin), (enterprise); admin/enterprise are empty shells until Phase 1.5+
- CI/CD: GitHub Actions → Railway auto-deploy on merge to main

**Deferred Decisions (Post-MVP):**
- LinkedIn OAuth (Phase 1.5 — when enterprise teams onboard)
- Rate limiting (Phase 2 — when abuse signal exists)
- External caching layer (when scale demands it)
- APM/log aggregation (when error volume justifies Sentry)
- Staging environment (when beta testers exist)
- Apple/Microsoft OAuth (when user demand exists)

### Data Architecture

| Decision | Choice | Version | Rationale |
|---|---|---|---|
| Validation library | Zod | latest | Largest ecosystem, best AI-assisted coding support, SuperForms default |
| Form handling | sveltekit-superforms | v2.29.1 | Server/client validation, tainted form detection, type-safe |
| Data modeling | Database-first (Supabase migrations) | — | Native to PostgREST, RLS co-located, auto-generated TS types |
| Caching | SvelteKit-native | — | Load function dedup + HTTP Cache-Control + Realtime subscriptions |
| Type generation | Automated `supabase gen types` | — | Runs as CI step + git hook after every migration — never manual |

**Caching by data pattern:**
- User profile/session: Per-request via `load` functions
- Sensei listings: HTTP Cache-Control headers, CDN
- Real-time data (matching, presence, dashboards): Supabase Realtime push
- Enterprise dashboards: Pre-aggregated tables, background refresh

### Authentication & Security

| Decision | Choice | Rationale |
|---|---|---|
| Auth engine | Supabase Auth via `@supabase/ssr` | Decided in Step 3 |
| Phase 1 auth methods | Magic Link + Google + GitHub OAuth | Frictionless entry + broad reach + developer audience |
| Phase 1.5 auth methods | LinkedIn OAuth | Enterprise credibility, added when B2B teams onboard |
| Route protection | Centralized `hooks.server.ts` middleware | Single audit point, role-based route group gating |
| Data authorization | Supabase RLS on all tables | Hook guards pages, RLS guards data |
| API security | Three-tier: RLS (PostgREST) / session (server endpoints) / service role key (Edge Functions) | Leverages Supabase built-in security at every layer |
| Rate limiting | Deferred to Phase 2 | Supabase built-in auth rate limiting sufficient initially |

**Route guard mapping:**
- `(public)` routes → no auth check
- `(app)` routes → require authenticated session
- `(admin)` routes → empty shell in Phase 1, require admin/platform admin role when populated
- `(enterprise)` routes → empty shell in Phase 1, require team lead/org admin role when populated

### API & Communication Patterns

| Decision | Choice | Rationale |
|---|---|---|
| Error handling | Typed responses + `$lib/errors.ts` mapper + graceful degradation | Never show raw errors to vulnerable users |
| Error UX principle | **Emotionally calibrated messages** | User-facing error messages must reassure, not notify. "We're still looking for your Sensei..." not "Match failed, retrying" |
| Edge Function patterns | Three standardized: Webhook Receiver, Async Job Processor, Scheduled Task | Predictable, debuggable, shared conventions |
| Job queue | Postgres table (`pending → processing → completed/failed/retry`) | No external queue infrastructure |
| Idempotency | `idempotency_key` column on job table | Handles duplicate webhook delivery |
| Edge Function logging | Structured `{ function_name, event_type, duration_ms, status }` | Consistent observability |

**Emotional error calibration principle:** Error messages in user-facing flows (especially matching, sessions, and onboarding) must be designed as emotional responses, not technical notifications. A failed Flash Help match says "We're still looking for your Sensei — hang tight" not "Error: no available match." The `$lib/errors.ts` mapper must include an `emotionalContext` field that downstream UI components use to select the appropriate tone.

**Real-time channel mapping:**

| Feature | Channel Type | Channel Name Pattern |
|---|---|---|
| Flash Help matching | Broadcast | `flash-help:{user_id}` |
| Sensei availability | Presence | `presence:senseis` |
| AI notes processing | Postgres Changes | `jobs:{session_id}` |
| Admin dashboards | Postgres Changes | `admin:{org_id}` |
| Session participants | Presence | `session:{session_id}` |

Centralized subscription management in `$lib/realtime.ts`.

### Frontend Architecture

| Decision | Choice | Rationale |
|---|---|---|
| State management | Svelte 5 runes-first | `$state`/`$derived`/`$effect` for local, `.svelte.ts` modules for app-wide, context API for subtree |
| Form state boundary | **SuperForms owns form state, runes own everything else** | SuperForms `$form`/`$errors` stores coexist with runes — no conflict, but clear mental model boundary |
| Component organization | Domain-grouped in `src/lib/components/features/` | Predictable location, max 2 levels deep |
| UI primitives | shadcn-svelte in `src/lib/components/ui/` | Accessible, customizable, never mixed with custom components |
| Route structure | Four groups: `(public)`, `(app)`, `(admin)`, `(enterprise)` | Group-level layouts, URL-transparent, centralized auth gating |
| Route group phasing | `(admin)` and `(enterprise)` are empty folder shells in Phase 1 | No layout chrome built until features populate them in Phase 1.5+ |

**Component directory structure:**
```
src/lib/
├── components/
│   ├── ui/              # shadcn-svelte only
│   ├── layout/          # Shell, Sidebar, Nav, Footer
│   ├── forms/           # Reusable form patterns
│   └── features/        # Domain-grouped
│       ├── auth/
│       ├── sessions/
│       ├── matching/
│       ├── profiles/
│       ├── admin/
│       └── enterprise/
├── stores/              # Reactive .svelte.ts modules
├── server/              # Server-only utilities
├── errors.ts
├── realtime.ts
└── utils/
```

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|---|---|---|
| Hosting | Railway (Singapore region) | Simplest DX, co-locates with Supabase, GitHub push deploy |
| SvelteKit adapter | `adapter-node` | Railway runs Node containers |
| Deploy config | Explicit nixpacks config or Dockerfile | Explicit over implicit — prevents production deploy debugging |
| Health endpoint | `/health` endpoint checking Supabase connectivity | Railway uses for zero-downtime deploys; process running ≠ app healthy |
| CI/CD | GitHub Actions → Railway auto-deploy | Lint, types, unit tests, build on PR; deploy on merge to main |
| Environment config | Three-tier: `.env.local` / GitHub Secrets / Railway env vars | SvelteKit `PUBLIC_` prefix convention for client-safe values |
| Monitoring | Platform dashboards (Supabase + Railway) + free uptime monitor | Sufficient for Phase 1 scale |
| AI pipeline health | Job queue table status queries | `failed` count as health signal |

**CI pipeline stages:**
1. Lint (ESLint + Prettier)
2. Type check (svelte-check + tsc)
3. Unit tests (Vitest)
4. RLS/integration tests (Vitest + Supabase local — every PR)
5. Build (vite build)
6. E2E tests (Playwright, pre-merge)
7. Auto-generate types (`supabase gen types`) — also runs as git hook locally
8. Auto-deploy to Railway (on merge to main)

### Decision Impact Analysis

**Implementation Sequence:**
1. Project scaffold (`sv create` + Supabase + shadcn-svelte) — unlocks everything
2. Auth integration (`hooks.server.ts` + Supabase Auth + OAuth providers) — unlocks route protection
3. Database schema + RLS policies — unlocks data layer
4. Component library setup (shadcn-svelte + layout shell) — unlocks UI
5. `/health` endpoint + Railway deploy config — unlocks production deployment
6. Real-time infrastructure (`$lib/realtime.ts`) — unlocks matching and presence
7. Edge Function patterns + job queue — unlocks AI pipeline
8. CI/CD pipeline (GitHub Actions + Railway) — unlocks automated deployment
9. Polar.sh integration — unlocks payments (Phase 2)

**Cross-Component Dependencies:**
- Auth → Route protection → Every protected feature
- Database schema → RLS → API security → All data access
- Edge Function patterns → AI pipeline → Session notes
- Real-time infrastructure → Flash Help matching + Presence + Admin dashboards
- CI pipeline (with RLS tests on every PR) → Every subsequent deployment
- Type generation automation → Type safety across all data access

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 7 categories where AI agents could make incompatible choices — all resolved below.

### Naming Patterns

**Database Naming Conventions:**

| Pattern | Convention | Example |
|---|---|---|
| Table names | `snake_case`, plural | `users`, `sessions`, `job_queue` |
| Column names | `snake_case` | `user_id`, `created_at`, `org_id` |
| Foreign keys | `{referenced_table_singular}_id` | `user_id`, `session_id`, `team_id` |
| Indexes | `idx_{table}_{columns}` | `idx_users_email`, `idx_sessions_sensei_id` |
| Enum types | `snake_case` | `user_role`, `job_status`, `consent_state` |
| RLS policies | `{table}_{action}_{role}` | `sessions_select_own_learner`, `profiles_update_own` |

**Code Naming Conventions:**

| Pattern | Convention | Example |
|---|---|---|
| Svelte components | `PascalCase.svelte` | `SenseiCard.svelte`, `FlashHelpStatus.svelte` |
| TypeScript files | `camelCase.ts` | `realtime.ts`, `errors.ts`, `authGuard.ts` |
| Svelte module files | `camelCase.svelte.ts` | `authStore.svelte.ts`, `presenceStore.svelte.ts` |
| Functions | `camelCase` | `getUserProfile()`, `mapSupabaseError()` |
| Variables/constants | `camelCase` / `SCREAMING_SNAKE` | `userId`, `MAX_RETRY_COUNT` |
| Types/interfaces | `PascalCase` | `UserProfile`, `SessionState`, `JobQueueEntry` |
| Zod schemas | `camelCase` + `Schema` suffix | `loginSchema`, `sessionFormSchema` |
| Route params | `camelCase` | `/sensei/[id]`, `/sessions/[sessionId]` |

**Data Format Convention — snake_case Pass-Through:**

Database `snake_case` flows directly into TypeScript code with no conversion layer. Supabase auto-generated types use `snake_case`. All code that touches database data uses `snake_case` field names: `user.created_at`, `session.sensei_id`. No camelCase conversion at any boundary. One convention, zero ambiguity.

### Type System Boundaries

**Supabase-Generated Types vs. Zod Schemas — Two Different Purposes:**

| Concern | Tool | Location | Purpose |
|---|---|---|---|
| Database row shapes | `supabase gen types` | `$lib/database.types.ts` | Type-safe reads/writes to database |
| Input validation | Zod schemas | `$lib/schemas/{feature}.ts` | Validate user input at boundaries |

These overlap on field names but serve different purposes. A `Database['public']['Tables']['users']['Row']` type has every column. A `updateProfileSchema` Zod schema only validates the fields the user can edit. **Never generate a Zod schema that mirrors the full database type** — Zod schemas are for input validation, not data shape documentation.

**Schema import convention:** Always import directly from the specific schema file. `import { loginSchema } from '$lib/schemas/auth'`. No barrel exports (`$lib/schemas/index.ts`) — they hurt tree-shaking and risk circular dependencies.

### Structure Patterns

**Test Location — Hybrid Approach:**

```
src/
├── lib/
│   ├── errors.ts
│   ├── errors.test.ts              # Unit test, co-located
│   └── components/features/auth/
│       ├── LoginForm.svelte
│       └── LoginForm.test.ts       # Component test, co-located
tests/
├── integration/
│   ├── rls/                        # RLS data isolation tests
│   └── api/                        # Server endpoint tests
├── e2e/
│   ├── auth.spec.ts                # Playwright flows
│   └── sessions.spec.ts
└── fixtures/
    ├── roles.ts                    # Canonical multi-role test user factory
    └── seed.ts                     # Shared seed data
```

- Unit/component tests: co-located with source (`*.test.ts` next to source file)
- RLS/integration tests: `tests/integration/` (requires Supabase local stack)
- E2E tests: `tests/e2e/` (requires Playwright + Supabase stack)
- Shared fixtures: `tests/fixtures/` (seed data, test users per role)

**Critical test boundary rule:** Co-located `.test.ts` files must NEVER import from Playwright or use browser automation. If a test needs a real browser, it belongs in `tests/e2e/`. Vitest config must exclude `tests/e2e/` from its test glob.

**Canonical RLS Test Fixture — `tests/fixtures/roles.ts`:**

```typescript
// tests/fixtures/roles.ts
// Single source of truth for multi-role test user setup
// Every RLS test imports from here — no ad-hoc test user creation

export async function createTestUsers() {
  return {
    learner: await createAuthenticatedClient('learner@test.com', 'learner'),
    sensei: await createAuthenticatedClient('sensei@test.com', 'sensei'),
    team_lead: await createAuthenticatedClient('lead@test.com', 'team_lead'),
    org_admin: await createAuthenticatedClient('admin@test.com', 'org_admin'),
    platform_admin: await createAuthenticatedClient('platform@test.com', 'platform_admin'),
  }
}
```

Every RLS test imports from this single source. No agent creates ad-hoc test users. This ensures consistent role setup and prevents fixture conflicts between tests written by different agents.

**Schema Files Location:**

- `$lib/schemas/{feature}.ts` — one file per feature domain
- Example: `$lib/schemas/auth.ts`, `$lib/schemas/sessions.ts`, `$lib/schemas/profiles.ts`
- Each schema exported by name: `export const loginSchema = z.object({...})`
- Direct imports only: `import { loginSchema } from '$lib/schemas/auth'` — no barrel re-exports

### Format Patterns

**API Response Format:**

- PostgREST calls: return raw Supabase response, no wrapping
- Custom `+server.ts` endpoints — success: direct data object. Error: `{ error: { code, message } }`
- Form actions: SuperForms `fail()` and `message()` only
- Webhook endpoints: return `{ received: true }` with 200
- HTTP status codes used correctly: 200, 201, 400, 401, 403, 404, 500

**Date/Time Handling:**

| Layer | Format | Example |
|---|---|---|
| Database | `timestamptz` (always, never `timestamp`) | `2026-02-07T14:30:00+00:00` |
| API/JSON | ISO 8601 string | `"2026-02-07T14:30:00Z"` |
| Client display | User's local timezone via `Intl.DateTimeFormat` | `"Feb 7, 2:30 PM"` |
| Scheduling UI | User selects local time, stored as UTC | — |

- One formatting utility: `$lib/utils/dates.ts`
- Never store local times — convert to UTC on input, local on display
- `created_at`/`updated_at` default to `now()` in migrations

### Communication Patterns

**Event Naming:**

| Pattern | Convention | Example |
|---|---|---|
| Completed actions | `resource.past_tense` | `session.created`, `note.completed`, `payment.processed` |
| State transitions | `resource.present_progressive` | `match.searching`, `match.connecting`, `match.live` |
| Channel names | `{feature}:{scope_id}` | `flash-help:user_123`, `presence:senseis` |

**Event Payload Structure:**

```typescript
type RealtimePayload<T> = {
  event: string        // 'match.found'
  timestamp: string    // ISO 8601 UTC
  data: T              // snake_case, event-specific
}
```

- Max one dot in event names — `note.completed`, not `session.note.completed`
- Always include timestamp in payload
- Payload `data` uses snake_case (consistent with database pass-through)

### Process Patterns

**Loading State Pattern:**

```typescript
type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: { code: string; message: string } }
  | { status: 'success'; data: T }
```

- SvelteKit `load` functions handle initial page data — loading states rare for page loads
- Client-side fetches (Realtime, lazy data) use `AsyncState<T>`
- Loading UI: shadcn-svelte `Skeleton` components, never full-page spinners
- Empty states: every page that displays a collection MUST have a designed empty state with contextual call-to-action — never a blank area
- Optimistic updates for simple actions (toggle availability, send invite) — revert on failure

**Error Handling Pattern:**

- Component-level errors: inline display using emotionally calibrated messages
- Page-level errors: `+error.svelte` with graceful fallback
- Error mapping: `$lib/errors.ts` with `emotionalContext` field
- Logging: `console.error` with structured context on server, user sees friendly message

**Retry & Recovery Pattern:**

| Context | Max Retries | Backoff | Ceiling |
|---|---|---|---|
| Webhook processing (Polar.sh, Daily) | 0 (provider retries) | — | — |
| AI pipeline jobs (Whisper, LLM) | 5 | Exponential: 1m, 2m, 4m, 8m, 16m | 16 minutes |
| Supabase Realtime reconnect | Unlimited | Built-in | Auto-handled |
| Client-side fetch retry | 2 | 1s, 3s | 3 seconds |

- Webhooks: never retry on our side, process idempotently, return 200
- Job queue: `retry_count` and `next_retry_at` on job row. After max retries → `failed` status, surfaced to admin
- Client: 2 retries, then emotionally calibrated error. Never spin indefinitely

**Validation Timing — Validate at Boundaries, Trust Internals:**

| Boundary | Validation | Tool |
|---|---|---|
| Form submission (client) | Zod schema via SuperForms | Instant feedback |
| Form action (server) | Same Zod schema via SuperForms | Server re-validation |
| Custom `+server.ts` | Zod `.parse()` on request body | Reject malformed input |
| Edge Functions | Zod `.parse()` on webhook/job payload | Verify external data |
| Database | Postgres constraints + CHECK + RLS | Last line of defense |

- Same Zod schema on client and server — one definition in `$lib/schemas/`
- Never validate inside `$lib/` utilities — internal functions trust callers
- Edge Functions verify webhook signatures before parsing body

### Enforcement Guidelines

**All AI Agents MUST:**

1. Follow naming conventions exactly — no exceptions. `snake_case` in database and data, `PascalCase` for components, `camelCase` for functions/files
2. Use snake_case pass-through for all database data — never introduce a camelCase conversion layer
3. Place tests in the correct tier location — unit co-located, integration in `tests/integration/`, E2E in `tests/e2e/`
4. Co-located `.test.ts` files must never import from Playwright or use browser automation
5. Use SuperForms `fail()`/`message()` for form actions — never invent custom response formats
6. Use `timestamptz` for all time columns — never `timestamp` without timezone
7. Include emotionally calibrated error messages for all user-facing error states
8. Use Zod schemas from `$lib/schemas/` for input validation only — never mirror full database types
9. Import schemas directly from specific files — no barrel exports
10. Every collection page MUST have a designed empty state with contextual call-to-action
11. All RLS tests MUST use the canonical `tests/fixtures/roles.ts` multi-role factory — no ad-hoc test users

**Pattern Verification:**
- ESLint rules enforce naming conventions where possible
- Vitest config excludes `tests/e2e/` to prevent co-located Playwright imports
- PR review checklist includes pattern compliance
- RLS tests on every PR catch data access violations
- Type generation catches schema drift

### Anti-Patterns (What to Avoid)

| Do This | Not This |
|---|---|
| `user.created_at` | `user.createdAt` (no camelCase conversion) |
| `return json({ user_id })` | `return json({ success: true, data: { userId } })` |
| `$lib/schemas/auth.ts` shared schema | Inline `z.object()` in both client and server |
| `import { loginSchema } from '$lib/schemas/auth'` | `import { loginSchema } from '$lib/schemas'` (no barrel) |
| Zod schema for 5 editable fields | Zod schema mirroring all 15 DB columns |
| `timestamptz` column | `timestamp` or `varchar` for dates |
| `sessions_select_own_learner` RLS policy | `policy_1` or `select_sessions` |
| `Skeleton` placeholder | Full-page loading spinner |
| "No sessions yet — schedule your first one!" | Blank empty area with no guidance |
| "We're still looking..." (emotional) | "Error: match timeout" (technical) |
| `createTestUsers()` from `tests/fixtures/roles.ts` | Ad-hoc test user creation per test file |

### Resolved Questions

- **~~Polar.sh marketplace payouts~~:** Resolved — FR50 (Sensei payouts) deferred to Phase 3+. Senseis are motivated by identity, community, and legacy, not income (PRD Competitive Innovation #4). Phase 2 payments are learner-pays-platform only (FR49, FR51, subscriptions, team plans), which Polar.sh handles natively as single-seller SaaS billing. No marketplace payout capability needed until Phase 3+ data validates Sensei compensation demand.

## Project Structure & Boundaries

### Complete Project Directory Structure

```
teachmesensei/
├── .env.example                          # Placeholder env vars for onboarding
├── .env.local                            # Local dev secrets (gitignored)
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml                        # GitHub Actions: lint, types, test, build
├── package.json                          # Scripts: db:*, test:*, dev, build
├── svelte.config.js                      # SvelteKit config, adapter-node
├── vite.config.ts                        # Vite + Tailwind + Vitest
├── tsconfig.json                         # TypeScript strict mode
├── playwright.config.ts                  # Playwright E2E config
├── tailwind.config.ts                    # Tailwind customization
├── Dockerfile                            # Railway production deploy (explicit)
│
├── src/
│   ├── app.html                          # SvelteKit HTML shell
│   ├── app.css                           # Global styles + Tailwind directives
│   ├── hooks.server.ts                   # Auth resolution + route guards (centralized)
│   ├── hooks.client.ts                   # Client error handler (graceful degradation)
│   │
│   ├── lib/
│   │   ├── database.types.ts             # Auto-generated: supabase gen types
│   │   ├── errors.ts                     # Error mapper (code → user-friendly + emotionalContext)
│   │   ├── errors.test.ts
│   │   ├── realtime.ts                   # Realtime subscription manager (channels, cleanup)
│   │   ├── realtime.test.ts
│   │   │
│   │   ├── schemas/                      # Zod validation schemas (input boundaries only)
│   │   │   ├── auth.ts                   # loginSchema, signupSchema, magicLinkSchema
│   │   │   ├── sessions.ts              # createSessionSchema, scheduleSchema
│   │   │   ├── profiles.ts             # updateProfileSchema, availabilitySchema
│   │   │   ├── admin.ts                 # flagSchema, userManagementSchema
│   │   │   └── enterprise.ts           # teamSchema, orgSettingsSchema
│   │   │
│   │   ├── stores/                       # Reactive .svelte.ts modules (app-wide state)
│   │   │   ├── authStore.svelte.ts      # User session, role, profile
│   │   │   ├── presenceStore.svelte.ts  # Sensei online status
│   │   │   └── notificationStore.svelte.ts
│   │   │
│   │   ├── server/                       # Server-only utilities (never imported client-side)
│   │   │   ├── supabaseAdmin.ts         # Service role client for server operations
│   │   │   ├── supabaseClient.ts        # Server client factory (from hooks)
│   │   │   └── webhookVerify.ts         # Polar.sh/Daily webhook signature verification
│   │   │
│   │   ├── utils/                        # Pure utility functions
│   │   │   ├── dates.ts                 # Intl.DateTimeFormat wrappers, UTC conversion
│   │   │   ├── dates.test.ts
│   │   │   └── formatting.ts           # Display helpers
│   │   │
│   │   └── components/
│   │       ├── ui/                       # shadcn-svelte primitives ONLY
│   │       │   ├── button/
│   │       │   ├── card/
│   │       │   ├── dialog/
│   │       │   ├── form/
│   │       │   ├── input/
│   │       │   ├── skeleton/
│   │       │   ├── sonner/
│   │       │   ├── avatar/
│   │       │   ├── badge/
│   │       │   ├── calendar/
│   │       │   ├── navigation-menu/
│   │       │   ├── sidebar/
│   │       │   ├── select/
│   │       │   ├── toggle-group/
│   │       │   └── alert/
│   │       │
│   │       ├── layout/                   # App shell components
│   │       │   ├── AppShell.svelte      # Authenticated app layout
│   │       │   ├── PublicShell.svelte   # Marketing/public layout
│   │       │   ├── Sidebar.svelte
│   │       │   ├── Nav.svelte
│   │       │   └── Footer.svelte
│   │       │
│   │       ├── forms/                    # Reusable form patterns
│   │       │   ├── ConsentDialog.svelte # Consent state machine UI
│   │       │   └── AvailabilityGrid.svelte # Custom grid layout
│   │       │
│   │       └── features/                 # Domain-grouped feature components
│   │           ├── auth/
│   │           │   ├── LoginForm.svelte
│   │           │   ├── LoginForm.test.ts
│   │           │   ├── SignupForm.svelte
│   │           │   ├── OAuthButtons.svelte
│   │           │   └── MagicLinkForm.svelte
│   │           │
│   │           ├── sessions/
│   │           │   ├── SessionCard.svelte
│   │           │   ├── SessionCard.test.ts
│   │           │   ├── VideoControls.svelte
│   │           │   ├── NotesDisplay.svelte
│   │           │   ├── ScheduleForm.svelte
│   │           │   └── RecordingConsent.svelte
│   │           │
│   │           ├── matching/
│   │           │   ├── FlashHelpEntry.svelte  # "I'm stuck" / "I'm curious" / "I'm preparing"
│   │           │   ├── MatchingStatus.svelte   # Real-time matching state transitions
│   │           │   └── WarmHold.svelte         # Warm-hold waiting UX
│   │           │
│   │           ├── profiles/
│   │           │   ├── SenseiCard.svelte
│   │           │   ├── SenseiProfile.svelte
│   │           │   ├── LearnerProfile.svelte
│   │           │   └── AvailabilityDisplay.svelte
│   │           │
│   │           ├── admin/
│   │           │   ├── DashboardWidget.svelte
│   │           │   ├── FlagList.svelte
│   │           │   └── UserTable.svelte
│   │           │
│   │           └── enterprise/
│   │               ├── TeamOverview.svelte
│   │               ├── OrgSettings.svelte
│   │               └── TeamMetrics.svelte
│   │
│   └── routes/
│       ├── +error.svelte                 # Global error page (emotionally calibrated)
│       │
│       ├── (public)/                     # No auth required
│       │   ├── +layout.svelte           # PublicShell layout
│       │   ├── +page.svelte             # Landing page
│       │   ├── +page.server.ts          # Landing page data (cached)
│       │   ├── about/
│       │   │   └── +page.svelte
│       │   ├── sensei/
│       │   │   └── [id]/
│       │   │       ├── +page.svelte     # Public Sensei profile
│       │   │       └── +page.server.ts
│       │   └── login/
│       │       ├── +page.svelte         # Login/signup (magic link, OAuth)
│       │       ├── +page.server.ts      # Auth form actions
│       │       └── callback/
│       │           └── +server.ts       # OAuth callback handler
│       │
│       ├── (app)/                        # Auth required
│       │   ├── +layout.server.ts        # Load user profile, role
│       │   ├── +layout.svelte           # AppShell layout (sidebar)
│       │   ├── dashboard/
│       │   │   ├── +page.svelte
│       │   │   └── +page.server.ts
│       │   ├── sessions/
│       │   │   ├── +page.svelte         # Session list
│       │   │   ├── +page.server.ts
│       │   │   ├── [id]/
│       │   │   │   ├── +page.svelte     # Session detail + video
│       │   │   │   └── +page.server.ts
│       │   │   └── schedule/
│       │   │       ├── +page.svelte
│       │   │       └── +page.server.ts
│       │   ├── flash-help/
│       │   │   ├── +page.svelte         # Flash Help entry + matching
│       │   │   └── +page.server.ts
│       │   ├── profile/
│       │   │   ├── +page.svelte         # Own profile edit
│       │   │   └── +page.server.ts
│       │   └── settings/
│       │       ├── +page.svelte
│       │       └── +page.server.ts
│       │
│       ├── (admin)/                      # Role-gated (empty shell Phase 1)
│       │   ├── +layout.server.ts        # Admin role check
│       │   ├── +layout.svelte
│       │   ├── dashboard/
│       │   │   ├── +page.svelte
│       │   │   └── +page.server.ts
│       │   ├── flags/
│       │   │   ├── +page.svelte
│       │   │   └── +page.server.ts
│       │   └── users/
│       │       ├── +page.svelte
│       │       └── +page.server.ts
│       │
│       ├── (enterprise)/                 # Role-gated (empty shell Phase 1)
│       │   ├── +layout.server.ts        # Org/team role check
│       │   ├── +layout.svelte
│       │   ├── team/
│       │   │   ├── +page.svelte
│       │   │   └── +page.server.ts
│       │   └── org/
│       │       ├── +page.svelte
│       │       └── +page.server.ts
│       │
│       ├── api/
│       │   ├── health/
│       │   │   └── +server.ts           # Health check (Supabase connectivity)
│       │   └── webhooks/
│       │       ├── polar/
│       │       │   └── +server.ts       # Polar.sh payment events
│       │       └── daily/
│       │           └── +server.ts       # Daily.co recording events
│       │
│       └── +layout.ts                    # Root layout (Supabase browser client)
│
├── supabase/
│   ├── config.toml                       # Supabase local config
│   ├── seed.sql                          # Dev seed data
│   ├── migrations/                       # SQL migrations (schema + RLS policies)
│   │   └── 00000000000000_initial.sql
│   └── functions/                        # Edge Functions (Deno runtime)
│       ├── process-recording/            # Webhook → job queue entry
│       │   └── index.ts
│       ├── transcribe-session/           # Job processor: Whisper transcription
│       │   └── index.ts
│       ├── summarize-session/            # Job processor: LLM summarization
│       │   └── index.ts
│       └── scheduled-cleanup/            # Scheduled: 90-day recording expiry
│           └── index.ts
│
├── tests/
│   ├── integration/
│   │   ├── rls/                          # RLS data isolation tests
│   │   │   ├── users.rls.test.ts
│   │   │   ├── sessions.rls.test.ts
│   │   │   └── enterprise.rls.test.ts
│   │   └── api/                          # Server endpoint tests
│   │       ├── webhooks.test.ts
│   │       └── health.test.ts
│   ├── e2e/                              # Playwright E2E flows
│   │   ├── auth.spec.ts
│   │   ├── sessions.spec.ts
│   │   ├── matching.spec.ts
│   │   └── profile.spec.ts
│   └── fixtures/
│       ├── roles.ts                      # Canonical multi-role test user factory
│       └── seed.ts                       # Shared test seed data
│
└── static/                               # Static assets (served directly)
    ├── favicon.png
    └── og-image.png
```

### Architectural Boundaries

**API Boundaries:**

| Boundary | Mechanism | Who Calls It |
|---|---|---|
| Supabase PostgREST | Direct client → Supabase (RLS enforced) | Browser client, server `load` functions |
| SvelteKit server endpoints | `+server.ts` files | External webhooks (Polar.sh, Daily), internal health checks |
| SvelteKit form actions | `+page.server.ts` actions | SuperForms submissions |
| Supabase Edge Functions | Invoked by webhook endpoints or scheduled | Webhook `+server.ts` routes, Supabase cron |
| Supabase Realtime | WebSocket subscriptions | Browser client via `$lib/realtime.ts` |

**Component Boundaries:**

| Boundary | Rule |
|---|---|
| `src/lib/components/ui/` | shadcn-svelte ONLY — never custom components |
| `src/lib/components/features/` | Domain-grouped, may import from `ui/` and `forms/` |
| `src/lib/components/layout/` | Shell components, imported by route layouts only |
| `src/lib/server/` | NEVER imported by client-side code — server-only utilities |
| `src/lib/stores/` | App-wide reactive state, imported anywhere in `src/` |
| `src/lib/schemas/` | Zod validation schemas, imported by forms and server actions |

**Data Boundaries:**

| Layer | Access Pattern | Authorization |
|---|---|---|
| Browser → Supabase | `createBrowserClient` with user JWT | RLS policies |
| Server → Supabase | `createServerClient` from hooks (user session) | RLS policies (user context) |
| Edge Functions → Supabase | Service role key (admin access) | No RLS — full access |
| Server → External APIs | API keys in env vars (Polar.sh, Daily, OpenAI) | Webhook signature verification |

### Requirements to Structure Mapping

**FR Category → Directory Mapping:**

| FR Category | Routes | Components | Schema | Migrations |
|---|---|---|---|---|
| Identity & Access (FR1-6) | `(public)/login/`, `hooks.server.ts` | `features/auth/` | `schemas/auth.ts` | `*_users.sql`, `*_roles.sql` |
| Sensei Management (FR7-12) | `(app)/profile/`, `(public)/sensei/[id]/` | `features/profiles/` | `schemas/profiles.ts` | `*_profiles.sql`, `*_availability.sql` |
| Learner Management (FR13-14) | `(app)/dashboard/` | `features/profiles/` | — | `*_connections.sql` |
| Session Scheduling (FR15-20) | `(app)/sessions/schedule/` | `features/sessions/` | `schemas/sessions.ts` | `*_sessions.sql` |
| Video Sessions (FR21-26) | `(app)/sessions/[id]/` | `features/sessions/` | — | `*_recordings.sql`, `*_consent.sql` |
| AI Session Notes (FR27-33) | `(app)/sessions/[id]/` | `features/sessions/NotesDisplay` | — | `*_job_queue.sql`, `*_notes.sql` |
| Flash Help (FR34-41) | `(app)/flash-help/` | `features/matching/` | — | `*_matches.sql` |
| Admin Operations (FR55-58) | `(admin)/` | `features/admin/` | `schemas/admin.ts` | `*_flags.sql` |
| Team & Enterprise (FR62-74) | `(enterprise)/` | `features/enterprise/` | `schemas/enterprise.ts` | `*_teams.sql`, `*_orgs.sql` |

**Cross-Cutting Concerns → Location Mapping:**

| Concern | Primary Location | Supporting Files |
|---|---|---|
| RLS + Data Isolation | `supabase/migrations/` (policies) | `tests/integration/rls/` |
| AI Processing Pipeline | `supabase/functions/` | `*_job_queue.sql`, `$lib/realtime.ts` |
| Real-Time Communication | `$lib/realtime.ts` | `$lib/stores/presenceStore.svelte.ts` |
| Multi-Tenancy | `supabase/migrations/` (org_id, team_id columns) | RLS policies, `(enterprise)/` routes |
| Consent State Machine | `supabase/migrations/*_consent.sql` | `components/forms/ConsentDialog.svelte` |
| Notification Pipeline | `supabase/functions/` (future) | `$lib/stores/notificationStore.svelte.ts` |
| Error Handling | `$lib/errors.ts` | `hooks.client.ts`, `+error.svelte` |

### Integration Points

**External Service Integration:**

| Service | Integration Point | Auth Mechanism |
|---|---|---|
| Supabase | `$lib/server/supabaseClient.ts`, `$lib/server/supabaseAdmin.ts` | Anon key (client), service role key (admin) |
| Daily.co | `api/webhooks/daily/+server.ts` + client-side SDK | API key (server), webhook signature |
| Polar.sh | `api/webhooks/polar/+server.ts` | API key (server), webhook signature |
| OpenAI / Whisper | `supabase/functions/transcribe-session/`, `summarize-session/` | API key in Edge Function env |
| Google/GitHub/LinkedIn OAuth | Supabase Auth config (dashboard) | OAuth client ID/secret in Supabase |

**Data Flow — Session Lifecycle:**

```
User schedules session
  → +page.server.ts (form action) → Supabase insert (sessions table, RLS)
  → Notification: email confirmation

Session starts
  → Daily.co room created (API call from server)
  → Consent state machine: consent_given → recording_active
  → Presence channel: session:{session_id}

Session ends
  → Daily.co webhook → api/webhooks/daily/+server.ts
  → Job queue entry: process-recording (status: pending)
  → Edge Function: transcribe-session (Whisper API)
  → Edge Function: summarize-session (LLM API)
  → Job status: completed → Realtime notification
  → User sees: "Your session notes are ready"
```

## Architecture Validation Results

### PRD Overrides

**Explicit deviations where this architecture document is authoritative over the PRD:**

| PRD Reference | PRD Says | Architecture Says | Rationale |
|---|---|---|---|
| FR1, FR2, Security | LinkedIn OAuth as primary Phase 1 auth | LinkedIn OAuth deferred to Phase 1.5 | Google + GitHub + Magic Link ship faster; LinkedIn added when B2B teams onboard |
| FR49, FR51, FR67, Integration | Stripe + Stripe Connect | Polar.sh (Merchant of Record), FR50 deferred to Phase 3+ | Polar.sh handles global tax/VAT at 4% + $0.40/txn; Vietnam supported. Sensei payouts deferred — "mentorship community, not marketplace" positioning means Senseis volunteer, not earn |
| NFR Reliability | AI transcription: 3 retries over 2 hours | 5 retries, exponential backoff over ~31 minutes | More resilient — 5 retries catches more transient failures faster |
| Cross-cutting #1 | RLS tests on every migration | RLS tests on every PR | Missing RLS on a new server query is as dangerous as a missing migration policy |

**When conflicts exist between PRD and this architecture document, the architecture document takes precedence for implementation.**

### Infrastructure Cost Decisions

**Supabase Plan: Pro ($25/mo) from Phase 1**

The free tier has limits that will block mid-Phase 1:
- Edge Function invocations: 500K/mo free (AI pipeline will consume heavily)
- Storage: 1GB free (video recordings exceed this with first few sessions)
- Database: 500MB free (migrations + seed data approach this quickly)

Pro tier provides 8GB database, 100GB storage, 5M Edge Function invocations — sufficient through Phase 2.

### Resolved Questions

- **~~Polar.sh marketplace payouts~~:** Resolved — FR50 (Sensei payouts) deferred to Phase 3+. Learner-pays-platform only in Phase 2. Revisit if data shows Senseis want/need compensation.

### Coherence Validation

**Decision Compatibility:** All technology choices work together without conflicts.

| Integration | Status | Notes |
|---|---|---|
| SvelteKit + Supabase | Compatible | `@supabase/ssr` v2 designed for SvelteKit |
| Svelte 5 Runes + SuperForms | Compatible | SuperForms v2.29.1 supports Runes |
| shadcn-svelte + Tailwind | Compatible | shadcn-svelte built on Tailwind |
| Zod + SuperForms | Compatible | SuperForms natively supports Zod |
| adapter-node + Railway | Compatible | Railway runs Node containers |
| Supabase Realtime + three channel patterns | Compatible | All three patterns native |
| Vitest + Playwright (separate tiers) | Compatible | Vitest config excludes E2E glob |
| Edge Functions (Deno) + Supabase CLI | Compatible | `supabase functions serve` for local testing |

No contradictory decisions found.

**Pattern Consistency:** All naming, structure, communication, and process patterns align with the technology stack.

**Structure Alignment:** Project directory structure implements every architectural decision.

### Requirements Coverage Validation

**Functional Requirements — All 78 FRs Covered:**

| FR Group | FRs | Architectural Support | Gaps |
|---|---|---|---|
| Identity & Access (FR1-6) | 6 | Supabase Auth, `hooks.server.ts`, RLS | LinkedIn deferred to Phase 1.5 (PRD Override) |
| Sensei Management (FR7-12) | 6 | `features/profiles/`, `schemas/profiles.ts` | None |
| Learner Management (FR13-14) | 2 | `features/profiles/`, dashboard route | None |
| Session Scheduling (FR15-20) | 6 | `features/sessions/`, `$lib/utils/dates.ts` (UTC) | None |
| Video Sessions (FR21-26) | 6 | Daily.co, consent state machine, Storage lifecycle | None |
| AI Session Notes (FR27-33) | 7 | Edge Functions pipeline, job queue | None |
| Flash Help (FR34-41) | 8 | `features/matching/`, Broadcast, Presence | FR41 async fallback at story level |
| Trust & Reputation (FR42-45) | 4 | Database schema, `features/profiles/` | Phase 2 |
| Safety & Moderation (FR46-48) | 3 | `features/admin/`, flag schema | None |
| Payments (FR49, FR51) | 2 | Polar.sh webhooks, Edge Functions | FR50 deferred to Phase 3+ |
| Constellation (FR52-54) | 3 | Graph model (Phase 2) | Phase 2 |
| Admin (FR55-58) | 4 | `(admin)/` route group | None |
| Data Privacy (FR59-61) | 3 | RLS, consent state machine, audit logging | None |
| Enterprise (FR62-74) | 13 | `(enterprise)/`, nullable org_id/team_id | Phase 1.5-3 |
| Enterprise Intelligence (FR75-78) | 4 | Materialized views, Edge Functions | Phase 3-4 |

**Non-Functional Requirements Coverage:**

| NFR | Architectural Support | Status |
|---|---|---|
| Performance | SvelteKit SSR + CDN, `load` functions | Covered |
| Security | Supabase encryption, RLS, service role key isolation | Covered |
| Multi-tenancy | Nullable org_id/team_id, RLS policies | Covered |
| Scalability | Supabase managed + Railway horizontal | Covered |
| Accessibility | shadcn-svelte (Radix primitives) + `axe-core` in Playwright | Covered |
| Reliability | Health endpoint, retry patterns, emotional errors | Covered |
| Observability | Structured Edge Function logging, job queue health | Covered |
| Error Experience | `$lib/errors.ts` with `emotionalContext` | Covered |

### Testing Architecture (Four Tiers)

| Tier | Tool | Runtime | Scope | Location | Trigger |
|---|---|---|---|---|---|
| Unit + Component | Vitest + `@testing-library/svelte` | Node | Component logic, utilities, stores | Co-located `*.test.ts` | Every PR |
| RLS/Integration | Vitest + Supabase local | Node + Docker | RLS isolation, API endpoints | `tests/integration/` | Every PR |
| Edge Functions | Deno test runner or Vitest | Deno | Function logic with mocked external APIs | `supabase/functions/*/index.test.ts` | Every PR |
| E2E + Accessibility | Playwright + `@axe-core/playwright` | Browser + Docker | Full user flows, WCAG 2.1 AA | `tests/e2e/` | Pre-merge |

### Key Configuration Examples

**`.env.example`:**

```bash
# Supabase
PUBLIC_SUPABASE_URL=http://localhost:54321
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Polar.sh
POLAR_ACCESS_TOKEN=your-polar-access-token
POLAR_WEBHOOK_SECRET=your-polar-webhook-secret

# Daily.co
DAILY_API_KEY=your-daily-api-key

# OpenAI (Whisper + LLM)
OPENAI_API_KEY=your-openai-api-key

# App
PUBLIC_APP_URL=http://localhost:5173
```

**`svelte.config.js` (adapter-node for Railway):**

```javascript
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  }
};
```

**`src/routes/+layout.ts` (browser client initialization):**

```typescript
import { createBrowserClient, isBrowser, parse } from '@supabase/ssr'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
  depends('supabase:auth')

  const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: { fetch },
    cookies: { get(key) { if (!isBrowser()) return JSON.stringify(data.session); return parse(document.cookie)[key] } }
  })

  const { data: { session } } = await supabase.auth.getSession()

  return { supabase, session }
}
```

**Note:** Verify `@supabase/ssr` API against current docs during implementation — the cookie API may have simplified since this architecture was written.

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Project context thoroughly analyzed (78 FRs, 8 cross-cutting concerns)
- [x] Scale and complexity assessed (medium-high, ~14 subsystems)
- [x] Technical constraints identified (solo dev, Supabase Singapore, managed services)
- [x] Cross-cutting concerns mapped (8 concerns with location mapping)

**Architectural Decisions**

- [x] Critical decisions documented with versions (SvelteKit 2.50.2, shadcn-svelte 1.1.1, SuperForms 2.29.1)
- [x] Technology stack fully specified
- [x] Integration patterns defined (PostgREST, server endpoints, Edge Functions, Realtime)
- [x] Performance considerations addressed
- [x] Infrastructure costs specified (Supabase Pro $25/mo, Railway ~$5-20/mo)
- [x] PRD overrides explicitly documented

**Implementation Patterns**

- [x] Naming conventions established (snake_case pass-through)
- [x] Structure patterns defined (hybrid test location, schema files, components)
- [x] Communication patterns specified (event naming, payloads, channels)
- [x] Process patterns documented (loading, errors, retry, validation)
- [x] Enforcement guidelines: 11 rules
- [x] Anti-patterns table

**Project Structure**

- [x] Complete directory structure (~100+ files)
- [x] Component boundaries (6 rules)
- [x] Integration points mapped (5 services)
- [x] Requirements to structure mapping (15 FR groups)
- [x] Key configuration examples (.env, svelte.config, +layout.ts)

**Testing**

- [x] Four-tier testing architecture (unit, RLS/integration, Edge Function, E2E + accessibility)
- [x] Canonical RLS test fixtures
- [x] Accessibility testing via axe-core in Playwright
- [x] Edge Function testing via co-located tests with mocked APIs

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level:** High

**Key Strengths:**
- Every decision traces to a PRD requirement or cross-cutting concern
- PRD overrides explicitly documented — no ambiguity for agents
- snake_case pass-through eliminates the #1 agent inconsistency source
- Four-tier testing catches failures at every layer including Edge Functions and accessibility
- Emotionally calibrated error handling architecturally enforced
- Phase 1 schema includes nullable org_id/team_id — no migration at Phase 1.5
- Three Party Mode reviews caught 23 improvements total
- Infrastructure costs specified — no surprise blockers

**Areas for Future Enhancement:**
- Email notification provider selection (Resend/Postmark at story level)
- PRD document update for Stripe → Polar.sh, FR50 deferral, and other overrides
- FR41 async fallback modes (voice memo, Q&A) at story level

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions
- When in doubt, check the Enforcement Guidelines (11 rules) and Anti-Patterns table
- When PRD and architecture conflict, architecture takes precedence (see PRD Overrides)

**First Implementation Priority:**

```bash
npx sv create teachmesensei
# Template: SvelteKit minimal | TypeScript | Add-ons: tailwindcss, eslint, prettier, vitest, playwright
```

Followed by Supabase integration, `hooks.server.ts` auth setup, and the first integration test: "server-side hook correctly resolves authenticated user session."

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED
**Total Steps Completed:** 8
**Date Completed:** 2026-02-07
**Document Location:** `_bmad-output/planning-artifacts/architecture.md`

### Final Architecture Deliverables

**Complete Architecture Document**

- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**Implementation Ready Foundation**

- 30+ architectural decisions made across 5 categories
- 11 enforcement rules + anti-patterns table
- ~100+ files/directories specified in project structure
- 78 functional requirements fully supported
- 4-tier testing architecture

**AI Agent Implementation Guide**

- Technology stack with verified versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards
- PRD overrides for authoritative conflict resolution

---

**Architecture Status:** READY FOR IMPLEMENTATION

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.
