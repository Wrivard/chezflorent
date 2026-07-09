import { db, sitePhotosTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
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
  { slot: "apropos-hero", url: "/images/suflo-crew-dos.jpg", alt: "L'équipe Su Flo de dos au comptoir" },
  { slot: "evenements-hero", url: "/images/jeu-cribbage.jpg", alt: "Jeu de cribbage sur une table Chez Florent" },
  { slot: "contact-hero", url: "/images/salle-rouge.jpg", alt: "La salle à manger rouge de Chez Florent" },
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
/**
 * One-time default swaps: when a slot's default photo changes in code, update
 * rows that still hold the OLD default URL (i.e. never customized in the CMS).
 * Rows the client edited keep their custom photo. Idempotent by construction.
 */
const DEFAULT_SWAPS: { slot: string; oldUrl: string; newUrl: string; alt: string }[] = [
  {
    slot: "apropos-hero",
    oldUrl: "/images/hero-interior.png",
    newUrl: "/images/suflo-crew-dos.jpg",
    alt: "L'équipe Su Flo de dos au comptoir",
  },
];

export async function ensureGroupAboutPhotos(): Promise<void> {
  try {
    const existing = await db
      .select({ slot: sitePhotosTable.slot })
      .from(sitePhotosTable);
    const have = new Set(existing.map((r) => r.slot));
    const missing = GROUP_ABOUT_PHOTOS.filter((p) => !have.has(p.slot));
    if (missing.length > 0) {
      await db
        .insert(sitePhotosTable)
        .values(missing)
        .onConflictDoNothing({ target: sitePhotosTable.slot });
      logger.info({ count: missing.length }, "Group/About photo slots ensured");
    }
    for (const swap of DEFAULT_SWAPS) {
      const updated = await db
        .update(sitePhotosTable)
        .set({ url: swap.newUrl, alt: swap.alt })
        .where(
          and(
            eq(sitePhotosTable.slot, swap.slot),
            eq(sitePhotosTable.url, swap.oldUrl),
          ),
        )
        .returning({ slot: sitePhotosTable.slot });
      if (updated.length > 0) {
        logger.info({ slot: swap.slot }, "Photo slot default updated");
      }
    }
  } catch (err) {
    logger.error({ err }, "Failed to ensure group/about photo slots");
  }
}
