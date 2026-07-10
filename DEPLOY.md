# Deploying Chez Florent (free, on Vercel)

This project is a pnpm monorepo:

- `artifacts/chez-florent` — the public website + `/admin` content manager (Vite/React)
- `artifacts/api-server` — the Express API (auth, content CRUD, photo uploads)
- `lib/db` — Drizzle schema + Postgres client

In production everything runs on **Vercel's free Hobby plan**:

- The website is served as static files.
- The API runs as a single **Vercel Serverless Function**
  (`api/index.mjs`), which imports the esbuild bundle of the Express app
  (`artifacts/api-server/dist/app.mjs`, built by the `buildCommand` in
  `vercel.json`). The vercel.json rewrite
  `{ "source": "/api/:path*", "destination": "/api" }` routes every `/api/*`
  request to it while preserving the original URL. (Do NOT use a
  `[...path].mjs` catch-all filename instead: Vercel only generates a
  single-segment route for it, so nested paths like `/api/auth/me` 404.)
- **Never commit the `.vercel/` directory.** If a prebuilt `.vercel/output`
  is present in the repo, Vercel skips the build entirely and deploys that
  stale, static-only output (no API function, no rewrites).
- The database is **Neon Postgres** (free tier).
- Photo uploads are stored in **Vercel Blob** (free tier).

No paid backend is required.

---

## 1. Create the database (Neon — free)

1. Sign up at <https://neon.tech> and create a project.
2. Copy the **pooled** connection string (it contains `-pooler` in the host).
   Serverless functions open many short-lived connections, so the pooled URL is
   important.

## 2. Create a Blob store (Vercel — free)

1. In your Vercel dashboard: **Storage → Create → Blob**.
2. **Choose PUBLIC access when creating the store.** The site serves photo
   URLs directly to visitors, so blobs must be publicly readable. A store
   created with *private* access makes every upload fail with
   «Vercel Blob: Cannot use public access on a private store» — and the
   access mode cannot be changed after creation; you would have to delete
   the store and create a new public one.
3. After creating it, copy the **`BLOB_READ_WRITE_TOKEN`**.

## 3. Import the repo into Vercel

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project → Import** the repo.
3. Vercel reads `vercel.json` automatically — leave the framework as **Other**.
   Do not override Build/Output settings; `vercel.json` already sets them.

## 4. Set environment variables (Vercel → Project → Settings → Environment Variables)

| Variable                | Value                                                        |
| ----------------------- | ----------------------------------------------------------- |
| `DATABASE_URL`          | Neon **pooled** connection string                           |
| `SESSION_SECRET`        | a long random string (signs the login cookie)               |
| `BLOB_READ_WRITE_TOKEN` | the token from the Blob store                               |
| `ADMIN_EMAIL`           | the client's admin login email (used once, to seed)         |
| `ADMIN_PASSWORD`        | the client's admin login password (used once, to seed)      |

Add them to **Production** (and Preview if you want preview deploys to work).

Generate a `SESSION_SECRET`, for example:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 5. Push the schema + seed the data into Neon

Run these **once**, locally, pointed at your Neon database. Replace the URL with
your Neon **pooled** connection string:

```bash
# from the repo root
export DATABASE_URL='postgresql://...-pooler.../neondb?sslmode=require'

# create the tables
pnpm --filter @workspace/db run push

# seed the site content + the admin user
export ADMIN_EMAIL='owner@chezflorent.example'
export ADMIN_PASSWORD='choose-a-strong-password'
pnpm --filter @workspace/api-server run seed
```

The seed is idempotent: it inserts the starter content only if the tables are
empty, and it creates **or updates** the admin user's password. To rotate the
admin password later, re-run the seed with a new `ADMIN_PASSWORD`.

## 6. Deploy

Trigger a deploy in Vercel (it deploys automatically on push to the production
branch). When it finishes:

- Public site: `https://<your-app>.vercel.app/`
- Admin panel: `https://<your-app>.vercel.app/admin`

Log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you seeded.

---

## How the pieces map to env vars

- **Auth** — `SESSION_SECRET` signs an httpOnly cookie. Passwords are hashed
  with Node's built-in `scrypt` (no native dependency). Cookies are sent with
  `Secure` automatically in production.
- **Uploads** — when `BLOB_READ_WRITE_TOKEN` is set, uploaded photos go to
  Vercel Blob and are served from its CDN. Without it (local dev) photos are
  written to `artifacts/api-server/uploads` and served from `/api/uploads`.
  Vercel's filesystem is read-only/ephemeral, so the Blob token is required in
  production.
- **Database** — `DATABASE_URL` is read by `lib/db`. Use the Neon pooled URL in
  production.

## Local development (Replit)

`DATABASE_URL` is already provisioned. Start the workflows (API server + web).
The web dev server proxies `/api` to the API server, so the same relative URLs
work in dev and prod. To create a local admin user, set `ADMIN_EMAIL` /
`ADMIN_PASSWORD` and run the seed.
