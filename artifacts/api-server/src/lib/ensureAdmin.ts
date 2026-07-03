import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";
import { logger } from "./logger";

/**
 * Ensure a bootstrap admin account exists so that logging in works on a freshly
 * deployed environment. Production has its own database (separate from dev) that
 * is only writable from inside the deployment, so the one-off `seed` script that
 * runs locally never reaches it. Running this on server startup guarantees the
 * configured admin exists wherever the server boots.
 *
 * Idempotent by design: it only INSERTs when the account is missing, so a
 * password changed through the admin UI is never reset on the next restart.
 * `onConflictDoNothing` also makes it safe when several autoscale instances boot
 * at the same time.
 */
export async function ensureAdminSeed(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password) {
    logger.warn(
      "ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin bootstrap.",
    );
    return;
  }

  try {
    const [existing] = await db
      .select({ id: adminUsersTable.id })
      .from(adminUsersTable)
      .where(eq(adminUsersTable.email, email));
    if (existing) return;

    await db
      .insert(adminUsersTable)
      .values({ email, passwordHash: hashPassword(password) })
      .onConflictDoNothing({ target: adminUsersTable.email });
    logger.info({ email }, "Bootstrap admin user created");
  } catch (err) {
    logger.error({ err }, "Failed to ensure bootstrap admin user");
  }
}
