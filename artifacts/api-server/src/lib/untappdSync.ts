import { db, menuCategoriesTable, menuItemsTable } from "@workspace/db";
import { notInArray, sql } from "drizzle-orm";
import { logger } from "./logger";

/**
 * One-way sync of the Untappd "for Business" embed menu into the site CMS.
 *
 * This reads the PUBLIC embed theme bundle (the same data the embed widget
 * renders client-side) and copies it into the menu_categories / menu_items
 * tables so the drinks render in the site's own design. It is READ-ONLY
 * against Untappd — nothing is ever pushed back.
 *
 * Re-running is safe: it replaces the previously imported drink categories
 * while leaving the fixed food categories untouched.
 *
 * Two entry points:
 *  - syncUntappdMenu(): unconditional re-pull (manual script / admin button).
 *  - autoSyncUntappdMenu(): TTL-based refresh called from GET /api/menu so the
 *    site follows the owner's Untappd edits without any manual step. Serverless
 *    friendly (no timers): the first menu request after the TTL pays for the
 *    refresh; concurrent instances are serialized by a Postgres advisory lock.
 */

const LOCATION_ID = 48727;
const THEME_ID = 174441;
const THEME_URL = `https://business.untappd.com/locations/${LOCATION_ID}/themes/${THEME_ID}/js`;

// Fixed printed-menu categories owned by the site (seed.ts / menuSeed.ts), NOT
// by Untappd. They are never touched by the sync. Every OTHER category is
// considered an imported Untappd drink and is replaced on each run — this keeps
// the sync idempotent even when Untappd renames sections (no orphans) and
// guarantees the fixed menu survives even if an Untappd section happened to
// slugify to one of these names. Keep this in sync with FIXED_MENU_SLUGS in the
// frontend (App.tsx) — the full set of site-owned fixed categories.
export const PROTECTED_SLUGS = [
  "ardoise",
  "encas",
  "salades",
  "pizzas",
  "hoagies",
  "desserts",
  "cafes-thes",
  "alcools",
  "extras",
];

// Sanity floors: the live menu is ~18 categories / ~168 items. If a markup
// change breaks the parser we must abort BEFORE deleting anything, rather than
// commit a truncated menu that silently drops drinks.
const MIN_CATEGORIES = 8;
const MIN_ITEMS = 80;

// How stale the imported drinks may get before a public menu request triggers
// a re-pull from Untappd.
const SYNC_TTL_MS = 15 * 60 * 1000;
// After a sync attempt (success OR failure), this instance won't try again for
// this long — prevents an Untappd outage from slowing every menu request.
const RETRY_COOLDOWN_MS = 5 * 60 * 1000;
// Arbitrary constant identifying the cross-instance advisory lock.
const ADVISORY_LOCK_KEY = 727448727;
// Never hang a public request on a slow upstream.
const FETCH_TIMEOUT_MS = 8000;

type ParsedItem = { name: string; price: string; description: string };
type ParsedCategory = { label: string; slug: string; items: ParsedItem[] };

