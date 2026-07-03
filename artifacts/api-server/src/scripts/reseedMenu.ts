import { db, menuCategoriesTable, menuItemsTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { MENU_SEED } from "./menuSeed";

// One-off script: wipe the existing menu and re-insert the canonical fixed
// menu (MENU_SEED). Use when the printed menu changes and the CMS-stored data
// needs to be reset to match. Run: pnpm --filter @workspace/api-server reseed:menu
async function reseedMenu(): Promise<void> {
  await db.delete(menuItemsTable);
  await db.delete(menuCategoriesTable);

  for (let c = 0; c < MENU_SEED.length; c++) {
    const category = MENU_SEED[c];
    const [inserted] = await db
      .insert(menuCategoriesTable)
      .values({
        slug: category.slug,
        label: category.label,
        tagline: category.tagline,
        sortOrder: c,
      })
      .returning();
    await db.insert(menuItemsTable).values(
      category.items.map((item, index) => ({
        categoryId: inserted.id,
        name: item.name,
        price: item.price,
        description: item.description,
        image: item.image,
        sortOrder: index,
      })),
    );
  }
  logger.info("Menu reseeded");
}

reseedMenu()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error({ err }, "Menu reseed failed");
    process.exit(1);
  });
