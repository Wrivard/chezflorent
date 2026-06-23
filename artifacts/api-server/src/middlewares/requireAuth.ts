import type { Request, Response, NextFunction } from "express";
import { SESSION_COOKIE } from "../lib/auth";

export interface AuthedRequest extends Request {
  adminId?: number;
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): void {
  const raw = req.signedCookies?.[SESSION_COOKIE];
  const id = typeof raw === "string" ? parseInt(raw, 10) : NaN;
  if (!raw || Number.isNaN(id)) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  req.adminId = id;
  next();
}