function decode(s: string): string {
  return (s || "")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(s: string): string {
  return decode(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fmtPrice(raw: string): string {
  const m = (raw || "").match(/(\d+(?:[.,]\d{1,2})?)/);
  if (!m) return "";
  const num = parseFloat(m[1].replace(",", "."));
  return Number.isNaN(num) ? "" : num.toFixed(2).replace(".", ",") + " $";
}

function parseItem(block: string): ParsedItem {
  const grab = (re: RegExp): string => {
    const m = block.match(re);
    return m ? decode(m[1]) : "";
  };
  const name =
    grab(/<h4 class="item">[\s\S]*?<span id="[^"]*">([\s\S]*?)<\/span>/) ||
    grab(/<h4 class="item">[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/);
  const brewery = grab(/class="item-brewery">([\s\S]*?)<\/span>/);
  const category = grab(/class="item-category">([\s\S]*?)<\/span>/);
  const location = grab(/class="item-brewery-location">([\s\S]*?)<\/span>/);
  const abv = grab(/class="item-abv">([\s\S]*?)<\/span>/).replace(/\s*ABV\s*$/i, "").trim();

  const groups = [...block.matchAll(/<div class="container-group[^"]*">([\s\S]*?)<\/div>/g)];
  const prices = groups
    .map((g) => {
      const inner = g[1].replace(/<span class="container-size">[\s\S]*?<\/span>/, "");
      return fmtPrice(decode(inner));
    })
    .filter(Boolean);
  const price = [...new Set(prices)].join(" / ");
  const description = [brewery, category, abv, location].filter(Boolean).join(" · ");
  return { name, price, description };
}

function parseMenu(rawJs: string): ParsedCategory[] {
  // The theme bundle embeds the fully-rendered (escaped) menu HTML.
  const html = rawJs
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\\$/g, "$");

  const headings = [...html.matchAll(/<h3 class="h3[^"]*">([\s\S]*?)<\/h3>/g)].map((m) => ({
    name: decode(m[1]),
    index: m.index ?? 0,
  }));
  const itemBlockRe =
    /<div class="item-bg-color menu-item">([\s\S]*?)(?=<div class="item-bg-color menu-item">|<div class="section-(?:items-container|heading)|<h3 class="h3|$)/g;

  const cats: ParsedCategory[] = [];
  // Seed with protected food slugs so an Untappd section can never be assigned
  // a slug that collides with a food category (it gets a "-2" suffix instead).
  const usedSlugs = new Set<string>(PROTECTED_SLUGS);
  for (let i = 0; i < headings.length; i++) {
    const chunk = html.slice(
      headings[i].index,
      i + 1 < headings.length ? headings[i + 1].index : html.length,
    );
    const items = [...chunk.matchAll(itemBlockRe)]
      .map((m) => parseItem(m[1]))
      .filter((it) => it.name);
    if (!items.length) continue;
    let slug = slugify(headings[i].name) || `section-${i}`;
    let n = 2;
    const base = slug;
    while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
    usedSlugs.add(slug);
    cats.push({ label: headings[i].name, slug, items });
  }
  return cats;
}

export type UntappdSyncResult = {
  categories: number;
  items: number;
  /** true when another instance held the lock and did the work instead. */
  skipped: boolean;
};

export async function syncUntappdMenu(): Promise<UntappdSyncResult> {
  logger.info({ url: THEME_URL }, "Fetching Untappd embed menu (read-only)");
  const res = await fetch(THEME_URL, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`Untappd theme fetch failed: ${res.status} ${res.statusText}`);
  }
  const rawJs = await res.text();
  const cats = parseMenu(rawJs);
  const totalItems = cats.reduce((s, c) => s + c.items.length, 0);
  if (cats.length < MIN_CATEGORIES || totalItems < MIN_ITEMS) {
    throw new Error(
      `Parsed only ${cats.length} categories / ${totalItems} items (floors: ${MIN_CATEGORIES}/${MIN_ITEMS}). ` +
        "Untappd markup likely changed — aborting before any deletion to avoid wiping the menu.",
    );
  }
  logger.info({ categories: cats.length, items: totalItems }, "Parsed Untappd menu");

  let skipped = false;
  await db.transaction(async (tx) => {
    // Serialize concurrent syncs (several serverless instances can hit the TTL
    // at once). The lock is transaction-scoped, so it releases automatically.
    const lockResult = await tx.execute(
      sql`select pg_try_advisory_xact_lock(${ADVISORY_LOCK_KEY}) as locked`,
    );
    const locked = lockResult.rows?.[0]?.["locked"] === true;
    if (!locked) {
      skipped = true;
      logger.info("Untappd sync already running elsewhere — skipping");
      return;
    }

    // Replace EVERY non-food category with the freshly parsed drinks. This is
    // idempotent across renames (no orphan categories left behind) and can never
    // touch the protected food categories. menu_items cascade-delete with theirs.
    await tx
      .delete(menuCategoriesTable)
      .where(notInArray(menuCategoriesTable.slug, PROTECTED_SLUGS));

    // Place drinks after the surviving (food) categories.
    const remaining = await tx.select().from(menuCategoriesTable);
    const base = remaining.reduce((max, c) => Math.max(max, c.sortOrder), -1) + 1;

    // Batched inserts (one statement each) keep the transaction short — this
    // can run inline in a serverless request with a tight time budget.
    const insertedCats = await tx
      .insert(menuCategoriesTable)
      .values(
        cats.map((cat, c) => ({
          slug: cat.slug,
          label: cat.label,
          tagline: "",
          sortOrder: base + c,
        })),
      )
      .returning();
    const idBySlug = new Map(insertedCats.map((c) => [c.slug, c.id]));
    await tx.insert(menuItemsTable).values(
      cats.flatMap((cat) =>
        cat.items.map((item, index) => ({
          categoryId: idBySlug.get(cat.slug)!,
          name: item.name,
          price: item.price,
          description: item.description,
          sortOrder: index,
        })),
      ),
    );
  });

  if (!skipped) {
    logger.info(
      { categories: cats.length, items: totalItems },
      "Untappd menu synced into CMS",
    );
  }
  return { categories: cats.length, items: totalItems, skipped };
}

// Per-instance cooldown so a failing upstream can't slow every menu request.
let lastAttemptAt = 0;

/** True when the imported drink categories are older than the sync TTL. */
export function untappdMenuIsStale(
  categories: { slug: string; createdAt: Date | string }[],
): boolean {
  const drinks = categories.filter((c) => !PROTECTED_SLUGS.includes(c.slug));
  if (drinks.length === 0) return true;
  const newest = Math.max(
    ...drinks.map((c) => new Date(c.createdAt).getTime()),
  );
  return Date.now() - newest > SYNC_TTL_MS;
}

/**
 * Refresh the drinks from Untappd when they are stale. Never throws.
 * Returns true when the menu was actually replaced (caller should re-read).
 */
export async function autoSyncUntappdMenu(
  categories: { slug: string; createdAt: Date | string }[],
): Promise<boolean> {
  if (!untappdMenuIsStale(categories)) return false;
  if (Date.now() - lastAttemptAt < RETRY_COOLDOWN_MS) return false;
  lastAttemptAt = Date.now();
  try {
    const result = await syncUntappdMenu();
    return !result.skipped;
  } catch (err) {
    logger.error({ err }, "Automatic Untappd sync failed — serving current menu");
    return false;
  }
}
