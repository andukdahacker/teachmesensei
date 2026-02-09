# Staging Environment

TeachMeSensei uses two isolated environments: **production** and **staging**. Both run on Railway with separate Supabase projects.

## Environment Overview

|                  | Production                 | Staging                     |
| ---------------- | -------------------------- | --------------------------- |
| Railway branch   | `master`                   | `staging`                   |
| Supabase project | Production project         | Staging project             |
| Auto-deploy      | Yes (on push to `master`)  | Yes (on push to `staging`)  |
| CI pipeline      | GitHub Actions on `master` | GitHub Actions on `staging` |

Both environments share the same `Dockerfile`, `railway.toml`, and codebase. The only difference is the environment variables configured in each Railway service.

## Environment Variables

Both Railway services use the same variable names with different values:

- `PUBLIC_SUPABASE_URL` — points to the respective Supabase project
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY` — publishable key for the respective project
- `SUPABASE_SECRET_KEY` — secret key for the respective project
- `PUBLIC_APP_URL` — the Railway public URL for that service
- `NODE_ENV` — `production` for both

Credentials are configured in the Railway dashboard only. They are never committed to the repository.

## Deploying to Staging

The `staging` branch is always at or behind `master`. To deploy to staging:

```bash
git checkout staging
git merge master
git push
```

Railway auto-deploys the staging service when the `staging` branch receives a push. CI runs automatically on both branches.

**Do not** merge PRs directly into `staging`. All PRs target `master`.

## Verifying a Staging Deployment

1. Check Railway dashboard for a successful build on the staging service
2. Hit the staging health endpoint:
   ```bash
   curl https://<staging-url>/api/health
   ```
   Expected response: `{ "status": "ok" }` (HTTP 200)
3. Confirm the staging Supabase project received the health check request in Supabase Studio API logs

## Data Isolation

Staging and production are fully isolated:

- Separate Supabase projects (different databases, auth, storage)
- Separate Railway services with independent environment variables
- Zero shared credentials between environments

## Supabase CLI Linking (Future)

When database migrations are introduced (Story 2.5), link the Supabase CLI to the staging project:

```bash
supabase link --project-ref <staging-project-ref>
```

Record the staging project ref during initial setup for this purpose.
