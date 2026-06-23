import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, hoursTable } from "@workspace/db";
import {
  ListHoursResponse,
  UpdateHoursParams,
  UpdateHoursBody,
  UpdateHoursResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/hours", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(hoursTable)
    .orderBy(hoursTable.dayOfWeek);
  res.json(ListHoursResponse.parse(rows));
});

router.patch(
  "/hours/:dayOfWeek",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = UpdateHoursParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const parsed = UpdateHoursBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [row] = await db
      .update(hoursTable)
      .set(parsed.data)
      .where(eq(hoursTable.dayOfWeek, params.data.dayOfWeek))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Day not found" });
      return;
    }
    res.json(UpdateHoursResponse.parse(row));
  },
);

export default router;
