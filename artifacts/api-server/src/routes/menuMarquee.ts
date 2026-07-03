import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, menuMarqueeTable } from "@workspace/db";
import {
  GetMenuMarqueeResponse,
  UpdateMenuMarqueeBody,
  UpdateMenuMarqueeResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { DEFAULT_MENU_MARQUEE, MENU_MARQUEE_ID } from "../lib/menuMarquee";

const router: IRouter = Router();

// Public: returns the stored suppliers band, or the defaults if it has never
// been edited, so the public page always has valid content.
router.get("/menu-marquee", async (_req, res): Promise<void> => {
  const [row] = await db
    .select()
    .from(menuMarqueeTable)
    .where(eq(menuMarqueeTable.id, MENU_MARQUEE_ID));
  const data = row?.data ?? DEFAULT_MENU_MARQUEE;
  res.json(GetMenuMarqueeResponse.parse(data));
});

// Admin: replaces the whole band in one shot (upsert on the singleton row).
router.put("/menu-marquee", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateMenuMarqueeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(menuMarqueeTable)
    .values({ id: MENU_MARQUEE_ID, data: parsed.data })
    .onConflictDoUpdate({
      target: menuMarqueeTable.id,
      set: { data: parsed.data },
    })
    .returning();
  res.json(UpdateMenuMarqueeResponse.parse(row.data));
});

export default router;
