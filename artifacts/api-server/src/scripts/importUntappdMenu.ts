import { db, menuCategoriesTable, menuItemsTable } from "@workspace/db";
import { notInArray } from "drizzle-orm";
import { logger } from "../lib/logger";

/**
 * One-way import of the Untappd "for Business" embed menu into the site CMS.
 *
 * This reads the PUBLIC embed theme bundle (the same data the embed widget
 * renders client-side) and copies it into the menu_categories / menu_items
 * tables so the drinks render in the site's own design and stay editable in
 * the CMS. It is READ-ONLY against Untappd — nothing is ever pushed back.
 *
 * Re-running is safe: it replaces the previously imported drink categories
 * (and the legacy "bar" placeholder) while leaving food categories untouched.
 *
 * NOTE: this overwrites CMS edits to the drink categories, so only run it for
 * an intentional re-pull from Untappd (bidirectional sync is a future step).
 */

const LOCATION_ID = 48727;
const THEME_ID = 174441;
const THEME_URL = `https://business.untappd.com/locations/${LOCATION_ID}/themes/${THEME_ID}/js`;

// Fixed printed-menu categories owned by the site (seed.ts / menuSeed.ts), NOT
// by Untappd. They are never touched by this importer. Every OTHER category is
// considered an imported Untappd drink and is replaced on each run — this keeps
// the import idempotent even when Untappd renames sections (no orphans) and
// guarantees the fixed menu survives even if an Untappd section happened to
// slugify to one of these names. Keep this in sync with FIXED_MENU_SLUGS in the
// frontend (App.tsx) — the full set of site-owned fixed categories.
const PROTECTED_SLUGS = [
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

async function main(): Promise<void> {
  logger.info({ url: THEME_URL }, "Fetching Untappd embed menu (read-only)");
  const res = await fetch(THEME_URL);
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

  await db.transaction(async (tx) => {
    // Replace EVERY non-food category with the freshly parsed drinks. This is
    // idempotent across renames (no orphan categories left behind) and can never
    // touch the protected food categories. menu_items cascade-delete with theirs.
    await tx
      .delete(menuCategoriesTable)
      .where(notInArray(menuCategoriesTable.slug, PROTECTED_SLUGS));

    // Place drinks after the surviving (food) categories.
    const remaining = await tx.select().from(menuCategoriesTable);
    const base = remaining.reduce((max, c) => Math.max(max, c.sortOrder), -1) + 1;

    for (let c = 0; c < cats.length; c++) {
      const cat = cats[c];
      const [inserted] = await tx
        .insert(menuCategoriesTable)
        .values({ slug: cat.slug, label: cat.label, tagline: "", sortOrder: base + c })
        .returning();
      await tx.insert(menuItemsTable).values(
        cat.items.map((item, index) => ({
          categoryId: inserted.id,
          name: item.name,
          price: item.price,
          description: item.description,
          sortOrder: index,
        })),
      );
    }
  });

  logger.info(
    { categories: cats.length, items: totalItems },
    "Untappd menu imported into CMS",
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error({ err }, "Untappd import failed");
    process.exit(1);
  });
