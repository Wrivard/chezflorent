---
name: Production admin bootstrap
description: Why admin login worked in dev but not on the published site, and the startup-seed fix that keeps prod's separate DB populated.
---

# Production admin login / DB seeding

**Symptom:** admin login works in dev but returns 401 ("Failed admin login attempt") on the published/deployed site, even with the correct email/password.

**Root cause:** production has its OWN database, separate from dev. The deploy path (`scripts/post-merge.sh`) only runs `pnpm --filter db push` (schema), and the one-off `seed` script is only ever run locally against the dev DB. So production ends up with the tables but an EMPTY `admin_users` table → no row to match → 401.

**Diagnosis tools that nailed it:**
- `fetch_deployment_logs` showed the server was UP (returning 401, not 500) → not a crash / not a missing SESSION_SECRET.
- `executeSql({ environment: "production" })` (read-only replica) on `admin_users` returned zero rows, while dev had the admin. That contrast is the smoking gun.

**Fix (the rule):** the API server must SELF-SEED the admin on startup, because production's DB is only writable from inside the deployment (agent `executeSql` prod access is read-only). Implemented as `ensureAdminSeed()` called via `void ensureAdminSeed()` inside the `app.listen` callback.

**Why:** it's the only place that runs inside the production environment with `ADMIN_EMAIL`/`ADMIN_PASSWORD` available and write access to the real prod DB.

**How to apply / invariants for any startup seeding of an account:**
- INSERT only when missing (check by unique email) + `onConflictDoNothing` — never UPDATE the password on boot, or a restart would wipe out a password changed through the admin UI, and would reset `session_version` behaviour.
- Idempotent + conflict-safe so multiple autoscale instances booting together don't fight.
- Wrap in try/catch and log — a seeding failure must not crash the server.
- Run AFTER `listen` so a slow DB can't delay the deployment healthcheck.
- Takes effect in production only after the user RE-PUBLISHES (the running deployment keeps old code until then).
- This is DATA bootstrap, not schema DDL — distinct from the "never script prod schema migrations" rule (schema is handled by Replit's publish-time diff).

## Copying ALL dev content into an empty prod DB (not just admin)

Same root problem, bigger scope: when the user wants the published site to show the EXACT content they curated in dev (full menu, events, hours, photos, singleton jsonb docs), you still can't write prod directly. Pattern that works:
1. Export dev content to a JSON snapshot committed in the repo (generate it with a throwaway node script that reads the dev DB via `pg` + `DATABASE_URL`, then delete the script). Run that script from a dir where `pg` resolves (e.g. `lib/db`), not the sandbox/workspace root — `pg` isn't resolvable there.
2. `import` the JSON into the server (esbuild bundles it; needs `resolveJsonModule: true` in the api-server tsconfig) and insert it on startup.
3. Bundle check: after build, grep dist for a distinctive snapshot string to confirm esbuild inlined the JSON.

**Why a single transaction matters (hard-won):** wrap the WHOLE import in one `db.transaction`. Per-step, non-transactional inserts gated only on "table has any row" are unsafe — a mid-run failure leaves the table half-populated but permanently "skipped", and two autoscale instances racing on an empty DB can partially double-insert / hit unique violations. One transaction makes it atomic (failure rolls back → next boot retries) AND race-safe (the losing instance hits a unique-key conflict on natural keys like category.slug / hours.dayOfWeek / photos.slot and rolls back entirely, leaving the winner's complete copy).

**Snapshot is a frozen copy, not a live mirror:** future dev edits do NOT propagate; after first publish, prod is managed independently through the CMS. Re-exporting the snapshot only re-seeds a prod table that is still empty.
