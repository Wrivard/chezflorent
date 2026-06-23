import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import type { CookieOptions } from "express";

export const SESSION_COOKIE = "cf_session";

/**
 * Hash a password using Node's built-in scrypt (no native dependency, works
 * on Replit and Vercel serverless alike). Output format: `salt:hash` (hex).
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const expected = Buffer.from(key, "hex");
  const derived = scryptSync(password, salt, 64);
  return (
    expected.length === derived.length && timingSafeEqual(expected, derived)
  );
}

/**
 * Secret used to sign the session cookie. In production this MUST be provided
 * via the SESSION_SECRET environment variable; the dev fallback only keeps the
 * local environment working without extra setup.
 */
export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  // The insecure constant is only acceptable for local development. In
  // production a missing secret would let anyone forge a signed session
  // cookie, so we fail fast instead.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET environment variable is required in production.",
    );
  }
  return "dev-insecure-chez-florent-session-secret";
}

export function sessionCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    signed: true,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  };
}
