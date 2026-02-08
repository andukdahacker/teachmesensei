---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
workflowStatus: complete
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
---

# TeachMeSensei - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for TeachMeSensei, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Identity & Access (Phase 1)**
- FR1: Senseis can create an account using LinkedIn OAuth or email registration
- FR2: Learners can create an account using LinkedIn OAuth or email registration
- FR3: Users must verify they are 18+ during registration
- FR4: Users can manage their profile information (name, photo, bio)
- FR5: Senseis can set their topic expertise areas during onboarding
- FR6: The system enforces role-based data access boundaries (learners see own data, Senseis see own learners, Admin sees aggregates)

**Sensei Management (Phase 1)**
- FR7: Senseis can set their available time slots for sessions
- FR8: Senseis can generate and manage up to 5 invite codes
- FR9: Senseis can share invite codes via link or individual codes
- FR10: Senseis can view their learner list with session count and last interaction date
- FR11: Senseis can view AI-generated session summaries for their sessions
- FR12: Learners can claim a Sensei's invite code to establish a connection

**Learner Management (Phase 1)**
- FR13: Learners can optionally select topic interests during onboarding
- FR14: Learners can view their session history, connected Senseis, and past session notes

**Session Scheduling (Phase 1)**
- FR15: Learners can view a Sensei's available time slots
- FR16: Learners can book a session by selecting an available time slot
- FR17: Both parties receive email confirmation when a session is booked
- FR18: Either party can cancel or reschedule a booked session
- FR19: Both parties receive reminders before upcoming sessions
- FR20: The system displays and manages scheduling across timezones, showing availability in each user's local time

**Video Sessions (Phase 1)**
- FR21: Senseis and learners can join a live video session at the scheduled time
- FR22: Video sessions are automatically recorded (with two-party consent)
- FR23: Either participant can opt out of session recording before or during a session
- FR24: Session recordings are stored encrypted with access limited to both participants
- FR25: Either participant can mark a session recording for permanent retention before the 90-day expiration
- FR26: Session recordings are automatically deleted after 90 days unless explicitly saved

**AI-Powered Session Notes (Phase 1)**
- FR27: The system automatically transcribes completed session recordings
- FR28: The system generates a structured summary from session transcripts
- FR29: Both Sensei and learner receive session notes within 30 minutes of session end
- FR30: Session notes are stored and accessible for review before future sessions
- FR31: Senseis can view a pre-session brief showing learner context and previous session summary before joining a session
- FR32: Senseis can add personal annotations to AI-generated session notes
- FR33: Users can copy session notes to clipboard for use in external tools

**Flash Help & AI Triage (Phase 2)**
- FR34: Learners can initiate help through three entry points: "I'm stuck" / "I'm curious" / "I'm preparing"
- FR35: The AI layer can respond to learner questions instantly (24/7)
- FR36: The AI can detect emotional distress signals and adjust response approach
- FR37: The AI can escalate to human Sensei matching when appropriate
- FR38: Learners can connect to a matched Sensei for a paid Flash Help session
- FR39: The system matches learners to Senseis based on experience proximity ("2 Years Ahead") and style compatibility
- FR40: When no Sensei is available, the system provides an AI warm-hold experience with estimated human availability
- FR41: The system supports async fallback modes (voice memo, written Q&A) when live Senseis are unavailable

**Trust & Reputation (Phase 2)**
- FR42: The system tracks behavioral signals: return rate, session extensions, referrals
- FR43: Behavioral trust signals are surfaced on Sensei profiles
- FR44: Senseis can self-select style tags (DJ, Sherpa, Provocateur)
- FR45: Learners can view Sensei profiles with style tags, experience proximity, and behavioral signals

**Safety & Moderation (Phase 2)**
- FR46: Learners can flag a session that didn't feel right (one-tap with optional detail)
- FR47: The system categorizes flags by type for admin routing (technical, no-show, uncomfortable interaction, billing, other)
- FR48: The no-show detection flow provides learner recovery options (reschedule, connect with another Sensei, refund)

**Payments (Phase 2)**
- FR49: Learners can pay for Flash Help sessions via micro-transaction
- FR50: Senseis receive payouts for completed paid sessions (DEFERRED to Phase 3+ per Architecture override)
- FR51: Learners can request instant refunds for no-show sessions

**Constellation & Growth (Phase 2)**
- FR52: Senseis can view their mentorship constellation — a visual representation of people they've helped
- FR53: The system tracks graduation milestones (job landed, 90-day mark)
- FR54: Graduated learners receive a prompt to become Senseis

**Admin Operations (Phase 1-2)**
- FR55: Admin can view aggregate platform metrics (active pairs, session counts, flags)
- FR56: Admin can view and respond to flagged sessions
- FR57: Admin can view AI-generated session summaries (not raw transcripts) for flagged sessions
- FR58: Admin can directly contact learners or Senseis regarding flags

**Data Privacy & Ownership (Phase 1)**
- FR59: Either participant can request deletion of their session data
- FR60: The other participant is notified when deletion is requested
- FR61: Users can export their personal data (GDPR data portability)

**Team & Enterprise Management (Phase 1.5-3)**
- FR62: Team leads can create a team via a one-link setup flow in under 60 seconds (Phase 1.5)
- FR63: Team leads can generate a shareable team invite link for members to join (Phase 1.5)
- FR64: Team members can join a team by clicking the invite link (Phase 1.5)
- FR65: Team leads can view a manager dashboard showing team mentorship activity: active pairs, session counts, average session length, and members with zero activity (Phase 1.5)
- FR66: Team leads can view a team-level mentorship health view identifying who is mentoring, who isn't, and session frequency per pair (Phase 2)
- FR67: The system supports self-serve team plan billing at $15/user/mo via Stripe (Phase 2)
- FR68: The system enforces team-level data boundaries — team leads see only their own team's aggregate data (Phase 1.5)
- FR69: Org-level admins can connect multiple teams into an organization and view aggregate data across teams (Phase 3)
- FR70: Org-level admins can view the mentorship heat map — a team-by-team visualization of mentorship activity and gaps (Phase 3)
- FR71: Org-level admins can view enterprise aggregate reporting: org-wide session metrics, team comparisons, mentorship density by team (Phase 3)
- FR72: The system supports enterprise plan billing (invoice-based, annual contract) (Phase 3)
- FR73: Teams and orgs can opt into the cross-company mentorship network to access the broader Sensei pool (Phase 3)
- FR74: The system enforces org-level data isolation — one organization's mentorship data is never visible to another organization (Phase 1.5)

**Enterprise Intelligence (Phase 3-4)**
- FR75: The system generates a mentorship heat map visualization at the team and org level (Phase 3)
- FR76: The system provides AI coaching pattern analysis for mentors (Phase 4)
- FR77: The system auto-generates mentee progress reports (Phase 4)
- FR78: The system surfaces retention signals by detecting mentorship disengagement patterns (Phase 4)

### NonFunctional Requirements

**Performance**
- NFR1: Page load time for public content (curiosity feed, Sensei profiles): < 2 seconds globally via CDN
- NFR2: Authenticated app interactions (booking, navigation, dashboard): < 500ms server response
- NFR3: "Finding your Sensei" matching flow: complete end-to-end within 60 seconds
- NFR4: Video session join: < 3 seconds from clicking "Join" to seeing video
- NFR5: AI session notes delivery: within 30 minutes of session end for sessions under 60 minutes
- NFR6: Concurrent video sessions supported: 10 simultaneous (Phase 1), 50 simultaneous (Phase 2)

**Security**
- NFR7: All data encrypted in transit (TLS 1.2+) and at rest (AES-256)
- NFR8: Video recordings encrypted at rest with access via signed, expiring URLs
- NFR9: Session transcripts stored encrypted, accessible only to participants and (for flagged sessions) admin via AI summaries
- NFR10: Raw transcript access requires explicit escalation protocol with audit logging
- NFR11: Authentication via Supabase Auth with OAuth 2.0 and email/password
- NFR12: Row-level security enforced at database level for all user data
- NFR13: PCI DSS compliance via payment processor (platform never handles raw card data)
- NFR14: Two-party consent required for session recording
- NFR15: Age verification (18+) enforced at registration

**Multi-Tenancy**
- NFR16: Org-level data isolation enforced via Supabase RLS — no cross-organization data leakage
- NFR17: Team-level data boundaries within organizations — team leads see only their team's aggregate metrics
- NFR18: Same database infrastructure for B2C and B2B users — logical separation, not physical separation
- NFR19: RLS policies validated for: team member, team lead, org admin, platform admin role boundaries

**Scalability**
- NFR20: Phase 1: Support 10 concurrent Sensei-learner pairs (20 active users)
- NFR21: Phase 2: Support 50+ Flash Help sessions, 100 active users, 50-person teams
- NFR22: Phase 4: Support 500-person organizations with multiple teams
- NFR23: Architecture must not preclude 10x growth without re-architecture
- NFR24: Video infrastructure scales independently via Daily.co's managed service

**Accessibility**
- NFR25: WCAG 2.1 AA compliance for all user-facing interfaces
- NFR26: AI transcription provides captioning for recorded sessions
- NFR27: Keyboard navigation for all core flows including "I'm stuck" entry
- NFR28: Screen reader compatibility for constellation visualization and dashboard
- NFR29: Sufficient color contrast and text scaling support

