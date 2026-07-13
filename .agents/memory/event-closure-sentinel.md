---
name: Event closure sentinel
description: How "Fermeture du resto" calendar entries are encoded without a schema change
---

Rule: a restaurant-closure calendar entry is a normal `events` row whose `tag` equals the reserved sentinel `__fermeture__` (constant `CLOSURE_TAG` in the web app's `src/lib/closure.ts`). There is NO `kind` column.

**Why:** production schema migrations are manual (`drizzle-kit push` from a local shell against Neon) and the user is non-technical, so schema changes are avoided; the API treats `tag` as opaque text, so no server/OpenAPI change was needed.

**How to apply:**
- Any new consumer of events data must branch on `isClosureTag(tag)` (or the derived `closed` flag on `AgendaEvent`) — closures must never render the raw sentinel, must not show reservation CTAs, and must be excluded from schema.org ld+json.
- `useAgendaEventsData` blanks the tag and sets `closed: true` at the source; the admin `toDraft()` strips the sentinel and re-injects it on submit.
- Known accepted edge: typing `__fermeture__` manually in the admin tag field creates a closure.
