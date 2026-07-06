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
- `PROTECTED_SLUGS` is the allowlist of FIXED printed-menu categories that the importer must NEVER touch. It MUST stay in sync with `FIXED_MENU_SLUGS` in the frontend `App.tsx` (currently: ardoise, encas, salades, pizzas, hoagies, desserts, cafes-thes, alcools, extras). EVERY other category is considered importer-owned (Untappd drinks) and is deleted+reinserted wholesale each run (`notInArray(slug, PROTECTED_SLUGS)`).
  - **Why this model:** makes reruns idempotent even when Untappd renames a section (no orphan categories), and the fixed menu can never be wiped even if an Untappd heading slugifies to a fixed slug. Parsed slugs are also de-duped against the protected set so a collision gets a `-2` suffix instead of a unique-constraint crash.
  - **Danger if out of sync:** if `PROTECTED_SLUGS` ever drifts from the real fixed slugs (e.g. left as an old `["partager","plats"]`), a run DELETES every real fixed category. Always reconcile it with `FIXED_MENU_SLUGS` before running.
- Integrity floors (`MIN_CATEGORIES` / `MIN_ITEMS`) abort BEFORE any deletion if the parse looks truncated, so a markup change can't silently commit a half-empty menu. Live menu is ~18 categories / ~168 items.
- Running the importer OVERWRITES any CMS edits to drink categories. Only run it for an intentional re-pull. Bidirectional sync (push) is a deferred future step.

**How to apply:** if drinks render wrong or stale, re-run `pnpm --filter @workspace/api-server run import:untappd`; the frontend is fully data-driven so no code change is needed for menu content.

## Fixed menu vs bar display split (frontend)
- Two distinct frontend constants (do not conflate): `FIXED_MENU_SLUGS` = all site-owned fixed categories (mirrors importer `PROTECTED_SLUGS`); `MENU_SLUGS` = the subset actually SHOWN in the main "La cuisine" tab bar.
- **`ardoise` is a real CMS-editable menu category, no longer a PDF.** It is in `FIXED_MENU_SLUGS` + `PROTECTED_SLUGS` + `MENU_SLUGS` (listed FIRST so it is the default tab) and seeded in `menuSeed.ts`. **La cuisine TAB ORDER is now driven by `MENU_SLUGS` order** (`MenuPage` maps `MENU_SLUGS`→categories, not by DB `sortOrder`) — to reorder/insert a cuisine tab, edit `MENU_SLUGS`, the DB `sortOrder` is irrelevant for that board. Already-populated DBs (dev+prod) get ardoise via the idempotent `ensureArdoiseMenu()` startup seeder (mirrors `ensureGalleryPhotos`: inserts the category+items only when the slug is entirely missing, gated on `importContentSnapshot` `ready`).
- `FOOD_SLUGS` (encas, salades, pizzas, hoagies) drives the HOMEPAGE `Menu` component — homepage shows kitchen food only.
- MENU PAGE split: `menu = categories in MENU_SLUGS` renders as ONE unified tab bar ("La cuisine", sticky cross-fade photo panel); `bar = categories NOT in FIXED_MENU_SLUGS` (imported Untappd drinks) renders in a separate photo-less "Le bar" board (`showPhoto={false}`, two-column grid).
  - **Why:** user wanted the fixed categories in the same tab bar as the kitchen items, with the live beer list kept as its own section.
  - **`alcools` is hidden from the main menu:** it is in `FIXED_MENU_SLUGS` but NOT in `MENU_SLUGS`, so it shows in NEITHER board (removed from La cuisine per user request, and excluded from Le bar because Le bar is Untappd-only). It still lives in the DB, is protected from import deletion, and stays editable in the admin. The bar filter keys off `FIXED_MENU_SLUGS` (not `MENU_SLUGS`) precisely so this hidden-but-fixed category doesn't leak into Le bar.
- Imported drinks have empty taglines and no images, so the board renders the tagline block only when truthy and falls back to a "Chez Florent" placeholder where a photo would be.
- **Gotcha:** the menu page mounts TWO `MenuBoard` instances. Their Framer Motion active-tab underline MUST use a per-board `layoutId` (parametrized by `boardId`, e.g. `menu-page-tab-underline-${boardId}`). A shared layoutId makes the underline animate/jump between the two boards.
- **Slug collision note:** the fixed coffee-liqueur category is slug `alcools`; Untappd also imports a spirits category slug `alcool` (singular). They are distinct — do not conflate.
- `MenuBoard` and the homepage `Menu` index `categories[0]`; both are guarded (`categories[0]?.id ?? ""` + early `return null` when no category) so an empty filter result can't crash.
- **Global heading font override (index.css):** `.site-root :is(h1..h6) { font-family: var(--font-display) !important; }` forces EVERY public-site heading to the Pacifico script. Any `<h#>` you add inside the site inherits Pacifico regardless of a Tailwind `font-*` class (the `!important` wins) — even elements coded as `font-serif`/`font-sans` (e.g. the homepage "On vient ici pour rester" pull-quote is coded `font-serif italic` but actually renders in Pacifico because it is an `<h2>`). To make a heading use another face, add a MORE specific `!important` rule (e.g. `.site-root .menu-item-name { font-family: var(--font-sans) !important; }`) — a plain `font-sans` utility will NOT override it. Menu item names use exactly this `menu-item-name` escape so dish names render in legible Inter, not the hard-to-read script.
- **Pacifico legibility = spacing, not font swap:** Pacifico glyphs collide (dots/ascenders/loops run into neighbouring letters). The owner wants to KEEP the script but be able to read it. Fix is `letter-spacing: 0.04em` + `word-spacing: 0.06em` applied to the same display-font selector (`.site-root :is(h1..h6), .site-root .font-display`), NOT swapping the font. Any new display/heading text inherits this automatically. `.menu-item-name` resets to `letter-spacing:-0.01em; word-spacing:normal` since it is sans, not script.
- **Word-reveal clip-path CUTS OFF script glyphs:** the per-word Framer reveal animates `clipPath` to `inset(0 0 0 0)` (clips exactly to each word's box). Script/italic glyphs (swashes, i-dots, descenders, the last italic letter's overhang) overflow that box and get sliced — user reported "text cutting" on the "On vient ici pour rester" quote. Fix = give the RESTING clip negative insets so it clips OUTSIDE the glyphs: `inset(-0.2em -0.5em -0.6em -0.3em)` (top/right/bottom/left). Framer interpolates the reveal side from `100%`→negative fine (mixed %/em is OK, matches the existing ardoise-title variant). Applies to every word-by-word title/quote reveal: App.tsx home pull-quote, AboutPage pull-quote, GroupReservationPage `AnimatedTitle` + hero title. Any NEW word-reveal must use negative insets, never `inset(0 0 0 0)`.