**Reliability**
- NFR30: Platform uptime: 99.5%
- NFR31: Video session completion rate: > 99%
- NFR32: Graceful degradation: when no Sensei is available, AI warm-hold activates (never show error/empty state)
- NFR33: AI transcription pipeline: retry up to 5 times with exponential backoff over ~31 minutes (Architecture override from PRD's 3 retries/2 hours)
- NFR34: When payment processing fails, session still proceeds — billing resolved async

**Observability**
- NFR35: Structured logging for all Edge Functions (AI pipeline, payments, video room creation)
- NFR36: Error alerting for failed transcription jobs, payment failures, video room failures, Sensei no-shows
- NFR37: Basic operational dashboard: API error rates, transcription pipeline health, active sessions count
- NFR38: Alert routing: critical failures notify immediately; non-critical batch to daily summary

**Error Experience**
- NFR39: All user-facing error states must use empathetic, reassuring language
- NFR40: No raw technical error messages exposed to users
- NFR41: Every failure state has a warm fallback message that maintains trust
- NFR42: Error tone is a product differentiator

**Integration**
- NFR43: Daily.co: video sessions, recording, WebRTC edge routing
- NFR44: Polar.sh: payment processing (Architecture override — Stripe replaced by Polar.sh as Merchant of Record)
- NFR45: Whisper API (OpenAI): post-session audio transcription
- NFR46: LLM API (Claude/GPT): session summary generation, Flash Help AI triage, emotional detection
- NFR47: LinkedIn OAuth: identity verification for onboarding (deferred to Phase 1.5 per Architecture override — Phase 1 uses Google + GitHub + Magic Link)
- NFR48: Email service: session confirmations, reminders, notes delivery

### Additional Requirements

**From Architecture — Starter Template:**
- Official `sv` CLI selected as starter template (not a community SaaS boilerplate)
- Initialization: `npx sv create teachmesensei` with TypeScript, Tailwind, ESLint, Prettier, Vitest, Playwright
- Manual Supabase integration: `@supabase/supabase-js` + `@supabase/ssr`
- shadcn-svelte for UI components
- This impacts Epic 1, Story 1 — project scaffold must follow this exact sequence

**From Architecture — PRD Overrides (Architecture is authoritative):**
- Auth: LinkedIn OAuth deferred to Phase 1.5; Phase 1 uses Magic Link + Google + GitHub OAuth
- Payments: Polar.sh replaces Stripe as Merchant of Record (4% + $0.40/txn, handles global tax/VAT)
- FR50 (Sensei payouts): Deferred to Phase 3+ — Senseis are volunteers, not paid, per core positioning
- AI pipeline retry: 5 retries with exponential backoff over ~31 minutes (not PRD's 3 retries/2 hours)
- RLS tests: Run on every PR (not just every migration)

**From Architecture — Infrastructure Requirements:**
- Hosting: Railway (Singapore region) with `adapter-node`
- Supabase Pro plan ($25/mo) from Phase 1 (free tier insufficient)
- Explicit Dockerfile for Railway deployment
- `/health` endpoint checking Supabase connectivity for zero-downtime deploys
- GitHub Actions CI pipeline: lint, types, unit, RLS, Edge Function, build, E2E
- Railway auto-deploy on merge to main

**From Architecture — Cross-Cutting Concerns:**
- RLS + Data Isolation Testing: Every RLS policy must have corresponding data-isolation test; canonical test fixture in `tests/fixtures/roles.ts`
- AI Processing Pipeline: Plugin architecture (recording → transcription → [processing steps] → delivery); Postgres-backed job queue resilient to multi-hour outages
- Real-Time Communication: Supabase Realtime WebSockets for Flash Help matching, Sensei presence, admin dashboards, job queue triggers
- Multi-Tenancy: `org_id` and `team_id` columns added nullable in Phase 1 schema (no migration at Phase 1.5 boundary)
- Consent State Machine: Per-participant, per-session state machine with audit trail (consent_given → recording_active → consent_withdrawn → consent_expired)
- Notification Pipeline: Unified service with channel adapters (email, in-app, future push/Slack)
- Pre-Aggregated Data: Materialized views or periodic aggregation tables for enterprise dashboards and constellation visualization

**From Architecture — Implementation Patterns (Enforcement Rules):**
- snake_case pass-through for all database data (no camelCase conversion)
- Svelte 5 runes-first state management (no external state library)
- SuperForms owns form state, runes own everything else
- Zod schemas for input validation only (never mirror full database types)
- Direct schema imports (no barrel exports)
- Emotionally calibrated error messages for all user-facing states
- Four-tier testing: Unit, RLS/Integration, Edge Function, E2E + Accessibility
- Co-located `.test.ts` must never import Playwright
- Every collection page must have designed empty state with CTA

**From Architecture — Implementation Roadmap (Steps 0-9):**
- Step 0: Repository setup (GitHub, .gitignore, .env.example, CI skeleton)
- Step 1: Project scaffold (sv create, Supabase, shadcn-svelte, adapter-node, Dockerfile)
- Step 2: Auth integration (hooks.server.ts, OAuth providers, route guards) — first integration test: "server-side hook resolves authenticated session"
- Step 3: Database schema + RLS (initial migrations, RLS policies with data isolation tests, type generation)
- Step 4: Component library + layout (shadcn-svelte, AppShell, PublicShell, route group layouts)
- Step 5: Production deploy (/health endpoint, Railway config, env vars)
- Step 6: Real-time infrastructure (subscription manager, Presence, Broadcast)
- Step 7: Edge Functions + job queue (AI pipeline skeleton)
- Step 8: CI/CD pipeline (GitHub Actions, Playwright E2E, Railway auto-deploy)
- Step 9: Polar.sh integration (Phase 2 — payment flows)

### FR Coverage Map

- FR1: Epic 2 - Sensei account creation (Magic Link, Google, GitHub OAuth)
- FR2: Epic 2 - Learner account creation (Magic Link, Google, GitHub OAuth)
- FR3: Epic 2 - Age verification (18+) at registration
- FR4: Epic 2 - Profile management (name, photo, bio)
- FR5: Epic 2 - Sensei topic expertise during onboarding
- FR6: Epic 2 - Role-based data access boundaries (RLS)
- FR7: Epic 4 - Sensei available time slot management
- FR8: Epic 3 - Sensei invite code generation (up to 5)
- FR9: Epic 3 - Invite code sharing via link or individual codes
- FR10: Epic 3 - Sensei learner list view (session count, last interaction)
- FR11: Epic 6 - Sensei views AI-generated session summaries (depends on AI pipeline)
- FR12: Epic 3 - Learner claims invite code to connect
- FR13: Epic 2 - Learner topic interest selection during onboarding
- FR14: Epic 3 - Learner session history, connected Senseis, past notes
- FR15: Epic 4 - Learner views Sensei available time slots
- FR16: Epic 4 - Learner books session by selecting time slot
- FR17: Epic 4 - Email confirmation when session booked
- FR18: Epic 4 - Cancel or reschedule booked session
- FR19: Epic 4 - Session reminders before upcoming sessions
- FR20: Epic 4 - Timezone display and management
- FR21: Epic 5 - Join live video session at scheduled time
- FR22: Epic 5 - Automatic session recording (two-party consent)
- FR23: Epic 5 - Opt out of session recording
- FR24: Epic 5 - Encrypted recording storage with participant-only access
- FR25: Epic 5 - Mark recording for permanent retention
- FR26: Epic 5 - Auto-delete recordings after 90 days
- FR27: Epic 6 - Automatic session transcription
- FR28: Epic 6 - Structured summary generation from transcripts
- FR29: Epic 6 - Session notes delivery within 30 minutes
- FR30: Epic 6 - Session notes stored and accessible for review
- FR31: Epic 6 - Pre-session brief for Senseis (learner context + previous summary)
- FR32: Epic 6 - Sensei annotations on AI-generated notes
- FR33: Epic 6 - Copy session notes to clipboard
- FR34: Epic 8 - Three entry points: "I'm stuck" / "I'm curious" / "I'm preparing"
- FR35: Epic 8 - AI instant response layer (24/7)
- FR36: Epic 8 - AI emotional distress detection
- FR37: Epic 8 - AI escalation to human Sensei matching
- FR38: Epic 8 - Learner connects to matched Sensei for paid Flash Help
- FR39: Epic 8 - Matching based on experience proximity and style
- FR40: Epic 8 - AI warm-hold with estimated human availability
- FR41: Epic 8 - Async fallback modes (voice memo, written Q&A)
- FR42: Epic 10 - Track behavioral signals (return rate, extensions, referrals)
- FR43: Epic 10 - Surface behavioral trust signals on Sensei profiles
- FR44: Epic 10 - Sensei self-select style tags
- FR45: Epic 10 - Enriched Sensei profiles with style tags, proximity, signals
- FR46: Epic 10 - Learner flags session ("That didn't feel right")
- FR47: Epic 10 - Flag categorization for admin routing
- FR48: Epic 10 - No-show detection with recovery options
- FR49: Epic 9 - Flash Help micro-transaction payment
- FR50: DEFERRED to Phase 3+ (Sensei payouts — Architecture override)
- FR51: Epic 9 - Instant refunds for no-show sessions
- FR52: Epic 11 - Sensei mentorship constellation visualization
- FR53: Epic 11 - Graduation milestone tracking
- FR54: Epic 11 - Graduate-to-Sensei prompt
- FR55: Epic 6 - Admin aggregate platform metrics
- FR56: Epic 10 - Admin views and responds to flagged sessions
- FR57: Epic 10 - Admin views AI session summaries for flagged sessions
- FR58: Epic 10 - Admin contacts learners/Senseis regarding flags
- FR59: Epic 7 - Data deletion request by participant
- FR60: Epic 7 - Notification to other participant on deletion request
- FR61: Epic 7 - GDPR data export (portability)
- FR62: Epic 7 - Team creation via one-link setup (60 seconds)
- FR63: Epic 7 - Shareable team invite link generation
- FR64: Epic 7 - Team member joins via invite link
- FR65: Epic 7 - Manager dashboard (active pairs, session counts, activity gaps)
- FR66: Epic 7 - Team mentorship health view (who's mentoring, frequency)
- FR67: Epic 9 - Self-serve team plan billing ($15/user/mo)
- FR68: Epic 7 - Team-level data boundaries (RLS)
- FR69: Epic 12 - Org admin connects teams into organization
- FR70: Epic 12 - Mentorship heat map (team-by-team visualization)
- FR71: Epic 12 - Enterprise aggregate reporting
- FR72: Epic 12 - Enterprise plan billing (invoice-based, annual)
- FR73: Epic 12 - Cross-company mentorship network opt-in
- FR74: Epic 7 - Org-level data isolation (RLS)
- FR75: Epic 12 - Mentorship heat map at team and org level
- FR76: Epic 13 - AI coaching pattern analysis for mentors
- FR77: Epic 13 - Auto-generated mentee progress reports
- FR78: Epic 13 - Retention signal detection (attrition early warning)

## Epic List

### Epic 1: Project Foundation & Production Deploy
The development team can build, test, and deploy features to production with a fully configured CI/CD pipeline, component library, and test infrastructure.
**FRs covered:** None (infrastructure epic — Architecture Steps 0, 1, 4, 5, 8)
**Phase:** 1
**Includes:** Repo setup, `sv create` scaffold, Supabase init, shadcn-svelte, adapter-node + Dockerfile, Railway deploy, `/health` endpoint, GitHub Actions CI, Vitest config (unit + integration), Playwright config, `tests/fixtures/roles.ts`, smoke RLS test

## Epic 1: Project Foundation & Production Deploy

The development team can build, test, and deploy features to production with a fully configured CI/CD pipeline, component library, and test infrastructure.

### Story 1.1: Repository Setup & SvelteKit Scaffold

As a developer,
I want a fully initialized SvelteKit project with all core dependencies and tooling configured,
So that I can begin building features on a consistent, well-structured foundation.

**Acceptance Criteria:**

**Given** the project doesn't exist yet
**When** I run the initialization sequence
**Then** a SvelteKit project is created using `npx sv create` with TypeScript, Tailwind, ESLint, Prettier, Vitest, Playwright
**And** `@supabase/supabase-js` and `@supabase/ssr` are installed
**And** `npx supabase init` creates `supabase/config.toml`, `migrations/`, and `seed.sql`
**And** `npx shadcn-svelte@latest init` configures the component library
**And** `svelte.config.js` uses `adapter-node`
**And** `.gitignore` includes `.env.local`, `node_modules/`, `.svelte-kit/`, `supabase/.temp/`
**And** `.env.example` contains all required environment variable placeholders
**And** the project builds successfully with `npm run build`
**And** `npm run dev` starts the development server without errors

### Story 1.2: Route Group Layouts & Component Library Shell

As a developer,
I want the four route groups and layout shells configured,
So that all future features have consistent navigation and layout infrastructure.

**Acceptance Criteria:**

**Given** the SvelteKit project exists from Story 1.1
**When** I create the route group structure
**Then** four route groups exist: `(public)`, `(app)`, `(admin)`, `(enterprise)`
**And** `(public)` has a `PublicShell` layout with basic navigation and footer
**And** `(app)` has an `AppShell` layout with sidebar placeholder
**And** `(admin)` and `(enterprise)` have empty shell layouts with placeholder pages
**And** the `(public)` landing page renders a basic placeholder
**And** shadcn-svelte `Button`, `Card`, `Input`, `Dialog`, `Skeleton`, `Sonner`, `Avatar`, `Badge` components are installed
**And** global styles and Tailwind directives are configured in `app.css`
**And** all layouts render without errors

### Story 1.3: Production Deployment & Health Check

As a developer,
I want the application deployed to Railway with a health endpoint,
So that I can verify production infrastructure works before building features.

**Acceptance Criteria:**

**Given** the SvelteKit project builds successfully
**When** I configure production deployment
**Then** a `Dockerfile` exists for Railway deployment with `adapter-node`
**And** a `/health` endpoint exists at `src/routes/api/health/+server.ts`
**And** the health endpoint checks Supabase connectivity and returns `{ status: 'ok' }` on success
**And** the health endpoint returns `{ status: 'degraded', error: '...' }` with 503 when Supabase is unreachable
**And** the application deploys successfully to Railway (Singapore region)
**And** the `/health` endpoint responds with 200 in production
**And** environment variables (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`) are configured in Railway

### Story 1.4: CI/CD Pipeline & Test Infrastructure

As a developer,
I want a GitHub Actions CI pipeline and test infrastructure configured,
So that every PR is validated for code quality, type safety, and test compliance.

**Acceptance Criteria:**

**Given** the project is in a GitHub repository
**When** I set up the CI pipeline
**Then** `.github/workflows/ci.yml` runs on every PR to main
**And** the pipeline executes in order: lint (ESLint + Prettier) → type check (svelte-check + tsc) → unit tests (Vitest) → build (vite build)
**And** Vitest is configured with two projects: `unit` (co-located `*.test.ts`) and `integration` (`tests/integration/`)
**And** Vitest config excludes `tests/e2e/` from its test glob
**And** Playwright config points at `tests/e2e/`
**And** `tests/fixtures/roles.ts` exists with the canonical multi-role test user factory stub (learner, sensei, team_lead, org_admin, platform_admin)
**And** `package.json` includes all development workflow scripts: `db:start`, `db:stop`, `db:reset`, `db:types`, `test:unit`, `test:integration`, `test:e2e`, `test:rls`
**And** Railway auto-deploys on merge to main
**And** at least one passing unit test exists proving the test infrastructure works

---

### Epic 2: Identity, Auth & User Profiles
Users can register (Magic Link, Google, GitHub OAuth), log in, verify age (18+), manage their profile, and experience role-based access. Senseis complete onboarding with topic expertise. Learners set topic interests.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR13

## Epic 2: Identity, Auth & User Profiles

Users can register (Magic Link, Google, GitHub OAuth), log in, verify age (18+), manage their profile, and experience role-based access. Senseis complete onboarding with topic expertise. Learners set topic interests.

### Story 2.0: Provision Staging Environment

As a developer,
I want a staging environment on Railway with its own Supabase project,
So that I can validate database migrations, RLS policies, and auth flows before deploying to production.

**Acceptance Criteria:**

**Given** the production Railway service from Epic 1
**When** I provision a staging environment
**Then** a separate Railway service exists with its own environment variables
**And** a separate Supabase project provides an isolated staging database
**And** the CI/CD pipeline (from Story 1.4) deploys to staging on push to a staging branch (or PR merge)
**And** staging and production share zero data — fully isolated
**And** the staging `/api/health` endpoint returns 200 with its own Supabase connection

> **Decision Note:** Deferred from Epic 1 (agreed during PM chat on 2026-02-08). Staging adds no value until database schema and auth exist — Epic 2 is where deployment risk first appears.

---

### Story 2.1: Supabase Auth Integration & Route Guards

As a developer,
I want Supabase Auth integrated with server-side session resolution and route guards,
So that the authentication foundation is secure and verified before building user-facing auth flows.

**Acceptance Criteria:**

**Given** the SvelteKit project with Supabase packages installed
**When** I configure auth integration
**Then** `hooks.server.ts` creates a Supabase server client using `@supabase/ssr` with proper cookie handling
**And** `+layout.ts` creates a Supabase browser client for client-side access
**And** `+layout.server.ts` at root passes session data to the client
**And** `(app)` routes redirect unauthenticated users to `/login`
**And** `(admin)` routes require admin/platform_admin role (returns 403 otherwise)
**And** `(enterprise)` routes require team_lead/org_admin role (returns 403 otherwise)
**And** `(public)` routes are accessible without authentication
**And** an integration test verifies: "server-side hook correctly resolves authenticated user session"
**And** `auth.getUser()` is used on server (never trusting unencoded session)

### Story 2.2: User Registration & Login

As a user,
I want to register and log in using Magic Link, Google, or GitHub OAuth,
So that I can access the platform with minimal friction.

**Acceptance Criteria:**

**Given** an unauthenticated user on the login page
**When** the user enters their email and submits for Magic Link
**Then** Supabase sends a magic link email and the UI shows "Check your email"
**And** clicking the magic link in the email completes authentication and redirects to `/dashboard`

**Given** an unauthenticated user on the login page
**When** the user clicks "Continue with Google"
**Then** the OAuth flow redirects to Google, completes authentication, and redirects to `/dashboard` via the `/login/callback` route

**Given** an unauthenticated user on the login page
**When** the user clicks "Continue with GitHub"
**Then** the OAuth flow redirects to GitHub, completes authentication, and redirects to `/dashboard` via the `/login/callback` route

**Given** a new user completing registration for the first time
**When** authentication succeeds
**Then** a `profiles` row is created with default role (learner) and `onboarding_complete: false`
**And** the user is redirected to onboarding flow

**Given** an existing user logging in
**When** authentication succeeds
**Then** the user is redirected to `/dashboard`

**Given** an OAuth provider (Google or GitHub) returns an error during the flow
**When** the user is redirected back to the login page
**Then** the UI displays a clear, warm error message: "We couldn't sign you in with [Provider]. Please try again or use a different method."
**And** the error is logged with the provider name and error code for debugging
**And** the user remains on the login page with all auth options still available

**E2E Test AC:**
**Given** the full registration and login flow
**When** an E2E test runs the happy path (Magic Link registration → onboarding → dashboard)
**Then** the test verifies the complete flow from unauthenticated → registered → onboarded → dashboard
**And** the test verifies OAuth redirect URLs are configured correctly (no 404s on callback routes)

### Story 2.3: Age Verification & Onboarding Flow

As a new user,
I want to verify my age and complete onboarding with my role selection and profile details,
So that I can start using the platform with a complete profile.

**Acceptance Criteria:**

**Given** a new user who has just registered
**When** they reach the onboarding flow
**Then** an age verification step requires date of birth entry
**And** users under 18 see a warm message: "TeachMeSensei is designed for adults navigating career transitions. Come back when you're 18!" and cannot proceed
**And** users 18+ proceed to role selection

**Given** a user completing onboarding
**When** they select their role
**Then** they can choose "I'm a Learner" or "I'm a Sensei"
**And** the `profiles.role` column is updated to `learner` or `sensei`

**Given** a learner completing onboarding
**When** they fill in their profile
**Then** they can set name, upload photo, write bio, and optionally select topic interests (FR13)
**And** `onboarding_complete` is set to `true`
**And** they are redirected to `/dashboard`

**Given** a Sensei completing onboarding
**When** they fill in their profile
**Then** they can set name, upload photo, write bio, and select topic expertise areas (FR5)
**And** `onboarding_complete` is set to `true`
**And** they are redirected to `/dashboard`

**Given** a user with `onboarding_complete: false`
**When** they try to access any `(app)` route
**Then** they are redirected to the onboarding flow

### Story 2.4: Profile Management

As a user,
I want to view and edit my profile information,
So that I can keep my details accurate and present myself to the community.

**Acceptance Criteria:**

**Given** an authenticated user on the profile page
**When** they view their profile
**Then** they see their name, photo, bio, role, and topic areas
**And** the page uses the `(app)/profile/` route

**Given** an authenticated user editing their profile
**When** they update name, photo, or bio and submit
**Then** the profile is updated in the database via SuperForms form action
**And** validation uses Zod schema from `$lib/schemas/profiles.ts`
**And** a success toast confirms the update

**Given** a Sensei editing their profile
**When** they update topic expertise areas
**Then** the topics are saved and reflected on their profile

**Given** a learner editing their profile
**When** they update topic interests
**Then** the interests are saved and reflected on their profile

### Story 2.5: Database Schema, RLS & Role-Based Access

As a platform,
I want user data protected by row-level security policies,
So that users can only access data appropriate to their role (FR6).

**Acceptance Criteria:**

**Given** the database schema
**When** migrations are applied
**Then** `profiles` table exists with: `id` (FK to auth.users), `role` (enum: learner, sensei, admin, platform_admin, team_lead, org_admin), `name`, `photo_url`, `bio`, `topics` (text[]), `date_of_birth`, `onboarding_complete`, `org_id` (nullable), `team_id` (nullable), `created_at` (timestamptz), `updated_at` (timestamptz)
**And** all time columns use `timestamptz` (never `timestamp`)
**And** `org_id` and `team_id` are nullable UUID columns with NO foreign key constraints (FK constraints will be added via ALTER TABLE in Epic 7/12 when the referenced tables are created)

**Given** RLS policies on the `profiles` table
**When** a learner queries profiles
**Then** they can read their own profile
**And** they can read basic public fields (name, photo, topics, role) of Senseis
**And** they cannot read other learners' profiles

**Given** RLS policies on the `profiles` table
**When** a Sensei queries profiles
**Then** they can read their own profile
**And** they can read profiles of learners connected to them

**Given** the RLS test infrastructure
**When** RLS tests run
**Then** `tests/integration/rls/users.rls.test.ts` uses `createTestUsers()` from `tests/fixtures/roles.ts`
**And** tests verify learner cannot access other learner data
**And** tests verify Sensei can only access connected learner data
**And** tests verify admin can access aggregate data
**And** all RLS tests pass

---

### Epic 3: Sensei Invite System & Learner Connections
Senseis can generate and share invite codes, learners claim codes to connect with a Sensei, and both parties can view their connections and interaction history.
**FRs covered:** FR8, FR9, FR10, FR12, FR14

## Epic 3: Sensei Invite System & Learner Connections

Senseis can generate and share invite codes, learners claim codes to connect with a Sensei, and both parties can view their connections and interaction history.

### Story 3.1: Invite Code Generation & Management

As a Sensei,
I want to generate and manage up to 5 invite codes,
So that I can control who joins the platform and bring my existing mentees on board.

**Acceptance Criteria:**

**Given** an authenticated Sensei
**When** they visit their invite codes page
**Then** they see up to 5 invite codes with status: unused, claimed (with claimer name)
**And** each code has a shareable link format: `teachmesensei.com/invite/{sensei_slug}-{code}`
**And** the Sensei can tap to copy any code or shareable link

**Given** a Sensei with fewer than 5 codes
**When** they request a new invite code
**Then** a new code is generated and displayed

**Given** a Sensei with 5 existing codes
**When** they try to generate another code
**Then** they see a message: "You've reached your 5 invite code limit"

**Given** the database schema
**When** migrations are applied
**Then** an `invite_codes` table exists with: `id`, `sensei_id` (FK to profiles), `code` (unique), `shareable_url`, `status` (enum: unused, claimed), `claimed_by` (FK to profiles, nullable), `claimed_at` (timestamptz, nullable), `created_at` (timestamptz)
**And** RLS policies ensure Senseis can only see and manage their own codes

### Story 3.2: Learner Claims Invite Code

As a learner,
I want to claim a Sensei's invite code to establish a mentorship connection,
So that I can start scheduling sessions with my Sensei.

**Acceptance Criteria:**

**Given** a learner who has a Sensei's invite link
**When** they visit the invite link URL
**Then** they see the Sensei's public profile (name, photo, topics, bio)
**And** a "Connect with [Sensei Name]" button is displayed

**Given** an authenticated learner clicking "Connect"
**When** the invite code is valid and unused
**Then** a `connections` row is created linking learner and Sensei
**And** the invite code status updates to `claimed` with the learner's profile ID
**And** the learner is redirected to the Sensei's profile page with a success message
**And** the Sensei receives a notification (in-app) that a learner claimed their code

**Given** an unauthenticated visitor clicking the invite link
**When** they arrive at the invite page
**Then** they are prompted to register/login first, then redirected back to claim the code

**Given** a learner trying to claim an already-used code
**When** they submit the code
**Then** they see a warm message: "This invite code has already been claimed"

**Given** the database schema
**When** migrations are applied
**Then** a `connections` table exists with: `id`, `sensei_id` (FK), `learner_id` (FK), `status` (enum: active, archived), `connected_at` (timestamptz), `last_interaction_at` (timestamptz, nullable)
**And** RLS policies ensure Senseis see their own connections and learners see their own connections

### Story 3.3: Sensei Learner List

As a Sensei,
I want to view my connected learners with session count and last interaction date,
So that I can keep track of my mentorship relationships (FR10).

**Acceptance Criteria:**

**Given** an authenticated Sensei on their dashboard
**When** they view their learner list
**Then** they see all connected learners with: name, photo, session count, last interaction date
**And** the list is sorted by most recent interaction (or connection date if no sessions yet)
**And** each learner entry links to the learner's profile

**Given** a Sensei with no connected learners
**When** they view their learner list
**Then** they see an empty state: "No learners yet — share your invite codes to get started!" with a link to their invite codes page

**Given** a Sensei with connected learners but no sessions yet
**When** they view the learner list
**Then** session count shows "0" and last interaction shows the connection date

**Implementation Note:** Session count uses a LEFT JOIN to the `sessions` table. If Epic 4 migrations have not yet been applied (sessions table does not exist), the query defaults session count to 0 and uses `connections.connected_at` as the last interaction date. The Supabase query must handle the missing table gracefully — use a database view or RPC function that returns 0 for session count when the sessions table is absent.

### Story 3.4: Learner Connection & Session History View

As a learner,
I want to view my connected Senseis and session history,
So that I can manage my mentorship relationships and review past interactions (FR14).

**Acceptance Criteria:**

**Given** an authenticated learner on their dashboard
**When** they view their connections
**Then** they see all connected Senseis with: name, photo, topics, session count, last interaction date
**And** each Sensei entry links to the Sensei's profile

**Given** a learner with connections but no sessions yet
**When** they view their connections
**Then** session count shows "0" and a CTA says "Schedule your first session"

**Given** a learner with no connections
**When** they view their connections
**Then** they see an empty state: "No Senseis yet — enter an invite code to connect with a Sensei!" with an invite code input field

**Given** a learner on their session history page
**When** they view past sessions
**Then** they see a chronological list with: Sensei name, date, duration, and link to session notes (if available)
**And** the empty state says: "No sessions yet — schedule your first one!"

---

### Epic 4: Session Scheduling & Availability
Senseis set available time slots, learners browse availability and book sessions, both receive email confirmations and reminders, either party can cancel/reschedule, timezone handling works correctly.
**FRs covered:** FR7, FR15, FR16, FR17, FR18, FR19, FR20

## Epic 4: Session Scheduling & Availability

Senseis set available time slots, learners browse availability and book sessions, both receive email confirmations and reminders, either party can cancel/reschedule, timezone handling works correctly.

### Story 4.1: Sensei Availability Management

As a Sensei,
I want to set my available time slots for mentorship sessions,
So that learners can see when I'm free and book accordingly (FR7).

**Acceptance Criteria:**

**Given** an authenticated Sensei on their availability settings page
**When** they set available time slots
**Then** they can select recurring weekly slots (e.g., Tuesdays 7-10pm, Thursdays 7-10pm)
**And** they can set slot duration (15, 30, 45, or 60 minutes)
**And** all times are entered in the Sensei's local timezone and stored as UTC in the database
**And** they can add, edit, or remove availability slots
**And** changes save immediately with optimistic UI update and success toast

**Given** the database schema
**When** migrations are applied
**Then** an `availability_slots` table exists with: `id`, `sensei_id` (FK), `day_of_week` (int 0-6), `start_time` (time), `end_time` (time), `timezone` (text), `slot_duration_minutes` (int), `is_active` (boolean), `created_at` (timestamptz), `updated_at` (timestamptz)
**And** RLS policies ensure Senseis can only manage their own slots
**And** learners can read availability of connected Senseis

**Given** a Sensei with no availability set
**When** they view the availability page
**Then** they see an empty state: "Set your availability so learners can book sessions with you" with a clear CTA

### Story 4.2: Learner Views Availability & Books Session

As a learner,
I want to view my Sensei's available time slots and book a session,
So that I can schedule mentorship at a convenient time (FR15, FR16).

**Acceptance Criteria:**

**Given** an authenticated learner connected to a Sensei
**When** they visit the scheduling page for that Sensei
**Then** they see the Sensei's available slots displayed in the learner's local timezone
**And** already-booked slots appear as unavailable
**And** past slots do not appear

**Given** a learner selecting an available slot
**When** they confirm the booking
**Then** a `sessions` row is created with status `scheduled`, both participant IDs, scheduled time (UTC), and duration
**And** the slot becomes unavailable for other learners
**And** the learner sees a confirmation with session details in their local time

**Given** the database schema
**When** migrations are applied
**Then** a `sessions` table exists with: `id`, `sensei_id` (FK), `learner_id` (FK), `status` (enum: scheduled, in_progress, completed, cancelled, no_show), `scheduled_at` (timestamptz), `duration_minutes` (int), `started_at` (timestamptz, nullable), `ended_at` (timestamptz, nullable), `cancelled_at` (timestamptz, nullable), `cancelled_by` (FK, nullable), `org_id` (nullable), `team_id` (nullable), `created_at` (timestamptz), `updated_at` (timestamptz)
**And** RLS policies ensure participants can only see their own sessions

**Given** a learner trying to book a slot that was just taken
**When** they submit the booking
**Then** they see a warm message: "This slot was just booked — please pick another time"

**E2E Test AC:**
**Given** the full booking flow
**When** an E2E test runs the happy path (learner views Sensei availability → selects slot → confirms booking)
**Then** the test verifies slot display in correct timezone, successful booking creation, confirmation screen, and slot becoming unavailable

### Story 4.3: Session Email Confirmations

As a session participant,
I want to receive email confirmation when a session is booked,
So that I have the details in my inbox and calendar (FR17).

**Acceptance Criteria:**

**Given** a session is successfully booked
**When** the booking is confirmed
**Then** both Sensei and learner receive an email with: session date/time in their respective local timezones, duration, participant names, and a link to the session page
**And** emails use warm, encouraging tone (e.g., "Your session with Marcus is confirmed!")

**Given** the email sending infrastructure
**When** an email needs to be sent
**Then** an email service is configured (Resend or equivalent)
**And** email templates are stored in a maintainable format
**And** email sending failures are logged but do not block the booking

**Given** a `$lib/utils/dates.ts` utility
**When** formatting dates for display
**Then** `formatForTimezone(utcDate, timezone)` returns localized date/time using `Intl.DateTimeFormat`
**And** all date display throughout the app uses this utility consistently

### Story 4.4: Cancel & Reschedule Session

As a session participant,
I want to cancel or reschedule a booked session,
So that I can manage changes to my schedule gracefully (FR18).

**Acceptance Criteria:**

**Given** a participant viewing an upcoming scheduled session
**When** they click "Cancel Session"
**Then** a confirmation dialog appears: "Are you sure you want to cancel this session?"
**And** upon confirmation, the session status updates to `cancelled` with `cancelled_by` set to the user
**And** the other participant receives an email notification about the cancellation
**And** the time slot becomes available again for booking

**Given** a participant viewing an upcoming scheduled session
**When** they click "Reschedule"
**Then** they see the Sensei's availability picker (same as booking flow)
**And** selecting a new time cancels the original session and creates a new one
**And** both participants receive email notification of the rescheduled time

**Given** a session that starts in less than 1 hour
**When** a participant tries to cancel
**Then** they see: "This session starts very soon. Are you sure you want to cancel?" but can still proceed

### Story 4.5: Session Reminders

As a session participant,
I want to receive reminders before upcoming sessions,
So that I don't miss my mentorship appointments (FR19).

**Acceptance Criteria:**

**Given** a scheduled session
**When** the session is 24 hours away
**Then** both participants receive an email reminder with session details in their local timezone

**Given** a scheduled session
**When** the session is 1 hour away
**Then** both participants receive an email reminder with a direct link to join the session

**Given** the reminder infrastructure
**When** reminders need to be sent
**Then** a scheduled job checks for upcoming sessions and sends reminders at the configured intervals
**And** reminders are not sent for cancelled sessions
**And** reminder sending failures are logged but do not affect the session

**Given** a session that was booked less than 24 hours before the scheduled time
**When** the 24-hour reminder would fire
**Then** the 24-hour reminder is skipped (only the 1-hour reminder sends)

**Emotional Framing Note:** All reminder emails must use warm, encouraging language that reinforces the value of the upcoming session. Examples: "Your session with Marcus is tomorrow — he's looking forward to continuing where you left off!" (24h) and "Your session with Marcus starts in 1 hour. Time to grow!" (1h). Avoid cold/transactional phrasing like "Reminder: You have a session scheduled."

---

### Epic 5: Video Sessions & Recording Consent
Senseis and learners join live video sessions, consent to recording via two-party state machine, opt out of recording, access encrypted recordings, and manage recording retention.
**FRs covered:** FR21, FR22, FR23, FR24, FR25, FR26

## Epic 5: Video Sessions & Recording Consent

Senseis and learners join live video sessions, consent to recording via two-party state machine, opt out of recording, access encrypted recordings, and manage recording retention.

### Story 5.1: Daily.co Integration & Video Room Creation

As a session participant,
I want to join a live video session at the scheduled time,
So that I can have a face-to-face mentorship conversation (FR21).

**Acceptance Criteria:**

**Given** a scheduled session approaching its start time
**When** either participant clicks "Join Session" on the session detail page
**Then** a Daily.co video room is created (or retrieved if already created) via server-side API call
**And** the participant joins the video room using the Daily.co client SDK
**And** video and audio are active by default
**And** the session page shows the video interface with basic controls (mute, camera toggle, leave)

**Given** a session that is not yet within the join window (>5 minutes before scheduled time)
**When** a participant tries to join
**Then** they see: "Your session starts at [time]. You can join 5 minutes early."

**Given** a participant joining the session
**When** the video room loads
**Then** the join-to-video time is under 3 seconds (NFR4)
**And** the session status updates to `in_progress` when both participants have joined

**Given** a participant leaving the session
**When** they click "Leave Session"
**Then** they are disconnected from the video room
**And** if both participants have left, the session status updates to `completed` with `ended_at` timestamp

**Given** a participant experiencing a video connection drop during the session
**When** the Daily.co SDK detects a network interruption
**Then** the UI shows a warm recovery message: "Connection lost — reconnecting..." with a calming animation (not a harsh error screen)
**And** the SDK automatically attempts to reconnect for up to 30 seconds
**And** if reconnection succeeds, the session resumes with a brief toast: "You're back!"
**And** if reconnection fails after 30 seconds, the UI shows: "We couldn't reconnect. Don't worry — your session can continue when you rejoin." with a "Rejoin Session" button
**And** the session status does NOT change to `completed` until both participants have explicitly left

**Given** the database schema
**When** migrations are applied
**Then** a `daily_rooms` table exists with: `id`, `session_id` (FK), `room_name`, `room_url`, `created_at` (timestamptz), `expires_at` (timestamptz)

**E2E Test AC:**
**Given** the full video session flow
**When** an E2E test runs the session join path
**Then** the test verifies: session detail page loads, "Join Session" button appears within the join window, Daily.co room creation succeeds, and basic video controls (mute, camera toggle, leave) are rendered

### Story 5.2: Recording Consent State Machine

As a session participant,
I want to provide or withdraw consent for session recording,
So that my privacy is respected and I control what is recorded (FR22, FR23).

**Acceptance Criteria:**

**Given** both participants have joined a session
**When** the session begins
**Then** a consent dialog appears for each participant: "This session can be recorded for AI-generated notes. Both participants must agree. You can withdraw consent at any time."
**And** each participant independently selects "I agree to recording" or "Skip recording"

**Given** both participants consent to recording
**When** both consents are received
**Then** the consent state transitions to `recording_active`
**And** Daily.co recording starts automatically
**And** a visual indicator shows "Recording" in the session UI

**Given** either participant does not consent
**When** one selects "Skip recording"
**Then** the consent state remains `consent_declined` and no recording occurs
**And** the session proceeds normally without recording
**And** both participants see: "Session is not being recorded"

**Given** a participant who previously consented
**When** they click "Stop Recording" during the session
**Then** the consent state transitions to `consent_withdrawn`
**And** Daily.co recording stops immediately
**And** both participants are notified: "Recording has been stopped"

**Given** the database schema
**When** migrations are applied
**Then** a `session_consent` table exists with: `id`, `session_id` (FK), `user_id` (FK), `consent_state` (enum: pending, consent_given, consent_declined, consent_withdrawn), `state_changed_at` (timestamptz), `created_at` (timestamptz)
**And** a `consent_audit_log` table exists with: `id`, `session_id` (FK), `user_id` (FK), `previous_state`, `new_state`, `changed_at` (timestamptz)
**And** every consent state transition is logged in the audit table

### Story 5.3: Recording Storage & Encrypted Access

As a session participant,
I want session recordings stored encrypted and accessible only to me and my session partner,
So that our conversation remains private and secure (FR24).

**Acceptance Criteria:**

**Given** a session with recording that has completed
**When** the Daily.co recording webhook fires with the completed recording
**Then** the recording is uploaded to Supabase Storage in an encrypted bucket
**And** a `recordings` table row is created with: `id`, `session_id` (FK), `storage_path`, `duration_seconds`, `file_size_bytes`, `status` (enum: processing, available, expired, deleted), `expires_at` (timestamptz — 90 days from creation), `retained` (boolean, default false), `created_at` (timestamptz)

**Given** a participant wanting to access a recording
**When** they click "View Recording" on the session detail page
**Then** a signed URL is generated with a short expiration (e.g., 1 hour)
**And** the recording plays in-browser via the signed URL
**And** the signed URL expires after the configured time

**Given** RLS policies on recordings
**When** a user queries recordings
**Then** they can only access recordings for sessions where they are a participant
**And** admin cannot access recordings directly (only AI summaries for flagged sessions)

**Given** the webhook endpoint
**When** Daily.co sends a recording-ready webhook
**Then** `api/webhooks/daily/+server.ts` verifies the webhook signature
**And** processes the recording upload idempotently (handles duplicate webhook delivery)

### Story 5.4: Recording Retention & Lifecycle Management

As a session participant,
I want recordings auto-deleted after 90 days unless I explicitly save them,
So that my data isn't stored indefinitely without my consent (FR25, FR26).

**Acceptance Criteria:**

**Given** a recording that is approaching 90 days old
**When** a participant views the recording
**Then** they see a notice: "This recording will be automatically deleted on [date]. Save it to keep it permanently."
**And** a "Save Permanently" button is available

**Given** a participant clicking "Save Permanently"
**When** they confirm
**Then** the `recordings.retained` flag is set to `true`
**And** the recording is excluded from automatic deletion
**And** a confirmation toast shows: "Recording saved permanently"

**Given** a recording that has reached 90 days and is not retained
**When** the scheduled cleanup job runs
**Then** the recording file is deleted from Supabase Storage
**And** the `recordings.status` updates to `expired`
**And** the session detail page shows: "Recording has expired" instead of a play button

**Given** the cleanup infrastructure
**When** the scheduled cleanup Edge Function (`scheduled-cleanup`) runs
**Then** it queries recordings where `expires_at < now()` and `retained = false` and `status = 'available'`
**And** deletes the storage files and updates status to `expired`
**And** logs the count of expired recordings for observability

---

### Epic 6: AI-Powered Session Notes & Admin Metrics
Both parties receive auto-generated session summaries within 30 minutes, review notes before future sessions, Senseis see pre-session briefs, add annotations, users copy notes. Admin can view aggregate platform metrics.
**FRs covered:** FR27, FR28, FR29, FR30, FR31, FR32, FR33, FR55

## Epic 6: AI-Powered Session Notes & Admin Metrics

Both parties receive auto-generated session summaries within 30 minutes, review notes before future sessions, Senseis see pre-session briefs, add annotations, users copy notes. Admin can view aggregate platform metrics.

### Story 6.1: Job Queue Infrastructure & AI Pipeline Skeleton

As a developer,
I want a Postgres-backed job queue with Edge Function processing patterns,
So that the AI transcription and summarization pipeline has reliable, resilient infrastructure.

**Acceptance Criteria:**

**Given** the database schema
**When** migrations are applied
**Then** a `job_queue` table exists with: `id`, `session_id` (FK), `job_type` (enum: process_recording, transcribe, summarize), `status` (enum: pending, processing, completed, failed, retry), `payload` (jsonb), `result` (jsonb, nullable), `error_message` (text, nullable), `retry_count` (int, default 0), `max_retries` (int, default 5), `next_retry_at` (timestamptz, nullable), `idempotency_key` (text, unique), `created_at` (timestamptz), `updated_at` (timestamptz)
**And** an index exists on `(status, next_retry_at)` for efficient job polling

**Given** the Edge Function patterns
**When** the `process-recording` Edge Function receives a trigger
**Then** it creates a `transcribe` job in the queue with status `pending`
**And** it uses an `idempotency_key` to prevent duplicate job creation

**Given** a job in `pending` status
**When** a processor Edge Function picks it up
**Then** it transitions to `processing` status
**And** on success, transitions to `completed` with result stored
**And** on failure, transitions to `retry` with `retry_count` incremented and `next_retry_at` set using exponential backoff (1m, 2m, 4m, 8m, 16m)
**And** after 5 failed retries, transitions to `failed` status

**Given** structured logging requirements
**When** any Edge Function executes
**Then** it logs `{ function_name, event_type, session_id, duration_ms, status }` consistently

**Test AC for Retry Logic:**
**Given** the job queue retry mechanism
**When** integration tests run for the retry logic
**Then** tests verify: a failed job increments `retry_count` and sets `next_retry_at` with correct exponential backoff intervals (1m, 2m, 4m, 8m, 16m)
**And** tests verify a job with `retry_count >= max_retries` transitions to `failed` status (not `retry`)
**And** tests verify the `idempotency_key` prevents duplicate job creation
**And** tests are located in `tests/integration/jobs/job-queue.test.ts`

### Story 6.2: Session Transcription

As a platform,
I want completed session recordings automatically transcribed,
So that session content can be processed into useful notes (FR27).

**Acceptance Criteria:**

**Given** a recording with status `available` in the recordings table
**When** the `transcribe-session` Edge Function processes the transcription job
**Then** it retrieves the recording from Supabase Storage via signed URL
**And** sends the audio to Whisper API for transcription
**And** stores the transcript in a `session_notes` table with `transcript` field
**And** creates a `summarize` job in the queue for the next pipeline step

**Given** the database schema
**When** migrations are applied
**Then** a `session_notes` table exists with: `id`, `session_id` (FK), `transcript` (text, nullable), `summary` (text, nullable), `sensei_annotations` (text, nullable), `status` (enum: transcribing, summarizing, completed, failed), `delivered_at` (timestamptz, nullable), `created_at` (timestamptz), `updated_at` (timestamptz)
**And** RLS policies ensure only session participants can read their notes
**And** admin can read `summary` only (not `transcript`) for flagged sessions

**Given** the Whisper API fails
**When** the transcription job encounters an error
**Then** the job retries with exponential backoff per the job queue pattern
**And** after max retries, job status is `failed`
**And** an alert is generated for observability

### Story 6.3: Session Summary Generation & Delivery

As a session participant,
I want to receive a structured summary of my session within 30 minutes,
So that I have useful notes without manual effort (FR28, FR29).

**Acceptance Criteria:**

**Given** a completed transcript in the session_notes table
**When** the `summarize-session` Edge Function processes the summarization job
**Then** it sends the transcript to the LLM API with a prompt that generates: key topics discussed, action items, emotional tone summary, and follow-up suggestions
**And** stores the summary in `session_notes.summary`
**And** updates `session_notes.status` to `completed`
**And** updates `session_notes.delivered_at` to the current timestamp

**Given** a completed session note
**When** delivery is triggered
**Then** both Sensei and learner receive an email: "Your session notes are ready!" with a link to view them
**And** an in-app notification is created for both participants

**Given** the 30-minute SLA (NFR5)
**When** the pipeline completes (recording → transcription → summarization → delivery)
**Then** the total time from session end to note delivery is under 30 minutes for sessions under 60 minutes

**Given** the pipeline fails and cannot deliver notes
**When** the user checks the session page
**Then** they see: "Session notes are taking longer than usual. Your recording is safe — we'll deliver notes as soon as possible."
**And** the message uses warm, reassuring tone (NFR39)

**Given** the Realtime infrastructure
**When** the job status changes for a session
**Then** participants subscribed to `jobs:{session_id}` channel receive live status updates
**And** the session detail page shows pipeline progress: "Transcribing..." → "Generating notes..." → "Notes ready!"

### Story 6.4: Session Notes Review & Pre-Session Brief

As a participant,
I want to review past session notes and see a pre-session brief before my next session,
So that I can build on previous conversations effectively (FR30, FR31).

**Acceptance Criteria:**

**Given** an authenticated participant viewing a completed session
**When** they navigate to the session detail page
**Then** they see the AI-generated summary with: key topics, action items, emotional tone, follow-up suggestions
**And** they see the full transcript (expandable/collapsible)
**And** notes are accessible from the session history page

**Given** a Sensei about to join an upcoming session with a learner
**When** they view the session detail page before joining
**Then** they see a "Pre-Session Brief" section showing: learner name, topics of interest, number of previous sessions, summary of the most recent previous session with this learner, and any action items from that session
**And** if no previous sessions exist, the brief shows: "First session with [learner name] — here's their profile" with learner bio and topics

**Given** a participant with no session notes yet
**When** they view the session notes section
**Then** they see an empty state: "Session notes will appear here after your first recorded session"

**Given** a participant searching for notes on a specific topic (FR11)
**When** they use the notes search/filter functionality
**Then** they can filter session notes by keyword across summaries and transcripts
**And** search results highlight matching terms and link to the relevant session detail page
**And** if no results match, a helpful message says: "No notes found for '[search term]'. Try a different keyword."

### Story 6.5: Sensei Annotations & Copy to Clipboard

As a Sensei,
I want to add personal annotations to session notes, and any user can copy notes to clipboard,
So that I can enrich the AI-generated content and users can use notes in external tools (FR32, FR33).

**Acceptance Criteria:**

**Given** a Sensei viewing a completed session's notes
**When** they click "Add Annotation"
**Then** a text area appears below the AI summary
**And** they can write personal notes, observations, or follow-up reminders
**And** annotations save via form action with Zod validation
**And** a success toast confirms: "Annotation saved"

**Given** a Sensei's annotation on a session
**When** the learner views the same session notes
**Then** they see the Sensei's annotation in a distinct section: "Notes from [Sensei Name]"

**Given** any participant viewing session notes
**When** they click "Copy to Clipboard"
**Then** the summary, action items, and annotations are copied as formatted text
**And** a toast confirms: "Notes copied to clipboard"

### Story 6.6: Admin Aggregate Platform Metrics

As an admin,
I want to view aggregate platform metrics,
So that I can monitor platform health and usage (FR55).

**Acceptance Criteria:**

**Given** an authenticated admin on the admin dashboard
**When** they view the dashboard
**Then** they see: total active users, total active Sensei-learner pairs, sessions completed this week, average session length, AI notes generated, and pipeline health (failed jobs count)
**And** metrics update on page load (not real-time for Phase 1)

**Given** the admin dashboard route
**When** the page loads
**Then** data is fetched via server `load` function using aggregate queries
**And** the admin role is verified by `hooks.server.ts` route guard

**Given** no sessions or users exist yet
**When** admin views the dashboard
**Then** they see zeros with contextual messaging: "Waiting for your first mentorship pairs to get started"

**Given** RLS policies for admin data access
**When** an admin queries aggregate data
**Then** they see counts and averages only — never individual session content or user details
**And** RLS tests verify admin cannot access individual session transcripts or recordings

---

### Epic 7: Team Creation, Data Privacy & Team Mentorship Health
Users can request data deletion and export (GDPR). Team leads create a team in 60 seconds, generate shareable invite links, members join, team leads view manager dashboard and team mentorship health. Team and org data isolation enforced.
**FRs covered:** FR59, FR60, FR61, FR62, FR63, FR64, FR65, FR66, FR68, FR74
**Phase:** 1.5-2

## Epic 7: Team Creation, Data Privacy & Team Mentorship Health

Users can request data deletion and export (GDPR). Team leads create a team in 60 seconds, generate shareable invite links, members join, team leads view manager dashboard and team mentorship health. Team and org data isolation enforced.

### Story 7.1: Data Deletion Request & Notification

As a session participant,
I want to request deletion of my session data and have the other participant notified,
So that I can exercise my privacy rights (FR59, FR60).

**Acceptance Criteria:**

**Given** an authenticated user viewing a past session
**When** they click "Request Data Deletion"
**Then** a confirmation dialog appears: "This will delete your participation data from this session. [Other participant] will be notified. This cannot be undone."
**And** upon confirmation, the user's session-specific data is queued for deletion
**And** the other participant receives an email notification: "[User] has requested deletion of shared session data"

**Given** a deletion request is submitted
**When** the system processes it
**Then** the requesting user's consent records, personal annotations, and access to the recording are removed
**And** the AI summary is retained in redacted form (references to the requesting user anonymized)
**And** the other participant retains their own data and access to the summary
**And** the deletion is logged in an audit table for compliance

**Given** the database schema
**When** migrations are applied
**Then** a `data_deletion_requests` table exists with: `id`, `user_id` (FK), `session_id` (FK), `status` (enum: pending, processing, completed), `requested_at` (timestamptz), `completed_at` (timestamptz, nullable)
**And** RLS policies ensure users can only create deletion requests for their own data

### Story 7.2: GDPR Data Export

As a user,
I want to export all my personal data in a portable format,
So that I can exercise my right to data portability (FR61).

**Acceptance Criteria:**

**Given** an authenticated user on their settings page
**When** they click "Export My Data"
**Then** a confirmation dialog appears: "We'll prepare a download of all your data. This may take a few minutes."
**And** a background job is queued to compile the export

**Given** the export job completes
**When** the data is ready
**Then** the user receives an email: "Your data export is ready" with a secure, time-limited download link
**And** the export includes: profile data, session history, session notes (summaries and annotations), connection data, and consent records
**And** the export format is JSON with a human-readable structure
**And** the download link expires after 24 hours

**Given** the export infrastructure
**When** the export job runs
**Then** it uses the service role key to compile data across tables
**And** it stores the export file in Supabase Storage with a signed URL
**And** export requests are rate-limited to 1 per 24 hours per user

### Story 7.3: Team Creation & Invite Link

As a team lead,
I want to create a team and get a shareable invite link in under 60 seconds,
So that I can set up mentorship infrastructure for my team effortlessly (FR62, FR63).

**Acceptance Criteria:**

**Given** an authenticated user
**When** they visit "Create Team" (accessible from dashboard or a direct URL)
**Then** they see a minimal form: team name (required), their email (pre-filled as team admin)
**And** submitting creates a team and assigns them the `team_lead` role

**Given** a team is created
**When** creation succeeds
**Then** the user sees a shareable team invite link: `teachmesensei.com/team/{team_slug}`
**And** they can tap to copy the link
**And** the entire flow from page load to copied link completes in under 60 seconds

**Given** the database schema
**When** migrations are applied
**Then** a `teams` table exists with: `id`, `name`, `slug` (unique), `org_id` (FK, nullable), `created_by` (FK), `invite_link`, `created_at` (timestamptz), `updated_at` (timestamptz)
**And** a `team_members` table exists with: `id`, `team_id` (FK), `user_id` (FK), `role` (enum: member, team_lead), `joined_at` (timestamptz)
**And** the creating user's `profiles.team_id` is set to the new team ID
**And** RLS policies ensure team leads can manage their own team only

### Story 7.4: Team Member Joins via Invite Link

As a team member,
I want to join my team by clicking the invite link,
So that my sessions are associated with the team and visible to my team lead (FR64).

**Acceptance Criteria:**

**Given** a user with the team invite link
**When** they visit the link
**Then** they see the team name and a "Join Team" button

**Given** an authenticated user clicking "Join Team"
**When** they confirm
**Then** a `team_members` row is created with role `member`
**And** their `profiles.team_id` is updated to the team ID
**And** their future sessions are associated with the team (`sessions.team_id`)
**And** they are redirected to the team dashboard with a welcome message

**Given** an unauthenticated visitor clicking the team link
**When** they arrive at the page
**Then** they are prompted to register/login first, then redirected back to join the team

**Given** a user already on the team
**When** they click the invite link again
**Then** they see: "You're already part of [team name]!" and are redirected to the team dashboard

### Story 7.5: Manager Dashboard — Team Mentorship Activity

As a team lead,
I want to view a dashboard showing my team's mentorship activity,
So that I can see who's mentoring, how often, and identify gaps (FR65).

**Acceptance Criteria:**

**Given** an authenticated team lead on the `(enterprise)/team/` dashboard
**When** they view the dashboard
**Then** they see: active mentoring pairs count, total sessions this week, average session length, and a list of team members with their activity status

**Given** the team member list
**When** displayed on the dashboard
**Then** each member shows: name, sessions this week, last session date, and mentoring pair (if any)
**And** members with zero mentorship activity are highlighted with a visual indicator

**Given** a team with no sessions yet
**When** the team lead views the dashboard
**Then** they see: "Your team is set up! Share the invite link to get everyone on board" with the team invite link and a prompt to encourage first sessions

**Given** RLS policies for team data
**When** a team lead queries team data
**Then** they see only their own team's aggregate metrics and member list
**And** they cannot see individual session content, notes, or recordings
**And** RLS tests verify team leads cannot access other teams' data

### Story 7.6: Team Mentorship Health View

As a team lead,
I want to view a team-level mentorship health view showing who is mentoring, who isn't, and session frequency,
So that I can proactively support team members who may be struggling in silence (FR66).

**Acceptance Criteria:**

**Given** an authenticated team lead viewing the team health view
**When** the page loads
**Then** they see a per-pair breakdown: mentor name, mentee name, sessions this month, average session length, last session date
**And** pairs are sorted by activity (least active first to surface gaps)
**And** team members not in any mentoring pair are listed separately as "Not yet paired"

**Given** a team member with declining session frequency
**When** the team lead views the health view
**Then** the pair shows a visual indicator (e.g., yellow/red status) if sessions have dropped below the team average

**Given** RLS and data boundary enforcement (FR68)
**When** a team lead from Team A queries the API
**Then** they receive only Team A data
**And** RLS tests verify cross-team data isolation using the canonical roles fixture

### Story 7.7: Org-Level Data Isolation

As a platform,
I want org-level data isolation enforced so no organization can see another's data,
So that enterprise trust requirements are met from day one (FR74).

**Acceptance Criteria:**

**Given** the existing nullable `org_id` column on relevant tables (profiles, sessions, teams)
**When** a team is created
**Then** the team's `org_id` is set (auto-created org for standalone teams, or assigned to existing org)

**Given** RLS policies for org isolation
**When** any user queries data
**Then** users with an `org_id` can only see data within their organization
**And** users without an `org_id` (B2C users) see only their own data as before
**And** the RLS policies gracefully handle null `org_id` (no breaking change for existing B2C users)

**Given** RLS data isolation tests
**When** org isolation tests run
**Then** `tests/integration/rls/enterprise.rls.test.ts` creates two orgs with two teams each
**And** verifies team leads in Org A cannot query any Org B data
**And** verifies team members in Team 1 cannot query Team 2 data within the same org
**And** verifies B2C users (null org_id) are unaffected by org-level policies

---

> **PREREQUISITE REMINDER:** Before starting Phase 2 epics (8-11), create UX specifications covering Flash Help matching flow, constellation visualization, warm-hold states, and enterprise dashboards. The PRD user journeys provide directional context but dedicated UX specs are needed to prevent inconsistent user experience and rework. (Flagged in Implementation Readiness Assessment 2026-02-07)

### Epic 8: Flash Help, AI Triage & Matching
Learners initiate help via "I'm stuck" / "I'm curious" / "I'm preparing", receive instant AI responses, AI detects emotional distress and escalates to human Sensei matching, warm-hold UX when no Sensei available, async fallback modes.
**FRs covered:** FR34, FR35, FR36, FR37, FR38, FR39, FR40, FR41
**Phase:** 2

## Epic 8: Flash Help, AI Triage & Matching

Learners initiate help via "I'm stuck" / "I'm curious" / "I'm preparing", receive instant AI responses, AI detects emotional distress and escalates to human Sensei matching, warm-hold UX when no Sensei available, async fallback modes.

### Story 8.1: Flash Help Entry Points & AI Conversation

As a learner,
I want to initiate help through "I'm stuck" / "I'm curious" / "I'm preparing" and receive instant AI responses,
So that I get immediate support 24/7 regardless of Sensei availability (FR34, FR35).

**Acceptance Criteria:**

**Given** an authenticated learner on the Flash Help page
**When** they view the page
**Then** they see three entry points styled with emotionally appropriate design:
- "I'm stuck" — urgent, empathetic tone
- "I'm curious" — exploratory, encouraging tone
- "I'm preparing" — focused, supportive tone
**And** each entry point leads to a conversational AI interface

**Given** a learner selects an entry point
**When** they type their question or concern
**Then** the AI responds instantly via an Edge Function calling the LLM API
**And** the conversation feels natural and empathetic, not clinical
**And** the AI adjusts its approach based on the entry point context (stuck = emotional support first, curious = exploration, preparing = structured guidance)

**Given** the AI conversation
**When** the learner interacts with the AI
**Then** the conversation history is persisted in a `flash_help_sessions` table
**And** the AI resolution is tracked (did the AI fully help, or did it escalate?)

**Given** the database schema
**When** migrations are applied
**Then** a `flash_help_sessions` table exists with: `id`, `learner_id` (FK), `entry_point` (enum: stuck, curious, preparing), `messages` (jsonb[]), `status` (enum: ai_active, escalated, resolved_by_ai, resolved_by_sensei, abandoned), `escalated_at` (timestamptz, nullable), `resolved_at` (timestamptz, nullable), `created_at` (timestamptz)

### Story 8.2: Emotional Distress Detection & Escalation

As a platform,
I want the AI to detect emotional distress signals and escalate to human Sensei matching when appropriate,
So that vulnerable learners get human connection when they need it most (FR36, FR37).

**Acceptance Criteria:**

**Given** a learner in an AI conversation
**When** the AI detects emotional distress signals (frustration, self-doubt, despair, imposter syndrome)
**Then** the AI adjusts its tone to be warmer and more empathetic
**And** the AI acknowledges the emotion before addressing the content: "That sounds really hard..."
**And** the AI does NOT try to immediately solve the technical problem

**Given** the AI determines human support would be more valuable
**When** the conversation signals indicate emotional escalation or career navigation needs
**Then** the AI suggests human connection: "This sounds like something a real human Sensei could help with. [Sensei Name] was in your exact situation 2 years ago. Want to talk to them?"
**And** the suggestion includes the Sensei's name, photo, brief context, and price ($5)
**And** the learner can accept or continue with AI

**Given** the escalation logic
**When** the AI evaluates whether to escalate
**Then** it uses a system prompt with escalation criteria: emotional distress detected, career navigation question, request for human perspective, or learner explicitly asks for a person
**And** escalation decisions are logged for quality improvement

### Story 8.3a: Matching Algorithm & Sensei Selection

As a platform,
I want a matching algorithm that ranks available Senseis by experience proximity and style compatibility,
So that learners are connected to the most relevant Sensei for their situation (FR38).

**Acceptance Criteria:**

**Given** the matching algorithm
**When** searching for a Sensei
**Then** it filters available Senseis from the `presence:senseis` Presence channel
**And** it ranks by: experience proximity ("2 Years Ahead" — Sensei's career switch date closest to 2 years ahead of learner), topic overlap, and style tag compatibility
**And** the best match is selected and sent a notification

**Given** the matching algorithm with multiple available Senseis
**When** ranking candidates
**Then** experience proximity is weighted highest (50%), topic overlap second (30%), style tag compatibility third (20%)
**And** the algorithm returns a ranked list, not just the top match, in case the first Sensei declines

**Given** a Sensei receives a Flash Help request notification
**When** they view the request
**Then** they see the learner's topic area and urgency level (not the learner's full profile for privacy)
**And** they have 15 seconds to accept before the request moves to the next-ranked Sensei

**Given** no Senseis are available or all decline
**When** the matching algorithm exhausts candidates
**Then** it returns a `no_match` result to trigger the warm-hold flow (Story 8.5)

**Test AC:**
**Given** the matching algorithm
**When** unit tests run
**Then** tests verify correct ranking with different combinations of experience proximity, topic overlap, and style compatibility
**And** tests verify fallback behavior when no Senseis are available
**And** tests are located in `tests/unit/matching/sensei-matching.test.ts`

### Story 8.3b: Real-Time Matching UX & Session Connection

As a learner,
I want a calming, real-time experience during Sensei matching that connects me to a live video session,
So that the transition from AI to human feels seamless and supportive (FR39).

**Acceptance Criteria:**

**Given** a learner accepts the AI's escalation to a human Sensei
**When** the matching process begins
**Then** the UI transitions to the "Finding your Sensei" state with a calming gradient animation and live countdown
**And** the Realtime Broadcast channel `flash-help:{user_id}` sends matching state events: `match.searching` → `match.found` → `match.connecting` → `match.live`

**Given** a Sensei accepts the Flash Help request
**When** the match is confirmed
**Then** a paid session is created ($5 micro-transaction)
**And** a Daily.co room is created
**And** both participants are connected to the video session
**And** the entire flow from "I'm stuck" to live human completes within 60 seconds (NFR3)

**Given** the Sensei profile is shown during matching
**When** the learner sees the "Finding your Sensei" UI
**Then** they see the matched Sensei's photo, name, style tags, and a one-liner context (e.g., "Career-switched from teaching. 47 rejections before his first yes.")

**Given** the matching takes longer than expected
**When** 30 seconds pass without a match
**Then** the UI updates the message: "Still looking — hang tight!" with a progress indicator
**And** the animation remains calming (no spinning loader or error-like patterns)

### Story 8.4: Sensei Presence & Availability Tracking

As a platform,
I want to track which Senseis are available for Flash Help in real-time,
So that matching can find live Senseis instantly.

**Acceptance Criteria:**

**Given** a Sensei who is online and has opted into Flash Help availability
**When** they are active in the app
**Then** their presence is tracked via the `presence:senseis` Supabase Realtime Presence channel
**And** their status includes: user_id, topics, style_tags, and availability status

**Given** a Sensei who goes offline or opts out of Flash Help
**When** their presence changes
**Then** they are removed from the available Sensei pool
**And** the matching algorithm no longer considers them

**Given** the presence infrastructure
**When** multiple Senseis are online
**Then** the admin dashboard can see a count of available Senseis (aggregate only)
**And** the matching algorithm queries the Presence channel for real-time availability

### Story 8.5: Warm-Hold & Graceful Degradation

As a learner,
I want a warm, supportive experience when no Sensei is available,
So that I never feel abandoned or see an error screen (FR40).

**Acceptance Criteria:**

**Given** a learner who has been escalated to human Sensei matching
**When** no Senseis are available within 60 seconds
**Then** the UI does NOT show an error or empty state
**And** the screen transitions to a warm-hold experience: "No Senseis are available right now, but I'm here. Let me help until morning."
**And** the AI continues the conversation in warm-hold mode

**Given** the warm-hold experience
**When** the AI is in warm-hold mode
**Then** it provides an estimated time for human availability based on historical patterns
**And** it offers to book a scheduled session with a recommended Sensei: "Marcus will be available in 6 hours. Want me to book you a session for 8am?"
**And** it can share relevant async content (voice clips, graduation stories) to maintain emotional connection

**Given** a Sensei becomes available during warm-hold
**When** presence is detected
**Then** the learner is notified: "[Sensei Name] just came online. Want to connect now?"
**And** the learner can accept for immediate connection or continue with their booked session

### Story 8.6: Async Fallback Modes

As a learner,
I want async alternatives when live Senseis aren't available,
So that I can still get human mentorship on a different timeline (FR41).

**Acceptance Criteria:**

**Given** a learner in warm-hold mode
**When** they prefer async over waiting
**Then** they can choose from:
- "Leave a voice memo" — records a short audio message for a matched Sensei to respond to within 24 hours
- "Write a question" — submits a written Q&A that a matched Sensei responds to asynchronously

**Given** a learner submits a voice memo
**When** the memo is submitted
**Then** it is stored in Supabase Storage and a notification is sent to the best-matched Sensei
**And** the Sensei can respond with a voice memo or text within 24 hours
**And** the learner receives notification when the response arrives

**Given** a learner submits a written question
**When** the question is submitted
**Then** it is stored in the `flash_help_sessions` table with status `awaiting_sensei_response`
**And** a matched Sensei receives notification to respond
**And** the Sensei's response is delivered to the learner with email and in-app notification

**Given** no Sensei responds within 24 hours
**When** the deadline passes
**Then** the learner sees: "We're still finding the right Sensei for your question. Hang tight."
**And** the request is escalated to additional Senseis

---

### Epic 9: Payments & Monetization
Learners pay for Flash Help sessions via micro-transaction, request instant refunds for no-shows, self-serve team plan billing.
**FRs covered:** FR49, FR51, FR67
**Phase:** 2

## Epic 9: Payments & Monetization

Learners pay for Flash Help sessions via micro-transaction, request instant refunds for no-shows, self-serve team plan billing.

### Story 9.1: Polar.sh Integration & Flash Help Micro-Transactions

As a learner,
I want to pay $5 for a Flash Help session via a simple micro-transaction,
So that I can connect with a human Sensei when the AI escalates (FR49).

**Acceptance Criteria:**

**Given** a learner who has accepted an AI escalation to a human Sensei
**When** the matching confirms a Sensei is available
**Then** a Polar.sh checkout is initiated for $5 (Flash Help session)
**And** the payment flow is embedded or redirected with minimal friction (no multi-step checkout)
**And** upon successful payment, the session proceeds immediately (Sensei match + video room creation)

**Given** the Polar.sh integration
**When** configured
**Then** Polar.sh is set up as Merchant of Record handling tax/VAT globally
**And** `api/webhooks/polar/+server.ts` receives and verifies webhook signatures
**And** webhook processing is idempotent (handles duplicate delivery)

**Given** the database schema
**When** migrations are applied
**Then** a `payments` table exists with: `id`, `user_id` (FK), `session_id` (FK, nullable), `polar_checkout_id` (text), `polar_order_id` (text, nullable), `amount_cents` (int), `currency` (text, default 'usd'), `status` (enum: pending, completed, refunded, failed), `payment_type` (enum: flash_help, subscription, team_plan), `created_at` (timestamptz), `updated_at` (timestamptz)
**And** RLS policies ensure users can only see their own payment records

**Given** the payment fails
**When** the learner's payment is declined
**Then** the session does NOT proceed
**And** the learner sees: "Payment didn't go through. Want to try a different method?" with an option to retry
**And** the Sensei is not connected (no wasted Sensei time on failed payments)

### Story 9.2: No-Show Refunds

As a learner,
I want to request an instant refund when a Sensei no-shows,
So that I'm not charged for a session that didn't happen (FR51).

**Acceptance Criteria:**

**Given** a learner in a paid Flash Help session where the Sensei hasn't joined
**When** the no-show detection triggers (7 minutes without Sensei joining, per Journey 6)
**Then** the learner sees recovery options including "Get a refund"

**Given** a learner selecting "Get a refund"
**When** they confirm
**Then** a refund is initiated via Polar.sh API immediately
**And** the `payments.status` updates to `refunded`
**And** the learner sees: "Refund processed — you should see it within a few business days"
**And** no questions asked, no friction

**Given** the refund processing
**When** Polar.sh processes the refund
**Then** the webhook updates the payment record
**And** the refund is logged for admin visibility
**And** the no-show is tracked against the Sensei for pattern detection (feeds into Epic 10)

### Story 9.3: Self-Serve Team Plan Billing

As a team lead,
I want self-serve team plan billing at $15/user/month,
So that I can expense it on my corporate card without procurement (FR67).

**Acceptance Criteria:**

**Given** an authenticated team lead on the team settings page
**When** they click "Upgrade to Team Plan"
**Then** they see the pricing: $15/user/month, billed based on active team members
**And** a Polar.sh checkout is initiated for a subscription

**Given** the team plan subscription is active
**When** team members are added or removed
**Then** the subscription quantity updates automatically via Polar.sh API
**And** the team lead sees current billing: "$X/month for Y members"

**Given** the team lead on billing settings
**When** they view billing history
**Then** they see past invoices with dates, amounts, and download links
**And** they can update payment method or cancel the plan

**Given** a team plan is cancelled
**When** the billing period ends
**Then** team features (manager dashboard, health view) become read-only
**And** existing session data is retained
**And** the team lead sees: "Your team plan has ended. Upgrade to restore team features."

**Given** the webhook processing
**When** Polar.sh sends subscription lifecycle events (created, updated, cancelled, payment_failed)
**Then** the webhook handler updates the team's billing status accordingly
**And** payment failures trigger a grace period with a warning to the team lead: "Your team plan payment failed. Please update your payment method within 7 days."

---

### Epic 10: Trust, Reputation & Safety
System tracks behavioral signals (return rate, extensions, referrals), surfaces them on Sensei profiles, Senseis set style tags, learners flag sessions, flags categorized for admin routing, no-show detection with recovery options, admin views and responds to flags.
**FRs covered:** FR42, FR43, FR44, FR45, FR46, FR47, FR48, FR56, FR57, FR58
**Phase:** 2

## Epic 10: Trust, Reputation & Safety

System tracks behavioral signals (return rate, extensions, referrals), surfaces them on Sensei profiles, Senseis set style tags, learners flag sessions, flags categorized for admin routing, no-show detection with recovery options, admin views and responds to flags.

### Story 10.1: Behavioral Signal Tracking

As a platform,
I want to track behavioral trust signals — return rate, session extensions, and referrals — for each Sensei,
So that authentic reputation is built from real behavior, not star ratings (FR42).

**Acceptance Criteria:**

**Given** a learner completing a session with a Sensei
**When** the session ends
**Then** the system checks if this learner has had a previous session with the same Sensei and increments the return count if so
**And** the system tracks whether the session ran longer than the scheduled duration (session extension)

**Given** a learner who connects with a new Sensei via a referral
**When** the referral is tracked
**Then** the referring Sensei's referral count is incremented

**Given** the database schema
**When** migrations are applied
**Then** a `sensei_signals` table exists with: `id`, `sensei_id` (FK, unique), `total_sessions` (int), `unique_learners` (int), `return_learner_count` (int), `return_rate` (decimal, computed), `session_extension_count` (int), `session_extension_rate` (decimal, computed), `referral_count` (int), `updated_at` (timestamptz)
**And** signal aggregation runs as a background job after each session completion
**And** RLS policies allow public read of signal data (it's displayed on profiles)

### Story 10.2: Sensei Style Tags

As a Sensei,
I want to self-select style tags that describe how I mentor,
So that learners can find Senseis whose approach matches their needs (FR44).

**Acceptance Criteria:**

**Given** an authenticated Sensei on their profile settings
**When** they view the style tags section
**Then** they see available tags: DJ (plays connections between ideas), Sherpa (guides step by step), Provocateur (challenges assumptions)
**And** they can select 1-3 style tags
**And** selected tags save immediately with optimistic update

**Given** the database schema
**When** style tags are stored
**Then** a `style_tags` column (text[]) is added to the `profiles` table
**And** the tags are validated against the allowed enum values via Zod schema

### Story 10.3: Enriched Sensei Profiles with Trust Signals

As a learner,
I want to view Sensei profiles with style tags, experience proximity, and behavioral signals,
So that I can choose a Sensei I trust based on real data, not ratings (FR43, FR45).

**Acceptance Criteria:**

**Given** a learner viewing a Sensei's profile (public or in-app)
**When** the profile loads
**Then** they see: name, photo, bio, topic expertise, style tags with descriptions, and behavioral signals
**And** behavioral signals are displayed as: "85% of learners came back", "Sessions often run over (they're that good)", "[X] referrals"
**And** experience proximity is shown: "2 years ahead of you" or similar contextual framing

**Given** a Sensei with no sessions yet
**When** a learner views their profile
**Then** signals show: "New Sensei — be their first learner!" instead of zero metrics

**Given** the public Sensei profile route
**When** the page is server-rendered at `(public)/sensei/[id]/`
**Then** it is SSR-optimized for SEO with meta tags (name, topics, bio)

### Story 10.4: Session Flagging

As a learner,
I want to flag a session that didn't feel right with one tap,
So that I can report issues without bureaucratic friction (FR46, FR47).

**Acceptance Criteria:**

**Given** a learner viewing a completed session
**When** they click the flag action
**Then** they see a warm prompt: "That session didn't feel right?"
**And** they select a category: Technical issue (audio/video), Sensei no-show, Uncomfortable interaction, Billing issue, Other
**And** they can optionally add a brief note
**And** submitting is one tap after category selection (minimal friction)

**Given** a flag is submitted
**When** stored in the database
**Then** a `session_flags` table row is created with: `id`, `session_id` (FK), `flagged_by` (FK), `category` (enum: technical, no_show, uncomfortable, billing, other), `notes` (text, nullable), `status` (enum: open, investigating, resolved, dismissed), `created_at` (timestamptz), `resolved_at` (timestamptz, nullable), `resolved_by` (FK, nullable)
**And** the admin dashboard shows a new flag notification
**And** RLS policies ensure only the flagging user can see their own flags, admin can see all flags

**Given** a learner who has already flagged a session
**When** they try to flag the same session again
**Then** they see: "You've already flagged this session. We're looking into it."

### Story 10.5: No-Show Detection & Learner Recovery

As a learner,
I want the platform to detect when my Sensei hasn't shown up and offer me recovery options,
So that I'm not left waiting with no recourse (FR48).

**Acceptance Criteria:**

**Given** a scheduled session where the learner has joined
**When** the Sensei has not joined after 2 minutes
**Then** the UI shows: "[Sensei Name] seems to be running late. Hang tight..."

**Given** the Sensei has not joined after 5 minutes
**When** the system checks again
**Then** the UI shows: "Still waiting. We'll keep trying to reach [Sensei Name]."
**And** the system sends the Sensei a push notification and/or SMS (if configured)

**Given** the Sensei has not joined after 7 minutes
**When** the no-show threshold is reached
**Then** the UI shows: "We're sorry — [Sensei Name] hasn't joined. This is unusual for them ([X]% on-time rate)."
**And** the learner sees three options:
- "Reschedule with [Sensei Name]" — opens their next available slots
- "Connect with another Sensei now" — shows 2-3 similar available Senseis
- "Get a refund" — instant, no questions (triggers Epic 9 refund flow)

**Given** the no-show is recorded
**When** the session is marked as `no_show`
**Then** a flag is auto-created with category `no_show`
**And** the no-show is tracked against the Sensei's record
**And** if this is the Sensei's 3rd no-show in a month, their visibility in matching is auto-reduced

### Story 10.6: Admin Flag Management

As an admin,
I want to view, investigate, and respond to flagged sessions,
So that I can maintain platform safety and trust (FR56, FR57, FR58).

**Acceptance Criteria:**

**Given** an authenticated admin on the admin flags page
**When** they view the flags list
**Then** they see all open flags sorted by recency with: session date, flag category, flagging user (name), flagged Sensei (name), status
**And** they can filter by category and status

**Given** an admin clicking on a specific flag
**When** they view the flag detail
**Then** they see: flag category, optional notes from the learner, AI-generated session summary (NOT raw transcript — FR57), Sensei's session history (return rate, previous flags), and the flagging learner's history
**And** raw transcript access is NOT available (requires explicit escalation protocol with audit logging)

**Given** an admin investigating a flag
**When** they want to contact a participant
**Then** they can send a direct message (email) to the learner or Sensei from the flag detail page (FR58)
**And** the outreach is logged on the flag record

**Given** an admin resolving a flag
**When** they update the flag status
**Then** they can set status to: investigating, resolved, or dismissed
**And** they can add internal admin notes (not visible to users)
**And** the resolution is logged with timestamp and admin ID

---

### Epic 11: Constellation, Graduation & Growth
Senseis view their mentorship constellation visualization, system tracks graduation milestones, graduated learners prompted to become Senseis.
**FRs covered:** FR52, FR53, FR54
**Phase:** 2

## Epic 11: Constellation, Graduation & Growth

Senseis view their mentorship constellation visualization, system tracks graduation milestones, graduated learners prompted to become Senseis.

### Story 11.1: Constellation Data Model & Visualization

As a Sensei,
I want to view my mentorship constellation — a visual galaxy of people I've helped,
So that I can see my mentorship impact grow over time and feel motivated to continue (FR52).

**Acceptance Criteria:**

**Given** an authenticated Sensei on their constellation page
**When** the page loads
**Then** they see a visual galaxy/network visualization where each learner they've helped is a star/node
**And** nodes are sized or styled by relationship depth (Flash Help = small, Follow = medium, Partner = large)
**And** connections (edges) show the Sensei-learner relationship
**And** graduated learners have a distinct visual indicator (glow, color, badge)
**And** the visualization is interactive: hoverable nodes show learner name, session count, and connection date

**Given** the database schema
**When** migrations are applied
**Then** a `constellation_nodes` table exists with: `id`, `sensei_id` (FK), `learner_id` (FK), `node_type` (enum: flash_help, follow, partner, graduated), `sessions_count` (int), `first_session_at` (timestamptz), `graduated_at` (timestamptz, nullable), `created_at` (timestamptz), `updated_at` (timestamptz)
**And** constellation data is pre-aggregated from sessions and connections via background job

**Given** a Sensei with no learners yet
**When** they view their constellation
**Then** they see an empty state with a single star (themselves) and: "Your constellation starts here. Every person you help becomes a star in your galaxy."

**Given** accessibility requirements (NFR28)
**When** the constellation is rendered
**Then** a screen-reader-accessible alternative view is available (list of learners with stats)
**And** keyboard navigation allows focus on individual nodes

### Story 11.2: Graduation Milestone Tracking

As a platform,
I want to track graduation milestones when a learner lands their first tech job and survives 90 days,
So that the system can celebrate achievements and measure real outcomes (FR53).

**Acceptance Criteria:**

**Given** a learner on their profile or settings page
**When** they report landing a job
**Then** they see an option: "I landed a job!" with fields for: company name (optional), role title (optional), and start date
**And** the milestone is recorded as `job_landed` with the reported date

**Given** a learner who reported a job landing 90 days ago
**When** the 90-day mark is reached
**Then** the system sends a notification: "Congratulations on 90 days at your new role! You've officially graduated."
**And** the graduation milestone is recorded as `graduated`
**And** the learner's constellation node on their Sensei's view updates to the graduated visual indicator

**Given** the database schema
**When** migrations are applied
**Then** a `milestones` table exists with: `id`, `user_id` (FK), `milestone_type` (enum: job_landed, ninety_day_mark, became_sensei), `details` (jsonb, nullable — company, role), `achieved_at` (timestamptz), `created_at` (timestamptz)

**Given** the milestone data
**When** aggregated for platform metrics
**Then** admin can see total graduations as a platform health metric

### Story 11.3: Graduate-to-Sensei Pipeline

As a graduated learner,
I want to receive a prompt to become a Sensei,
So that I can give back and continue the mentorship cycle (FR54).

**Acceptance Criteria:**

**Given** a learner who has reached the `graduated` milestone (90-day mark)
**When** the graduation is recorded
**Then** the learner receives a notification (in-app + email): "Congratulations on graduating, [Name]! You did it. Want to help someone else?"
**And** the notification includes a CTA: "Become a Sensei"

**Given** a graduated learner clicking "Become a Sensei"
**When** they accept
**Then** they are taken to a streamlined Sensei onboarding flow (similar to Epic 2 Story 2.3 but pre-filled with their existing profile)
**And** their role updates to `sensei` (or adds sensei as secondary role if dual-role is supported)
**And** they receive 5 invite codes
**And** their `became_sensei` milestone is recorded

**Given** a graduated learner who declines
**When** they dismiss the prompt
**Then** they are not prompted again for 30 days
**And** after 30 days, a softer nudge is sent: "Someone just asked the same question you asked [original Sensei] [X] months ago. Want to help?"

**Given** a graduated learner who becomes a Sensei
**When** their Sensei views their constellation
**Then** the graduated node shows a second-generation branch indicator (their mentees become sub-nodes in future)

---

### Epic 12: Enterprise Org Management & Reporting
Org admins connect teams into an organization, view mentorship heat map, view enterprise aggregate reporting, enterprise billing, teams opt into cross-company mentorship network.
**FRs covered:** FR69, FR70, FR71, FR72, FR73, FR75
**Phase:** 3

## Epic 12: Enterprise Org Management & Reporting

Org admins connect teams into an organization, view mentorship heat map, view enterprise aggregate reporting, enterprise billing, teams opt into cross-company mentorship network.

### Story 12.1: Organization Creation & Team Connection

As an org-level admin,
I want to create an organization and connect existing teams into it,
So that I can see aggregate mentorship data across my company (FR69).

**Acceptance Criteria:**

**Given** an authenticated user (who may already be a team lead)
**When** they visit "Create Organization"
**Then** they see a form: organization name, their email (pre-filled as org admin)
**And** submitting creates an organization and assigns them the `org_admin` role

**Given** an org admin with an existing organization
**When** they view the org settings page
**Then** they see a list of connected teams and an "Add Team" option
**And** they can connect existing teams by entering the team slug or inviting a team lead via email
**And** when a team lead accepts the org invitation, their team's `org_id` is set to the organization

**Given** the database schema
**When** migrations are applied
**Then** an `organizations` table exists with: `id`, `name`, `slug` (unique), `created_by` (FK), `billing_status` (enum: trial, active, past_due, cancelled), `created_at` (timestamptz), `updated_at` (timestamptz)
**And** the `teams.org_id` foreign key references this table
**And** RLS policies ensure org admins can only manage their own organization's teams

**Given** a team already connected to a different org
**When** an org admin tries to add it
**Then** they see: "This team is already part of another organization"

### Story 12.2: Mentorship Heat Map

As an org admin,
I want to view a mentorship heat map showing team-by-team mentorship activity and gaps,
So that I can identify which teams need mentorship support (FR70, FR75).

**Acceptance Criteria:**

**Given** an authenticated org admin on the org dashboard
**When** they view the mentorship heat map
**Then** they see a team-by-team visualization with color coding:
- Green: Rich mentorship culture (active pairs, regular sessions)
- Yellow: Emerging (some activity, room for growth)
- Red: Mentorship desert (zero or minimal sessions)
**And** each team cell shows: team name, active pairs count, sessions this month

**Given** the heat map data
**When** the page loads
**Then** data is sourced from pre-aggregated tables (not computed on the fly)
**And** a background job refreshes aggregation daily (or on-demand via admin action)

**Given** the pre-aggregation infrastructure
**When** migrations are applied
**Then** a `team_mentorship_stats` table exists with: `id`, `team_id` (FK), `org_id` (FK), `active_pairs` (int), `sessions_this_month` (int), `avg_session_length_minutes` (decimal), `members_with_zero_activity` (int), `health_status` (enum: thriving, emerging, desert), `aggregated_at` (timestamptz)
**And** a scheduled background job updates this table daily

**Given** an org admin clicking on a specific team in the heat map
**When** they drill down
**Then** they see the team-level mentorship health view (same as Epic 7 Story 7.6 but in the org context)

### Story 12.3: Enterprise Aggregate Reporting

As an org admin,
I want to view enterprise-wide aggregate reporting with org-wide metrics and team comparisons,
So that I can measure and report on mentorship program impact (FR71).

**Acceptance Criteria:**

**Given** an authenticated org admin on the reporting page
**When** they view enterprise reports
**Then** they see org-wide metrics: total active pairs across all teams, total sessions this month, average session length, mentorship coverage rate (% of employees in at least one pair), and total graduations

**Given** the team comparison view
**When** displayed
**Then** they see a table comparing teams: team name, active pairs, sessions/month, avg session length, coverage rate, health status
**And** teams are sortable by any column
**And** trends are shown: "↑3 from last month" or "↓2 from last month" for key metrics

**Given** the reporting data
**When** org admin exports reports
**Then** they can download a CSV of the team comparison data
**And** the export includes date range and generation timestamp

**Given** RLS policies for org reporting
**When** an org admin queries data
**Then** they see only their organization's aggregate data
**And** they cannot see individual session content, notes, or recordings from any team
**And** RLS tests verify cross-org data isolation

### Story 12.4: Enterprise Plan Billing

As an org admin,
I want enterprise plan billing with invoice-based annual contracts,
So that my company can formalize the mentorship tool investment (FR72).

**Acceptance Criteria:**

**Given** an org admin on the billing page
**When** they view billing options
**Then** they see the enterprise plan: annual contract, invoice-based billing, custom pricing based on org size
**And** a "Contact Sales" or "Request Enterprise Plan" CTA is available

**Given** an enterprise plan is activated (manually by platform admin after sales discussion)
**When** the plan is set up
**Then** the org's `billing_status` updates to `active`
**And** the org admin sees their plan details: contract dates, user count, renewal date
**And** invoice history is available with download links

**Given** an enterprise plan approaching renewal
**When** 30 days before contract end
**Then** the org admin receives an email: "Your enterprise plan renews on [date]"

### Story 12.5: Cross-Company Mentorship Network Opt-In

As a team or org admin,
I want to opt into the cross-company mentorship network to access the broader Sensei pool,
So that my team can benefit from external mentors beyond our company (FR73).

**Acceptance Criteria:**

**Given** a team lead or org admin on team/org settings
**When** they view the mentorship network section
**Then** they see an option: "Connect to the TeachMeSensei Network"
**And** a description: "Allow your team members to connect with Senseis from the broader community. Your internal mentorship data remains private."

**Given** the admin enabling cross-company network
**When** they toggle the opt-in
**Then** team members can now see and book sessions with B2C Senseis from the public pool
**And** the team's internal mentorship data (session content, notes, dashboards) remains isolated — only the connection to external Senseis is enabled

**Given** an admin disabling the cross-company network
**When** they toggle it off
**Then** existing connections with external Senseis are preserved but no new external connections can be made
**And** team members see: "Cross-company mentorship has been disabled by your admin. Existing connections are still active."

---

### Epic 13: Enterprise Intelligence
AI coaching pattern analysis for mentors, auto-generated mentee progress reports, retention signal detection for attrition early warning.
**FRs covered:** FR76, FR77, FR78
**Phase:** 4

> **ACTION REQUIRED:** This epic has NO stories defined. Before Phase 4 planning begins, create full stories with Given/When/Then acceptance criteria for:
> - FR76: AI coaching pattern analysis for mentors (post-session facilitation feedback)
> - FR77: Auto-generated mentee progress reports (skills, sessions, growth trajectory)
> - FR78: Retention signal detection (mentorship disengagement as attrition early warning)
>
> Without stories, these three FRs have no implementable path. (Flagged in Implementation Readiness Assessment 2026-02-07)
