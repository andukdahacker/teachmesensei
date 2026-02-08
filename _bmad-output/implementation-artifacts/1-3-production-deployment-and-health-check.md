# Story 1.3: Production Deployment & Health Check

Status: review

## Story

As a developer,
I want the application deployed to Railway with a health endpoint,
So that I can verify production infrastructure works before building features.

## Acceptance Criteria

1. **Given** the SvelteKit project builds successfully
   **When** I check the project root
   **Then** a `Dockerfile` exists for Railway deployment with `adapter-node`

2. **Given** the Dockerfile exists
   **When** I build the Docker image
   **Then** a multi-stage build produces a minimal production image using `node:22-alpine`

3. **Given** the application is running
   **When** I send a GET request to `/api/health`
   **Then** the endpoint at `src/routes/api/health/+server.ts` checks Supabase connectivity and returns `{ status: 'ok' }` with HTTP 200

4. **Given** the application is running but Supabase is unreachable
   **When** I send a GET request to `/api/health`
   **Then** the endpoint returns `{ status: 'degraded', error: '...' }` with HTTP 503

5. **Given** the Dockerfile and health endpoint exist
   **When** the application is deployed to Railway (Singapore region `asia-southeast1-eqsg3a`)
   **Then** the application deploys successfully

6. **Given** the application is deployed to Railway
   **When** I send a GET request to the production `/api/health` endpoint
   **Then** it responds with HTTP 200

7. **Given** Railway is configured
   **When** I check the environment variables
   **Then** `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` are configured in Railway

## Tasks / Subtasks

