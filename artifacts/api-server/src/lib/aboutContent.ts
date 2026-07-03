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
    quote: "Quand nous allons Chez Florent, chez qui allons-nous ?",
    storyP1:
      "Florent était le grand-père de Marie-Laurence, copropriétaire de l'établissement. Afin de souligner son parcours entrepreneurial marquant avec la cantine Nic et Flo, qu'il a fondée dans les années 1970 avec sa douce moitié, Nicole, Maxime et Marie-Laurence ont choisi d'unir distinction et racines soreloises en dédiant cet établissement à cet homme grand, jovial et profondément apprécié, qui nous a quittés beaucoup trop tôt.",
    storyQuestion2: "D'où vient l'idée d'ouvrir le restaurant ?",
    storyP2:
      "Il fut un temps où, à Sorel, il y avait un endroit où nous pouvions consommer de la bière artisanale et nous retrouver entre amis dans une ambiance décontractée, un endroit où l'on se sentait comme à la maison. Malheureusement, cet endroit a été emporté par les flammes.\n\nQuelques années plus tard, Maxime et Marie-Laurence devinrent collègues et amis, liés par leur lieu de travail, La Grange à Houblon. C'est après plusieurs quarts de travail à partager ce qu'ils aimaient, et aimaient moins, d'un établissement culinaire qu'ils ont réalisé qu'un concept complètement distinct, à leur image, pourrait représenter un vent de fraîcheur au cœur du centre-ville de Sorel-Tracy. Conseillés et appuyés par leurs mentors respectifs, Pierre-Luc et Fabienne, Max et Marie se lancèrent enfin dans cette grande aventure.\n\nCette aventure était alimentée par le désir de recréer ce lieu rassembleur mettant de l'avant le monde brassicole et viticole québécois, ainsi que les maraîchers locaux. Leur objectif était d'offrir un endroit accessible et familial, propice à tous les types de rassemblements, tout en proposant des assiettes, ma foi simples, bien que toujours préparées avec une qualité inébranlable.\n\nPassionnés, jeunes et ambitieux, ils ont vu ce projet se développer petit à petit. Puis, en mai 2025, Chez Florent prit vie.",
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
    story1: "suflo-crew-dos.jpg",
    story2: "equipe-bar.jpg",
    story3: "chef-four-a-bois.jpg",
  },
  chef: {
    marker: "Le chef",
    name: "Tommy Therrien",
    role: "Chef cuisinier",
    bio: "Tommy Therrien a développé son expertise culinaire à travers plusieurs établissements reconnus. Après sept années formatrices au Distingo de Sorel-Tracy auprès de son mentor, François Leduc, il a poursuivi son parcours au prestigieux Club Saint-James de Montréal, où il a perfectionné sa rigueur et son souci du détail.\n\nIl a ensuite occupé le poste de chef de production au Café Monk, participant activement au développement de son identité culinaire, avant de rejoindre L'Aurochs Steakhouse, où il a approfondi sa maîtrise des viandes de qualité supérieure et des techniques de cuisson.\n\nAujourd'hui, chez Florent, il met à profit l'ensemble de ces expériences dans un défi qui revêt pour lui une importance autant personnelle que professionnelle. Porter le nom de son grand-père sur sa veste de chef est une immense fierté qui l'accompagne à travers les hauts et les bas du monde de la restauration.\n\nPour Tommy, la cuisine est avant tout une histoire de transmission, de passion et de partage. Chaque assiette est une occasion de raconter une histoire, de créer une émotion et de rendre hommage aux producteurs, aux artisans et aux personnes qui se rassemblent autour d'une même table.",
    image: "chef-four-a-bois.jpg",
  },
};
