# Story 2.0: Provision Staging Environment

Status: in-progress

## Story

As a developer,
I want a staging environment on Railway with its own Supabase project,
so that I can validate database migrations, RLS policies, and auth flows before deploying to production.

## Acceptance Criteria

1. **Given** the production Railway service from Epic 1
   **When** I provision a staging environment
   **Then** a separate Railway service exists with its own environment variables

2. **Given** the staging Railway service
   **When** I check Supabase connectivity
   **Then** a separate Supabase project provides an isolated staging database

3. **Given** the CI/CD pipeline from Story 1.4
   **When** code is pushed to a staging branch (or a PR is merged)
   **Then** Railway deploys to staging automatically

4. **Given** staging and production environments
   **When** I compare their data stores
   **Then** staging and production share zero data — fully isolated

5. **Given** the staging deployment is complete
   **When** I hit the staging `/api/health` endpoint
   **Then** it returns 200 with its own Supabase connection confirmed

## Tasks / Subtasks

- [ ] Task 1: Create Supabase staging project (AC: #2, #4)
  - [ ] 1.1 Create a new Supabase project via the Supabase dashboard (separate from production project)
  - [ ] 1.2 Select the same region as production (Singapore / ap-southeast-1) for latency parity
  - [ ] 1.3 Record the staging project's `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY`
  - [ ] 1.4 Start the staging project on **Free tier** (no schema, no data yet — functionally equivalent). Upgrade to Pro when Story 2.5 introduces database schema and feature parity matters. Saves $25/mo during initial setup.
  - [ ] 1.5 Record the staging Supabase **project ref** (e.g., `abcdefghijkl`) — needed later for `supabase link` when pushing migrations in Story 2.5
  - [ ] 1.6 Verify: staging project has no tables, no auth users, no storage buckets — fully empty and isolated from production

- [ ] Task 2: Create Railway staging service (AC: #1)
  - [ ] 2.1 In the Railway dashboard, create a new service within the same project (or a separate project — team preference)
  - [ ] 2.2 Connect the staging service to the same GitHub repository
  - [ ] 2.3 Configure the staging service to deploy from a `staging` branch (not `master`)
  - [ ] 2.4 The service uses the same `railway.toml` (Dockerfile builder, `/api/health` healthcheck) — no code changes needed
  - [ ] 2.5 Set environment variables on the staging Railway service pointing to the **staging** Supabase project:
    - `PUBLIC_SUPABASE_URL` → staging Supabase URL
    - `PUBLIC_SUPABASE_PUBLISHABLE_KEY` → staging publishable key
    - `SUPABASE_SECRET_KEY` → staging secret key
    - `PUBLIC_APP_URL` → staging Railway public URL
    - `NODE_ENV` → `production`
  - [ ] 2.6 Optionally enable "Wait for CI" so staging deploys gate on GitHub Actions passing

- [ ] Task 3: Create and configure `staging` branch (AC: #3)
  - [ ] 3.1 Create a `staging` branch from `master`: `git checkout -b staging && git push -u origin staging`
  - [x] 3.2 Update `.github/workflows/ci.yml` to also trigger on push/PR to `staging` branch
  - [ ] 3.3 Verify: Railway staging service triggers a build when `staging` branch receives a push

- [ ] Task 4: Verify end-to-end staging deployment (AC: #1, #2, #3, #4, #5)
  - [ ] 4.1 Push current `master` code to `staging` branch
  - [ ] 4.2 Verify: Railway staging service builds and deploys successfully (check Railway dashboard logs)
  - [ ] 4.3 Hit staging `https://<staging-url>/api/health` — must return `{ "status": "ok" }` (200)
  - [ ] 4.4 Hit production `https://<prod-url>/api/health` — must still return `{ "status": "ok" }` (200)
  - [ ] 4.5 Verify staging connects to the correct Supabase project: in the Railway dashboard, confirm the staging service's `PUBLIC_SUPABASE_URL` differs from production's. Then check Supabase Studio for the staging project — the API logs should show the health check request arriving.
  - [ ] 4.6 Verify: staging and production Railway services have completely different Supabase env vars — zero shared credentials (compare all 3 Supabase vars side-by-side in Railway dashboard)

- [x] Task 5: Document staging environment (AC: all)
  - [x] 5.1 Update `.env.example` with a comment block noting staging uses separate Supabase credentials (no credential values — those live in Railway)
  - [x] 5.2 Create `docs/staging.md` explaining the two-environment setup, how to deploy to staging, and how to verify (keep README clean — operational details go in docs/)

## Dev Notes

### This Is Primarily a Manual/Infrastructure Story

Most tasks are **dashboard configuration** (Railway UI, Supabase UI) rather than code changes. The only code change is updating `ci.yml` to trigger on the `staging` branch.

### Production Environment (Already Working from Epic 1)

| Component | Value |
|---|---|
| Railway service | Production, deploys from `master` |
| Supabase project | Production project |
| Health endpoint | `/api/health` — checks Supabase connectivity via REST API |
| Dockerfile | Multi-stage Node 22 Alpine, `adapter-node` output |
| `railway.toml` | `builder = "DOCKERFILE"`, healthcheck at `/api/health` |

### Health Endpoint Already Handles Staging

The existing `/api/health` endpoint (`src/routes/api/health/+server.ts`) reads `PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY` from `$env/dynamic/*` at runtime. No code changes needed — it will automatically connect to whichever Supabase project the Railway env vars point to.

### CI/CD Pipeline Update

Current `ci.yml` triggers:
```yaml
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
```

Update to also include `staging`:
```yaml
on:
  push:
    branches: [master, staging]
  pull_request:
    branches: [master, staging]
```

This is the **only code change** in this story. Railway auto-deploys are configured per-service in the Railway dashboard — production service watches `master`, staging service watches `staging`.

### Environment Variable Isolation

Both Railway services use the **same variable names** but with **different values**:

| Variable | Production | Staging |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | prod Supabase URL | staging Supabase URL |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | prod key | staging key |
| `SUPABASE_SECRET_KEY` | prod secret | staging secret |
| `PUBLIC_APP_URL` | prod Railway URL | staging Railway URL |
| `NODE_ENV` | `production` | `production` |

Architecture decision: Three-tier env config (`.env.local` / GitHub Secrets / Railway env vars). SvelteKit `PUBLIC_` prefix convention for client-safe values. [Source: architecture.md — Environment config decision]

### Railway Configuration

`railway.toml` is shared between both services (same repo, same file):
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 120
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

No changes needed — both services use the same Dockerfile and healthcheck path.

### Branching Workflow

Code flows **`master` → `staging`**. The intended workflow:
1. PRs merge into `master` (production branch, gated by CI)
2. When ready to validate on staging, fast-forward `staging` to `master`: `git checkout staging && git merge master && git push`
3. Railway staging auto-deploys from `staging` branch push
4. After staging validation, production auto-deploys from `master` (already happened at step 1)

This means `staging` is always at or behind `master`. Do **not** merge PRs directly into `staging`.

### Forward Dependencies (Stories 2.1/2.2)

When Stories 2.1 and 2.2 configure Supabase Auth and OAuth, the **staging Supabase project** will need separate configuration:
- **Auth Site URL:** Set to staging Railway public URL (default is `localhost` — auth redirects will break without this)
- **Auth Redirect URLs:** Add staging Railway URL to the allowed list
- **OAuth providers (Google, GitHub):** Must be configured in the staging Supabase project dashboard separately, with staging-specific redirect URIs
- **Supabase CLI linking:** Run `supabase link --project-ref <staging-ref>` when Story 2.5 needs to push migrations to staging. Record the project ref during Task 1.5.

### What NOT to Build

- **No Supabase migrations** — no database schema exists yet (that's Story 2.5)
- **No auth configuration in staging Supabase** — auth flows are Story 2.1/2.2
- **No seed data** — no tables to seed
- **No separate staging CI job** — same CI pipeline validates both branches
- **No Supabase local stack changes** — local dev uses `supabase start` regardless of staging
- **No Railway CLI automation** — dashboard config is simpler for a one-time setup
- **No branch protection rules** — that's GitHub repo settings, not this story's scope

### Previous Story Intelligence (Story 1.4)

Key learnings:
- CI workflow initially targeted `main` but repo uses `master` — **critical fix** applied. Ensure `staging` branch name in CI matches exactly.
- Railway auto-deploy is entirely dashboard-configured, not in `railway.toml` or CI. The GitHub integration and branch triggers are dashboard-only settings.
- Node 22 across `.nvmrc`, Dockerfile, and CI. No version mismatches.
- `engines` field in `package.json` set to `>=22`.

### Previous Story Intelligence (Story 1.3)

- Dockerfile uses multi-stage build: deps → builder → runner (Node 22 Alpine)
- Health endpoint uses `$env/dynamic/*` (NOT `$env/static/*`) for runtime env resolution — this is what makes staging work with different env vars per Railway service
- `.env.example` tracks all env var placeholders for developer reference

### Git Intelligence

Recent commits:
```
cdeea07 feat: story 1.4 — CI/CD pipeline, test infrastructure, and code review fixes
e4a2a6c doc: add story 2.0 — staging environment provisioning (deferred from epic 1)
64e5e6b fix: story 1.3 code review — align env var names, harden tests, fix config
90489a6 feat: story 1.3 — Dockerfile, health endpoint, and Railway config
```

Patterns: commit messages use `feat:`, `fix:`, `doc:` prefixes. Branch is `master` (not `main`).

### Decision Context

> Deferred from Epic 1 (agreed during PM chat on 2026-02-08). Staging adds no value until database schema and auth exist — Epic 2 is where deployment risk first appears.

### Project Structure Notes

**No new application files.** Code changes: `.github/workflows/ci.yml` (add `staging` branch trigger). New documentation: `docs/staging.md` (two-environment setup guide).

### Architecture Compliance Checklist

- [ ] Staging Railway service exists with its own env vars
- [ ] Staging Supabase project is fully isolated (separate project, no shared data)
- [ ] CI pipeline runs on `staging` branch pushes/PRs
- [ ] Railway staging auto-deploys from `staging` branch
- [ ] Staging `/api/health` returns 200 with staging Supabase connection
- [ ] Production `/api/health` still returns 200 (no regression)
- [ ] Zero shared credentials between staging and production
- [ ] `railway.toml` unchanged (works for both services)
- [ ] Dockerfile unchanged (works for both services)
- [ ] No Svelte 4 patterns introduced
- [ ] No secrets committed to repository

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.0, lines 435-451]
- [Source: _bmad-output/planning-artifacts/architecture.md — Infrastructure & Deployment decisions, lines 485-507]
- [Source: _bmad-output/planning-artifacts/architecture.md — Environment variables, lines 1204-1224]
- [Source: _bmad-output/planning-artifacts/architecture.md — CI/CD pipeline stages, lines 498-506]
- [Source: _bmad-output/implementation-artifacts/1-4-ci-cd-pipeline-and-test-infrastructure.md — CI config, Railway auto-deploy notes]
- [Source: _bmad-output/implementation-artifacts/1-3-production-deployment-and-health-check.md — Dockerfile, health endpoint, Railway config]
- [Source: _bmad-output/project-context.md — Auth & Security patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Subtask 3.2: Updated `.github/workflows/ci.yml` to trigger on `staging` branch (push + PR). Added `staging` to both `push.branches` and `pull_request.branches` arrays.
- Task 5.1: Updated `.env.example` with comment block noting staging uses separate Supabase credentials configured in Railway (no credential values committed).
- Task 5.2: Created `docs/staging.md` with two-environment setup guide covering: environment overview table, env var isolation, deploy workflow (`master` → `staging`), verification steps, data isolation, and Supabase CLI linking note for Story 2.5.
- All tests pass (17/17), lint clean, 0 type errors.
- **BLOCKED on manual tasks:** Tasks 1, 2, 3.1, 3.3, and 4 require Supabase Dashboard, Railway Dashboard, and git branch creation by the user.

### Change Log

- 2026-02-09: Story created by SM agent (Claude Opus 4.6) — ultimate context engine analysis completed
- 2026-02-09: Story validated by SM agent (Claude Opus 4.6) — 7 improvements applied: concrete verification steps, forward dependencies for auth/OAuth, branching workflow, cost optimization (Free tier start), supabase link note, docs/staging.md target, LLM-optimized task wording
- 2026-02-09: Dev agent (Claude Opus 4.6) — implemented code tasks: ci.yml staging branch trigger (3.2), .env.example comment (5.1), docs/staging.md (5.2). All tests pass. Remaining tasks require manual dashboard configuration.

### File List

- `.github/workflows/ci.yml` (modified — added `staging` to branch triggers)
- `.env.example` (modified — added staging credential comment block)
- `docs/staging.md` (new — two-environment setup documentation)