- [x] Task 1: Create the Dockerfile (AC: #1, #2)
  - [x] 1.1 Create `Dockerfile` at project root with 3-stage multi-stage build (deps, builder, runner)
  - [x] 1.2 Stage 1 (`deps`): `node:22-alpine`, copy `package.json` + `package-lock.json`, run `npm ci`
  - [x] 1.3 Stage 2 (`builder`): copy `node_modules` from deps, copy source, run `npm run build`, run `npm prune --omit=dev`
  - [x] 1.4 Stage 3 (`runner`): `node:22-alpine`, create non-root user, copy `build/`, `node_modules/`, `package.json` from builder, `CMD ["node", "build"]`
  - [x] 1.5 Create `.dockerignore` at project root

- [x] Task 2: Create the health endpoint (AC: #3, #4)
  - [x] 2.1 Create directory `src/routes/api/health/`
  - [x] 2.2 Create `src/routes/api/health/+server.ts` with GET handler
  - [x] 2.3 Import env vars from `$env/dynamic/private` and `$env/dynamic/public` (NOT `$env/static/*` — see Dev Notes)
  - [x] 2.4 Implement Supabase connectivity check via direct `fetch` to PostgREST root with 5s timeout
  - [x] 2.5 Return `{ status: 'ok' }` (200) on success, `{ status: 'degraded', error: '...' }` (503) on failure

- [x] Task 3: Create Railway config-as-code (AC: #5)
  - [x] 3.1 Create `railway.toml` at project root with Dockerfile builder config
  - [x] 3.2 Configure `healthcheckPath = "/api/health"` and `healthcheckTimeout = 120`

- [x] Task 4: Create health endpoint unit test (AC: #3, #4)
  - [x] 4.1 Create `src/routes/api/health/+server.test.ts`
  - [x] 4.2 Test: returns 200 with `{ status: 'ok' }` when Supabase is reachable (mock `fetch` to return 200)
  - [x] 4.3 Test: returns 503 with `{ status: 'degraded', error }` when Supabase is unreachable (mock `fetch` to throw)
  - [x] 4.4 Test: returns 503 when env vars are missing (mock `$env/dynamic/*` to return undefined)
  - [x] 4.5 Test: returns 503 when fetch times out (mock `fetch` to reject with AbortError)

- [x] Task 5: Verify local build (AC: #1, #2)
  - [x] 5.1 Run `npm run build` — must succeed
  - [x] 5.2 Run `node build` locally — verified adapter-node output in build/ directory
  - [x] 5.3 Health endpoint compiled to `entries/endpoints/api/health/_server.ts.js` — verified in build output

- [ ] Task 6: Deploy to Railway and verify (AC: #5, #6, #7) — **MANUAL: Requires Railway dashboard access**
  - [ ] 6.1 Push to Railway (Singapore region)
  - [ ] 6.2 Configure environment variables in Railway dashboard: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `ORIGIN`, `PUBLIC_APP_URL`, `PROTOCOL_HEADER=x-forwarded-proto`, `HOST_HEADER=x-forwarded-host`, `XFF_DEPTH=1`
  - [ ] 6.3 Verify `/api/health` returns 200 in production

## Dev Notes

### Dockerfile — Exact Implementation

Use a 3-stage multi-stage build. This project has runtime `dependencies` (`@supabase/supabase-js`, `@supabase/ssr`, `clsx`, `tailwind-merge`, `tailwind-variants`, `tw-animate-css`) so `node_modules` must be included in the final image.

```dockerfile
# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the SvelteKit application
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm prune --omit=dev

# Stage 3: Production runtime
FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
ENV NODE_ENV=production
EXPOSE 3000
USER appuser
CMD ["node", "build"]
```

**Why 3 stages:** Separating `deps` from `builder` maximizes Docker layer caching. If only source code changes (not `package.json`), the `deps` stage is cached and `npm ci` is skipped.

**Why `node:22-alpine`:** Node 22 is current LTS (active until April 2027). `package.json` specifies `"node": ">=20"`. Alpine keeps final image under 50MB vs 1GB+ with Debian. **Note:** `.nvmrc` currently pins Node 20 for local dev. Node 22 is chosen for production because Node 20 LTS maintenance ends April 2026. If you encounter subtle runtime differences, align `.nvmrc` to `22` as well.

**Why `npm prune --omit=dev`:** Removes ~200MB of devDependencies (Vite, TypeScript, testing libs) from production image.

**Why exec form `CMD`:** `CMD ["node", "build"]` — no shell needed. SvelteKit adapter-node reads `process.env.PORT` at runtime internally.

### .dockerignore — Required Contents

```
Dockerfile
.dockerignore
.git
.gitignore
.svelte-kit
node_modules
build
supabase/.temp
_bmad
_bmad-output
README.md
CHANGELOG.md
.prettierrc
.editorconfig
playwright-report
test-results
tests
.env
.env.*
!.env.example
.vscode
.github
```

### Health Endpoint — Implementation Pattern

The health endpoint must verify **actual Supabase connectivity**, not just check if the client object exists. Railway uses this for zero-downtime deploys — process running does NOT mean app healthy.

```typescript
// src/routes/api/health/+server.ts
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export async function GET() {
  try {
    const url = publicEnv.PUBLIC_SUPABASE_URL;
    const key = env.SUPABASE_SECRET_KEY;

    if (!url || !key) {
      return json({ status: 'degraded', error: 'Missing Supabase configuration' }, { status: 503 });
    }

    // Direct fetch to PostgREST root — lightweight, reliable connectivity check
    // Times out after 5s to fail fast instead of hanging until Railway's 120s timeout
    const response = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Supabase returned ${response.status}`);
    }

    return json({ status: 'ok' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return json({ status: 'degraded', error: message }, { status: 503 });
  }
}
```

**Important considerations:**
- **`$env/dynamic/*` (NOT `$env/static/*`)** — Static env imports are inlined at build time by Vite. The Dockerfile runs `npm run build` without production env vars, so `$env/static/private` would bake in `undefined`. Dynamic imports read from `process.env` at runtime, which is the correct pattern for adapter-node deployments where Railway injects env vars at runtime.
- Uses `SUPABASE_SECRET_KEY` (server-only) — this is a server route (`+server.ts`), not client code. Safe per architecture rules.
- **Direct `fetch` to PostgREST root** (NOT `supabase.auth.getSession()`) — `getSession()` reads from local in-memory session store and does NOT make a network request. It would return `{ session: null, error: null }` even if Supabase is completely down. The `fetch` approach actually verifies network connectivity.
- **5-second timeout via `AbortSignal.timeout(5000)`** — Fails fast instead of hanging until Railway's 120s health check timeout. If Supabase doesn't respond in 5s, the endpoint returns 503 immediately.
- If the Supabase project doesn't exist yet in production, the health endpoint will return 503. This is expected — configure Supabase first, then Railway.
- **API pattern deviation (intentional):** Architecture says `+server.ts` errors use `{ error: { code, message } }`. This health endpoint uses `{ status: 'degraded', error: '...' }` per the epic AC specification. Do NOT "fix" this to match the standard API error format — health endpoints are machine-readable status checks, not user-facing API responses.

### railway.toml — Config-as-Code

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

**Health check behavior:** Railway queries `/api/health` on the `PORT` the app listens on. It expects HTTP 200 within `healthcheckTimeout` seconds. If no 200 in that window, the deploy fails. Health checks run **only at deploy time** — NOT for continuous monitoring. Requests come from hostname `healthcheck.railway.app`.

**Region selection:** Singapore (`asia-southeast1-eqsg3a`) is configured via the Railway dashboard or account settings, NOT in `railway.toml` (unless using multi-region config). Set it in the Railway project settings.

### SvelteKit adapter-node Runtime Environment Variables

These are set in Railway dashboard (NOT in Dockerfile):

| Variable | Value | Purpose |
|----------|-------|---------|
| `PUBLIC_SUPABASE_URL` | Production Supabase URL | Supabase client URL (browser-safe) |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Production anon key | Supabase anon JWT key (browser-safe) |
| `SUPABASE_SECRET_KEY` | Production service role key | Server-only admin key |
| `ORIGIN` | `https://<your-domain>.up.railway.app` | Required for SvelteKit CSRF protection |
| `PUBLIC_APP_URL` | `https://<your-domain>.up.railway.app` | App URL for absolute link generation (matches `.env.example`) |
| `PROTOCOL_HEADER` | `x-forwarded-proto` | Reverse proxy protocol detection |
| `HOST_HEADER` | `x-forwarded-host` | Reverse proxy host detection |
| `XFF_DEPTH` | `1` | Railway is a single proxy layer |
| `SHUTDOWN_TIMEOUT` | `30` | Graceful shutdown wait in seconds (adapter-node default) |

`PORT` and `HOST` are auto-injected by Railway. SvelteKit adapter-node reads `PORT` (default 3000) and defaults `HOST` to `0.0.0.0` — no config needed.

**ORIGIN is critical:** Without it, SvelteKit's CSRF protection will reject form submissions in production. Set it to the full production URL including protocol.

### What NOT to Build in This Story

- **No CI/CD pipeline** — GitHub Actions belongs to Story 1.4
- **No auto-deploy on merge** — Railway GitHub integration configured in Story 1.4
- **No database migrations** — No Supabase tables needed yet
- **No environment variable validation** — Keep it simple, SvelteKit will error on missing env vars at startup
- **No uptime monitoring** — Phase 1 uses platform dashboards only
- **No custom domain** — Railway provides `*.up.railway.app` by default

### Previous Story Intelligence (Story 1.2)

Key learnings from Story 1.2:
- Route groups `(public)`, `(app)`, `(admin)`, `(enterprise)` are established
- shadcn-svelte components installed: button, card, input, dialog, skeleton, sonner, avatar, badge
- Layout shells: `PublicShell`, `AppShell`, `Nav`, `Footer`, `Sidebar` in `$lib/components/layout/`
- Toaster provider added to root `+layout.svelte`
- Svelte 5 runes used everywhere — `$props()`, `{@render children()}`, `Snippet` type
- `@testing-library/svelte`, `@testing-library/jest-dom`, `jsdom` added for component testing
- Vitest configured with `resolve.conditions: ['browser']` for Svelte 5 component tests
- 10 tests passing (2 unit + 8 component)
- `tw-animate-css` produces harmless CSS warning — not from our code
- Root `+page.svelte` was deleted — landing page moved to `(public)/+page.svelte`
- Route conflict learning: `(app)/dashboard/`, `(admin)/admin/`, `(enterprise)/enterprise/` use nested paths

### Git Intelligence

Recent commits (most recent first):
```
0397a66 feat: story 1.2 — route group layouts, shadcn components, and layout shells
b1fd818 feat: story 1.1 — SvelteKit scaffold with Supabase, shadcn-svelte, and tooling
```

Story 1.2 created 50+ files. Key patterns established:
- Components in `$lib/components/layout/` and `$lib/components/ui/`
- Tests co-located next to source files (`*.test.ts`)
- `components.json` configured with correct aliases
- `src/lib/utils.ts` has `cn()` utility
- Root layout uses `$props()` pattern

### Project Structure After This Story

```
(root)
├── Dockerfile                              # NEW — 3-stage production build
├── .dockerignore                           # NEW — excludes dev/docs from image
├── railway.toml                            # NEW — Railway config-as-code
├── src/
│   └── routes/
│       └── api/
│           └── health/
│               ├── +server.ts              # NEW — health check endpoint
│               └── server.test.ts           # NEW — health endpoint unit tests (no + prefix — SvelteKit reserves it)
```

No existing files are modified in this story.

### Architecture Compliance Checklist

- [ ] Dockerfile uses `adapter-node` output (`build/` directory)
- [ ] Dockerfile uses multi-stage build (explicit over implicit)
- [ ] Health endpoint at `src/routes/api/health/+server.ts`
- [ ] Health endpoint uses `$env/dynamic/*` (NOT `$env/static/*`) for runtime env resolution
- [ ] Health endpoint checks actual Supabase connectivity via network request (NOT `getSession()`)
- [ ] Health endpoint has 5s timeout (`AbortSignal.timeout(5000)`)
- [ ] Health returns `{ status: 'ok' }` (200) / `{ status: 'degraded', error }` (503)
- [ ] Health endpoint has co-located unit tests (`+server.test.ts`)
- [ ] `SUPABASE_SECRET_KEY` never exposed to client
- [ ] Environment variables follow SvelteKit `PUBLIC_` convention
- [ ] No barrel exports added
- [ ] TypeScript strict mode
- [ ] snake_case in JSON responses (`status`, `error` — single-word keys, no convention issue)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Hosting decisions, lines 485-507]
- [Source: _bmad-output/planning-artifacts/architecture.md — Dockerfile requirement, line 795]
- [Source: _bmad-output/planning-artifacts/architecture.md — Environment variables, lines 1204-1224]
- [Source: _bmad-output/planning-artifacts/architecture.md — svelte.config.js, lines 1226-1238]
- [Source: _bmad-output/planning-artifacts/architecture.md — Health endpoint, lines 492-496]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1 Story 1.3, lines 387-403]
- [Source: _bmad-output/project-context.md — Component boundaries, security rules]
- [Source: _bmad-output/implementation-artifacts/1-2-route-group-layouts-and-component-library-shell.md — Previous story learnings]
- [Source: Railway Docs — Dockerfiles, healthchecks, regions, variables]
- [Source: SvelteKit Docs — adapter-node configuration and runtime env vars]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- SvelteKit reserves `+` prefixed filenames in routes — test file renamed from `+server.test.ts` to `server.test.ts`
- `DOMException` does not extend `Error` in jsdom — added fallback for objects with `message` property in catch block
- `vi.mock('$env/dynamic/*')` uses getter pattern for mutable env objects to allow per-test overrides
- Prettier has no parser for Dockerfile, .dockerignore, railway.toml — expected behavior

### Completion Notes List

- Tasks 1-5 complete: Dockerfile, .dockerignore, health endpoint, railway.toml, unit tests, build verification
- Task 6 (Railway deploy) requires manual user action — Railway dashboard access needed for env var config and deploy
- 5 new unit tests added (all pass): ok response, unreachable, non-ok status, timeout, missing env vars
- 15/15 total tests pass (5 new + 10 existing), zero regressions
- Build succeeds with adapter-node output
- Health endpoint uses `$env/dynamic/*` for runtime env resolution (correct for Docker builds)
- Health endpoint uses direct `fetch` to PostgREST root with 5s timeout (NOT `getSession()`)

### Change Log

- 2026-02-08: Story created by SM agent — ultimate context engine analysis completed
- 2026-02-08: Quality review applied — 9 improvements across 3 categories (3 critical, 4 enhancements, 2 optimizations): fixed $env/static to $env/dynamic, replaced getSession() with direct fetch connectivity check, added 5s timeout, added health endpoint unit tests task, documented Node version divergence, added PUBLIC_APP_URL and SHUTDOWN_TIMEOUT to env vars, noted API pattern deviation, refined .dockerignore specificity
- 2026-02-08: Implementation complete — Tasks 1-5 done, 15/15 tests passing, build clean. Task 6 (Railway deploy) pending manual user action.

### File List

New files:
- Dockerfile
- .dockerignore
- railway.toml
- src/routes/api/health/+server.ts
- src/routes/api/health/server.test.ts

Modified files:
- _bmad-output/implementation-artifacts/sprint-status.yaml (status: in-progress → review)
- _bmad-output/implementation-artifacts/1-3-production-deployment-and-health-check.md (status: ready-for-dev → review)
