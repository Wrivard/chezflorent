import { db, menuCategoriesTable, menuItemsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "./logger";
import { MENU_SEED } from "../scripts/menuSeed";

const ARDOISE_SLUG = "ardoise";

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
    if (existing) return;

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
