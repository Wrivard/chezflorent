---
name: Testing setup (Vitest + Supertest)
description: How API integration tests are wired in this pnpm monorepo and the gotchas that bite when adding/running them.
---

# API integration testing

The api-server (`@workspace/api-server`) uses **Vitest + Supertest** to drive the
real Express app (`src/app.ts`) against the **real Postgres database**
(`DATABASE_URL`). Run with `pnpm --filter @workspace/api-server test`.

## Gotchas (non-obvious)

- **Adding devDeps:** the package-management `installLanguagePackages` tool adds
  to the workspace ROOT and pnpm blocks that (`ERR_PNPM_ADDING_TO_ROOT`). Instead
  edit the sub-package's `package.json` and run `pnpm install --filter <pkg>`.
- **Test files live in `test/`, not `src/`.** The package tsconfig only includes
  `src`, so tests in `test/` are excluded from the tsc build (no need to pull
  vitest/supertest types into the production typecheck). Vitest transpiles them
  via esbuild regardless.
- **pino-pretty worker:** the logger uses a `pino-pretty` transport (worker
  thread) in non-production. Tests set `LOG_LEVEL: "silent"` via vitest config
  `test.env` to keep output clean.
- **Self-contained against a shared real DB:** tests must namespace all fixtures
  uniquely and clean up in `afterAll`, and call `pool.end()` so the process
  exits. `fileParallelism: false` keeps shared-DB state predictable. Hours rows
  use an out-of-range test day (99) to avoid clobbering real seeded days 0-6.
- **Auth:** session is a signed cookie (`cf_session`) signed with the dev secret
  when `NODE_ENV !== production`. Use `request.agent(app)` to persist it across
  requests; plain `request(app)` (no cookie) is how you assert the 401 guard.
