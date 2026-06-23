---
name: Untappd menu import
description: How Chez Florent pulls its drinks menu from Untappd into the CMS, and why the importer is built the way it is.
---

# Untappd → CMS menu import

## Reading the menu without auth
- Untappd "for Business" menu data is readable WITHOUT any token from the PUBLIC theme JS bundle: `https://business.untappd.com/locations/{LOCATION}/themes/{THEME}/js`. It embeds the fully-rendered menu HTML (escaped). Unescape `\/ \" \n \t \$` then parse the HTML.
- The direct REST API (`/api/v1/menus/{theme}`) returns 401/403 for every token auth scheme tried. Do NOT keep retrying the API for read — use the theme JS.
- Item fields live in spans: name = `<span id=...>` inside `<h4 class="item">` (the `item-tap-number` span is a different one, skip it); `item-brewery`, `item-category`, `item-brewery-location`, `item-abv`; prices in `container-group` → strip the `container-size` span, the remaining number is the price.

**Why:** the API auth wall cost real time; the public theme JS is the reliable read path.

## Importer safety model (`scripts/importUntappdMenu.ts`)
- This is a ONE-WAY pull (Untappd → CMS). Never write back to Untappd.
- Food categories are an allowlist (`PROTECTED_SLUGS`, e.g. `partager`, `plats`). EVERY other category is considered importer-owned and is deleted+reinserted wholesale each run (`notInArray(slug, PROTECTED_SLUGS)`).
  - **Why this model:** makes reruns idempotent even when Untappd renames a section (no orphan categories), and food can never be wiped even if an Untappd heading slugifies to a food slug. Parsed slugs are also de-duped against the protected set so a collision gets a `-2` suffix instead of a unique-constraint crash.
- Integrity floors (`MIN_CATEGORIES` / `MIN_ITEMS`) abort BEFORE any deletion if the parse looks truncated, so a markup change can't silently commit a half-empty menu.
- Running the importer OVERWRITES any CMS edits to drink categories. Only run it for an intentional re-pull. Bidirectional sync (push) is a deferred future step — the write token would be stored as a secret only when building that.

**How to apply:** if drinks render wrong or stale, re-run `pnpm --filter @workspace/api-server run import:untappd`; the frontend MenuPage is fully data-driven so no code change is needed for menu content.

## Food vs drinks display split (frontend)
- The same `FOOD_SLUGS` allowlist (mirrors the importer's `PROTECTED_SLUGS`) drives the UI split: homepage `Menu` shows FOOD only; MenuPage shows two labeled sections — "La cuisine" (food, with the sticky cross-fade photo panel) and "Le bar" (drinks, photo-less `showPhoto={false}`, two-column item grid).
- Imported drinks have empty taglines and no images, so the board renders the tagline block only when truthy and falls back to a "Chez Florent" placeholder where a photo would be.
- **Gotcha:** the menu page mounts TWO `MenuBoard` instances. Their Framer Motion active-tab underline MUST use a per-board `layoutId` (parametrized by `boardId`, e.g. `menu-page-tab-underline-${boardId}`). A shared layoutId makes the underline animate/jump between the two boards.
- `MenuBoard` and the homepage `Menu` index `categories[0]`; both are guarded (`categories[0]?.id ?? ""` + early `return null` when no category) so an empty filter result can't crash.
