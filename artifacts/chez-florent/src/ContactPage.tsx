import { motion } from "framer-motion";
import {
  Navbar,
  Footer,
  FilmGrain,
  ScrollProgress,
  SectionMarker,
  usePhotos,
  useHoursItems,
  useOpenDaysLabel,
  useEarliestOpenHour,
  imgSrc,
  EASE,
} from "./App";

const RESTO_PHONE = "450 743-1448";
const RESTO_PHONE_HREF = "tel:+14507431448";
const MAPS_EMBED =
  "https://www.google.com/maps?q=57+Rue+du+Roi,+Sorel-Tracy,+QC+J3P+4M6&output=embed";
const MAPS_LINK =
  "https://www.google.com/maps/search/?api=1&query=57+Rue+du+Roi+Sorel-Tracy+QC+J3P+4M6";

export default function ContactPage() {
  const photos = usePhotos();
  const hoursItems = useHoursItems();
  const daysLabel = useOpenDaysLabel();
  const openHour = useEarliestOpenHour();

  return (
    <div className="min-h-[100dvh] w-full bg-bg-primary text-cream selection:bg-orange selection:text-bg-primary relative">
      <ScrollProgress />
      <FilmGrain />

      <div className="overflow-x-hidden">
        <Navbar activeSection="" onContactPage />

        <main>
          {/* Hero / header */}
          <section className="relative bg-bg-primary pt-40 md:pt-52 pb-16 md:pb-20 px-6 md:px-12 overflow-hidden">
            {/* Background photo */}
            <img
              src={imgSrc("exterior-dusk.png")}
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
            <SectionMarker number="06" />
            <div className="max-w-7xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
                  <span aria-hidden="true">✶ </span>06 — Nous trouver
                </div>
                <h1 className="font-display text-cream leading-[1.18] pb-[0.28em] text-[clamp(3.5rem,11vw,11rem)]">
                  Passez nous voir
                </h1>
                <p className="font-sans italic text-cream-soft/75 max-w-2xl text-lg mt-6">
                  À deux pas du marché, au cœur de Sorel-Tracy. La porte est
                  ouverte du {daysLabel.long} — appelez-nous pour réserver votre
                  table.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Coordinates + façade */}
          <section className="bg-cream-soft pt-20 md:pt-24 pb-20 md:pb-24 px-6 md:px-12 relative">
            <SectionMarker number="06" tone="light" />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                {/* Left: details */}
                <motion.div
                  className="w-full lg:w-[55%]"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <address className="font-serif text-[1.75rem] md:text-[2rem] text-bg-primary not-italic mb-12 leading-snug">
                    <strong className="font-semibold block text-orange mb-2">
                      Chez Florent
                    </strong>
                    57 Rue du Roi<br />
                    Sorel-Tracy, Québec<br />
                    J3P 4M6
                  </address>

                  {/* Hours — wired to the CMS schedule */}
                  <div className="mb-12">
                    <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-bg-primary/60 mb-4">
                      Heures d'ouverture
                    </div>
                    <ul className="max-w-[440px] border-t border-bg-primary/20">
                      {hoursItems.map((item) => (
                        <li
                          key={item}
                          className="py-3.5 border-b border-bg-primary/20 font-sans text-bg-primary/85 text-base md:text-lg"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="font-sans text-bg-primary/85 mb-12">
                    <div className="text-[0.7rem] uppercase tracking-[0.2em] mb-2 opacity-90">
                      Appelez-nous
                    </div>
                    <a
                      href={RESTO_PHONE_HREF}
                      aria-label={`Appeler Chez Florent au ${RESTO_PHONE}`}
                      className="font-display text-[clamp(2.5rem,5vw,4rem)] text-bg-primary link-underline hover:text-orange transition-colors"
                    >
                      {RESTO_PHONE}
                    </a>
                    <p className="font-sans italic text-bg-primary/65 mt-3 text-sm max-w-md">
                      Réservations et soirées par téléphone uniquement — on répond
                      avec plaisir dès {openHour}h.
                    </p>
                  </div>

                  <div className="flex gap-8 text-[0.875rem] font-medium tracking-[0.2em] uppercase text-bg-primary">
                    <a
                      href="https://www.instagram.com/chezflorent.bistro/"
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="link-underline"
                      aria-label="Instagram de Chez Florent (nouvel onglet)"
                    >
                      Instagram
                    </a>
                    <span aria-hidden="true" className="text-orange">·</span>
                    <a
                      href="https://www.facebook.com/chezflorent.bistro/"
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="link-underline"
                      aria-label="Facebook de Chez Florent (nouvel onglet)"
                    >
                      Facebook
                    </a>
                  </div>
                </motion.div>

                {/* Right: façade photo */}
                <motion.div
                  className="w-full lg:w-[45%]"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
                >
                  <div className="bg-bg-primary aspect-[4/5] overflow-hidden group ring-1 ring-bg-primary/15">
                    <img
                      src={photos.facade.url}
                      alt={photos.facade.alt}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  </div>
                  <span className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-bg-primary/75 mt-4 block text-right">
                    — Notre façade, 57 rue du Roi
                  </span>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Map */}
          <section className="bg-bg-primary pt-16 md:pt-20 pb-24 md:pb-28 px-6 md:px-12 relative">
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex items-end justify-between gap-4 mb-8">
                <div>
                  <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-orange mb-3">
                    <span aria-hidden="true">◦ </span>Sur la carte
                  </div>
                  <h2 className="font-serif text-cream text-[2rem] md:text-[2.75rem] leading-tight">
                    Comment nous rejoindre
                  </h2>
                </div>
                <a
                  href={MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-2 px-5 py-3 border border-orange text-orange hover:bg-orange hover:text-bg-primary transition-all duration-300 rounded-[2px] text-[0.72rem] font-medium tracking-[0.2em] uppercase whitespace-nowrap"
                >
                  Itinéraire <span aria-hidden="true">↗</span>
                </a>
              </div>
              <div className="w-full aspect-[16/10] md:aspect-[16/7] overflow-hidden ring-1 ring-cream/10 bg-bg-secondary">
                <iframe
                  title="Carte — Chez Florent, 57 Rue du Roi, Sorel-Tracy"
                  src={MAPS_EMBED}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full border-0 grayscale-[0.2] contrast-[1.05]"
                  allowFullScreen
                />
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
