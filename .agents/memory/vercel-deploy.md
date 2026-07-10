---
name: Vercel deploy of the pnpm-monorepo full-stack scaffold
description: How the chez-florent CMS (Vite web + Express api-server + lib/db) is wired for free Vercel deployment.
---

# Vercel deployment of the Replit pnpm-workspace scaffold

This scaffold (Vite frontend artifact + Express `api-server` artifact + `lib/db`)
deploys to Vercel's free Hobby plan as: static frontend + one serverless
function wrapping the Express app + Neon Postgres + Vercel Blob.

## Serverless routing (the non-obvious part)
- Use a **catch-all function file** `api/[...path].mjs` (plain JS!) that does
  `import app from "../artifacts/api-server/dist/app.mjs"; export default app;`.
  The `[...path]` filename makes Vercel route every `/api/*` request to it via
  filesystem routing, preserving the original URL so Express `app.use("/api", …)`
  resolves correctly.
- **Never point the function at the TypeScript source.** @vercel/node
  type-checks every traced `.ts` file, and because the packages are
  `"type": "module"` it forces nodenext resolution → every extensionless
  relative import in api-server fails with TS2835 and the build dies. Instead:
  `build.mjs` bundles BOTH `src/index.ts` (listening server) and `src/app.ts`
  (pure app export) → `dist/app.mjs`; the function imports the bundle.
  `buildCommand` must run `pnpm --filter @workspace/api-server build` BEFORE the
  web build (buildCommand runs before function bundling — verified with local
  `npx vercel build`).
- **Never commit `.vercel/`** (it's in .gitignore now). A committed
  `.vercel/output` makes Vercel SKIP the build and deploy that stale prebuilt
  output verbatim — symptom: static pages load but every `/api/*` and SPA
  fallback returns Vercel's platform NOT_FOUND, and vercel.json is ignored.
- Local repro/verification without deploying: create a synthetic
  `.vercel/project.json` (`{"projectId":"prj_local","orgId":"team_local","settings":{"framework":null}}`)
  and run `npx vercel@latest build --yes`; inspect `.vercel/output/functions`
  and `config.json` routes, then delete `.vercel/`.
- Vercel serverless never runs `index.ts`, so its startup seeding/bootstrap is
  dead code there — prod data must be migrated externally (see
  prod-admin-bootstrap.md).
- **Do not** use a `{ source: "/api/(.*)", destination: "/api/index" }` rewrite —
  the wildcard segment is not passed and behavior is ambiguous. The catch-all
  filename avoids rewrites for the API entirely.
- **Never use the legacy `routes` key** in vercel.json: its presence makes Vercel
  silently ignore `outputDirectory` → build fails with «No Output Directory named
  "public" found» even though the build succeeded. Use `rewrites` only.
- `vercel.json` only needs an SPA fallback rewrite, and it **must exclude `/api`**:
  `{ "source": "/((?!api/).*)", "destination": "/index.html" }`. Vercel serves
  existing static assets before applying rewrites, so this doesn't clobber JS/CSS.
- `buildCommand` builds api-server (bundle) then the web artifact;
  `outputDirectory` is the web artifact's `dist/public`. `maxDuration: 10` is
  free-tier safe.
- **Root Directory gotcha:** the user's Vercel project has Root Directory set to
  `artifacts/chez-florent` (log tell: build cwd is that dir, pnpm shows `../..`).
  Vercel then ignores the repo-root vercel.json entirely. Fallback shipped: a
  mirror `artifacts/chez-florent/vercel.json` (outputDirectory `dist/public`) plus
  `artifacts/chez-florent/api/[...path].mjs` re-exporting the bundled Express
  app, so the deploy works with either Root Directory setting. Keep both configs
  in sync.
- **Output Directory failure — CONFIRMED mechanism (from real build logs):**
  Vercel reads the REPO-ROOT vercel.json (its buildCommand was echoed verbatim
  in failing logs) but executes it in an UNKNOWN cwd that is 2 levels below
  the repo root (pnpm install shows root as `../..`) and is NOT
  artifacts/chez-florent (both `dist/public` and
  `artifacts/chez-florent/dist/public` were "cannot stat"/introuvable from
  there — likely Root Directory points at another workspace dir, e.g.
  artifacts/api-server). The output-dir check ("public", dashboard Override)
  also failed while artifacts/chez-florent/public existed → checked elsewhere
  (repo root or that cwd). NEVER assume the buildCommand cwd. Fix:
  `scripts/vercel-output.sh` locates itself via `$0` → derives the repo root
  absolutely → copies dist/public into `public/` at the repo root, the app
  dir, AND `$(pwd)`; buildCommand finds the script via an if/elif chain
  trying `scripts/`, `../scripts/`, `../../scripts/`, `../../../scripts/`.
  Script prints cwd for future log forensics. Guard inside the script is
  `-d /vercel` (real machines clone to /vercel/path0), NOT `$VERCEL` — local
  `vercel build` also sets VERCEL=1 and once polluted the SOURCE `public/`
  (vite publicDir) with built files. `FORCE_VERCEL_OUTPUT=1` lets you
  sandbox-test the script locally.
- **Custom domain gotcha:** `www.chezflorent.ca` CNAMEs to vercel-dns (works),
  but the apex `chezflorent.ca` A record pointed at the old WHC host
  (149.56.225.6, whc.ca cert) → visitors on the apex saw the OLD site. Apex must
  be repointed at the DNS provider per Vercel → Settings → Domains.

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

## Courriels de contact via Resend
All three public forms POST `/api/messages`; the server fire-and-forgets a
Resend notification for every kind. Env on Vercel: `RESEND_API_KEY`,
`RESEND_FROM_EMAIL` (bonjour@kua.quebec, must be a Resend-verified sender),
`RECIPIENT_EMAIL`. No key → message is stored and email skipped (dev-safe).
