---
name: api-server seed scripts
description: How menu/seed data is structured and the import side-effect gotcha
---

# api-server seed scripts

`artifacts/api-server/src/scripts/seed.ts` runs `main()` and `process.exit(0)`
at module top level. So any script that reuses seed data must NOT import from
`seed.ts` — importing it would run the full seed and exit.

**Rule:** shared seed data lives in a side-effect-free module
(`src/scripts/menuSeed.ts` exports `MENU_SEED`). Both `seed.ts` (fresh DBs,
guards on existing rows) and `reseedMenu.ts` (wipes + reinserts, run via
`pnpm --filter @workspace/api-server reseed:menu`) import from there.

**Why:** the DB is the source of truth for the public menu once seeded; the
static `menuCategories` fallback in `chez-florent/src/App.tsx` only renders when
the API returns nothing. Keep that fallback in sync with `MENU_SEED`.
