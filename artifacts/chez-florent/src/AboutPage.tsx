import { motion } from "framer-motion";
import {
  Navbar,
  Footer,
  FilmGrain,
  ScrollProgress,
  SectionMarker,
  usePhotos,
  EASE,
} from "./App";

const SUPPLIERS = [
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
];

export default function AboutPage() {
  const photos = usePhotos();
  const quoteWords = "« On vient ici pour rester. »".split(" ");

  return (
    <div className="min-h-[100dvh] w-full bg-bg-primary text-cream selection:bg-orange selection:text-bg-primary relative">
      <ScrollProgress />
      <FilmGrain />

      <div className="overflow-x-hidden">
        <Navbar activeSection="" onAboutPage />

        <main>
          {/* Hero / header */}
          <section className="relative bg-bg-primary pt-40 md:pt-52 pb-16 md:pb-20 px-6 md:px-12 overflow-hidden">
            <SectionMarker number="02" />
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] -translate-y-1/3 translate-x-1/4 pointer-events-none rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(216, 90, 44, 0.10) 0%, transparent 60%)",
              }}
            />
            <div className="max-w-7xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
                  <span aria-hidden="true">✶ </span>02 — La maison
                </div>
                <h1 className="font-display text-cream leading-[1.18] pb-[0.28em] text-[clamp(3.5rem,11vw,11rem)]">
                  La maison
                </h1>
                <p className="font-sans italic text-cream-soft/75 max-w-2xl text-lg mt-6">
                  Un bistro de quartier, une certaine idée du temps qui passe —
                  et des gens qui le font vivre.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Pull quote + story + image stack */}
          <section className="bg-cream-soft pt-20 md:pt-24 pb-24 md:pb-28 px-6 md:px-12 relative overflow-hidden">
            <SectionMarker number="02" tone="light" />
            <div className="max-w-7xl mx-auto relative z-10">
              <h2 className="font-serif italic font-light text-bg-primary leading-[1.1] pb-[0.22em] text-[clamp(3rem,9vw,8rem)] mb-10 max-w-6xl flex flex-wrap gap-x-[0.3em] gap-y-4">
                {quoteWords.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ clipPath: "inset(100% 0 0 0)", y: 20 }}
                    whileInView={{ clipPath: "inset(0 0 0 0)", y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
                    className="block"
                  >
                    {word}
                  </motion.span>
                ))}
              </h2>

              {/* Narrative */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 max-w-5xl mb-20 md:mb-24">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: EASE }}
                  className="font-serif text-bg-primary text-[1.0625rem] md:text-[1.125rem] leading-[1.85]"
                >
                  Chez Florent est né d'une envie simple : un endroit où l'on
                  s'attable sans cérémonie, où le vin se verse au pichet, et où la
                  cuisine ne triche jamais avec ses produits. Pas de chichi —
                  juste de bons plats, partagés à la bonne température.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                  className="font-sans font-light text-bg-primary/80 text-[1rem] leading-[1.85]"
                >
                  On travaille avec des fermiers et artisans qu'on appelle par
                  leur prénom. L'ardoise change au gré des arrivages et des
                  saisons — c'est ça, un bistro vivant : du temps, de l'huile de
                  coude, et le plaisir de bien recevoir.
                </motion.p>
              </div>

              {/* Asymmetric image stack */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.9, ease: EASE }}
                  className="md:col-span-7 aspect-[4/3] overflow-hidden ring-1 ring-bg-primary/10"
                >
                  <img
                    src={photos.about1.url}
                    alt={photos.about1.alt}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.12 }}
                  className="md:col-span-5 aspect-[3/4] overflow-hidden ring-1 ring-bg-primary/10"
                >
                  <img
                    src={photos.about2.url}
                    alt={photos.about2.alt}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
            </div>
          </section>

          {/* Team voices */}
          <section className="bg-bg-primary pt-20 md:pt-24 pb-16 md:pb-20 px-6 md:px-12 relative">
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-orange mb-10">
                <span aria-hidden="true">◦ </span>Les voix de la maison
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-5xl">
                <motion.figure
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: EASE }}
                  className="m-0"
                >
                  <blockquote className="font-serif font-normal text-cream text-[1.125rem] leading-[1.8]">
                    « Florent n'est pas seulement un nom au-dessus de la porte.
                    C'est une certaine idée du bistro : celle où l'on s'attable
                    sans cérémonie, où le vin se verse au pichet, et où la cuisine
                    ne triche jamais avec ses produits. »
                  </blockquote>
                  <figcaption className="mt-4 font-sans text-[0.75rem] tracking-[0.2em] uppercase text-cream-soft/75 flex items-center gap-3">
                    <span aria-hidden="true" className="inline-block w-8 h-px bg-orange/70" />
                    Florent Tremblay
                    <span aria-hidden="true" className="text-orange/70">·</span>
                    <span className="font-serif normal-case italic tracking-normal text-cream-soft/80">
                      Propriétaire
                    </span>
                  </figcaption>
                </motion.figure>
                <motion.figure
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                  className="m-0"
                >
                  <blockquote className="font-sans font-light text-cream-soft/85 text-[1rem] leading-[1.8]">
                    « On travaille avec des fermiers qu'on appelle par leur prénom
                    — la Ferme J.N Beauchemin pour les saucisses, Fromagerie Fuoco
                    pour la bufarella, Les Cowboys du BBQ pour le brisket. Le
                    reste, c'est de l'huile de coude et du temps. »
                  </blockquote>
                  <figcaption className="mt-4 font-sans text-[0.75rem] tracking-[0.2em] uppercase text-cream-soft/75 flex items-center gap-3">
                    <span aria-hidden="true" className="inline-block w-8 h-px bg-orange/70" />
                    Annie Vincent
                    <span aria-hidden="true" className="text-orange/70">·</span>
                    <span className="font-serif normal-case italic tracking-normal text-cream-soft/80">
                      Sommelière
                    </span>
                  </figcaption>
                </motion.figure>
              </div>
            </div>
          </section>

          {/* Suppliers */}
          <section className="bg-bg-primary pt-12 md:pt-16 pb-24 md:pb-32 px-6 md:px-12 relative">
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-orange mb-10">
                <span aria-hidden="true">◦ </span>Nos producteurs
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-border">
                {SUPPLIERS.map((s, i) => (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}
                    className="grid grid-cols-[auto_1fr] gap-5 py-7 border-b border-border sm:odd:border-r sm:odd:pr-10 sm:even:pl-10"
                  >
                    <span className="font-serif italic text-orange text-lg pt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-serif font-semibold text-cream text-[1.35rem] leading-tight mb-1.5">
                        {s.name}
                      </h3>
                      <p className="font-sans font-light italic text-cream-soft/80 leading-relaxed text-sm md:text-base">
                        {s.note}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-16 text-center">
                <p className="font-sans italic text-cream-soft/85 text-sm">
                  « On vient ici pour rester. » — Au plaisir de vous recevoir,
                  57 rue du Roi.
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
