import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";
import { SESSION_COOKIE, parseSession } from "../lib/auth";

export interface AuthedRequest extends Request {
  adminId?: number;
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = parseSession(req.signedCookies?.[SESSION_COOKIE]);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, session.id));

  // Reject sessions whose embedded version no longer matches the stored one;
  // this is what logs out other devices after a credential rotation.
  if (!user || user.sessionVersion !== session.version) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  req.adminId = user.id;
  next();
}
