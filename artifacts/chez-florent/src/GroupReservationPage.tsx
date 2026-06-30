import { motion } from "framer-motion";
import {
  useGetGroupContent,
  type GroupContent,
} from "@workspace/api-client-react";
import {
  Navbar,
  Footer,
  FilmGrain,
  ScrollProgress,
  SectionMarker,
  imgSrc,
  EASE,
} from "./App";

const RESTO_PHONE = "450 743-1448";
const RESTO_PHONE_HREF = "tel:+14507431448";
const RESTO_EMAIL = "groupes@chezflorent.ca";
const RESTO_EMAIL_HREF = "mailto:groupes@chezflorent.ca";

// -----------------------------------------------------------------------------
// PLACEHOLDER CONTENT
// Tous les tarifs (« 00 »), capacités et détails ci-dessous sont des espaces
// réservés. Florent confirmera les valeurs exactes — il suffira de les remplacer.
// -----------------------------------------------------------------------------

// Word-by-word clip-path reveal — the site's signature heading entrance.
function RevealHeading({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <h2 className={className}>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ clipPath: "inset(100% 0 0 0)", y: 20 }}
          whileInView={{ clipPath: "inset(0 0 0 0)", y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
          className="inline-block mr-[0.28em]"
        >
          {word}
        </motion.span>
      ))}
    </h2>
  );
}

