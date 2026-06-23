---
name: Vercel deploy of the pnpm-monorepo full-stack scaffold
description: How the chez-florent CMS (Vite web + Express api-server + lib/db) is wired for free Vercel deployment.
---

# Vercel deployment of the Replit pnpm-workspace scaffold

This scaffold (Vite frontend artifact + Express `api-server` artifact + `lib/db`)
deploys to Vercel's free Hobby plan as: static frontend + one serverless
function wrapping the Express app + Neon Postgres + Vercel Blob.

## Serverless routing (the non-obvious part)
- Use a **catch-all function file** `api/[...path].ts` that does
  `import app from "../artifacts/api-server/src/app"; export default app;`.
  The `[...path]` filename makes Vercel route every `/api/*` request to it via
  filesystem routing, preserving the original URL so Express `app.use("/api", …)`
  resolves correctly.
- **Do not** use a `{ source: "/api/(.*)", destination: "/api/index" }` rewrite —
  the wildcard segment is not passed and behavior is ambiguous. The catch-all
  filename avoids rewrites for the API entirely.
- `vercel.json` only needs an SPA fallback rewrite, and it **must exclude `/api`**:
  `{ "source": "/((?!api/).*)", "destination": "/index.html" }`. Vercel serves
  existing static assets before applying rewrites, so this doesn't clobber JS/CSS.
- `buildCommand` builds only the web artifact; `outputDirectory` is the web
  artifact's `dist/public`. `maxDuration: 10` is free-tier safe.

## Build-time env
**Why:** `vite.config.ts` in the scaffold throws if `PORT`/`BASE_PATH` are
missing, but Vercel's static build doesn't set them.
**How to apply:** make them optional with defaults (`PORT ?? "5173"`,
`BASE_PATH ?? "/"`); the Replit dev workflow still provides real values which
take precedence. Verify a Vercel build locally with
`BASE_PATH=/ pnpm exec vite build` (no PORT).

## Production secrets / runtime
- `getSessionSecret()` must **throw in production** if `SESSION_SECRET` is unset
  (the dev fallback constant would otherwise let anyone forge the signed session
  cookie). Dev keeps the insecure fallback.
- DB uses `pg.Pool` (TCP) at module scope — fine for low-traffic serverless, but
  prod must use the **Neon pooled** connection string (host contains `-pooler`).
- Photo uploads: `BLOB_READ_WRITE_TOKEN` set → Vercel Blob; unset → local disk
  at `/api/uploads` (dev only; Vercel fs is ephemeral/read-only).
- Required Vercel env: `DATABASE_URL`, `SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN`,
  plus `ADMIN_EMAIL`/`ADMIN_PASSWORD` used once by `pnpm --filter @workspace/api-server run seed`.

## API verb/contract gotchas
- Content updates are **PATCH** (not PUT): `PATCH /api/events/:id` etc. Hours
  update is keyed by `dayOfWeek`, photos by `slot`.
- Upload validates by **magic-byte sniffing** (jpeg/png/gif/webp), not the
  client MIME header.
- The generated api-client uses **relative `/api/...` paths** (no `setBaseUrl`),
  so the same code works behind the Replit dev proxy and the Vercel rewrite.
