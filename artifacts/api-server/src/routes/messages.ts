import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, messagesTable } from "@workspace/db";
import {
  ListMessagesResponse,
  CreateMessageBody,
  UpdateMessageParams,
  UpdateMessageBody,
  UpdateMessageResponse,
  DeleteMessageParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

type MessageRow = typeof messagesTable.$inferSelect;

function serialize(row: MessageRow) {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

router.get("/messages", requireAuth, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(messagesTable)
    .orderBy(desc(messagesTable.createdAt), desc(messagesTable.id));
  res.json(ListMessagesResponse.parse(rows.map(serialize)));
});

router.post("/messages", async (req, res): Promise<void> => {
  const parsed = CreateMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (parsed.data.kind === "fournisseur" && !parsed.data.company?.trim()) {
    res
      .status(400)
      .json({ error: "Le nom de l'entreprise est requis pour un fournisseur." });
    return;
  }
  const [row] = await db.insert(messagesTable).values(parsed.data).returning();
  res.status(201).json(UpdateMessageResponse.parse(serialize(row)));
});

router.patch("/messages/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(messagesTable)
    .set(parsed.data)
    .where(eq(messagesTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Message not found" });
    return;
  }
  res.json(UpdateMessageResponse.parse(serialize(row)));
});

router.delete("/messages/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(messagesTable)
    .where(eq(messagesTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Message not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
