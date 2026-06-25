import { motion } from "framer-motion";
import {
  Navbar,
  Footer,
  FilmGrain,
  ScrollProgress,
  SectionMarker,
  HoursBand,
  imgSrc,
  EASE,
} from "./App";

const RESTO_PHONE = "450 743-1448";
const RESTO_PHONE_HREF = "tel:+14507431448";
const RESTO_EMAIL = "groupes@chezflorent.ca";
const RESTO_EMAIL_HREF = "mailto:groupes@chezflorent.ca";

// -----------------------------------------------------------------------------
// PLACEHOLDER CONTENT
// Tous les textes, tarifs et inclusions ci-dessous sont des espaces réservés.
// Florent fournira les détails exacts — il suffira de remplacer ces valeurs.
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

type Formule = {
  name: string;
  tagline: string;
  price: string;
  unit: string;
  includes: string[];
  featured?: boolean;
};

const FORMULES: Formule[] = [
  {
    name: "Le 5 à 7",
    tagline: "Bouchées & bulles pour trinquer entre collègues ou amis.",
    price: "00",
    unit: "$ / pers.",
    includes: [
      "Planches à partager (charcuteries & fromages)",
      "Sélection de bouchées chaudes",
      "1 consommation de bienvenue",
      "Durée — à confirmer",
    ],
  },
  {
    name: "Table du chef",
    tagline: "Un repas assis, service aux plats, l'ardoise revisitée pour le groupe.",
    price: "00",
    unit: "$ / pers.",
    includes: [
      "Entrée à partager",
      "Plat principal au choix",
      "Dessert maison",
      "Café & thé",
    ],
    featured: true,
  },
  {
    name: "Resto au complet",
    tagline: "Privatisation entière du bistro — l'endroit est à vous.",
    price: "Sur mesure",
    unit: "",
    includes: [
      "Salle complète réservée",
      "Menu personnalisé avec le chef",
      "Bar & service dédiés",
      "Montant minimum — à confirmer",
    ],
  },
];

type Occasion = {
  title: string;
  desc: string;
  image: string;
  tag: string;
};

const OCCASIONS: Occasion[] = [
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
];

type MenuOption = {
  title: string;
  desc: string;
};

const MENU_OPTIONS: MenuOption[] = [
  {
    title: "Planches à partager",
    desc: "Service familial au centre de la table — charcuteries, fromages d'ici, pains chauds.",
  },
  {
    title: "Menu assis",
    desc: "Entrée, plat et dessert choisis avec le chef selon les arrivages de la saison.",
  },
  {
    title: "Stations & bouchées",
    desc: "Format cocktail debout, idéal pour circuler et discuter entre les bouchées.",
  },
  {
    title: "Forfaits bar",
    desc: "Cocktails maison, vins choisis, bières locales — au verre, à la bouteille ou en forfait.",
  },
];

type Step = {
  n: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "Dites-nous tout",
    body: "Date, nombre de convives et occasion — un appel ou un courriel suffit pour démarrer.",
  },
  {
    n: "02",
    title: "On bâtit la formule",
    body: "Le chef vous propose un menu et un déroulé sur mesure, ajustés à votre budget.",
  },
  {
    n: "03",
    title: "On vous reçoit",
    body: "Le jour J, on s'occupe de tout — vous n'avez qu'à profiter de vos gens.",
  },
];

type Fact = {
  value: string;
  label: string;
};

const FACTS: Fact[] = [
  { value: "00", label: "Places assises" },
  { value: "00", label: "Format cocktail" },
  { value: "00 h", label: "Durée typique" },
  { value: "$00", label: "Acompte requis" },
];

