import { db, sitePhotosTable } from "@workspace/db";
import { logger } from "./logger";

/**
 * Default photos for the decorative images that used to be edited inline on the
 * Groupes and À-propos editors. They now live in the single "Photos" tab, so the
 * public pages read them from `site_photos` (with a code fallback) and the CMS
 * must expose an editable row for each slot. These mirror the frontend
 * PHOTO_FALLBACK entries — keep the two in sync.
 */
const GROUP_ABOUT_PHOTOS: { slot: string; url: string; alt: string }[] = [
  { slot: "grp-formule-1", url: "/images/tap-pour.jpg", alt: "Formule — service au comptoir" },
  { slot: "grp-formule-2", url: "/images/bread-tearing.png", alt: "Formule — pain partagé" },
  { slot: "grp-formule-3", url: "/images/dish-charcuterie.png", alt: "Formule — planche de charcuterie" },
  { slot: "grp-formule-4", url: "/images/ambiance-smoke.png", alt: "Formule — ambiance du bistro" },
  { slot: "grp-occasion-1", url: "/images/interior-bar.jpg", alt: "Occasion — la salle Chez Florent" },
  { slot: "grp-occasion-2", url: "/images/tap-pour.jpg", alt: "Occasion — au comptoir" },
  { slot: "grp-occasion-3", url: "/images/florent-glass.jpg", alt: "Occasion — verre signature" },
  { slot: "apropos-hero", url: "/images/hero-interior.png", alt: "Intérieur de Chez Florent" },
  { slot: "apropos-1", url: "/images/suflo-crew-dos.jpg", alt: "L'équipe de Chez Florent" },
  { slot: "apropos-2", url: "/images/equipe-bar.jpg", alt: "L'équipe au bar" },
  { slot: "apropos-3", url: "/images/chef-four-a-bois.jpg", alt: "Le chef au four à bois" },
  { slot: "apropos-chef", url: "/images/chef-four-a-bois.jpg", alt: "Portrait du chef" },
];

/**
 * Ensure the Groupes/À-propos decorative photo slots exist in whatever database
 * this instance is connected to. Backfills slots into databases that were seeded
 * before these slots existed so the client can edit them from the CMS.
 *
 * Idempotent: only inserts slots that are missing, never overwrites CMS edits.
 * `onConflictDoNothing` on the unique `slot` column keeps concurrent boots safe.
 */
export async function ensureGroupAboutPhotos(): Promise<void> {
  try {
    const existing = await db
      .select({ slot: sitePhotosTable.slot })
      .from(sitePhotosTable);
    const have = new Set(existing.map((r) => r.slot));
    const missing = GROUP_ABOUT_PHOTOS.filter((p) => !have.has(p.slot));
    if (missing.length === 0) return;
    await db
      .insert(sitePhotosTable)
      .values(missing)
      .onConflictDoNothing({ target: sitePhotosTable.slot });
    logger.info({ count: missing.length }, "Group/About photo slots ensured");
  } catch (err) {
    logger.error({ err }, "Failed to ensure group/about photo slots");
  }
}
