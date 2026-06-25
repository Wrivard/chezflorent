import { motion } from "framer-motion";
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
// Tous les textes, tarifs et inclusions ci-dessous sont des espaces réservés.
// Florent fournira les détails exacts — il suffira de remplacer ces valeurs.
// -----------------------------------------------------------------------------

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
};

const OCCASIONS: Occasion[] = [
  {
    title: "Fêtes & anniversaires",
    desc: "Réunissez vos proches autour d'une grande tablée et d'un gâteau du chef.",
    image: "interior-bar.jpg",
  },
  {
    title: "Événements corporatifs",
    desc: "5 à 7, party de bureau, lancement — un cadre chaleureux loin des salles fades.",
    image: "tap-pour.jpg",
  },
  {
    title: "Célébrations intimes",
    desc: "Mariages, fiançailles, retrouvailles : la maison ferme ses portes, rien que pour vous.",
    image: "florent-glass.jpg",
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
          <section className="relative bg-bg-primary pt-40 md:pt-52 pb-16 md:pb-20 px-6 md:px-12 overflow-hidden">
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
              >
                <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
                  <span aria-hidden="true">✶ </span>07 — Groupes & privatisation
                </div>
                <h1 className="font-display text-cream leading-[1.18] pb-[0.28em] text-[clamp(3.5rem,11vw,11rem)]">
                  Réunir vos gens
                </h1>
                <p className="font-sans italic text-cream-soft/75 max-w-2xl text-lg mt-6">
                  Un party de bureau, un anniversaire, un mariage intime ou une
                  envie de privatiser le bistro au complet — on s'occupe de tout.
                  Choisissez une formule, on bâtit le reste avec vous.
                </p>
                <div className="flex flex-wrap gap-4 mt-8">
                  <a
                    href="#formules"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-orange text-orange text-[0.75rem] font-medium tracking-[0.2em] uppercase hover:bg-orange hover:text-bg-primary transition-all duration-300 rounded-[2px]"
                  >
                    Voir les formules
                    <span aria-hidden="true">↓</span>
                  </a>
                  <a
                    href={RESTO_PHONE_HREF}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-cream-soft/30 text-cream text-[0.75rem] font-medium tracking-[0.2em] uppercase hover:border-cream-soft/60 transition-all duration-300 rounded-[2px]"
                  >
                    {RESTO_PHONE}
                  </a>
                </div>
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
          <section className="bg-bg-primary pt-20 md:pt-24 pb-16 md:pb-20 px-6 md:px-12 relative">
            <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-6 md:gap-10">
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
                  className="border border-border bg-bg-secondary/30 p-8 md:p-10 rounded-[2px]"
                >
                  <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-orange mb-4">
                    {opt.kicker}
                  </div>
                  <h2 className="font-serif text-cream text-[1.75rem] md:text-[2.25rem] leading-tight mb-4">
                    {opt.title}
                  </h2>
                  <p className="font-sans text-cream-soft/85 leading-relaxed">
                    {opt.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Formules & tarifs */}
          <section
            id="formules"
            className="bg-cream-soft pt-20 md:pt-24 pb-20 md:pb-24 px-6 md:px-12 relative scroll-mt-32 md:scroll-mt-40"
          >
            <SectionMarker number="07" tone="light" />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="mb-12 md:mb-16">
                <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-orange mb-3">
                  <span aria-hidden="true">◦ </span>Formules & tarifs
                </div>
                <h2 className="font-display text-bg-primary text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05]">
                  Choisissez votre formule
                </h2>
                <p className="font-sans italic text-bg-primary/65 max-w-2xl text-lg mt-4">
                  Trois points de départ — chacun s'ajuste au nombre de convives
                  et à l'occasion. Les tarifs ci-dessous sont des exemples à
                  confirmer.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {FORMULES.map((f, i) => (
                  <motion.div
                    key={f.name}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
                    className={`flex flex-col p-8 rounded-[2px] border ${
                      f.featured
                        ? "bg-bg-primary text-cream border-bg-primary shadow-xl md:-mt-4 md:mb-4"
                        : "bg-white/40 text-bg-primary border-bg-primary/15"
                    }`}
                  >
                    {f.featured && (
                      <div className="text-[0.65rem] font-medium tracking-[0.2em] uppercase text-orange mb-3">
                        ✶ Le plus demandé
                      </div>
                    )}
                    <h3
                      className={`font-serif text-[1.75rem] leading-tight mb-2 ${
                        f.featured ? "text-cream" : "text-bg-primary"
                      }`}
                    >
                      {f.name}
                    </h3>
                    <p
                      className={`font-sans italic text-sm leading-relaxed mb-6 ${
                        f.featured ? "text-cream-soft/80" : "text-bg-primary/65"
                      }`}
                    >
                      {f.tagline}
                    </p>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="font-display text-orange text-[2.75rem] leading-none">
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
                      className={`space-y-3 mb-8 flex-1 ${
                        f.featured ? "border-t border-cream/15" : "border-t border-bg-primary/15"
                      } pt-6`}
                    >
                      {f.includes.map((inc) => (
                        <li
                          key={inc}
                          className={`flex items-start gap-3 font-sans text-sm ${
                            f.featured ? "text-cream-soft/90" : "text-bg-primary/80"
                          }`}
                        >
                          <span aria-hidden="true" className="text-orange mt-0.5">
                            ✶
                          </span>
                          {inc}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={RESTO_PHONE_HREF}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-[0.72rem] font-medium tracking-[0.2em] uppercase rounded-[2px] transition-all duration-300 ${
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

              <p className="font-sans italic text-bg-primary/55 text-sm mt-8">
                Les tarifs sont des espaces réservés et seront confirmés avec
                Florent. Taxes et service en sus.
              </p>
            </div>
          </section>

          {/* Menus sur mesure */}
          <section className="bg-bg-primary pt-20 md:pt-24 pb-16 md:pb-20 px-6 md:px-12 relative">
            <SectionMarker number="07" />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                <motion.div
                  className="w-full lg:w-[42%] lg:sticky lg:top-32"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-orange mb-3">
                    <span aria-hidden="true">◦ </span>Menus sur mesure
                  </div>
                  <h2 className="font-display text-cream text-[clamp(2.5rem,6vw,4rem)] leading-[1.05] mb-6">
                    Bâti avec le chef
                  </h2>
                  <p className="font-sans text-cream-soft/85 leading-relaxed mb-4">
                    Chaque groupe est différent. On part de l'ardoise et on
                    adapte les formats, les portions et les accords selon votre
                    occasion, vos goûts et votre budget.
                  </p>
                  <p className="font-sans italic text-cream-soft/65 leading-relaxed text-sm">
                    Allergies, régimes et demandes spéciales : on s'adapte. Le
                    menu final est confirmé avec vous avant l'événement.
                  </p>
                </motion.div>

                <div className="w-full lg:w-[58%] grid sm:grid-cols-2 gap-5">
                  {MENU_OPTIONS.map((opt, i) => (
                    <motion.div
                      key={opt.title}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
                      className="border border-border bg-bg-secondary/30 p-7 rounded-[2px] hover:border-orange/40 transition-colors"
                    >
                      <div className="font-serif text-orange/80 text-lg mb-3">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3 className="font-serif font-semibold text-cream text-[1.35rem] leading-tight mb-2">
                        {opt.title}
                      </h3>
                      <p className="font-sans font-light italic text-cream-soft/80 text-sm leading-relaxed">
                        {opt.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Occasions */}
          <section className="bg-cream-soft pt-20 md:pt-24 pb-20 md:pb-24 px-6 md:px-12 relative">
            <SectionMarker number="07" tone="light" />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="mb-12 md:mb-16">
                <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-orange mb-3">
                  <span aria-hidden="true">◦ </span>Pour toutes les occasions
                </div>
                <h2 className="font-display text-bg-primary text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05]">
                  On célèbre quoi ?
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {OCCASIONS.map((occ, i) => (
                  <motion.div
                    key={occ.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
                    className="group"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[2px] ring-1 ring-bg-primary/15 mb-5">
                      <img
                        src={imgSrc(occ.image)}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/50 to-transparent" />
                    </div>
                    <h3 className="font-serif text-bg-primary text-[1.5rem] leading-tight mb-2">
                      {occ.title}
                    </h3>
                    <p className="font-sans text-bg-primary/70 text-sm leading-relaxed">
                      {occ.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Quick facts */}
          <section className="bg-bg-primary pt-16 md:pt-20 pb-16 md:pb-20 px-6 md:px-12 relative">
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border rounded-[2px] overflow-hidden">
                {FACTS.map((fact) => (
                  <div
                    key={fact.label}
                    className="bg-bg-primary px-6 py-10 text-center flex flex-col items-center justify-center"
                  >
                    <div className="font-display text-orange text-[clamp(2.25rem,5vw,3.5rem)] leading-none mb-2">
                      {fact.value}
                    </div>
                    <div className="text-[0.7rem] font-medium tracking-[0.18em] uppercase text-cream-soft/75">
                      {fact.label}
                    </div>
                  </div>
                ))}
              </div>
              <p className="font-sans italic text-cream-soft/55 text-sm mt-6 text-center">
                Capacités et montants à confirmer avec Florent.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-bg-primary pt-8 md:pt-12 pb-20 md:pb-24 px-6 md:px-12 relative">
            <div className="max-w-3xl mx-auto relative z-10">
              <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-orange mb-3">
                <span aria-hidden="true">◦ </span>Questions fréquentes
              </div>
              <h2 className="font-display text-cream text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] mb-10">
                Bon à savoir
              </h2>
              <div className="border-t border-border">
                {FAQS.map((faq) => (
                  <details
                    key={faq.q}
                    className="group border-b border-border py-5"
                  >
                    <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-serif text-cream text-[1.2rem] md:text-[1.35rem] leading-snug">
                      {faq.q}
                      <span
                        aria-hidden="true"
                        className="text-orange text-2xl shrink-0 transition-transform duration-300 group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="font-sans text-cream-soft/80 leading-relaxed mt-4 text-sm md:text-base">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-cream-soft pt-20 md:pt-24 pb-20 md:pb-24 px-6 md:px-12 relative">
            <SectionMarker number="07" tone="light" />
            <div className="max-w-4xl mx-auto relative z-10 text-center">
              <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-orange mb-4">
                <span aria-hidden="true">✶ </span>On planifie ensemble
              </div>
              <h2 className="font-display text-bg-primary text-[clamp(2.75rem,7vw,5rem)] leading-[1.02] mb-6">
                Parlons de votre soirée
              </h2>
              <p className="font-sans text-bg-primary/70 text-lg max-w-xl mx-auto mb-10">
                Donnez-nous la date, le nombre de convives et l'occasion — on
                vous revient avec une proposition sur mesure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={RESTO_PHONE_HREF}
                  aria-label={`Appeler Chez Florent au ${RESTO_PHONE}`}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-orange text-bg-primary text-[0.78rem] font-medium tracking-[0.2em] uppercase hover:bg-orange/85 transition-all duration-300 rounded-[2px]"
                >
                  {RESTO_PHONE}
                </a>
                <a
                  href={RESTO_EMAIL_HREF}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-bg-primary/30 text-bg-primary text-[0.78rem] font-medium tracking-[0.2em] uppercase hover:border-bg-primary/60 transition-all duration-300 rounded-[2px]"
                >
                  {RESTO_EMAIL}
                </a>
              </div>
              <p className="font-sans italic text-bg-primary/50 text-sm mt-6">
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
