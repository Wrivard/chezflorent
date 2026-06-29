---
name: Singleton-document CMS pages
description: How bespoke one-off pages (e.g. Groupes) are made CMS-editable in Chez Florent without overloading the schema.
---

# Singleton-document CMS pages

For a bespoke, single-instance page whose content does not warrant many
relational tables (e.g. the "Groupes" page), store the whole editable document
as ONE jsonb row keyed by a stable slug id, exposed as a public `GET` + an
auth-gated `PUT` that validates with the generated Zod schema and upserts the
singleton. The admin gets one tab editing a single whole-document draft with a
single save; the public page reads it via the generated query hook.

**Why:** Avoids a table-per-section explosion and keeps the owner's editing flow
to one form + one save. Chosen over the per-collection CRUD pattern used for
menu/events because the content is fixed-shape and one-of-a-kind.

**How to apply:**
- The public page must define a `DEFAULT_*` constant that EXACTLY mirrors the
  server-side defaults/seed and use it as the fallback (`data ?? DEFAULT`).
  These two copies are duplicated by hand — any change to the document shape or
  default text must be made in BOTH the server lib and the public page, or the
  pre-edit page silently drifts from the seeded row.
- Keep intentionally-excluded sub-content (e.g. FAQ) hardcoded; don't add it to
  the document just because it's nearby.
- Derive ordinal display (step numbers "01/02") from array order, not a stored
  field, so add/remove "just works" without renumbering.
