import type { MenuMarquee } from "@workspace/api-zod";

// Single-row identifier for the bespoke Menu-page suppliers band.
export const MENU_MARQUEE_ID = "menu";

// Source of truth for the band's seeded/default content. Kept in sync with the
// fallback used by the public page so the band never looks empty.
export const DEFAULT_MENU_MARQUEE: MenuMarquee = {
  suppliers: [
    "Les Cowboys du BBQ",
    "Fuoco",
    "L'or de l'Italie",
    "Wiltor Café",
    "Ferme J.N Beauchemin",
    "Charcuteries Porc Épique",
    "Christophe",
    "Le Comptoir Alexandrine",
    "Pâtisserie Aveline",
    "Comont",
    "Flirt",
    "Statera",
    "Rosemont",
    "Helix",
    "La Barberie",
    "Auval",
    "Dunham",
    "5e Baron",
    "Cheptel",
    "Messorem",
    "Bad Bones",
    "Prospecteur",
    "Stadaconé",
    "Domaine du Fleuve",
    "Domaine l'Espiègle",
    "Nival",
    "Domaine Gélinas",
    "Vignoble Ste-Pétronile",
    "Gutsy",
    "Brasserie du Bas-Canada",
    "Albion",
    "Artisans du Terroir",
    "Les Ouches",
    "Wein Goutte",
    "Herman",
    "Tête d'allumette",
    "Gaspard",
    "Sir John",
  ],
};
