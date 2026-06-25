import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

// The ways to gather — presented as an editorial menu (L'ardoise pattern),
// not a pricing table. Food and experience lead; price is a quiet line.
type Formule = {
  name: string;
  kind: string;
  desc: string;
  price: string;
  unit: string;
  image: string;
};

const FORMULES: Formule[] = [
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

// Practical info — a calm hairline definition list (Contact hours pattern),
// not a stat band shouting "00".
type Detail = { label: string; value: string };

const DETAILS: Detail[] = [
  { label: "Réservation de groupe", value: "à partir de 00 pers." },
  { label: "Privatisation complète", value: "à partir de 00 pers." },
  { label: "Durée typique", value: "00 h" },
  { label: "Acompte à la réservation", value: "00 $ (appliqué à la facture)" },
  { label: "Délai conseillé", value: "00 jours à l'avance" },
  { label: "Menu", value: "bâti avec le chef · allergies adaptées" },
];

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
  const [activeFormule, setActiveFormule] = useState(0);
  const active = FORMULES[activeFormule];

  return (
    <div className="min-h-[100dvh] w-full bg-bg-primary text-cream selection:bg-orange selection:text-bg-primary relative">
      <ScrollProgress />
      <FilmGrain />

      <div className="overflow-x-hidden">
        <Navbar activeSection="" onGroupsPage />

        <main>
          {/* ============================================================
              HERO — cinematic photo bookend (opening). Kept from v1.
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

          {/* Placeholder notice — slim, honest */}
          <div className="bg-orange/10 border-y border-orange/30 px-6 md:px-12">
            <div className="max-w-7xl mx-auto py-3 text-center text-[0.72rem] md:text-[0.78rem] font-medium tracking-[0.12em] uppercase text-orange">
              <span aria-hidden="true">✶ </span>
              Page en préparation — tarifs et détails à confirmer avec Florent
            </div>
          </div>

          {/* ============================================================
              L'INVITATION — owner's note. Replaces the boxy "two pathways".
              First-person warmth: a neighbourhood bistro hosts personally.
          ============================================================ */}
          <section className="bg-cream-soft pt-24 md:pt-36 pb-24 md:pb-36 px-6 md:px-12 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                <div className="lg:col-span-7">
                  <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-bg-primary/60 mb-8">
                    <span aria-hidden="true">◦ </span>Le mot de Florent
                  </div>
                  <h2 className="font-serif italic font-light text-bg-primary leading-[1.18] pb-[0.12em] text-[clamp(2rem,4.5vw,3.6rem)] flex flex-wrap">
                    {"Recevoir un groupe, c'est recevoir comme chez soi.".split(" ").map((word, i) => (
                      <motion.span
                        key={`${word}-${i}`}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 }}
                        className="inline-block mr-[0.28em]"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </h2>
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
                    className="mt-10 max-w-xl space-y-5 font-sans font-light text-bg-primary/80 text-base md:text-lg leading-[1.8]"
                  >
                    <p>
                      Que vous soyez dix autour d'une grande tablée ou que vous
                      preniez la place au complet, on prépare votre soirée comme
                      si c'était la nôtre — le menu, le vin, le rythme du service.
                    </p>
                    <p>
                      On part de l'ardoise, on l'ajuste à votre occasion, et on
                      s'occupe du reste. Vous n'avez qu'à réunir vos gens.
                    </p>
                  </motion.div>
                  <div className="mt-10 flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className="inline-block w-10 h-px bg-orange/70"
                    />
                    <span className="font-display text-orange text-[clamp(1.6rem,3vw,2.4rem)] leading-none">
                      Florent
                    </span>
                    <span className="font-sans text-[0.72rem] tracking-[0.2em] uppercase text-bg-primary/55">
                      Propriétaire
                    </span>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 1.04 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 1, ease: EASE }}
                  className="lg:col-span-5"
                >
                  <div className="aspect-[4/5] overflow-hidden ring-1 ring-bg-primary/15">
                    <img
                      src={imgSrc("about-hands.png")}
                      alt="Service à table Chez Florent"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ============================================================
              RECEVOIR, QUATRE FAÇONS — editorial menu of formules.
              Reuses the homepage L'ardoise list + cross-fading sticky photo.
              Price is a quiet line, never a pricing card.
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
              <div className="mb-14 md:mb-20 max-w-3xl">
                <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-6">
                  07 — Quatre façons de recevoir
                </div>
                <h2 className="font-display text-cream leading-[1.05] pb-[0.1em] text-[clamp(3rem,8vw,7rem)]">
                  L'art de recevoir
                </h2>
                <p className="font-serif italic text-cream-soft/80 text-lg md:text-xl mt-6">
                  Quatre points de départ — chacun s'ajuste au nombre de convives,
                  à l'occasion et au budget. Les tarifs sont à confirmer.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-10 lg:gap-16 items-start">
                {/* Left — the list */}
                <div className="grid grid-cols-1">
                  {FORMULES.map((f, i) => {
                    const isActive = i === activeFormule;
                    return (
                      <div
                        key={f.name}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isActive}
                        aria-label={`Aperçu de ${f.name}`}
                        onMouseEnter={() => setActiveFormule(i)}
                        onClick={() => setActiveFormule(i)}
                        onFocus={() => setActiveFormule(i)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setActiveFormule(i);
                          }
                        }}
                        className={`group grid grid-cols-[36px_1fr_auto] md:grid-cols-[56px_1fr_auto] gap-4 md:gap-8 py-8 border-b border-border cursor-default transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-inset px-3 md:px-6 ${
                          isActive ? "bg-bg-secondary/40" : "hover:bg-bg-secondary/30"
                        } ${i === 0 ? "border-t border-border" : ""}`}
                      >
                        <div
                          className={`font-serif italic text-lg md:text-xl pt-1 transition-colors ${
                            isActive ? "text-orange" : "text-orange/70"
                          }`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <motion.div
                          className="flex flex-col gap-1.5"
                          animate={{ x: isActive ? 12 : 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <div className="text-[0.68rem] font-medium tracking-[0.2em] uppercase text-cream-soft/70">
                            {f.kind}
                          </div>
                          <h3 className="font-serif font-semibold text-[1.5rem] md:text-[1.85rem] text-cream leading-tight">
                            {f.name}
                          </h3>
                          <p className="font-sans font-light italic text-cream-soft/85 max-w-[560px] leading-relaxed text-sm md:text-base">
                            {f.desc}
                          </p>
                        </motion.div>
                        <div className="flex flex-col items-end pt-1 text-right">
                          <span className="font-serif font-semibold text-[1.1rem] md:text-[1.4rem] text-orange whitespace-nowrap leading-tight">
                            {f.price}
                          </span>
                          {f.unit && (
                            <span className="font-sans text-[0.72rem] text-cream-soft/65 mt-0.5">
                              {f.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
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

                {/* Right — sticky cross-fading photo */}
                <div className="hidden lg:block lg:sticky lg:top-32 w-full">
                  <div className="relative w-full aspect-[4/5] overflow-hidden bg-bg-secondary ring-1 ring-cream/10">
                    <AnimatePresence mode="sync">
                      <motion.img
                        key={active.image}
                        src={imgSrc(active.image)}
                        alt={active.name}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1 }}
                        transition={{ duration: 0.6, ease: EASE }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </AnimatePresence>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/40 to-transparent p-6 pt-16 z-10">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeFormule}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.35, ease: EASE }}
                        >
                          <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-orange mb-1">
                            ◦ {String(activeFormule + 1).padStart(2, "0")} — {active.kind}
                          </div>
                          <div className="font-display text-cream text-[1.75rem] leading-none">
                            {active.name}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[0.7rem] font-medium tracking-[0.2em] uppercase text-cream-soft/75">
                    <span>— Survolez une formule</span>
                    <span className="font-serif italic normal-case tracking-normal text-cream-soft/85">
                      {String(activeFormule + 1).padStart(2, "0")} / {String(FORMULES.length).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================
              ON CÉLÈBRE QUOI — occasions. Kept from v1 (image-led grid).
          ============================================================ */}
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

          {/* ============================================================
              COMMENT ÇA SE PASSE — warm prose + a calm hairline detail list.
              Replaces the numbered step-cards and the "00 / 00" stat band.
          ============================================================ */}
          <section className="bg-bg-primary pt-24 md:pt-32 pb-24 md:pb-32 px-6 md:px-12 relative overflow-hidden">
            <SectionMarker number="07" />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
                {/* Left — the how, in prose */}
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.8, ease: EASE }}
                  className="lg:col-span-6"
                >
                  <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
                    <span aria-hidden="true">✶ </span>Comment ça se passe
                  </div>
                  <h2 className="font-display text-cream text-[clamp(2.75rem,6.5vw,5.5rem)] leading-[1.05] pb-[0.08em] mb-8">
                    Simple, comme à la maison
                  </h2>
                  <div className="space-y-6 font-sans font-light text-cream-soft/85 text-base md:text-lg leading-[1.8] max-w-xl">
                    <p>
                      <span className="font-serif italic text-cream">Un appel ou un courriel</span>{" "}
                      pour nous dire la date, le nombre de convives et l'occasion.
                    </p>
                    <p>
                      <span className="font-serif italic text-cream">On bâtit la formule</span>{" "}
                      avec le chef — un menu et un déroulé à votre image, ajustés à votre budget.
                    </p>
                    <p>
                      <span className="font-serif italic text-cream">On vous reçoit</span>{" "}
                      le jour venu. On s'occupe de tout : vous n'avez qu'à profiter de vos gens.
                    </p>
                  </div>
                </motion.div>

                {/* Right — practical details as a hairline definition list */}
                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
                  className="lg:col-span-6 lg:pt-2"
                >
                  <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft/75 mb-8">
                    <span aria-hidden="true">◦ </span>Détails pratiques
                  </div>
                  <dl className="border-t border-border">
                    {DETAILS.map((d) => (
                      <div
                        key={d.label}
                        className="flex items-baseline justify-between gap-6 py-5 border-b border-border"
                      >
                        <dt className="font-sans text-[0.8rem] md:text-[0.85rem] tracking-[0.06em] text-cream-soft/80">
                          {d.label}
                        </dt>
                        <dd className="font-serif text-cream text-base md:text-lg text-right leading-snug">
                          {d.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="font-serif italic text-cream-soft/50 text-sm mt-6">
                    Capacités et montants à confirmer avec Florent.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ============================================================
              FAQ — kept from v1.
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
              CLOSING INVITATION — cinematic photo bookend (closing).
              Mirrors the hero; phone + email as elegant inline links.
          ============================================================ */}
          <section className="relative bg-bg-primary px-6 md:px-12 py-32 md:py-44 overflow-hidden">
            <img
              src={imgSrc("exterior-dusk.png")}
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
