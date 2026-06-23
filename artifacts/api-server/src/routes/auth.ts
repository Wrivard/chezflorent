import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";
import {
  LoginBody,
  LoginResponse,
  GetCurrentAdminResponse,
  ChangePasswordBody,
} from "@workspace/api-zod";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyPassword,
  hashPassword,
} from "../lib/auth";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, email));

  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    req.log.warn({ email }, "Failed admin login attempt");
    res.status(401).json({ error: "Courriel ou mot de passe invalide." });
    return;
  }

  res.cookie(SESSION_COOKIE, String(user.id), sessionCookieOptions());
  res.json(LoginResponse.parse({ id: user.id, email: user.email }));
});

router.post("/auth/logout", (_req, res): void => {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.sendStatus(204);
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const raw = req.signedCookies?.[SESSION_COOKIE];
  const id = typeof raw === "string" ? parseInt(raw, 10) : NaN;
  if (!raw || Number.isNaN(id)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, id));

  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json(GetCurrentAdminResponse.parse({ id: user.id, email: user.email }));
});

router.post(
  "/auth/change-password",
  requireAuth,
  async (req, res): Promise<void> => {
    const parsed = ChangePasswordBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const adminId = (req as { adminId?: number }).adminId;
    const [user] = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.id, adminId ?? -1));

    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!verifyPassword(parsed.data.currentPassword, user.passwordHash)) {
      req.log.warn(
        { adminId: user.id },
        "Failed admin password change (wrong current password)",
      );
      res.status(401).json({ error: "Mot de passe actuel invalide." });
      return;
    }

    await db
      .update(adminUsersTable)
      .set({ passwordHash: hashPassword(parsed.data.newPassword) })
      .where(eq(adminUsersTable.id, user.id));

    res.sendStatus(204);
  },
);

export default router;
