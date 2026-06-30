import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, aboutContentTable } from "@workspace/db";
import {
  GetAboutContentResponse,
  UpdateAboutContentBody,
  UpdateAboutContentResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { DEFAULT_ABOUT_CONTENT, ABOUT_CONTENT_ID } from "../lib/aboutContent";

const router: IRouter = Router();

// Public: returns the stored singleton document, or the defaults if the page
// has never been edited/seeded, so the public page always has valid content.
router.get("/about-content", async (_req, res): Promise<void> => {
  const [row] = await db
    .select()
    .from(aboutContentTable)
    .where(eq(aboutContentTable.id, ABOUT_CONTENT_ID));
  const data = row?.data ?? DEFAULT_ABOUT_CONTENT;
  res.json(GetAboutContentResponse.parse(data));
});

// Admin: replaces the whole document in one shot (upsert on the singleton row).
router.put("/about-content", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateAboutContentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(aboutContentTable)
    .values({ id: ABOUT_CONTENT_ID, data: parsed.data })
    .onConflictDoUpdate({
      target: aboutContentTable.id,
      set: { data: parsed.data },
    })
    .returning();
  res.json(UpdateAboutContentResponse.parse(row.data));
});

export default router;
