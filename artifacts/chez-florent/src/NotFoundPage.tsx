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

export default function NotFoundPage() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <div className="min-h-[100dvh] w-full bg-bg-primary text-cream selection:bg-orange selection:text-bg-primary relative">
      <ScrollProgress />
      <FilmGrain />

      <div className="overflow-x-hidden">
        <Navbar activeSection="" />

        <main>
          <section className="relative bg-bg-primary pt-40 md:pt-52 pb-28 md:pb-36 px-6 md:px-12 overflow-hidden min-h-[80vh] flex items-center">
            {/* Background photo */}
            <img
              src={imgSrc("interior-bar.jpg")}
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
                  "linear-gradient(180deg, rgba(14,31,28,0.86) 0%, rgba(14,31,28,0.78) 45%, rgba(14,31,28,0.96) 100%)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none mix-blend-multiply"
              style={{
                background:
                  "radial-gradient(120% 90% at 80% 0%, rgba(216,90,44,0.30) 0%, transparent 55%)",
              }}
            />
            <SectionMarker number="404" />
            <div className="max-w-7xl mx-auto relative z-10 w-full">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
                  <span aria-hidden="true">✶ </span>Erreur 404 — Page introuvable
                </div>
                <h1 className="font-display text-cream leading-[0.9] pb-[0.1em] text-[clamp(6rem,26vw,22rem)]">
                  404
                </h1>
                <p className="font-serif italic text-cream text-[1.5rem] md:text-[2rem] mt-4 leading-snug max-w-3xl">
                  La table que vous cherchez n'existe pas… ou n'est plus servie.
                </p>
                <p className="font-sans text-cream-soft/80 max-w-2xl text-base md:text-lg mt-5 leading-relaxed">
                  Le lien est peut-être brisé ou la page a été déplacée. Pas de
                  panique — revenez à l'accueil ou jetez un œil à l'ardoise.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <a
                    href={`${base}/`}
                    className="inline-flex items-center gap-2 px-7 py-4 bg-orange text-bg-primary hover:bg-orange/90 transition-colors rounded-[2px] text-[0.78rem] font-medium tracking-[0.2em] uppercase"
                  >
                    Retour à l'accueil
                  </a>
                  <a
                    href={`${base}/menu`}
                    className="inline-flex items-center gap-2 px-7 py-4 border border-cream/30 text-cream hover:border-cream/60 hover:text-cream transition-colors rounded-[2px] text-[0.78rem] font-medium tracking-[0.2em] uppercase"
                  >
                    Voir le menu <span aria-hidden="true">↗</span>
                  </a>
                  <a
                    href="tel:+14507431448"
                    className="inline-flex items-center gap-2 px-7 py-4 border border-cream/30 text-cream hover:border-cream/60 hover:text-cream transition-colors rounded-[2px] text-[0.78rem] font-medium tracking-[0.2em] uppercase"
                  >
                    450 743-1448
                  </a>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
