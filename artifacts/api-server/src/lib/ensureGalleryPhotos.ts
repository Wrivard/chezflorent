import { db, sitePhotosTable } from "@workspace/db";
import { logger } from "./logger";

/**
 * Default photos for the home-page gallery slider ("Un soir chez Florent").
 * These mirror the frontend PHOTO_FALLBACK gallery entries so the public site
 * and the CMS start from the same images. Keep the two in sync.
 */
const GALLERY_PHOTOS: { slot: string; url: string; alt: string }[] = [
  { slot: "gallery1", url: "/images/g-photo-01.jpg", alt: "Ambiance Chez Florent" },
  { slot: "gallery2", url: "/images/g-photo-02.jpg", alt: "Un soir Chez Florent" },
  { slot: "gallery3", url: "/images/g-photo-03.jpg", alt: "La salle Chez Florent" },
  { slot: "gallery4", url: "/images/g-photo-04.jpg", alt: "Le bar Chez Florent" },
  { slot: "gallery5", url: "/images/g-photo-05.jpg", alt: "Autour de la table Chez Florent" },
  { slot: "gallery6", url: "/images/g-photo-06.jpg", alt: "Bouchées et verres partagés" },
  { slot: "gallery7", url: "/images/g-photo-07.jpg", alt: "Ambiance de quartier Chez Florent" },
  { slot: "gallery8", url: "/images/g-photo-08.jpg", alt: "Verres et bonne compagnie" },
  { slot: "gallery9", url: "/images/g-photo-09.jpg", alt: "Détail de service Chez Florent" },
  { slot: "gallery10", url: "/images/g-photo-10.jpg", alt: "Convives attablés Chez Florent" },
  { slot: "gallery11", url: "/images/g-photo-11.jpg", alt: "La salle à manger Chez Florent" },
  { slot: "gallery12", url: "/images/g-photo-12.jpg", alt: "L'ardoise et les verres" },
  { slot: "gallery13", url: "/images/g-photo-13.jpg", alt: "Moment de partage Chez Florent" },
  { slot: "gallery14", url: "/images/g-photo-14.jpg", alt: "Le comptoir Chez Florent" },
  { slot: "gallery15", url: "/images/g-photo-15.jpg", alt: "Soirée animée Chez Florent" },
  { slot: "gallery16", url: "/images/g-photo-16.jpg", alt: "Fragment d'un soir Chez Florent" },
];

/**
 * Ensure the gallery photo slots exist in whatever database this instance is
 * connected to. Unlike the content-snapshot import (which only seeds photos into
 * a fully empty table), this backfills the gallery slots into databases that
 * were already seeded with the original photos, so the client can edit the
 * home-page gallery from the CMS.
 *
 * Idempotent: only inserts slots that are missing, never overwrites CMS edits.
 * `onConflictDoNothing` on the unique `slot` column keeps concurrent boots safe.
 */
export async function ensureGalleryPhotos(): Promise<void> {
  try {
    const existing = await db
      .select({ slot: sitePhotosTable.slot })
      .from(sitePhotosTable);
    const have = new Set(existing.map((r) => r.slot));
    const missing = GALLERY_PHOTOS.filter((p) => !have.has(p.slot));
    if (missing.length === 0) return;
    await db
      .insert(sitePhotosTable)
      .values(missing)
      .onConflictDoNothing({ target: sitePhotosTable.slot });
    logger.info({ count: missing.length }, "Gallery photo slots ensured");
  } catch (err) {
    logger.error({ err }, "Failed to ensure gallery photo slots");
  }
}
