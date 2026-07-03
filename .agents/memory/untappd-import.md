---
name: Untappd menu import
description: How Chez Florent pulls its live drinks/beer menu from Untappd into the CMS, how it coexists with the fixed printed menu, and why the importer is built the way it is.
---

# Untappd → CMS menu import

The site has BOTH a fixed printed menu (kitchen + desserts/cafés/alcools/extras,
owned by `seed.ts` / `menuSeed.ts`) AND a live drinks/beer menu pulled from
Untappd. They coexist: the importer only ever touches non-fixed categories.

## Reading the menu without auth
- Untappd "for Business" menu data is readable WITHOUT any token from the PUBLIC theme JS bundle: `https://business.untappd.com/locations/{LOCATION}/themes/{THEME}/js`. It embeds the fully-rendered menu HTML (escaped). Unescape `\/ \" \n \t \$` then parse the HTML.
- The direct REST API (`/api/v1/menus/{theme}`) returns 401/403 for every token auth scheme tried. Do NOT keep retrying the API for read — use the theme JS.
- Item fields live in spans: name = `<span id=...>` inside `<h4 class="item">` (the `item-tap-number` span is a different one, skip it); `item-brewery`, `item-category`, `item-brewery-location`, `item-abv`; prices in `container-group` → strip the `container-size` span, the remaining number is the price.

**Why:** the API auth wall cost real time; the public theme JS is the reliable read path.

## Importer safety model (`scripts/importUntappdMenu.ts`)
- This is a ONE-WAY pull (Untappd → CMS). Never write back to Untappd.
- `PROTECTED_SLUGS` is the allowlist of FIXED printed-menu categories that the importer must NEVER touch. It MUST stay in sync with `MENU_SLUGS` in the frontend `App.tsx` (currently: encas, salades, pizzas, hoagies, desserts, cafes-thes, alcools, extras). EVERY other category is considered importer-owned (Untappd drinks) and is deleted+reinserted wholesale each run (`notInArray(slug, PROTECTED_SLUGS)`).
  - **Why this model:** makes reruns idempotent even when Untappd renames a section (no orphan categories), and the fixed menu can never be wiped even if an Untappd heading slugifies to a fixed slug. Parsed slugs are also de-duped against the protected set so a collision gets a `-2` suffix instead of a unique-constraint crash.
  - **Danger if out of sync:** if `PROTECTED_SLUGS` ever drifts from the real fixed slugs (e.g. left as an old `["partager","plats"]`), a run DELETES every real fixed category. Always reconcile it with `MENU_SLUGS` before running.
- Integrity floors (`MIN_CATEGORIES` / `MIN_ITEMS`) abort BEFORE any deletion if the parse looks truncated, so a markup change can't silently commit a half-empty menu. Live menu is ~18 categories / ~168 items.
- Running the importer OVERWRITES any CMS edits to drink categories. Only run it for an intentional re-pull. Bidirectional sync (push) is a deferred future step.

**How to apply:** if drinks render wrong or stale, re-run `pnpm --filter @workspace/api-server run import:untappd`; the frontend is fully data-driven so no code change is needed for menu content.

## Fixed menu vs bar display split (frontend)
- `FOOD_SLUGS` (encas, salades, pizzas, hoagies) drives the HOMEPAGE `Menu` component — homepage shows kitchen food only.
- `MENU_SLUGS` (all 8 fixed slugs) drives the MENU PAGE split: everything in `MENU_SLUGS` renders as ONE unified tab bar ("La cuisine", with the sticky cross-fade photo panel); every category NOT in `MENU_SLUGS` (the imported Untappd drinks) renders in a separate photo-less "Le bar" board (`showPhoto={false}`, two-column grid).
  - **Why:** user wanted all fixed categories (incl. desserts/cafés/alcools/extras) in the same tab bar as the kitchen items, with the live beer list kept as its own section.
- Imported drinks have empty taglines and no images, so the board renders the tagline block only when truthy and falls back to a "Chez Florent" placeholder where a photo would be.
- **Gotcha:** the menu page mounts TWO `MenuBoard` instances. Their Framer Motion active-tab underline MUST use a per-board `layoutId` (parametrized by `boardId`, e.g. `menu-page-tab-underline-${boardId}`). A shared layoutId makes the underline animate/jump between the two boards.
- **Slug collision note:** the fixed coffee-liqueur category is slug `alcools`; Untappd also imports a spirits category slug `alcool` (singular). They are distinct — do not conflate.
- `MenuBoard` and the homepage `Menu` index `categories[0]`; both are guarded (`categories[0]?.id ?? ""` + early `return null` when no category) so an empty filter result can't crash.
