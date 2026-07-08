import { db, sitePhotosTable } from "@workspace/db";
import { logger } from "./logger";

/**
 * Default photos for the five extra "La maison" collage slots added on the
 * home page (about4–about8). These mirror the frontend PHOTO_FALLBACK entries
 * — keep the two in sync.
 */
const MAISON_PHOTOS: { slot: string; url: string; alt: string }[] = [
  { slot: "about4", url: "/images/maison-plats.jpg", alt: "Plats de la maison et pinte partagée" },
  { slot: "about5", url: "/images/maison-pizza-biere.jpg", alt: "Pointe de pizza et pinte Florent" },
  { slot: "about6", url: "/images/maison-vin.jpg", alt: "Vin québécois versé au verre" },
  { slot: "about7", url: "/images/maison-pizza-four.jpg", alt: "Pizza qui sort du four à bois" },
  { slot: "about8", url: "/images/maison-four.jpg", alt: "Le four à bois de la maison" },
];

/**
 * Ensure the extra "La maison" photo slots exist in whatever database this
 * instance is connected to, so the client can edit them from the CMS.
 *
 * Idempotent: only inserts slots that are missing, never overwrites CMS edits.
 * `onConflictDoNothing` on the unique `slot` column keeps concurrent boots safe.
 */
export async function ensureMaisonPhotos(): Promise<void> {
  try {
    const existing = await db
      .select({ slot: sitePhotosTable.slot })
      .from(sitePhotosTable);
    const have = new Set(existing.map((r) => r.slot));
    const missing = MAISON_PHOTOS.filter((p) => !have.has(p.slot));
    if (missing.length === 0) return;
    await db
      .insert(sitePhotosTable)
      .values(missing)
      .onConflictDoNothing({ target: sitePhotosTable.slot });
    logger.info({ count: missing.length }, "Maison photo slots ensured");
  } catch (err) {
    logger.error({ err }, "Failed to ensure maison photo slots");
  }
}
