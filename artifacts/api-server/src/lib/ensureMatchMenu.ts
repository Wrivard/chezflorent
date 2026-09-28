import { db, menuCategoriesTable, menuItemsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";
import { MENU_SEED } from "../scripts/menuSeed";

/** Backfill only a missing category. Never overwrite or restore CMS edits. */
export async function ensureMatchMenu(): Promise<void> {
  const seed = MENU_SEED.find((category) => category.slug === "soir-de-match");
  if (!seed) throw new Error("Soir de match menu seed is missing");

  try {
    await db.transaction(async (tx) => {
      const [{ maxSort }] = await tx
        .select({ maxSort: sql<number>`coalesce(max(${menuCategoriesTable.sortOrder}), -1)` })
        .from(menuCategoriesTable);
      const [category] = await tx
        .insert(menuCategoriesTable)
        .values({
          slug: seed.slug,
          label: seed.label,
          tagline: seed.tagline,
          sortOrder: (maxSort ?? -1) + 1,
        })
        .onConflictDoNothing({ target: menuCategoriesTable.slug })
        .returning();

      if (!category) return;
      await tx.insert(menuItemsTable).values(
        seed.items.map((item, index) => ({
          categoryId: category.id,
          name: item.name,
          price: item.price,
          description: item.description,
          image: item.image,
          sortOrder: index,
        })),
      );
      logger.info("Soir de match menu category initialized");
    });
  } catch (err) {
    logger.error({ err }, "Failed to initialize Soir de match menu");
  }
}