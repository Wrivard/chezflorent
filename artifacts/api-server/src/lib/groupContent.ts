import { eq } from "drizzle-orm";
import type { GroupContent } from "@workspace/api-zod";
import { db, groupContentTable } from "@workspace/db";
import { logger } from "./logger";

// Single-row identifier for the bespoke "Groupes" page document.
export const GROUP_CONTENT_ID = "groupes";

// Source of truth for the page's seeded/default content. Kept in sync with the
// fallback constants used by the public page so the page never looks broken.
export const DEFAULT_GROUP_CONTENT: GroupContent = {
  texts: {
    heroMarker: "01 — Groupes & privatisation",
    heroTitle: "Un anniversaire, une célébration importante",
    heroLede:
      "Un party de bureau, un anniversaire, un mariage intime ou une envie de privatiser le restaurant au complet — on s'occupe de tout.",
    manifestoMarker: "02 — Le mot de Florent",
    manifestoTitle: "« Vos gens, notre maison. »",
    manifestoBody:
      "Que vous soyez une dizaine autour d'une grande tablée ou que vous preniez la place au complet, on prépare votre soirée comme si vous receviez vos beaux-parents ! — le menu, le vin, la bière, le rythme du service, l'ambiance. Vous n'avez qu'à réunir vos gens, amenez vos décorations, on s'occupe du reste !",
    manifestoQuote:
      "« On ne reçoit pas un groupe comme une réservation de plus. On le reçoit comme on reçoit chez nous. »",
    signatureName: "Florent",
    signatureRole: "Propriétaire",
    formulesMarker: "03 — Les formules",
    formulesTitle: "L'art de recevoir",
    formulesLede:
      "Trois façons de réunir vos gens — chacune s'ajuste au nombre, à l'occasion et au budget.",
    occasionsMarker: "04 — Pour toutes les occasions",
    occasionsTitle: "On célèbre quoi ?",
    stepsMarker: "05 — Comment ça se passe",
    stepsTitle: "Simple, comme à la maison",
    essentialTitle: "L'essentiel",
    essentialFootnote:
      "Chaque soirée se planifie avec Florent — appelez-nous pour les détails.",
  },
  formules: [
    {
      name: "L'apéro",
      kind: "Format debout · autour du bar",
      desc: "Jusqu'à une trentaine de personnes debout autour du bar, bouchées à discuter selon l'occasion — parfait pour un 5 à 7 de départ à la retraite ou un lancement.",
      price: "À discuter",
      unit: "",
      image: "tap-pour.jpg",
    },
    {
      name: "La grande tablée",
      kind: "Repas attablé",
      desc: "Le coin des cinq banquettes accueille de 30 à 35 personnes, le côté tables de 20 à 22 — ou 26 en ajoutant les tables hautes. Un dépôt de 200 $ est demandé à la réservation.",
      price: "Dépôt de 200 $",
      unit: "· appliqué à la facture",
      image: "bread-tearing.png",
    },
    {
      name: "Le restaurant, rien qu'à vous",
      kind: "Privatisation complète · jeudi au samedi",
      desc: "On ferme les portes pour votre soirée : sans frais dès 60 convives, 500 $ pour 50, 1 000 $ pour 40, 1 500 $ pour 30. Dimanche, lundi ou mardi ? On en discute.",
      price: "Sans frais",
      unit: "dès 60 convives",
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
    { label: "Réservation de groupe", value: "dès 8 pers." },
    { label: "Grande tablée", value: "dépôt de 200 $ · appliqué à la facture" },
    { label: "Privatisation (jeudi–samedi)", value: "sans frais dès 60 pers." },
    { label: "Privatisation 50 / 40 / 30 pers.", value: "500 $ / 1 000 $ / 1 500 $" },
    { label: "Dimanche au mardi", value: "à discuter" },
    { label: "Menu", value: "bâti avec le chef" },
  ],
};

// Previous (v2) default document: identical to the current default except for
// the old "manifesto" paragraph. Kept so `ensureGroupContent` can migrate an
// unedited stored row to the latest default.
const GROUP_CONTENT_V2: GroupContent = {
  ...DEFAULT_GROUP_CONTENT,
  texts: {
    ...DEFAULT_GROUP_CONTENT.texts,
    manifestoBody:
      "Vous recevez vos beaux-parents et vous n'avez pas envie de passer la soirée dans la cuisine ? Venez célébrer chez nous : amenez vos décorations, on s'occupe du reste — la table, le menu, le service.",
  },
};

// Previous (v1) default document, kept only so `ensureGroupContent` can detect
// a stored row the client never edited and migrate it to the new default.
const GROUP_CONTENT_V1: GroupContent = {
  texts: {
    heroMarker: "01 — Groupes & privatisation",
    heroTitle: "Réunir vos gens",
    heroLede:
      "Un party de bureau, un anniversaire, un mariage intime ou une envie de privatiser le bistro au complet — on s'occupe de tout.",
    manifestoMarker: "02 — Le mot de Florent",
    manifestoTitle: "« Vos gens, notre maison. »",
    manifestoBody:
      "Que vous soyez une dizaine autour d'une grande tablée ou que vous preniez la place au complet, on prépare votre soirée comme si c'était la nôtre — le menu, le vin, le rythme du service. Vous n'avez qu'à réunir vos gens.",
    manifestoQuote:
      "« On ne reçoit pas un groupe comme une réservation de plus. On le reçoit comme on reçoit chez nous. »",
    signatureName: "Florent",
    signatureRole: "Propriétaire",
    formulesMarker: "03 — Les formules",
    formulesTitle: "L'art de recevoir",
    formulesLede:
      "Quatre façons de réunir vos gens — chacune s'ajuste au nombre, à l'occasion et au budget. Les tarifs sont à confirmer.",
    occasionsMarker: "04 — Pour toutes les occasions",
    occasionsTitle: "On célèbre quoi ?",
    stepsMarker: "05 — Comment ça se passe",
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
  occasions: DEFAULT_GROUP_CONTENT.occasions,
  steps: DEFAULT_GROUP_CONTENT.steps,
  details: [
    { label: "Réservation de groupe", value: "dès 00 pers." },
    { label: "Privatisation complète", value: "dès 00 pers." },
    { label: "Durée typique", value: "00 h" },
    { label: "Acompte", value: "00 $ · appliqué à la facture" },
    { label: "Délai conseillé", value: "00 jours à l'avance" },
    { label: "Menu", value: "bâti avec le chef" },
  ],
};

// Original (v0) default document: identical to v1 except every section marker
// used the "07 — " prefix. This is what the very first production deploy
// seeded, so it must be in the legacy list for prod to migrate.
const GROUP_CONTENT_V0: GroupContent = {
  ...GROUP_CONTENT_V1,
  texts: {
    ...GROUP_CONTENT_V1.texts,
    heroMarker: "07 — Groupes & privatisation",
    manifestoMarker: "07 — Le mot de Florent",
    formulesMarker: "07 — Les formules",
    occasionsMarker: "07 — Pour toutes les occasions",
    stepsMarker: "07 — Comment ça se passe",
  },
};

// Key-order-independent serialization: Postgres jsonb does not preserve key
// order, so plain JSON.stringify comparison would never match.
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

/**
 * Migrate a stored "Groupes" document that the client never edited (it still
 * deep-equals the v1 default) to the current default. Rows the client edited
 * in the CMS are never touched. Idempotent.
 */
export async function ensureGroupContent(): Promise<void> {
  try {
    const [row] = await db
      .select()
      .from(groupContentTable)
      .where(eq(groupContentTable.id, GROUP_CONTENT_ID));
    if (!row) return; // GET falls back to the new default — nothing to do.
    const stored = stableStringify(row.data);
    const isKnownOldDefault = [
      GROUP_CONTENT_V0,
      GROUP_CONTENT_V1,
      GROUP_CONTENT_V2,
    ].some(
      (v) => stored === stableStringify(v),
    );
    if (isKnownOldDefault) {
      await db
        .update(groupContentTable)
        .set({ data: DEFAULT_GROUP_CONTENT })
        .where(eq(groupContentTable.id, GROUP_CONTENT_ID));
      logger.info("Group content migrated to latest default");
    }
  } catch (err) {
    logger.error({ err }, "Failed to ensure group content");
  }
}
