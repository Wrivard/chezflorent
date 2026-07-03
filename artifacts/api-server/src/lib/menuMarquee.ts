import type { MenuMarquee } from "@workspace/api-zod";

// Single-row identifier for the bespoke Menu-page suppliers band.
export const MENU_MARQUEE_ID = "menu";

// Source of truth for the band's seeded/default content. Kept in sync with the
// fallback used by the public page so the band never looks empty.
export const DEFAULT_MENU_MARQUEE: MenuMarquee = {
  suppliers: [
    "Ferme J.N Beauchemin",
    "Fromagerie Fuoco",
    "Les Cowboys du BBQ",
    "Huile d'olive QC",
  ],
};
