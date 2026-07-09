---
name: Decorative photo slot consolidation
description: All decorative page photos live in site_photos slots edited from one Photos tab; index-based slots force fixed list cardinality.
---

# Decorative photos → single Photos tab (site_photos slots)

Decorative images for the Groupes and À-propos pages are NOT edited inline in
their own content editors. They live in `site_photos` rows and are edited only
from the admin "Photos" tab. Public pages resolve them via `usePhotos()` with a
code fallback: `photos["slot"]?.url || imgSrc(oldBakedValue)`. Menu *dish* photos
are the exception — they stay in the Menu tab.

**The rule:** any page section whose photo is index-mapped to a slot
(`grp-formule-${i+1}`, `grp-occasion-${i+1}`, etc.) MUST have fixed list
cardinality in its editor. The Groupes editor therefore edits the existing
formules/occasions in place only — no add/remove buttons.

**Why:** slots are matched to array items by position. If an admin could
add/remove/reorder items, the images would drift onto the wrong item, and items
beyond the defined slot count would have no image and no way to set one (the
inline ImageField is gone). Fixed cardinality keeps position↔slot stable.

**How to apply:** when adding a new decorative slot, keep FOUR places in sync or
the CMS shows an un-editable/missing photo:
1. frontend `PHOTO_FALLBACK` (App.tsx) — default url + alt,
2. admin `PHOTO_GROUPS` (admin/lib.ts) — so the slot shows in the Photos tab,
3. `ensureGroupAboutPhotos.ts` idempotent backfill (mirrors ensureGalleryPhotos,
   invoked in index.ts after a successful snapshot import) — seeds the DB row so
   PhotoCard is enabled (it disables save when the slot has no DB row),
4. `seed.ts` defaults + `contentSnapshot.json` sitePhotos — for fresh/empty DBs.
The public page must also read the slot and keep its baked fallback in sync.

**Changing a slot's default photo later:** insert-missing seeding never touches
existing rows, so already-seeded DBs (incl. prod) keep the old image. Use the
`DEFAULT_SWAPS` list in `ensureGroupAboutPhotos.ts`: it updates a slot's row only
when the URL still equals the OLD default — idempotent, never clobbers CMS edits.
Page-header bg slots now exist for À propos (`apropos-hero`), Événements
(`evenements-hero`) and Contact (`contact-hero`).
