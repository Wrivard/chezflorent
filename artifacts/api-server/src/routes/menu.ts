import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
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
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { autoSyncUntappdMenu, syncUntappdMenu } from "../lib/untappdSync";

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
