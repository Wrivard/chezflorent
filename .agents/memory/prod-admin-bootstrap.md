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