// Defaults mirror the seeded CMS document (see api-server lib/groupContent.ts)
// so the page renders correctly even before the document exists or if the API
// is unavailable. Editable in the admin under the « Groupes » tab.
const DEFAULT_GROUP_CONTENT: GroupContent = {
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

type Faq = { q: string; a: string };

const FAQS: Faq[] = [
  {
    q: "Combien de personnes pour réserver un groupe ?",
    a: "À partir de 00 personnes pour une réservation de groupe, et 00 personnes pour la privatisation complète du bistro. — À confirmer.",
  },
  {
    q: "Faut-il un dépôt pour confirmer ?",
    a: "Un acompte est demandé à la réservation et appliqué à votre facture finale. Le montant exact sera confirmé avec Florent.",
  },
  {
    q: "Peut-on adapter le menu aux allergies et restrictions ?",
    a: "Oui. Le chef adapte les formules pour les allergies, les régimes végétariens et autres besoins — indiquez-le à la réservation.",
  },
  {
    q: "Jusqu'à quand peut-on rester ?",
    a: "La durée et l'heure de fin sont convenues à l'avance selon votre formule. Détails à confirmer.",
  },
];

export default function GroupReservationPage() {
  const { data } = useGetGroupContent();
  const content = data ?? DEFAULT_GROUP_CONTENT;
  const t = content.texts;

  return (
    <div className="min-h-[100dvh] w-full bg-bg-primary text-cream selection:bg-orange selection:text-bg-primary relative">
      <ScrollProgress />
      <FilmGrain />

      <div className="overflow-x-hidden">
        <Navbar activeSection="" onGroupsPage />

        <main>
          {/* ============================================================
              HERO — cinematic photo bookend (opening). Kept.
          ============================================================ */}
          <section className="relative bg-bg-primary pt-40 md:pt-56 pb-20 md:pb-28 px-6 md:px-12 overflow-hidden">
            <img
              src={imgSrc("interior-bar.jpg")}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(14,31,28,0.82) 0%, rgba(14,31,28,0.72) 45%, rgba(14,31,28,0.94) 100%)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none mix-blend-multiply"
              style={{
                background:
                  "radial-gradient(120% 90% at 80% 0%, rgba(216,90,44,0.28) 0%, transparent 55%)",
              }}
            />
            <SectionMarker number="07" />
            <div className="max-w-7xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6"
              >
                <span aria-hidden="true">✶ </span>
                {t.heroMarker}
              </motion.div>
              <h1 className="font-display text-cream leading-[1.05] pb-[0.1em] text-[clamp(3.5rem,11vw,11rem)]">
                {t.heroTitle.split(" ").map((word, i) => (
                  <motion.span
                    key={`${word}-${i}`}
                    initial={{ clipPath: "inset(100% 0 0 0)", y: 24 }}
                    animate={{ clipPath: "inset(0 0 0 0)", y: 0 }}
                    transition={{ duration: 0.85, ease: EASE, delay: 0.15 + i * 0.12 }}
                    className="inline-block mr-[0.22em]"
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
                className="flex items-baseline gap-4 mt-8 max-w-2xl"
              >
                <div className="h-[1px] w-12 bg-orange shrink-0 translate-y-[-0.4em]" />
                <p className="font-serif italic text-cream-soft/90 text-lg md:text-2xl leading-snug">
                  {t.heroLede}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.65 }}
                className="flex flex-wrap gap-4 mt-10"
              >
                <a
                  href="#recevoir"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange text-bg-primary text-[0.75rem] font-medium tracking-[0.2em] uppercase hover:bg-orange/85 transition-all duration-300 rounded-[2px]"
                >
                  Voir les façons de recevoir
                  <span aria-hidden="true">↓</span>
                </a>
                <a
                  href={RESTO_PHONE_HREF}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-cream-soft/30 text-cream text-[0.75rem] font-medium tracking-[0.2em] uppercase hover:border-cream-soft/60 transition-all duration-300 rounded-[2px]"
                >
                  {RESTO_PHONE}
                </a>
              </motion.div>
            </div>
          </section>

          {/* ============================================================
              LE MOT DE FLORENT — manifesto: massive clip-path pull-quote +
              asymmetric photo triptych + signed note. (Redesigned.)
          ============================================================ */}
          <section className="bg-cream-soft pt-24 md:pt-36 pb-24 md:pb-36 px-6 md:px-12 relative overflow-hidden">
            <SectionMarker number="07" tone="light" />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                {/* Left — words */}
                <div className="lg:col-span-7">
                  <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-bg-primary/60 mb-8">
                    <span aria-hidden="true">◦ </span>
                    {t.manifestoMarker}
                  </div>

                  <h2 className="font-serif italic font-light text-bg-primary leading-[1.05] pb-[0.16em] text-[clamp(2.5rem,6vw,5.25rem)] mb-8 flex flex-wrap gap-x-[0.28em] gap-y-1">
                    {t.manifestoTitle.split(" ").map((word, i) => (
                      <motion.span
                        key={`${word}-${i}`}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.7, ease: EASE, delay: i * 0.07 }}
                        className="inline-block"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: EASE }}
                    className="font-sans font-light text-bg-primary/80 max-w-xl text-base md:text-lg leading-[1.8] mb-10"
                  >
                    {t.manifestoBody}
                  </motion.p>

                  {/* Signed note */}
                  <motion.figure
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                    className="m-0 border-t border-bg-primary/15 pt-8 max-w-xl"
                  >
                    <blockquote className="font-serif italic text-bg-primary text-[1.2rem] md:text-[1.5rem] leading-[1.6]">
                      {t.manifestoQuote}
                    </blockquote>
                    <div className="mt-6 mb-2">
                      <img
                        src="/logo.png"
                        alt="Chez Florent"
                        className="h-14 w-auto opacity-80"
                      />
                    </div>
                    <figcaption className="mt-3 font-sans text-[0.75rem] tracking-[0.2em] uppercase text-bg-primary/65 flex items-center gap-3">
                      <span aria-hidden="true" className="inline-block w-8 h-px bg-orange/70" />
                      <span className="font-display normal-case tracking-normal text-orange text-2xl leading-none">
                        {t.signatureName}
                      </span>
                    </figcaption>
                  </motion.figure>
                </div>

                {/* Right — overlapping image pair */}
                <div className="lg:col-span-5">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.9, ease: EASE }}
                    className="relative md:pb-16 md:pl-16"
                  >
                    <div className="group aspect-[4/5] overflow-hidden ring-1 ring-bg-primary/10">
                      <img
                        src={imgSrc("about-hands.png")}
                        alt="Service à table Chez Florent"
                        className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                      />
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.18 }}
                      className="hidden md:block group absolute bottom-0 left-0 w-[52%] aspect-[4/3] overflow-hidden ring-1 ring-bg-primary/10 outline outline-[6px] outline-cream-soft"
                    >
                      <img
                        src={imgSrc("florent-glass.jpg")}
                        alt="Verre servi au bar"
                        className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                      />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================
              L'ART DE RECEVOIR — formules as cinematic, alternating feature
              bands (large photo + big type + quiet price). (Redesigned.)
          ============================================================ */}
          <section
            id="recevoir"
            className="bg-bg-primary pt-24 md:pt-32 pb-24 md:pb-32 px-6 md:px-12 relative overflow-hidden scroll-mt-28 md:scroll-mt-36"
          >
            <SectionMarker number="07" />
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] -translate-y-1/3 translate-x-1/4 pointer-events-none rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(216, 90, 44, 0.10) 0%, transparent 60%)",
              }}
            />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="mb-16 md:mb-24 max-w-3xl">
                <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-6">
                  <span aria-hidden="true">✶ </span>
                  {t.formulesMarker}
                </div>
                <h2 className="font-display text-cream leading-[1.05] pb-[0.1em] text-[clamp(3rem,8vw,7rem)]">
                  {t.formulesTitle}
                </h2>
                <div className="flex items-baseline gap-4 mt-6">
                  <div className="h-[1px] w-12 bg-orange shrink-0 translate-y-[-0.4em]" />
                  <p className="font-serif italic text-cream-soft/80 text-lg md:text-xl">
                    {t.formulesLede}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-20 md:gap-28 lg:gap-36">
                {content.formules.map((f, i) => {
                  const reversed = i % 2 === 1;
                  return (
                    <div
                      key={`formule-${i}`}
                      className="relative grid lg:grid-cols-2 gap-8 lg:gap-16 items-center"
                    >
                      {/* Photo */}
                      <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.9, ease: EASE }}
                        className={`group relative ${reversed ? "lg:order-2" : ""}`}
                      >
                        <div className="aspect-[4/3] overflow-hidden ring-1 ring-cream/10">
                          <img
                            src={imgSrc(f.image)}
                            alt={f.name}
                            className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                          />
                        </div>
                      </motion.div>

                      {/* Text */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.8, ease: EASE, delay: 0.12 }}
                        className={`relative ${
                          reversed ? "lg:order-1 lg:pr-10" : "lg:pl-10"
                        }`}
                      >
                        <div className="flex items-start gap-5">
                          <span className="font-display text-orange/25 text-[clamp(3rem,6vw,5rem)] leading-[0.8] select-none">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="pt-1">
                            <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-cream-soft/70 mb-3">
                              {f.kind}
                            </div>
                            <h3 className="font-serif font-semibold text-cream text-[clamp(1.9rem,4vw,3rem)] leading-[1.05]">
                              {f.name}
                            </h3>
                          </div>
                        </div>
                        <p className="font-sans font-light italic text-cream-soft/85 text-base md:text-lg leading-relaxed mt-6 max-w-md">
                          {f.desc}
                        </p>
                        <div className="mt-7 inline-flex items-baseline gap-2 border-t border-border pt-5">
                          <span className="font-serif font-semibold text-orange text-xl md:text-2xl">
                            {f.price}
                          </span>
                          {f.unit && (
                            <span className="font-sans text-cream-soft/60 text-sm">
                              {f.unit}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-20 md:mt-28 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-border pt-10">
                <a
                  href={RESTO_PHONE_HREF}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange text-bg-primary text-[0.72rem] font-medium tracking-[0.2em] uppercase hover:bg-orange/85 transition-all duration-300 rounded-[2px]"
                >
                  Demander une proposition
                  <span aria-hidden="true">→</span>
                </a>
                <p className="font-serif italic text-cream-soft/55 text-sm">
                  Menu final bâti avec le chef. Taxes et service en sus.
                </p>
              </div>
            </div>
          </section>

          {/* ============================================================
              ON CÉLÈBRE QUOI — occasions. Kept (image-led grid).
          ============================================================ */}
          <section className="bg-cream-soft pt-24 md:pt-32 pb-24 md:pb-32 px-6 md:px-12 relative">
            <SectionMarker number="07" tone="light" />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="mb-16 md:mb-20">
                <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-bg-primary/60 mb-6">
                  {t.occasionsMarker}
                </div>
                <RevealHeading
                  text={t.occasionsTitle}
                  className="font-display text-bg-primary leading-[1.05] pb-[0.1em] text-[clamp(3rem,8vw,7rem)] flex flex-wrap"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-14">
                {content.occasions.map((occ, i) => (
                  <motion.article
                    key={`occasion-${i}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, ease: EASE, delay: i * 0.12 }}
                    className={`flex flex-col group ${
                      i === 0 ? "" : i === 1 ? "md:mt-8 lg:mt-16" : "md:mt-16 lg:mt-32"
                    }`}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden ring-1 ring-bg-primary/15 mb-6">
                      <img
                        src={imgSrc(occ.image)}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/55 to-transparent" />
                      <div className="absolute bottom-4 left-4 bg-cream-soft text-bg-primary px-3 py-1.5 font-sans text-[0.65rem] font-medium tracking-[0.2em] uppercase">
                        <span aria-hidden="true">✶ </span>{occ.tag}
                      </div>
                    </div>
                    <h3 className="font-serif text-bg-primary text-[1.6rem] leading-tight mb-2.5">
                      {occ.title}
                    </h3>
                    <p className="font-sans font-light text-bg-primary/70 text-base leading-relaxed">
                      {occ.desc}
                    </p>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          {/* ============================================================
              COMMENT ÇA SE PASSE — type-forward process beats + an
              "L'essentiel" reservation-slip card. (Redesigned.)
          ============================================================ */}
          <section className="bg-bg-primary pt-24 md:pt-32 pb-24 md:pb-32 px-6 md:px-12 relative overflow-hidden">
            <SectionMarker number="07" />
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 w-[55vw] h-[55vw] max-w-[640px] max-h-[640px] translate-y-1/3 -translate-x-1/4 pointer-events-none rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(216, 90, 44, 0.08) 0%, transparent 60%)",
              }}
            />
            <div className="max-w-7xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: EASE }}
                className="mb-14 md:mb-20 max-w-3xl"
              >
                <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
                  <span aria-hidden="true">✶ </span>
                  {t.stepsMarker}
                </div>
                <h2 className="font-display text-cream text-[clamp(2.75rem,7vw,6rem)] leading-[1.05] pb-[0.08em]">
                  {t.stepsTitle}
                </h2>
              </motion.div>

              <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                {/* Process beats */}
                <div className="lg:col-span-7">
                  {content.steps.map((s, i) => (
                    <motion.div
                      key={`step-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.7, ease: EASE, delay: i * 0.1 }}
                      className={`flex gap-6 md:gap-8 py-7 md:py-9 border-b border-border ${
                        i === 0 ? "border-t" : ""
                      }`}
                    >
                      <span className="font-display text-orange text-[clamp(2rem,4vw,3rem)] leading-[0.85] shrink-0 w-[1.6em]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="font-serif italic text-cream text-2xl md:text-[1.9rem] leading-tight mb-2">
                          {s.title}
                        </h3>
                        <p className="font-sans font-light text-cream-soft/80 text-base md:text-lg leading-relaxed max-w-md">
                          {s.body}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* L'essentiel — reservation-slip card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
                  className="lg:col-span-5 lg:sticky lg:top-32"
                >
                  <div className="relative border border-border bg-bg-secondary/40 backdrop-blur-sm p-7 md:p-8 overflow-hidden">
                    <div aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-[3px] bg-orange" />
                    <div className="flex items-baseline justify-between mb-5">
                      <div className="text-[0.7rem] font-medium tracking-[0.22em] uppercase text-orange">
                        <span aria-hidden="true">✶ </span>
                        {t.essentialTitle}
                      </div>
                      <div className="font-serif italic text-cream-soft/60 text-sm">
                        Chez Florent
                      </div>
                    </div>
                    <div
                      aria-hidden="true"
                      className="border-t border-dashed border-cream-soft/25 mb-1"
                    />
                    <dl>
                      {content.details.map((d, i) => (
                        <div
                          key={`detail-${i}`}
                          className={`flex items-baseline justify-between gap-5 py-4 ${
                            i === content.details.length - 1
                              ? ""
                              : "border-b border-border"
                          }`}
                        >
                          <dt className="font-sans text-[0.8rem] tracking-[0.04em] text-cream-soft/75">
                            {d.label}
                          </dt>
                          <dd className="font-serif text-cream text-right leading-snug">
                            {d.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <div
                      aria-hidden="true"
                      className="border-t border-dashed border-cream-soft/25 mt-1 mb-4"
                    />
                    <p className="font-serif italic text-cream-soft/50 text-sm">
                      {t.essentialFootnote}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ============================================================
              FAQ — kept.
          ============================================================ */}
          <section className="bg-cream-soft pt-24 md:pt-28 pb-24 md:pb-28 px-6 md:px-12 relative">
            <SectionMarker number="07" tone="light" />
            <div className="max-w-3xl mx-auto relative z-10">
              <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-bg-primary/60 mb-6">
                <span aria-hidden="true">◦ </span>Questions fréquentes
              </div>
              <h2 className="font-display text-bg-primary text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] pb-[0.08em] mb-12">
                Bon à savoir
              </h2>
              <div className="border-t border-bg-primary/15">
                {FAQS.map((faq) => (
                  <details
                    key={faq.q}
                    className="group border-b border-bg-primary/15 py-6"
                  >
                    <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-serif text-bg-primary text-[1.25rem] md:text-[1.45rem] leading-snug">
                      {faq.q}
                      <span
                        aria-hidden="true"
                        className="text-orange text-2xl shrink-0 transition-transform duration-300 group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="font-sans text-bg-primary/70 leading-relaxed mt-4 text-sm md:text-base">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* ============================================================
              CLOSING INVITATION — cinematic photo bookend (closing). Kept.
          ============================================================ */}
          <section className="relative bg-bg-primary px-6 md:px-12 py-32 md:py-44 overflow-hidden">
            <img
              src={imgSrc("hero-interior.png")}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(14,31,28,0.88) 0%, rgba(14,31,28,0.78) 50%, rgba(14,31,28,0.92) 100%)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none mix-blend-multiply"
              style={{
                background:
                  "radial-gradient(110% 80% at 50% 100%, rgba(216,90,44,0.26) 0%, transparent 60%)",
              }}
            />
            <div className="max-w-4xl mx-auto relative z-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: EASE }}
                className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6"
              >
                <span aria-hidden="true">✶ </span>On planifie ensemble
              </motion.div>
              <h2 className="font-display text-cream text-[clamp(3rem,9vw,8.5rem)] leading-[1.02] pb-[0.08em] mb-8">
                Écrivons votre soirée
              </h2>
              <p className="font-serif italic text-cream-soft/90 text-lg md:text-2xl leading-snug max-w-2xl mx-auto mb-12">
                Donnez-nous la date, le nombre de convives et l'occasion — on
                vous revient avec une proposition sur mesure.
              </p>
              <div className="flex flex-col items-center gap-4">
                <a
                  href={RESTO_PHONE_HREF}
                  aria-label={`Appeler Chez Florent au ${RESTO_PHONE}`}
                  className="font-display text-cream text-[clamp(2.5rem,6vw,4.5rem)] leading-none hover:text-orange transition-colors"
                >
                  450&nbsp;743&#8209;1448
                </a>
                <div className="flex items-center gap-3 text-cream-soft/70">
                  <span aria-hidden="true" className="inline-block w-8 h-px bg-orange/60" />
                  <span className="font-sans text-[0.7rem] tracking-[0.2em] uppercase">ou</span>
                  <span aria-hidden="true" className="inline-block w-8 h-px bg-orange/60" />
                </div>
                <a
                  href={RESTO_EMAIL_HREF}
                  className="font-serif italic text-cream-soft/90 text-lg md:text-xl hover:text-orange transition-colors underline underline-offset-4 decoration-orange/40"
                >
                  {RESTO_EMAIL}
                </a>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
