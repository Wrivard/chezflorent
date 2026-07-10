---
name: Vercel deploy of the pnpm-monorepo full-stack scaffold
description: How the chez-florent CMS (Vite web + Express api-server + lib/db) is wired for free Vercel deployment.
---

# Vercel deployment of the Replit pnpm-workspace scaffold

This scaffold (Vite frontend artifact + Express `api-server` artifact + `lib/db`)
deploys to Vercel's free Hobby plan as: static frontend + one serverless
function wrapping the Express app + Neon Postgres + Vercel Blob.

## Serverless routing (the non-obvious part)
- Use a **single function file** `api/index.mjs` (plain JS!) that does
  `import app from "../artifacts/api-server/dist/app.mjs"; export default app;`,
  plus the vercel.json rewrite `{ "source": "/api/:path*", "destination": "/api" }`
  as the FIRST rewrite. The rewrite preserves the original URL so Express
  `app.use("/api", …)` resolves correctly. Do NOT use a `[...path].mjs`
  catch-all filename (see bullet further down — it breaks nested paths).
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
- The API rewrite destination must be `"/api"` (resolves to `api/index.mjs`),
  NOT `"/api/index"`; the original URL is preserved through the rewrite so no
  path segment needs forwarding.
- **Never use the legacy `routes` key** in vercel.json: its presence makes Vercel
  silently ignore `outputDirectory` → build fails with «No Output Directory named
  "public" found» even though the build succeeded. Use `rewrites` only.
- `vercel.json` rewrites: the `/api/:path*` → `/api` rewrite first, prerendered
  page rewrites next, SPA fallback last — and the fallback **must exclude `/api`**:
  `{ "source": "/((?!api/).*)", "destination": "/index.html" }`. Vercel serves
  existing static assets before applying rewrites, so this doesn't clobber JS/CSS.
- `buildCommand` builds api-server (bundle) then the web artifact;
  `outputDirectory` is the web artifact's `dist/public`. `maxDuration: 10` is
  free-tier safe.
- **Root Directory gotcha:** the user's Vercel project has Root Directory set to
  `artifacts/chez-florent` (log tell: build cwd is that dir, pnpm shows `../..`).
  Vercel then ignores the repo-root vercel.json entirely. Fallback shipped: a
  mirror `artifacts/chez-florent/vercel.json` (outputDirectory `dist/public`) plus
  `artifacts/chez-florent/api/index.mjs` re-exporting the bundled Express
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
  Script prints cwd for future log forensics. NOTE: vercel.json schema caps
  `buildCommand` at 256 chars — long shell chains must live in a root
  package.json script invoked via `pnpm -w run vercel-build` (`-w` runs from
  the workspace root regardless of cwd). Guard inside the script is
  `-d /vercel` (real machines clone to /vercel/path0), NOT `$VERCEL` — local
  `vercel build` also sets VERCEL=1 and once polluted the SOURCE `public/`
  (vite publicDir) with built files. `FORCE_VERCEL_OUTPUT=1` lets you
  sandbox-test the script locally.
- **`[...path].mjs` catch-all DOES NOT WORK on Vercel:** in production it only
  generated the single-segment route `^/api/([^/]+)$` (param literally named
  `...path`), so `/api/healthz` worked but `/api/auth/me` returned Vercel
  NOT_FOUND. Use the canonical Express pattern instead: function file
  `api/index.mjs` + vercel.json rewrite
  `{ "source": "/api/:path*", "destination": "/api" }` → generates
  `^/api(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?$` which matches all depths; the
  function still receives the ORIGINAL url (Express routes under /api match).
  Verify routing with local `vercel build` then inspect
  `.vercel/output/config.json` routes — that is the ground truth.
- **Photo upload 500 in prod — two distinct causes seen live.** (1) Missing
  BLOB_READ_WRITE_TOKEN → local-disk fallback throws EROFS on Vercel's
  read-only FS. (2) Token present but the Blob store was created with
  PRIVATE access → `put(..., { access: "public" })` throws «Cannot use
  public access on a private store». Store access mode is fixed at creation;
  the user must delete the store and create a new PUBLIC one, then redeploy.
  Surfacing the underlying storage error in the admin-only upload route's
  JSON response is what made this diagnosable from a screenshot.
- **Prod CMS smoke-test procedure that works:** curl login with the
  ADMIN_EMAIL/ADMIN_PASSWORD secrets (cookie jar), then GET public endpoints,
  a no-op PATCH (e.g. /api/hours/:day with identical payload), and POST
  /api/upload with a tiny generated PNG. Verifies auth/DB/storage separately.
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
