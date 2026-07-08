import { and, eq } from "drizzle-orm";
import { db, sitePhotosTable } from "@workspace/db";
import { logger } from "./logger";

/**
 * Original (v1) gallery defaults — the order the slots were first seeded with.
 * Used to detect rows the client never edited so the v2 re-order below can be
 * applied without clobbering CMS edits.
 */
const GALLERY_PHOTOS_V1: { slot: string; url: string }[] = [
  { slot: "gallery1", url: "/images/g-photo-01.jpg" },
  { slot: "gallery2", url: "/images/g-photo-02.jpg" },
  { slot: "gallery3", url: "/images/g-photo-03.jpg" },
  { slot: "gallery4", url: "/images/g-photo-04.jpg" },
  { slot: "gallery5", url: "/images/g-photo-05.jpg" },
  { slot: "gallery6", url: "/images/g-photo-06.jpg" },
  { slot: "gallery7", url: "/images/g-photo-07.jpg" },
  { slot: "gallery8", url: "/images/g-photo-08.jpg" },
  { slot: "gallery9", url: "/images/g-photo-09.jpg" },
  { slot: "gallery10", url: "/images/g-photo-10.jpg" },
  { slot: "gallery11", url: "/images/g-photo-11.jpg" },
  { slot: "gallery12", url: "/images/g-photo-12.jpg" },
  { slot: "gallery13", url: "/images/g-photo-13.jpg" },
  { slot: "gallery14", url: "/images/g-photo-14.jpg" },
  { slot: "gallery15", url: "/images/g-photo-15.jpg" },
  { slot: "gallery16", url: "/images/g-photo-16.jpg" },
];

/**
 * Current (v2) gallery defaults for the home-page slider ("Un soir chez
 * Florent"). Order alternates bouffe → alcool → resto (client note), and the
 * near-duplicate dining-room photo (old g-photo-12) was removed, leaving 15
 * slots. These mirror the frontend PHOTO_FALLBACK gallery entries — keep the
 * two in sync.
 */
const GALLERY_PHOTOS: { slot: string; url: string; alt: string }[] = [
  { slot: "gallery1", url: "/images/g-photo-02.jpg", alt: "Pizzas du four à bois et verres" },
  { slot: "gallery2", url: "/images/g-photo-01.jpg", alt: "Vin blanc versé au comptoir" },
  { slot: "gallery3", url: "/images/g-photo-10.jpg", alt: "La salle à manger Chez Florent" },
  { slot: "gallery4", url: "/images/g-photo-03.jpg", alt: "Pizza pour emporter" },
  { slot: "gallery5", url: "/images/g-photo-05.jpg", alt: "Bières de microbrasserie québécoises" },
  { slot: "gallery6", url: "/images/g-photo-11.jpg", alt: "La salle et le bar Chez Florent" },
  { slot: "gallery7", url: "/images/g-photo-04.jpg", alt: "Pizza au four à bois" },
  { slot: "gallery8", url: "/images/g-photo-07.jpg", alt: "Spiritueux québécois au bar" },
  { slot: "gallery9", url: "/images/g-photo-13.jpg", alt: "Le comptoir et les pompes à bière" },
  { slot: "gallery10", url: "/images/g-photo-06.jpg", alt: "Burger généreux Chez Florent" },
  { slot: "gallery11", url: "/images/g-photo-08.jpg", alt: "Casquettes Florent" },
  { slot: "gallery12", url: "/images/g-photo-09.jpg", alt: "Plats et pinte partagés" },
  { slot: "gallery13", url: "/images/g-photo-14.jpg", alt: "Assiette de l'ardoise" },
  { slot: "gallery14", url: "/images/g-photo-15.jpg", alt: "Pizza fromagée et pinte Florent" },
  { slot: "gallery15", url: "/images/g-photo-16.jpg", alt: "Bouchées gratinées" },
];

/**
 * Ensure the gallery photo slots exist in whatever database this instance is
 * connected to, then migrate never-edited rows to the v2 order:
 *
 * - Missing slots are inserted with the v2 defaults.
 * - Existing slots whose URL still matches the v1 default (i.e. the client
 *   never changed them in the CMS) are updated to the v2 default.
 * - `gallery16` (the removed duplicate) is deleted only if it still holds its
 *   v1 default; the frontend no longer renders it either way.
 * - Rows the client edited are never touched.
 *
 * Idempotent and safe under concurrent boots (`onConflictDoNothing` on the
 * unique `slot` column; updates are keyed on slot + old URL).
 */
export async function ensureGalleryPhotos(): Promise<void> {
  try {
    const existing = await db
      .select({ slot: sitePhotosTable.slot, url: sitePhotosTable.url })
      .from(sitePhotosTable);
    const bySlot = new Map(existing.map((r) => [r.slot, r.url]));

    // Insert missing slots with v2 defaults.
    const missing = GALLERY_PHOTOS.filter((p) => !bySlot.has(p.slot));
    if (missing.length > 0) {
      await db
        .insert(sitePhotosTable)
        .values(missing)
        .onConflictDoNothing({ target: sitePhotosTable.slot });
      logger.info({ count: missing.length }, "Gallery photo slots ensured");
    }

    // Migrate rows that still hold their v1 default to the v2 order.
    const v1BySlot = new Map(GALLERY_PHOTOS_V1.map((p) => [p.slot, p.url]));
    let migrated = 0;
    for (const p of GALLERY_PHOTOS) {
      const current = bySlot.get(p.slot);
      const v1 = v1BySlot.get(p.slot);
      if (current !== undefined && v1 !== undefined && current === v1 && current !== p.url) {
        await db
          .update(sitePhotosTable)
          .set({ url: p.url, alt: p.alt })
          .where(
            and(eq(sitePhotosTable.slot, p.slot), eq(sitePhotosTable.url, v1)),
          );
        migrated += 1;
      }
    }

    // Drop the removed 16th slot if it was never edited.
    const g16 = bySlot.get("gallery16");
    if (g16 === "/images/g-photo-16.jpg") {
      await db
        .delete(sitePhotosTable)
        .where(
          and(
            eq(sitePhotosTable.slot, "gallery16"),
            eq(sitePhotosTable.url, "/images/g-photo-16.jpg"),
          ),
        );
      migrated += 1;
    }
    if (migrated > 0) {
      logger.info({ count: migrated }, "Gallery photo order migrated to v2");
    }
  } catch (err) {
    logger.error({ err }, "Failed to ensure gallery photo slots");
  }
}