type Faq = {
  q: string;
  a: string;
};

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
  return (
    <div className="min-h-[100dvh] w-full bg-bg-primary text-cream selection:bg-orange selection:text-bg-primary relative">
      <ScrollProgress />
      <FilmGrain />

      <div className="overflow-x-hidden">
        <Navbar activeSection="" onGroupsPage />

        <main>
          {/* Hero / header */}
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
                <span aria-hidden="true">✶ </span>07 — Groupes & privatisation
              </motion.div>
              <h1 className="font-display text-cream leading-[1.05] pb-[0.1em] text-[clamp(3.5rem,11vw,11rem)]">
                {"Réunir vos gens".split(" ").map((word, i) => (
                  <motion.span
                    key={word}
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
                  Un party de bureau, un anniversaire, un mariage intime ou une
                  envie de privatiser le bistro au complet — on s'occupe de tout.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.65 }}
                className="flex flex-wrap gap-4 mt-10"
              >
                <a
                  href="#formules"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange text-bg-primary text-[0.75rem] font-medium tracking-[0.2em] uppercase hover:bg-orange/85 transition-all duration-300 rounded-[2px]"
                >
                  Voir les formules
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

          {/* Placeholder notice */}
          <div className="bg-orange/10 border-y border-orange/30 px-6 md:px-12">
            <div className="max-w-7xl mx-auto py-3 text-center text-[0.72rem] md:text-[0.78rem] font-medium tracking-[0.12em] uppercase text-orange">
              <span aria-hidden="true">✶ </span>
              Page en préparation — tarifs et détails à confirmer avec Florent
            </div>
          </div>

          {/* Two pathways: group vs full privatisation */}
          <section className="bg-bg-primary pt-24 md:pt-32 pb-16 md:pb-20 px-6 md:px-12 relative overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] -translate-y-1/3 translate-x-1/4 pointer-events-none rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(216, 90, 44, 0.10) 0%, transparent 60%)",
              }}
            />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-12 md:mb-16">
                <span aria-hidden="true">◦ </span>Deux façons de nous réserver
              </div>
              <div className="grid md:grid-cols-2 gap-px bg-border border border-border rounded-[2px] overflow-hidden">
                {[
                  {
                    kicker: "Option 1",
                    title: "Réservation de groupe",
                    desc: "Une grande tablée dans le bistro, parmi les autres convives. Idéal pour les groupes qui veulent l'ambiance Chez Florent sans réserver l'endroit au complet.",
                  },
                  {
                    kicker: "Option 2",
                    title: "Privatisation complète",
                    desc: "Le bistro ferme ses portes pour vous. Salle entière, bar dédié, menu sur mesure — l'expérience Chez Florent rien que pour votre groupe.",
                  },
                ].map((opt, i) => (
                  <motion.div
                    key={opt.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7, ease: EASE, delay: i * 0.1 }}
                    className="bg-bg-primary p-8 md:p-12 group"
                  >
                    <div className="text-[0.7rem] font-medium tracking-[0.22em] uppercase text-orange mb-5">
                      <span aria-hidden="true">✶ </span>{opt.kicker}
                    </div>
                    <h2 className="font-serif text-cream text-[2rem] md:text-[2.75rem] leading-[1.1] mb-5">
                      {opt.title}
                    </h2>
                    <p className="font-sans font-light text-cream-soft/80 leading-relaxed text-base md:text-lg max-w-xl">
                      {opt.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Formules & tarifs */}
          <section
            id="formules"
            className="bg-cream-soft pt-24 md:pt-32 pb-24 md:pb-32 px-6 md:px-12 relative overflow-hidden scroll-mt-32 md:scroll-mt-40"
          >
            <SectionMarker number="07" tone="light" />
            {/* Ghost number for editorial weight */}
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            >
              <span className="font-display text-[40vw] md:text-[28vw] text-bg-primary/[0.03] leading-none">
                07
              </span>
            </div>
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="mb-14 md:mb-20">
                <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-bg-primary/60 mb-6">
                  07 — Formules & tarifs
                </div>
                <RevealHeading
                  text="Choisissez votre formule"
                  className="font-display text-bg-primary leading-[1.05] pb-[0.1em] text-[clamp(3rem,8vw,7rem)] flex flex-wrap"
                />
                <p className="font-serif italic text-bg-primary/65 max-w-2xl text-lg md:text-xl mt-6">
                  Trois points de départ — chacun s'ajuste au nombre de convives
                  et à l'occasion. Les tarifs ci-dessous sont des exemples à
                  confirmer.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-stretch">
                {FORMULES.map((f, i) => (
                  <motion.div
                    key={f.name}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
                    className={`flex flex-col p-8 md:p-9 rounded-[2px] relative overflow-hidden ${
                      f.featured
                        ? "bg-bg-primary text-cream shadow-2xl md:-mt-4 md:mb-4"
                        : "bg-white/50 text-bg-primary ring-1 ring-bg-primary/15"
                    }`}
                  >
                    {f.featured && (
                      <div
                        aria-hidden="true"
                        className="absolute left-0 top-0 bottom-0 w-[3px] bg-orange"
                      />
                    )}
                    {f.featured && (
                      <div className="text-[0.65rem] font-medium tracking-[0.22em] uppercase text-orange mb-4">
                        <span aria-hidden="true">✶ </span>Le plus demandé
                      </div>
                    )}
                    <h3
                      className={`font-serif text-[1.85rem] leading-tight mb-3 ${
                        f.featured ? "text-cream" : "text-bg-primary"
                      }`}
                    >
                      {f.name}
                    </h3>
                    <p
                      className={`font-serif italic text-[0.98rem] leading-relaxed mb-7 ${
                        f.featured ? "text-cream-soft/85" : "text-bg-primary/70"
                      }`}
                    >
                      {f.tagline}
                    </p>
                    <div className="flex items-baseline gap-1.5 mb-7">
                      <span className="font-display text-orange text-[clamp(2.5rem,4vw,3.25rem)] leading-none">
                        {f.price}
                      </span>
                      {f.unit && (
                        <span
                          className={`font-sans text-sm ${
                            f.featured ? "text-cream-soft/75" : "text-bg-primary/60"
                          }`}
                        >
                          {f.unit}
                        </span>
                      )}
                    </div>
                    <ul
                      className={`space-y-3.5 mb-9 flex-1 pt-6 ${
                        f.featured
                          ? "border-t border-cream/15"
                          : "border-t border-bg-primary/15"
                      }`}
                    >
                      {f.includes.map((inc) => (
                        <li
                          key={inc}
                          className={`flex items-start gap-3 font-sans text-sm ${
                            f.featured
                              ? "text-cream-soft/90"
                              : "text-bg-primary/80"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className="text-orange mt-0.5 leading-none"
                          >
                            ✶
                          </span>
                          {inc}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={RESTO_PHONE_HREF}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 text-[0.72rem] font-medium tracking-[0.2em] uppercase rounded-[2px] transition-all duration-300 ${
                        f.featured
                          ? "bg-orange text-bg-primary hover:bg-orange/85"
                          : "border border-orange text-orange hover:bg-orange hover:text-bg-primary"
                      }`}
                    >
                      Demander cette formule
                    </a>
                  </motion.div>
                ))}
              </div>

              <p className="font-serif italic text-bg-primary/55 text-sm mt-10">
                Les tarifs sont des espaces réservés et seront confirmés avec
                Florent. Taxes et service en sus.
              </p>
            </div>
          </section>

          {/* Marquee — brand connective tissue */}
          <HoursBand />

          {/* Menus sur mesure */}
          <section className="bg-bg-primary pt-24 md:pt-32 pb-16 md:pb-24 px-6 md:px-12 relative overflow-hidden">
            <SectionMarker number="07" />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
                <motion.div
                  className="w-full lg:w-[42%] lg:sticky lg:top-32"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
                    <span aria-hidden="true">◦ </span>Menus sur mesure
                  </div>
                  <h2 className="font-display text-cream text-[clamp(2.75rem,6vw,5rem)] leading-[1.05] pb-[0.08em] mb-6">
                    Bâti avec le chef
                  </h2>
                  <div className="flex items-baseline gap-4 mb-6">
                    <div className="h-[1px] w-12 bg-orange shrink-0 translate-y-[-0.4em]" />
                    <p className="font-serif italic text-cream-soft/85 leading-relaxed text-lg">
                      Chaque groupe est différent. On part de l'ardoise et on
                      adapte les formats, les portions et les accords selon votre
                      occasion.
                    </p>
                  </div>
                  <p className="font-sans font-light text-cream-soft/65 leading-relaxed text-sm pl-1">
                    Allergies, régimes et demandes spéciales : on s'adapte. Le
                    menu final est confirmé avec vous avant l'événement.
                  </p>
                </motion.div>

                <div className="w-full lg:w-[58%] grid sm:grid-cols-2 gap-px bg-border border border-border rounded-[2px] overflow-hidden">
                  {MENU_OPTIONS.map((opt, i) => (
                    <motion.div
                      key={opt.title}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
                      className="bg-bg-primary p-7 md:p-8 group hover:bg-bg-secondary/30 transition-colors"
                    >
                      <div className="font-serif italic text-orange/80 text-2xl mb-4">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3 className="font-serif font-semibold text-cream text-[1.4rem] leading-tight mb-2.5">
                        {opt.title}
                      </h3>
                      <p className="font-sans font-light italic text-cream-soft/75 text-sm leading-relaxed">
                        {opt.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Occasions — editorial staggered grid */}
          <section className="bg-cream-soft pt-24 md:pt-32 pb-24 md:pb-32 px-6 md:px-12 relative">
            <SectionMarker number="07" tone="light" />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="mb-16 md:mb-20">
                <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-bg-primary/60 mb-6">
                  07 — Pour toutes les occasions
                </div>
                <RevealHeading
                  text="On célèbre quoi ?"
                  className="font-display text-bg-primary leading-[1.05] pb-[0.1em] text-[clamp(3rem,8vw,7rem)] flex flex-wrap"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-14">
                {OCCASIONS.map((occ, i) => (
                  <motion.article
                    key={occ.title}
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

          {/* Comment réserver — 3 steps */}
          <section className="bg-bg-primary pt-24 md:pt-32 pb-16 md:pb-20 px-6 md:px-12 relative overflow-hidden">
            <SectionMarker number="07" />
            <div className="max-w-7xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: EASE }}
                className="mb-12 md:mb-16 max-w-4xl"
              >
                <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
                  <span aria-hidden="true">✶ </span>Comment ça marche
                </div>
                <h2 className="font-display text-cream text-[clamp(2.75rem,7vw,6rem)] leading-[1.05] pb-[0.08em]">
                  Trois étapes
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 border-y border-border py-10 md:py-14"
              >
                {STEPS.map((s, i) => (
                  <div key={s.n} className="flex flex-col gap-3 relative md:pl-6">
                    {i > 0 && (
                      <div
                        aria-hidden="true"
                        className="hidden md:block absolute left-0 top-2 bottom-2 w-[1px] bg-border"
                      />
                    )}
                    <div className="text-[0.7rem] font-medium tracking-[0.22em] uppercase text-orange">
                      {s.n}
                    </div>
                    <h3 className="font-serif italic text-cream text-2xl md:text-3xl leading-tight">
                      {s.title}
                    </h3>
                    <p className="font-sans text-cream-soft/80 text-sm md:text-[0.95rem] leading-relaxed max-w-[30ch]">
                      {s.body}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Quick facts */}
          <section className="bg-bg-primary pb-20 md:pb-28 px-6 md:px-12 relative">
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border rounded-[2px] overflow-hidden">
                {FACTS.map((fact) => (
                  <div
                    key={fact.label}
                    className="bg-bg-primary px-6 py-12 text-center flex flex-col items-center justify-center"
                  >
                    <div className="font-display text-orange text-[clamp(2.5rem,5vw,3.75rem)] leading-none mb-3">
                      {fact.value}
                    </div>
                    <div className="text-[0.7rem] font-medium tracking-[0.18em] uppercase text-cream-soft/75">
                      {fact.label}
                    </div>
                  </div>
                ))}
              </div>
              <p className="font-serif italic text-cream-soft/55 text-sm mt-6 text-center">
                Capacités et montants à confirmer avec Florent.
              </p>
            </div>
          </section>

          {/* FAQ */}
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

          {/* CTA — signature phone block */}
          <section className="bg-bg-primary pt-24 md:pt-32 pb-28 md:pb-36 px-6 md:px-12 relative overflow-hidden">
            <SectionMarker number="07" />
            {/* Ghost number */}
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            >
              <span className="font-display text-[40vw] md:text-[26vw] text-cream/[0.025] leading-none -translate-y-8">
                07
              </span>
            </div>
            {/* Orange wash */}
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] -translate-y-1/3 translate-x-1/4 pointer-events-none rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(216, 90, 44, 0.12) 0%, transparent 60%)",
              }}
            />
            <div className="max-w-7xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: EASE }}
                className="mb-12 md:mb-16 max-w-4xl"
              >
                <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
                  <span aria-hidden="true">✶ </span>On planifie ensemble
                </div>
                <h2 className="font-display text-cream text-[clamp(3rem,9vw,9rem)] leading-[1.05] pb-[0.08em] mb-8">
                  Parlons-en
                </h2>
                <div className="flex items-baseline gap-4 max-w-2xl">
                  <div className="h-[1px] w-12 bg-orange shrink-0 translate-y-[-0.4em]" />
                  <p className="font-serif italic text-cream-soft/90 text-lg md:text-2xl leading-snug">
                    Donnez-nous la date, le nombre de convives et l'occasion — on
                    vous revient avec une proposition sur mesure.
                  </p>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                {/* Phone — the signature moment */}
                <motion.a
                  href={RESTO_PHONE_HREF}
                  aria-label={`Appeler Chez Florent au ${RESTO_PHONE}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, ease: EASE }}
                  className="lg:col-span-7 block group relative border border-border bg-bg-secondary/50 backdrop-blur-sm p-8 md:p-10 hover:border-orange/50 transition-colors overflow-hidden"
                >
                  <div aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-[3px] bg-orange" />
                  <div className="text-[0.7rem] tracking-[0.22em] uppercase text-orange mb-4">
                    <span aria-hidden="true">✶ </span>Le plus chaleureux
                  </div>
                  <div className="font-display text-cream text-[clamp(2.5rem,5.5vw,4rem)] group-hover:text-orange transition-colors leading-[0.95] mb-4 whitespace-nowrap">
                    450&nbsp;743&#8209;1448
                  </div>
                  <div className="text-[0.75rem] tracking-[0.18em] uppercase text-cream-soft/85 group-hover:text-cream transition-colors">
                    Touchez pour appeler <span aria-hidden="true">↘</span>
                  </div>
                </motion.a>

                {/* Email + promise */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
                  className="lg:col-span-5 border border-border bg-bg-secondary/30 backdrop-blur-sm p-8 md:p-10 flex flex-col"
                >
                  <div className="text-[0.7rem] tracking-[0.22em] uppercase text-cream-soft/85 mb-4">
                    <span aria-hidden="true">◦ </span>Par courriel
                  </div>
                  <a
                    href={RESTO_EMAIL_HREF}
                    className="font-serif text-cream text-xl md:text-2xl leading-tight hover:text-orange transition-colors break-words mb-7"
                  >
                    {RESTO_EMAIL}
                  </a>
                  <ul className="space-y-3 mt-auto pt-6 border-t border-border">
                    {[
                      "Réponse en 24–48 h",
                      "Proposition sur mesure",
                      "Menu confirmé avant l'événement",
                    ].map((line) => (
                      <li
                        key={line}
                        className="flex items-start gap-3 font-sans text-[0.9rem] text-cream-soft/85"
                      >
                        <span aria-hidden="true" className="text-cream-soft/45 leading-none pt-[0.3rem]">✶</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              <p className="font-serif italic text-cream-soft/50 text-sm mt-8">
                Coordonnées de groupe à confirmer.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
