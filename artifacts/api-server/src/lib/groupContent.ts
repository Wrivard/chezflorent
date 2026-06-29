import type { GroupContent } from "@workspace/api-zod";

// Single-row identifier for the bespoke "Groupes" page document.
export const GROUP_CONTENT_ID = "groupes";

// Source of truth for the page's seeded/default content. Kept in sync with the
// fallback constants used by the public page so the page never looks broken.
export const DEFAULT_GROUP_CONTENT: GroupContent = {
  texts: {
    heroMarker: "07 — Groupes & privatisation",
    heroTitle: "Réunir vos gens",
    heroLede:
      "Un party de bureau, un anniversaire, un mariage intime ou une envie de privatiser le bistro au complet — on s'occupe de tout.",
    manifestoMarker: "07 — Le mot de Florent",
    manifestoTitle: "« Vos gens, notre maison. »",
    manifestoBody:
      "Que vous soyez une dizaine autour d'une grande tablée ou que vous preniez la place au complet, on prépare votre soirée comme si c'était la nôtre — le menu, le vin, le rythme du service. Vous n'avez qu'à réunir vos gens.",
    manifestoQuote:
      "« On ne reçoit pas un groupe comme une réservation de plus. On le reçoit comme on reçoit chez nous. »",
    signatureName: "Florent",
    signatureRole: "Propriétaire",
    formulesMarker: "07 — Les formules",
    formulesTitle: "L'art de recevoir",
    formulesLede:
      "Quatre façons de réunir vos gens — chacune s'ajuste au nombre, à l'occasion et au budget. Les tarifs sont à confirmer.",
    occasionsMarker: "07 — Pour toutes les occasions",
    occasionsTitle: "On célèbre quoi ?",
    stepsMarker: "07 — Comment ça se passe",
    stepsTitle: "Simple, comme à la maison",
    essentialTitle: "L'essentiel",
    essentialFootnote: "Valeurs à confirmer avec Florent.",
  },
  formules: [
    {
      name: "Le 5 à 7",
      kind: "Apéro · format debout",
      desc: "Planches à partager, bouchées chaudes et une consommation de bienvenue — pour trinquer entre collègues ou amis, sans cérémonie.",
      price: "à p. de 00 $",
      unit: "/ pers.",
      image: "tap-pour.jpg",
    },
    {
      name: "La grande tablée",
      kind: "Repas attablé",
      desc: "Entrée à partager, plat au choix, dessert maison. L'ardoise revisitée pour votre groupe, servie au cœur de la salle.",
      price: "à p. de 00 $",
      unit: "/ pers.",
      image: "bread-tearing.png",
    },
    {
      name: "Le cocktail dînatoire",
      kind: "Réception debout",
      desc: "Stations et bouchées qui circulent, bar ouvert. Pour un groupe qui aime se mêler, verre à la main.",
      price: "à p. de 00 $",
      unit: "/ pers.",
      image: "dish-charcuterie.png",
    },
    {
      name: "Le bistro, rien qu'à vous",
      kind: "Privatisation complète",
      desc: "On ferme les portes pour votre soirée : salle entière, bar et service dédiés, menu bâti de A à Z avec le chef.",
      price: "Sur mesure",
      unit: "",
      image: "ambiance-smoke.png",
    },
  ],
  occasions: [
    {
      title: "Fêtes & anniversaires",
      desc: "Réunissez vos proches autour d'une grande tablée et d'un gâteau du chef.",
      image: "interior-bar.jpg",
      tag: "Entre proches",
    },
    {
      title: "Événements corporatifs",
      desc: "5 à 7, party de bureau, lancement — un cadre chaleureux loin des salles fades.",
      image: "tap-pour.jpg",
      tag: "Au bureau",
    },
    {
      title: "Célébrations intimes",
      desc: "Mariages, fiançailles, retrouvailles : la maison ferme ses portes, rien que pour vous.",
      image: "florent-glass.jpg",
      tag: "Grandes occasions",
    },
  ],
  steps: [
    {
      title: "On se parle",
      body: "Un appel ou un courriel : la date, le nombre de convives, l'occasion. On part de là.",
    },
    {
      title: "On bâtit votre soirée",
      body: "Le chef compose le menu et le déroulé à votre image, ajustés à votre budget.",
    },
    {
      title: "On vous reçoit",
      body: "Le jour venu, on s'occupe de tout. Vous n'avez qu'à profiter de vos gens.",
    },
  ],
  details: [
    { label: "Réservation de groupe", value: "dès 00 pers." },
    { label: "Privatisation complète", value: "dès 00 pers." },
    { label: "Durée typique", value: "00 h" },
    { label: "Acompte", value: "00 $ · appliqué à la facture" },
    { label: "Délai conseillé", value: "00 jours à l'avance" },
    { label: "Menu", value: "bâti avec le chef" },
  ],
};
