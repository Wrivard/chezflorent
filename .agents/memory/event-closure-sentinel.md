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
- Hours displays also honor closures via `useClosureMap`/`useClosureNotices` (App.tsx): the open/closed navbar pill and «today's hours» treat a closure day as closed («Fermé exceptionnellement», next-open search skips closure dates), and hours sections (marquee, home Contact, ContactPage) show orange notices for closures within ~21 days. Weekly-schedule hooks (`useHoursItems`/`useHoursRows`/`useOpenDaysLabel`) stay generic on purpose.
- Accepted limit: an open public tab picks up new closures only after remount/navigation (no polling), and day-based notices roll over on next re-render, not at midnight.
