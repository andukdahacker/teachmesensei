# Story 2.0 — Manual Steps Checklist

## Task 1: Create Supabase Staging Project

- [ ] Open [supabase.com/dashboard](https://supabase.com/dashboard)
- [ ] Click **New Project**
- [ ] Select your existing organization
- [ ] Project name: `teachmesensei-staging` (or similar)
- [ ] Database password: generate and save securely
- [ ] Region: **Singapore (ap-southeast-1)** — must match production
- [ ] Plan: **Free tier**
- [ ] Click **Create new project** and wait for it to provision
- [ ] Once ready, go to **Settings → API** and record these three values:
  - `PUBLIC_SUPABASE_URL` — the Project URL
  - `PUBLIC_SUPABASE_PUBLISHABLE_KEY` — the `anon` / `public` key
  - `SUPABASE_SECRET_KEY` — the `service_role` key
- [ ] Go to **Settings → General** and record the **Project Reference ID** (e.g. `abcdefghijkl`) — needed for `supabase link` in Story 2.5
- [ ] Verify isolation: **Table Editor** shows no tables, **Authentication → Users** shows no users, **Storage** shows no buckets

## Task 2: Create Railway Staging Service

- [ ] Open [railway.app](https://railway.app) and go to your project
- [ ] Click **New Service** (or **+ New** → **Service**)
- [ ] Choose **Deploy from GitHub repo** → select the `teachmesensei` repository
- [ ] Once created, go to **Service Settings**:
  - Set **Source Branch** to `staging`
  - Verify **Builder** is set to Dockerfile (should auto-detect from `railway.toml`)
- [ ] Go to **Variables** tab and add these environment variables:

| Variable                             | Value                                            |
| ------------------------------------ | ------------------------------------------------ |
| `PUBLIC_SUPABASE_URL`                | _(staging Supabase URL from Task 1)_             |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY`    | _(staging anon key from Task 1)_                 |
| `SUPABASE_SECRET_KEY`                | _(staging service_role key from Task 1)_         |
| `PUBLIC_APP_URL`                     | _(staging Railway public URL — Settings → Networking → Public Domain)_ |
| `NODE_ENV`                           | `production`                                     |

- [ ] _(Optional)_ Under **Settings → Deploy**, enable **Wait for CI** to gate deploys on GitHub Actions

## Task 3.1 & 3.3: Create and Push `staging` Branch

Run locally after committing the code changes:

```bash
git checkout -b staging
git push -u origin staging
```

- [ ] Verify: Railway staging service triggers a build automatically (check Railway dashboard)

## Task 4: Verify End-to-End

- [ ] Check Railway dashboard — staging service shows a successful build/deploy
- [ ] Hit staging health endpoint:
  ```bash
  curl https://<staging-url>/api/health
  ```
  Expected: `{ "status": "ok" }` with HTTP 200
- [ ] Hit production health endpoint:
  ```bash
  curl https://<prod-url>/api/health
  ```
  Expected: `{ "status": "ok" }` with HTTP 200 (no regression)
- [ ] Verify Supabase isolation:
  - In Railway dashboard, open staging service → Variables
  - Open production service → Variables
  - Compare all 3 Supabase vars side-by-side — **all must be different**
- [ ] Verify staging Supabase received the request:
  - Open staging Supabase project → **API Logs** (under Logs section)
  - Confirm the health check request appears there (not in the production project's logs)
