import type { AboutContent } from "@workspace/api-zod";

// Single-row identifier for the bespoke "À propos" page document.
export const ABOUT_CONTENT_ID = "apropos";

// Source of truth for the page's seeded/default content. Kept in sync with the
// fallback constants used by the public page so the page never looks broken.
export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  texts: {
    heroMarker: "02 — La maison",
    heroTitle: "La maison",
    heroLede:
      "Un bistro de quartier, une certaine idée du temps qui passe — et des gens qui le font vivre.",
    quote: "« On vient ici pour rester. »",
    storyP1:
      "Chez Florent est né d'une envie simple : un endroit où l'on s'attable sans cérémonie, où le vin se verse au pichet, et où la cuisine ne triche jamais avec ses produits. Pas de chichi — juste de bons plats, partagés à la bonne température.",
    storyP2:
      "On travaille avec des fermiers et artisans qu'on appelle par leur prénom. L'ardoise change au gré des arrivages et des saisons — c'est ça, un bistro vivant : du temps, de l'huile de coude, et le plaisir de bien recevoir.",
    voicesMarker: "Les voix de la maison",
    suppliersMarker: "Nos producteurs",
    closingNote:
      "« On vient ici pour rester. » — Au plaisir de vous recevoir, 57 rue du Roi.",
  },
  voices: [
    {
      quote:
        "« Florent n'est pas seulement un nom au-dessus de la porte. C'est une certaine idée du bistro : celle où l'on s'attable sans cérémonie, où le vin se verse au pichet, et où la cuisine ne triche jamais avec ses produits. »",
      name: "Florent Tremblay",
      role: "Propriétaire",
    },
    {
      quote:
        "« On travaille avec des fermiers qu'on appelle par leur prénom — la Ferme J.N Beauchemin pour les saucisses, Fromagerie Fuoco pour la bufarella, Les Cowboys du BBQ pour le brisket. Le reste, c'est de l'huile de coude et du temps. »",
      name: "Annie Vincent",
      role: "Sommelière",
    },
  ],
  suppliers: [
    {
      name: "Ferme J.N Beauchemin",
      note: "Saucisses & charcuteries, élevées à quelques minutes d'ici.",
    },
    {
      name: "Fromagerie Fuoco",
      note: "La bufarella et les fromages du moment, frais chaque semaine.",
    },
    {
      name: "Les Cowboys du BBQ",
      note: "Brisket fumé lentement pour nos sandwichs signature.",
    },
    {
      name: "Riverbend Brewing Co.",
      note: "Bières brassées à Sorel — locales, fraîches, désaltérantes.",
    },
  ],
  images: {
    hero: "hero-interior.png",
    story1: "tap-pour.jpg",
    story2: "florent-glass.jpg",
  },
};
