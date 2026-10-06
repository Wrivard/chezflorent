import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import {
  db,
  menuCategoriesTable,
  menuItemsTable,
  type MenuItemRow,
} from "@workspace/db";
import {
  GetMenuResponse,
  CreateMenuCategoryBody,
  UpdateMenuCategoryParams,
  UpdateMenuCategoryBody,
  UpdateMenuCategoryResponse,
  DeleteMenuCategoryParams,
  CreateMenuItemBody,
  UpdateMenuItemParams,
  UpdateMenuItemBody,
  UpdateMenuItemResponse,
  DeleteMenuItemParams,
  ReorderMenuItemsParams,
  ReorderMenuItemsBody,
  ReorderMenuItemsResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { autoSyncUntappdMenu, syncUntappdMenu, PROTECTED_SLUGS } from "../lib/untappdSync";
import { ensureMatchMenu } from "../lib/ensureMatchMenu";

const router: IRouter = Router();

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}

async function loadMenu() {
  const categories = await db
    .select()
    .from(menuCategoriesTable)
    .orderBy(menuCategoriesTable.sortOrder, menuCategoriesTable.id);
  const items = await db
    .select()
    .from(menuItemsTable)
    .orderBy(menuItemsTable.sortOrder, menuItemsTable.id);

  const byCategory = new Map<number, MenuItemRow[]>();
  for (const item of items) {
    const list = byCategory.get(item.categoryId) ?? [];
    list.push(item);
    byCategory.set(item.categoryId, list);
  }

  return categories.map((category) => ({
    ...category,
    items: byCategory.get(category.id) ?? [],
  }));
}

router.get("/menu", async (_req, res): Promise<void> => {
  let result = await loadMenu();
  // Vercel runs the Express app as a serverless function, so index.ts startup
  // backfills never run there. Add only the missing category on the first menu
  // read; existing CMS edits and items are left untouched.
  if (!result.some((category) => category.slug === "soir-de-match")) {
    await ensureMatchMenu();
    result = await loadMenu();
  }
  // Keep the drinks in step with the owner's Untappd edits: when the imported
  // categories are older than the TTL, re-pull before answering. Never throws;
  // on upstream failure the current menu is served as-is.
  if (await autoSyncUntappdMenu(result)) {
    result = await loadMenu();
  }
  res.json(GetMenuResponse.parse(result));
});

// Manual "refresh the bar now" trigger for the admin CMS.
router.post("/menu/untappd-sync", requireAuth, async (req, res): Promise<void> => {
  try {
    const result = await syncUntappdMenu();
    res.json({ categories: result.categories, items: result.items });
  } catch (err) {
    req.log?.error({ err }, "Manual Untappd sync failed");
    res.status(502).json({
      error:
        "Impossible de récupérer le menu Untappd pour le moment. Réessayez dans quelques minutes.",
    });
  }
});

// --- Categories ---

router.post(
  "/menu/categories",
  requireAuth,
  async (req, res): Promise<void> => {
    const parsed = CreateMenuCategoryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    try {
      const [row] = await db
        .insert(menuCategoriesTable)
        .values(parsed.data)
        .returning();
      res.status(201).json(UpdateMenuCategoryResponse.parse(row));
    } catch (err) {
      if (isUniqueViolation(err)) {
        res.status(400).json({ error: "Cet identifiant de catégorie existe déjà." });
        return;
      }
      throw err;
    }
  },
);

router.patch(
  "/menu/categories/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = UpdateMenuCategoryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const parsed = UpdateMenuCategoryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [matchCategory] = await db
      .select({ slug: menuCategoriesTable.slug })
      .from(menuCategoriesTable)
      .where(eq(menuCategoriesTable.id, params.data.id));
    if (matchCategory?.slug === "soir-de-match" && parsed.data.slug !== undefined && parsed.data.slug !== "soir-de-match") {
      res.status(400).json({ error: "L'identifiant Soir de match est réservé aux liens de l'agenda." });
      return;
    }
    try {
      const [row] = await db
        .update(menuCategoriesTable)
        .set(parsed.data)
        .where(eq(menuCategoriesTable.id, params.data.id))
        .returning();
      if (!row) {
        res.status(404).json({ error: "Category not found" });
        return;
      }
      res.json(UpdateMenuCategoryResponse.parse(row));
    } catch (err) {
      if (isUniqueViolation(err)) {
        res.status(400).json({ error: "Cet identifiant de catégorie existe déjà." });
        return;
      }
      throw err;
    }
  },
);

