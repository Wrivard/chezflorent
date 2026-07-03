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
import { useGetAboutContent } from "@workspace/api-client-react";
import type { AboutContent } from "@workspace/api-client-react";

const DEFAULT_ABOUT_CONTENT: AboutContent = {
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
    story1: "tap-pour.jpg",
    story2: "florent-glass.jpg",
  },
};

// Splits an editable text field into paragraphs on blank lines, so the CMS can
// hold multi-paragraph stories in a single field.
function toParagraphs(s: string): string[] {
  return s
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function AboutPage() {
  const { data } = useGetAboutContent();
  const content = data ?? DEFAULT_ABOUT_CONTENT;
  const { texts, voices, suppliers, images } = content;
  const quoteWords = texts.quote.split(" ");
  const question2 =
    texts.storyQuestion2 ?? DEFAULT_ABOUT_CONTENT.texts.storyQuestion2 ?? "";

  const voiceStyles = [
    {
      blockquote:
        "font-serif font-normal text-cream text-[1.125rem] leading-[1.8]",
      delay: 0,
    },
    {
      blockquote:
        "font-sans font-light text-cream-soft/85 text-[1rem] leading-[1.8]",
      delay: 0.1,
    },
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-bg-primary text-cream selection:bg-orange selection:text-bg-primary relative">
      <ScrollProgress />
      <FilmGrain />

      <div className="overflow-x-hidden">
        <Navbar activeSection="" onAboutPage />

        <main>
          {/* Hero / header */}
          <section className="relative bg-bg-primary pt-40 md:pt-52 pb-16 md:pb-20 px-6 md:px-12 overflow-hidden">
            {/* Background photo */}
            <img
              src={imgSrc(images.hero)}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
            />
            {/* Accent overlay — dark base + orange tint to guarantee text contrast */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,25,30,0.82) 0%, rgba(0,25,30,0.72) 45%, rgba(0,25,30,0.94) 100%)",
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
            <SectionMarker number="02" />
            <div className="max-w-7xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
                  <span aria-hidden="true">✶ </span>
                  {texts.heroMarker}
                </div>
                <h1 className="font-display text-cream leading-[1.18] pb-[0.28em] text-[clamp(3.5rem,11vw,11rem)]">
                  {texts.heroTitle}
                </h1>
                <p className="font-sans italic text-cream-soft/75 max-w-2xl text-lg mt-6">
                  {texts.heroLede}
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

              {/* Narrative — the answer to the pull quote */}
              <div className="max-w-3xl space-y-5 mb-16 md:mb-20">
                {toParagraphs(texts.storyP1).map((p, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: EASE, delay: i * 0.05 }}
                    className="font-serif text-bg-primary text-[1.0625rem] md:text-[1.1875rem] leading-[1.9]"
                  >
                    {p}
                  </motion.p>
                ))}
              </div>

              {/* Second chapter — the origin story */}
              {(question2 || texts.storyP2) && (
                <div className="max-w-3xl mb-20 md:mb-24">
                  {question2 && (
                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, ease: EASE }}
                      className="font-serif italic font-light text-bg-primary text-[clamp(1.75rem,4.5vw,3rem)] leading-[1.15] mb-8"
                    >
                      {question2}
                    </motion.h3>
                  )}
                  <div className="space-y-5">
                    {toParagraphs(texts.storyP2).map((p, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: EASE, delay: i * 0.05 }}
                        className="font-sans font-light text-bg-primary/80 text-[1rem] md:text-[1.0625rem] leading-[1.9]"
                      >
                        {p}
                      </motion.p>
                    ))}
                  </div>
                </div>
              )}

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
                    src={imgSrc(images.story1)}
                    alt=""
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
                    src={imgSrc(images.story2)}
                    alt=""
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
                <span aria-hidden="true">◦ </span>
                {texts.voicesMarker}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-5xl">
                {voices.map((v, i) => {
                  const style = voiceStyles[i] ?? voiceStyles[1];
                  return (
                    <motion.figure
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, ease: EASE, delay: style.delay }}
                      className="m-0"
                    >
                      <blockquote className={style.blockquote}>
                        {v.quote}
                      </blockquote>
                      <figcaption className="mt-4 font-sans text-[0.75rem] tracking-[0.2em] uppercase text-cream-soft/75 flex items-center gap-3">
                        <span aria-hidden="true" className="inline-block w-8 h-px bg-orange/70" />
                        {v.name}
                        <span aria-hidden="true" className="text-orange/70">·</span>
                        <span className="font-serif normal-case italic tracking-normal text-cream-soft/80">
                          {v.role}
                        </span>
                      </figcaption>
                    </motion.figure>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Suppliers */}
          <section className="bg-bg-primary pt-12 md:pt-16 pb-24 md:pb-32 px-6 md:px-12 relative">
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-orange mb-10">
                <span aria-hidden="true">◦ </span>
                {texts.suppliersMarker}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-border">
                {suppliers.map((s, i) => (
                  <motion.div
                    key={i}
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
                  {texts.closingNote}
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
