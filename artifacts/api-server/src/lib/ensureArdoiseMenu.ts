import { db, menuCategoriesTable, menuItemsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "./logger";
import { MENU_SEED } from "../scripts/menuSeed";

const ARDOISE_SLUG = "ardoise";

/**
 * Previous versions of the ardoise seed (name/price/description only). If the
 * items currently in the DB exactly match one of these legacy versions, the
 * client never edited them in the CMS, so we can safely replace them with the
 * current MENU_SEED ardoise. Any CMS edit breaks the match and we keep it.
 */
const LEGACY_ARDOISE_VERSIONS: { name: string; price: string; description: string }[][] = [
  [
    { name: "Trempette de poireaux bacon", price: "16,95 $", description: "Servi avec pain plat gratiné." },
    { name: "Grilled cheese sur baguette", price: "5,95 $ / 11,95 $", description: "Provolone, mozzarella, fromage jaune, beurre à l'ail." },
    { name: "Focaccia", price: "19,95 $", description: "Focaccia maison, miel, huile épicée, huile d'olive (Esporao), mélange de fromages ricotta et chèvre, prosciutto, tomates, glaze balsamique, poivre moulu, basilic frais." },
    { name: "Bufarella ananananas", price: "17,95 $", description: "Boule de fromage bufarella (Fromagerie Fuoco) accompagnée d'une compote d'ananas, mayonnaise chili épicée maison, crumble d'amandes, de sucre et de coconut, zeste de lime. Servi avec pains naan grillés." },
    { name: "Le « Choux-Choux »", price: "21,95 $", description: "Pain ciabatta, dinde fumée, salade de choux rouge crémeuse, gelée de betteraves jaunes, roquette." },
    { name: "« Messieurs patates »", price: "9,95 $", description: "Bouchées de pommes de terre frits, parmesan, huile de truffe, beurre à l'ail confit maison, poivre moulu, sirop d'érable. Servi avec sauce marinara." },
    { name: "Pizza « Bimi »", price: "25,95 $", description: "Sauce au fromage (Île-aux-Grues, cheddar vieilli 2 ans), broccolini, jambon (Charcuterie Porc Épique), coulis de moutarde et miel, huile d'olive." },
    { name: "Assiette de charcuterie", price: "35,95 $", description: "Calabrese, prosciutto, saucissons secs, olives méli-mélo, fromages du moment, pickle d'onions rouges, petits cornichons. Servi avec pain et croutons." },
    { name: "« Philly T »", price: "25,95 $", description: "Pain baguette, fromages (jaune, mozzarella, provolone), poivrons rouges, onions blancs, brisket (Les Cowboys du BBQ), mayonnaise épicée. Servi avec salade de pâte maison et cup de sauce BBQ." },
  ],
];

function itemsMatchLegacy(
  items: { name: string; price: string; description: string | null }[],
): boolean {
  return LEGACY_ARDOISE_VERSIONS.some(
    (legacy) =>
      legacy.length === items.length &&
      legacy.every(
        (l, i) =>
          l.name === items[i].name &&
          l.price === items[i].price &&
          l.description === (items[i].description ?? ""),
      ),
  );
}

/**
 * Ensure the "ardoise" (chef's rotating specials) menu category and its items
 * exist in whatever database this instance is connected to. The ardoise used to
 * be a linked PDF; it is now a real, CMS-editable menu tab.
 *
 * Unlike the content-snapshot import (which only seeds the menu into a fully
 * empty table), this backfills the single ardoise category into databases that
 * were already seeded with the other menu categories, so the client sees the
 * new tab and can edit it from the CMS.
 *
 * Idempotent: seeds only when the category is entirely missing, so it never
 * re-adds items the client deleted nor overwrites CMS edits. `onConflictDoNothing`
 * on the unique slug keeps concurrent boots from inserting duplicates.
 */
export async function ensureArdoiseMenu(): Promise<void> {
  try {
    const seed = MENU_SEED.find((c) => c.slug === ARDOISE_SLUG);
    if (!seed) {
      logger.error("Ardoise seed data missing from MENU_SEED");
      return;
    }

    const [existing] = await db
      .select({ id: menuCategoriesTable.id })
      .from(menuCategoriesTable)
      .where(eq(menuCategoriesTable.slug, ARDOISE_SLUG));

    if (existing) {
      // Category already there: migrate to the latest seed only if the
      // current items are an untouched legacy seed (no CMS edits).
      const currentItems = await db
        .select({
          name: menuItemsTable.name,
          price: menuItemsTable.price,
          description: menuItemsTable.description,
        })
        .from(menuItemsTable)
        .where(eq(menuItemsTable.categoryId, existing.id))
        .orderBy(menuItemsTable.sortOrder);

      if (!itemsMatchLegacy(currentItems)) return;

      await db.transaction(async (tx) => {
        await tx.delete(menuItemsTable).where(eq(menuItemsTable.categoryId, existing.id));
        await tx.insert(menuItemsTable).values(
          seed.items.map((item, index) => ({
            categoryId: existing.id,
            name: item.name,
            price: item.price,
            description: item.description,
            image: item.image,
            sortOrder: index,
          })),
        );
      });
      logger.info({ count: seed.items.length }, "Ardoise menu migrated to latest seed");
      return;
    }

    const [{ maxSort }] = await db
      .select({
        maxSort: sql<number>`coalesce(max(${menuCategoriesTable.sortOrder}), -1)`,
      })
      .from(menuCategoriesTable);

    const [inserted] = await db
      .insert(menuCategoriesTable)
      .values({
        slug: seed.slug,
        label: seed.label,
        tagline: seed.tagline,
        sortOrder: (maxSort ?? -1) + 1,
      })
      .onConflictDoNothing({ target: menuCategoriesTable.slug })
      .returning();

    // Lost a race with a concurrent boot that inserted the category first.
    if (!inserted) return;

    await db.insert(menuItemsTable).values(
      seed.items.map((item, index) => ({
        categoryId: inserted.id,
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image,
        sortOrder: index,
      })),
    );
    logger.info({ count: seed.items.length }, "Ardoise menu ensured");
  } catch (err) {
    logger.error({ err }, "Failed to ensure ardoise menu");
  }
}