router.delete(
  "/menu/categories/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = DeleteMenuCategoryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const [matchCategory] = await db
      .select({ slug: menuCategoriesTable.slug })
      .from(menuCategoriesTable)
      .where(eq(menuCategoriesTable.id, params.data.id));
    if (matchCategory?.slug === "soir-de-match") {
      res.status(400).json({ error: "La catégorie Soir de match est utilisée par l'agenda." });
      return;
    }
    const [row] = await db
      .delete(menuCategoriesTable)
      .where(eq(menuCategoriesTable.id, params.data.id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.sendStatus(204);
  },
);

// --- Items ---

router.put("/menu/categories/:id/items/order", requireAuth, async (req, res): Promise<void> => {
  const params = ReorderMenuItemsParams.safeParse(req.params);
  const body = ReorderMenuItemsBody.safeParse(req.body);
  if (!params.success || !Number.isSafeInteger(params.data.id) || !body.success) {
    res.status(400).json({ error: "Ordre des plats invalide." });
    return;
  }
  const { itemIds, expectedItemIds } = body.data;
  if ([itemIds, expectedItemIds].some((ids) =>
    ids.some((id) => !Number.isSafeInteger(id)) || new Set(ids).size !== ids.length
  )) {
    res.status(400).json({ error: "Chaque identifiant de plat doit être un entier unique." });
    return;
  }
  const result = await db.transaction(async (tx) => {
    // Serialize category reorders and block FK inserts until this save commits.
    const [category] = await tx.select().from(menuCategoriesTable)
      .where(eq(menuCategoriesTable.id, params.data.id)).for("update");
    if (!category) return { status: 404, error: "Catégorie introuvable." } as const;
    if (!PROTECTED_SLUGS.includes(category.slug) || category.slug === "alcools") {
      return { status: 403, error: "Cette catégorie n'est pas gérée dans le menu du CMS." } as const;
    }
    const current = await tx.select().from(menuItemsTable)
      .where(eq(menuItemsTable.categoryId, category.id))
      .orderBy(menuItemsTable.sortOrder, menuItemsTable.id).for("update");
    const currentIds = current.map((item) => item.id);
    if (expectedItemIds.length !== currentIds.length ||
      expectedItemIds.some((id, index) => id !== currentIds[index]) ||
      itemIds.length !== currentIds.length ||
      itemIds.some((id) => !currentIds.includes(id))) {
      return { status: 409, error: "La liste des plats a changé. Elle a été actualisée; réessayez." } as const;
    }
    if (itemIds.length > 0) {
      const positions = sql`case ${menuItemsTable.id} ${sql.join(
        itemIds.map((id, index) => sql`when ${id} then ${index}::integer`), sql` `
      )} end`;
      await tx.update(menuItemsTable).set({ sortOrder: positions })
        .where(eq(menuItemsTable.categoryId, category.id));
    }
    const items = await tx.select().from(menuItemsTable)
      .where(eq(menuItemsTable.categoryId, category.id))
      .orderBy(menuItemsTable.sortOrder, menuItemsTable.id);
    return { status: 200, category: { ...category, items } } as const;
  });
  if (result.status !== 200) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.json(ReorderMenuItemsResponse.parse(result.category));
});

router.post("/menu/items", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(menuItemsTable).values(parsed.data).returning();
  res.status(201).json(UpdateMenuItemResponse.parse(row));
});

router.patch(
  "/menu/items/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = UpdateMenuItemParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const parsed = UpdateMenuItemBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [row] = await db
      .update(menuItemsTable)
      .set(parsed.data)
      .where(eq(menuItemsTable.id, params.data.id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    res.json(UpdateMenuItemResponse.parse(row));
  },
);

router.delete(
  "/menu/items/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = DeleteMenuItemParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const [row] = await db
      .delete(menuItemsTable)
      .where(eq(menuItemsTable.id, params.data.id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Item not found" });
      return;
    }
    res.sendStatus(204);
  },
);

export default router;
