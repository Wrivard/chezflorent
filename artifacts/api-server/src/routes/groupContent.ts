import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, groupContentTable } from "@workspace/db";
import {
  GetGroupContentResponse,
  UpdateGroupContentBody,
  UpdateGroupContentResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { DEFAULT_GROUP_CONTENT, GROUP_CONTENT_ID } from "../lib/groupContent";

const router: IRouter = Router();

// Public: returns the stored singleton document, or the defaults if the page
// has never been edited/seeded, so the public page always has valid content.
router.get("/group-content", async (_req, res): Promise<void> => {
  const [row] = await db
    .select()
    .from(groupContentTable)
    .where(eq(groupContentTable.id, GROUP_CONTENT_ID));
  const data = row?.data ?? DEFAULT_GROUP_CONTENT;
  res.json(GetGroupContentResponse.parse(data));
});

// Admin: replaces the whole document in one shot (upsert on the singleton row).
router.put("/group-content", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateGroupContentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(groupContentTable)
    .values({ id: GROUP_CONTENT_ID, data: parsed.data })
    .onConflictDoUpdate({
      target: groupContentTable.id,
      set: { data: parsed.data },
    })
    .returning();
  res.json(UpdateGroupContentResponse.parse(row.data));
});

export default router;
