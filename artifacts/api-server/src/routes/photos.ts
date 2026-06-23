import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, sitePhotosTable } from "@workspace/db";
import {
  ListPhotosResponse,
  UpdatePhotoParams,
  UpdatePhotoBody,
  UpdatePhotoResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/photos", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(sitePhotosTable)
    .orderBy(sitePhotosTable.id);
  res.json(ListPhotosResponse.parse(rows));
});

router.patch(
  "/photos/:slot",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = UpdatePhotoParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const parsed = UpdatePhotoBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [row] = await db
      .update(sitePhotosTable)
      .set(parsed.data)
      .where(eq(sitePhotosTable.slot, params.data.slot))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Photo slot not found" });
      return;
    }
    res.json(UpdatePhotoResponse.parse(row));
  },
);

export default router;
