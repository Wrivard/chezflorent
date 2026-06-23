import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion, AnimatePresence, useMotionValue } from "framer-motion";
import Lenis from 'lenis';
import {
  useGetMenu,
  useListEvents,
  useListHours,
  useListPhotos,
} from "@workspace/api-client-react";

export const EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];
export const EASE_SMOOTH: [number, number, number, number] = [0.22, 1, 0.36, 1];

// -----------------------------------------------------------------------------
// 1) PRELOADER
// -----------------------------------------------------------------------------
function Preloader({ onComplete }: { onComplete: () => void }) {
  const prefersReducedMotion = useReducedMotion();
  const DURATION_MS = 3600;

  useEffect(() => {
    if (prefersReducedMotion) {
      onComplete();
      return;
    }
    const timer = setTimeout(onComplete, DURATION_MS);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion, onComplete]);

  return (
    <motion.div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="fixed inset-0 z-[100] bg-bg-primary flex flex-col items-center justify-center overflow-hidden"
      initial={{ clipPath: "inset(0 0 0 0)" }}
      animate={{ clipPath: "inset(0 0 0 0)" }}
      exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.7, ease: EASE } }}
    >
      {/* Subtle radial warm glow behind the logo */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(216, 90, 44, 0.18), transparent 55%)",
        }}
      />

      {/* Centered logo — appears FIRST and holds alone for a moment */}
      <div className="relative">
        <motion.img
          src="/logo.png"
          alt="Chez Florent"
          className="block w-[min(72vw,460px)] h-auto relative z-10"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.05, ease: EASE_SMOOTH }}
        />
      </div>

      {/* Decorative thin frame — corner brackets (after logo settles) */}
      {[
        "top-8 left-8 border-t border-l",
        "top-8 right-8 border-t border-r",
        "bottom-8 left-8 border-b border-l",
        "bottom-8 right-8 border-b border-r",
      ].map((pos) => (
        <motion.span
          key={pos}
          aria-hidden="true"
          className={`absolute w-10 h-10 md:w-14 md:h-14 border-cream-soft/35 ${pos}`}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE_SMOOTH, delay: 1.2 }}
        />
      ))}

      {/* Top eyebrow (after logo holds) */}
      <motion.div
        className="absolute top-14 md:top-20 left-1/2 -translate-x-1/2 flex items-center gap-3 md:gap-4 text-[0.65rem] md:text-[0.72rem] tracking-[0.42em] uppercase text-cream-soft/70 font-sans whitespace-nowrap"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.4, ease: EASE_SMOOTH }}
      >
        <span className="hidden sm:inline-block w-8 h-px bg-cream-soft/40" aria-hidden="true" />
        <span aria-hidden="true">✶</span>
        <span>Bistro · Bar à vins</span>
        <span aria-hidden="true">✶</span>
        <span className="hidden sm:inline-block w-8 h-px bg-cream-soft/40" aria-hidden="true" />
      </motion.div>

      {/* Editorial tagline in serif italic */}
      <motion.div
        className="mt-8 md:mt-10 font-serif italic text-cream/90 text-lg md:text-2xl text-center px-8 max-w-md leading-snug"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.7, ease: EASE_SMOOTH }}
      >
        Cuisine généreuse, vins vivants.
      </motion.div>

      {/* Bottom location strip */}
      <motion.div
        className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[0.62rem] md:text-[0.7rem] tracking-[0.32em] uppercase text-cream-soft/55 font-sans whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2.1, ease: EASE_SMOOTH }}
      >
        <span>57 Rue du Roi</span>
        <span aria-hidden="true" className="text-orange/80">·</span>
        <span>Sorel-Tracy</span>
        <span aria-hidden="true" className="text-orange/80">·</span>
        <span>MMXXVI</span>
      </motion.div>

      {/* Progress bar bottom edge */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-cream-soft/12">
        <motion.div
          className="h-full bg-orange origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: DURATION_MS / 1000, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// PROGRESS BAR
// -----------------------------------------------------------------------------
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 h-[1px] bg-orange z-50 origin-left"
      style={{ scaleX: scrollYProgress, width: "100%" }}
    />
  );
}

// -----------------------------------------------------------------------------
// MAGNETIC BUTTON
// -----------------------------------------------------------------------------
function MagneticButton({ children, className, onClick, type = "button" }: { children: React.ReactNode, className?: string, onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void, type?: "button" | "submit" | "reset" }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Magnetic pull (30% strength)
    x.set(distanceX * 0.3);
    y.set(distanceY * 0.3);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className="inline-block relative"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        className={className}
        style={{ x: springX, y: springY }}
        animate={{ scale: isHovered ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.button>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// UTILS
// -----------------------------------------------------------------------------
function useActiveSection() {
  const [activeSection, setActiveSection] = useState<string>("accueil");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-10% 0px -50% 0px" }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return activeSection;
}

// -----------------------------------------------------------------------------
// COMPONENTS
// -----------------------------------------------------------------------------

// Live opening-status hook based on the actual schedule
//   Mon: closed · Tue–Thu 17h–22h · Fri–Sat 17h–23h · Sun 17h–21h
const SCHEDULE: Record<number, { open: number; close: number } | null> = {
  0: { open: 17, close: 21 }, // Sunday
  1: null,                    // Monday — closed
  2: { open: 17, close: 22 }, // Tuesday
  3: { open: 17, close: 22 }, // Wednesday
  4: { open: 17, close: 22 }, // Thursday
  5: { open: 17, close: 23 }, // Friday
  6: { open: 17, close: 23 }, // Saturday
};
const DAY_NAMES_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

function useOpenStatus(): { open: boolean; label: string } {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const schedule = useScheduleData();
  const day = now.getDay();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const today = schedule[day];

  if (today) {
    if (totalMinutes >= today.open * 60 && totalMinutes < today.close * 60) {
      return { open: true, label: `Ouvert · ferme à ${today.close}h` };
    }
    // Open day but before opening time
    if (totalMinutes < today.open * 60) {
      return { open: false, label: `Fermé · ouvre aujourd'hui ${today.open}h` };
    }
  }

  // After closing time today, or closed all day — find next open day
  for (let i = 1; i <= 7; i++) {
    const nextDayIdx = (day + i) % 7;
    const next = schedule[nextDayIdx];
    if (next) {
      const dayLabel = i === 1 ? "demain" : DAY_NAMES_FR[nextDayIdx];
      return { open: false, label: `Fermé · ouvre ${dayLabel} ${next.open}h` };
    }
  }
  return { open: false, label: "Fermé" };
}

export function Navbar({
  activeSection,
  onEventsPage = false,
  onMenuPage = false,
  onAboutPage = false,
  onContactPage = false,
}: {
  activeSection: string;
  onEventsPage?: boolean;
  onMenuPage?: boolean;
  onAboutPage?: boolean;
  onContactPage?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const status = useOpenStatus();
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const onSubPage = onEventsPage || onMenuPage || onAboutPage || onContactPage;
  const sectionHref = (id: string) =>
    onSubPage ? `${base}/#${id}` : `#${id}`;
  const homeHref = onSubPage ? `${base}/` : "#accueil";
  const eventsHref = `${base}/evenements`;
  const menuHref = `${base}/menu`;
  const aboutHref = `${base}/a-propos`;
  const contactHref = `${base}/contact`;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? "bg-bg-primary/90 backdrop-blur-md border-b border-border py-2"
            : "bg-transparent border-b border-transparent py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <a
            href={homeHref}
            aria-label="Chez Florent — Accueil"
            className="flex items-center text-cream hover:opacity-80 transition-opacity shrink-0"
          >
            <img
              src="/logo.png"
              alt="Chez Florent logo"
              className={`object-contain transition-all duration-500 ${scrolled ? "h-20 md:h-24" : "h-24 md:h-32"}`}
            />
          </a>

          {/* Right cluster — status + nav grouped together with deliberate spacing */}
          <div className="flex items-center gap-5 md:gap-10">
            {/* Live status badge — visible on all sizes */}
            <a
              href={sectionHref("contact")}
              aria-label={`Statut du restaurant : ${status.label}`}
              className="flex items-center gap-2.5 px-3 md:px-3.5 py-1.5 md:py-2 rounded-full border border-cream-soft/25 bg-bg-primary/40 backdrop-blur-sm text-[0.65rem] md:text-[0.7rem] font-medium tracking-[0.18em] uppercase text-cream hover:text-cream hover:border-cream-soft/40 transition-colors group shrink-0"
            >
              <span className="relative inline-flex w-1.5 h-1.5 shrink-0" aria-hidden="true">
                {status.open && (
                  <span className="absolute inset-0 rounded-full bg-orange opacity-60 animate-ping"></span>
                )}
                <span className={`relative inline-block w-1.5 h-1.5 rounded-full ${status.open ? 'bg-orange' : 'bg-cream-soft/60'}`}></span>
              </span>
              <span className="hidden sm:inline">{status.label}</span>
              <span className="sm:hidden">{status.open ? 'Ouvert' : 'Fermé'}</span>
            </a>

            <div className="hidden md:flex items-center gap-7 lg:gap-8 text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft">
              <a href={homeHref} className={`link-underline hover:text-cream transition-colors ${!onSubPage && activeSection === "accueil" ? "active text-cream" : ""}`}>Accueil</a>
              <a href={aboutHref} className={`link-underline hover:text-cream transition-colors ${onAboutPage ? "active text-cream" : ""}`}>À propos</a>
              <a href={menuHref} className={`link-underline hover:text-cream transition-colors ${onMenuPage ? "active text-cream" : ""}`}>Menu</a>
              <a href={eventsHref} className={`link-underline hover:text-cream transition-colors ${onEventsPage ? "active text-cream" : ""}`}>Agenda</a>
              <a href={contactHref} className={`link-underline hover:text-cream transition-colors ${onContactPage ? "active text-cream" : ""}`}>Contact</a>
              <a
                href={sectionHref("reservation")}
                className="px-5 py-2 border border-orange text-orange hover:bg-orange hover:text-bg-primary transition-all duration-300 rounded-[2px]"
              >
                Réserver
              </a>
            </div>

            <button
              className="md:hidden text-cream-soft p-2 focus-visible:outline-2 focus-visible:outline-orange"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: EASE_SMOOTH }}
            className="fixed inset-0 z-50 bg-bg-primary pt-32 px-6 pb-6 flex flex-col"
          >
            <div className="flex justify-end mb-8">
              <button onClick={closeMenu} className="text-cream p-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-8 text-3xl font-serif text-cream">
              <a href={homeHref} onClick={closeMenu} className="hover:text-orange transition-colors">Accueil</a>
              <a href={aboutHref} onClick={closeMenu} className="hover:text-orange transition-colors">À propos</a>
              <a href={menuHref} onClick={closeMenu} className="hover:text-orange transition-colors">L'ardoise</a>
              <a href={eventsHref} onClick={closeMenu} className="hover:text-orange transition-colors">Agenda</a>
              <a href={contactHref} onClick={closeMenu} className="hover:text-orange transition-colors">Nous trouver</a>
              <a href={sectionHref("reservation")} onClick={closeMenu} className="hover:text-orange transition-colors">Réserver une table</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function SectionMarker({ number, tone = "dark" }: { number: string; tone?: "dark" | "light" }) {
  const colorClass = tone === "light" ? "text-bg-primary/15" : "text-cream/10";
  const blendClass = tone === "light" ? "mix-blend-multiply" : "mix-blend-difference";
  return (
    <div className={`absolute top-16 right-6 md:right-12 font-display text-[clamp(4rem,10vw,8rem)] ${colorClass} leading-[0.9] ${blendClass} pointer-events-none select-none z-0`}>
      {number}
    </div>
  );
}

function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const status = useOpenStatus();
  const photos = usePhotos();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.5
      }
    }
  };

  const lineVariants = {
    hidden: { clipPath: "inset(0 0 100% 0)", y: 20 },
    visible: { clipPath: "inset(0 0 0 0)", y: 0, transition: { duration: 0.8, ease: EASE } }
  };

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1, ease: EASE_SMOOTH } }
  };

  return (
    <section id="accueil" className="relative min-h-[100dvh] flex flex-col justify-between overflow-hidden pt-44 md:pt-52 pb-0">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-bg-primary">
        <div 
          className="absolute inset-0 bg-cover bg-center animate-kenburns origin-center"
          style={{
            backgroundImage: `url('${photos.hero.url}')`,
            filter: "saturate(1.1) contrast(1.1)"
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(14,31,28,0.85) 0%, rgba(14,31,28,0.55) 40%, rgba(14,31,28,0.9) 100%)"
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, transparent 40%, rgba(14,31,28,0.6) 100%)"
          }}
        />
      </div>

      <div className="relative z-10 px-6 md:px-12 max-w-7xl w-full mx-auto flex-1 flex flex-col justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full relative"
        >
          {/* Eyebrows */}
          <div className="flex justify-between items-start mb-16">
            <motion.div variants={fadeVariants} className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft">
              <span aria-hidden="true" className="text-cream-soft/45 mr-3">✶</span>BISTRO — SOREL-TRACY / DEPUIS 2026
            </motion.div>
            
            <motion.div variants={fadeVariants} className="hidden md:flex flex-col gap-2 text-[0.65rem] font-medium tracking-[0.3em] uppercase text-cream-soft text-right">
              <span>N° 01</span>
              <span>—</span>
              <span>ARDOISE</span>
              <span>DU SOIR</span>
            </motion.div>
          </div>

          {/* Broken Type Headline */}
          <h1 className="font-serif font-light text-cream leading-[1.08] pb-[0.18em] text-[clamp(4.5rem,11vw,11rem)] mb-16 w-full">
            <motion.div variants={lineVariants} className="block italic">
              Une cuisine
            </motion.div>
            <motion.div variants={lineVariants} className="block italic ml-[8vw] md:ml-[12vw]">
              qui raconte
            </motion.div>
            <motion.div variants={lineVariants} className="block ml-[10vw] md:ml-[20vw] pr-[0.4em]">
              des <span className="relative inline-block italic pb-[0.28em] pr-[0.15em]">
                histoires.
                <motion.svg 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 1.5, ease: EASE_SMOOTH }}
                  className="absolute left-0 -bottom-3 md:-bottom-5 w-[92%] h-auto text-orange pointer-events-none" 
                  viewBox="0 0 200 15" 
                  fill="none" 
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M2 10C50 -2 150 -2 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </motion.svg>
              </span>
            </motion.div>
          </h1>

          {/* Bottom layout — tagline left, CTAs right, status under tagline */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mt-12 mb-20">
            <motion.div variants={fadeVariants} className="max-w-[420px] order-2 md:order-1">
              <p className="font-sans font-light text-[1.0625rem] leading-[1.7] text-cream-soft mb-3">
                « L'ardoise change selon les humeurs du chef et les arrivages du marché. »
              </p>
              <p className="font-sans text-[0.95rem] leading-[1.6] text-cream/80 mb-4">
                Bistro du quartier, 75 places assises, 7 jours sur 7.
              </p>
              <div className="hidden md:inline-flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.2em] uppercase text-cream-soft">
                <span className="relative inline-flex w-1.5 h-1.5" aria-hidden="true">
                  {status.open && <span className="absolute inset-0 rounded-full bg-orange opacity-60 animate-ping"></span>}
                  <span className={`relative inline-block w-1.5 h-1.5 rounded-full ${status.open ? 'bg-orange' : 'bg-cream-soft/60'}`}></span>
                </span>
                {status.label} <span className="text-cream-soft/70">— en ce moment</span>
              </div>
            </motion.div>

            <motion.div variants={fadeVariants} className="flex flex-col sm:flex-row gap-3 order-1 md:order-2 shrink-0">
              <a
                href="#reservation"
                className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-orange text-bg-primary font-medium tracking-[0.05em] transition-transform duration-300 hover:bg-orange-dark hover:scale-[1.02] rounded-[2px]"
              >
                Réserver une table
                <span aria-hidden="true">↘</span>
              </a>
              <a
                href="#menu"
                className="inline-flex justify-center items-center gap-2 px-8 py-4 border border-cream/40 text-cream font-medium tracking-[0.05em] hover:border-cream hover:bg-cream/5 transition-all duration-300 rounded-[2px]"
              >
                Voir l'ardoise
                <span aria-hidden="true">→</span>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Marquee Band at bottom */}
      <div className="relative z-20 w-full overflow-hidden bg-bg-primary/60 backdrop-blur-md py-5 border-t border-border">
        <div className="flex whitespace-nowrap animate-marquee w-max items-center">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center">
              <span className="font-serif italic text-2xl text-cream px-6">ARDOISE QUI CHANGE</span>
              <span aria-hidden="true" className="text-cream-soft/45 text-sm">✶</span>
              <span className="font-serif italic text-2xl text-cream px-6">PRODUITS LOCAUX</span>
              <span aria-hidden="true" className="text-cream-soft/45 text-sm">✶</span>
              <span className="font-serif italic text-2xl text-cream px-6">TABLE ARTISANALE</span>
              <span aria-hidden="true" className="text-cream-soft/45 text-sm">✶</span>
              <span className="font-serif italic text-2xl text-cream px-6">DEPUIS 2026</span>
              <span aria-hidden="true" className="text-cream-soft/45 text-sm">✶</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  const { scrollYProgress } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  const photos = usePhotos();
  const ySlow = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 200]);
  const yFast = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -150]);

  const quoteWords = "« On vient ici pour rester. »".split(" ");

  return (
    <section id="a-propos" className="bg-cream-soft pt-32 pb-32 overflow-hidden relative">
      <SectionMarker number="02" tone="light" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-bg-primary/60 mb-6">
          02 — LA MAISON
        </div>

        {/* Massive Pull Quote — dark green text on cream */}
        <h2 className="font-serif italic font-light text-bg-primary leading-[1.1] pb-[0.22em] text-[clamp(4rem,11vw,10rem)] mb-10 max-w-6xl flex flex-wrap gap-x-[0.3em] gap-y-4">
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

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="font-sans italic text-bg-primary/70 max-w-2xl text-base md:text-lg mb-24"
        >
          Un bistro de quartier, une certaine idée du temps qui passe.
        </motion.p>

        {/* Asymmetric Image Stack — clean stack on mobile, editorial triptych on md+ */}
        <div className="relative mb-24 md:mb-32 md:min-h-[125vh] lg:min-h-[100vh] flex flex-col gap-6 md:block md:gap-0">
          <motion.div 
            style={{ y: ySlow }}
            className="w-[88%] md:w-[48%] lg:w-[50%] aspect-[4/3] overflow-hidden relative md:z-10 ring-1 ring-bg-primary/10"
          >
            <img src={photos.about1.url} alt={photos.about1.alt} className="w-full h-full object-cover" />
          </motion.div>
          
          <motion.div 
            style={{ y: yFast }}
            className="w-[68%] md:w-[34%] lg:w-[30%] aspect-[3/4] overflow-hidden relative md:absolute md:top-[8%] lg:top-[18%] md:right-0 md:z-20 self-end md:self-auto md:mt-0 ring-1 ring-bg-primary/10"
          >
            <img src={photos.about2.url} alt={photos.about2.alt} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
            className="w-[78%] md:w-[42%] lg:w-[38%] aspect-[5/4] overflow-hidden relative md:absolute md:bottom-0 md:left-[34%] lg:left-[26%] md:z-[15] ml-[8%] md:ml-0 ring-1 ring-bg-primary/10"
          >
            <img src={photos.about3.url} alt={photos.about3.alt} className="w-full h-full object-cover" />
          </motion.div>
        </div>

        {/* Text Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl ml-auto">
          <motion.figure
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="m-0"
          >
            <blockquote className="font-serif font-normal text-bg-primary text-[1.125rem] leading-[1.8]">
              « Florent n'est pas seulement un nom au-dessus de la porte. C'est une certaine idée du bistro : celle où l'on s'attable sans cérémonie, où le vin se verse au pichet, et où la cuisine ne triche jamais avec ses produits. »
            </blockquote>
            <figcaption className="mt-4 font-sans text-[0.75rem] tracking-[0.2em] uppercase text-bg-primary/65 flex items-center gap-3">
              <span aria-hidden="true" className="inline-block w-8 h-px bg-orange/70" />
              Florent Tremblay
              <span aria-hidden="true" className="text-orange/70">·</span>
              <span className="font-serif normal-case italic tracking-normal text-bg-primary/70">Propriétaire</span>
            </figcaption>
          </motion.figure>
          <motion.figure
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="m-0"
          >
            <blockquote className="font-sans font-light text-bg-primary/80 text-[1rem] leading-[1.8]">
              « On travaille avec des fermiers qu'on appelle par leur prénom — la Ferme J.N Beauchemin pour les saucisses, Fromagerie Fuoco pour la bufarella, Les Cowboys du BBQ pour le brisket. Le reste, c'est de l'huile de coude et du temps. »
            </blockquote>
            <figcaption className="mt-4 font-sans text-[0.75rem] tracking-[0.2em] uppercase text-bg-primary/65 flex items-center gap-3">
              <span aria-hidden="true" className="inline-block w-8 h-px bg-orange/70" />
              Annie Vincent
              <span aria-hidden="true" className="text-orange/70">·</span>
              <span className="font-serif normal-case italic tracking-normal text-bg-primary/70">Sommelière</span>
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}

export type Dish = { name: string; price: string; desc: string; image: string };
export type MenuCategory = { id: string; label: string; tagline: string; dishes: Dish[] };

const menuCategories: MenuCategory[] = [
  {
    id: "partager",
    label: "À partager",
    tagline: "Pour ouvrir la soirée — un verre, une planche, le temps qui ralentit.",
    dishes: [
      { name: "Trempette de poireaux rôtis", price: "16,95 $", desc: "Bacon fumé, servi avec pain plat gratiné.", image: "naan-dip.jpg" },
      { name: "Bufarella potato", price: "17,95 $", desc: "Boule de fromage bufarella (Fromagerie Fuoco) accompagnée de hummus de patate douce, coulis de bleuets à l'érable, huile épicée, menthe et crumble au parmesan. Servi avec pain naan grillé.", image: "bufarella-mint.jpg" },
      { name: "Assiette de charcuterie", price: "35,95 $", desc: "Calabrese, prosciutto, saucissons secs, olives méli-mélo, fromages du moment, pickle d'oignons rouges, petits cornichons. Servi avec pain et croutons.", image: "sandwich-mac.jpg" },
    ],
  },
  {
    id: "plats",
    label: "Les plats",
    tagline: "Le coeur de l'ardoise — sandwichs travaillés, plats roboratifs, à manger sans manières.",
    dishes: [
      { name: "Grilled cheese sur baguette", price: "5,95 $ / 11,95 $", desc: "Provolone, mozzarella, fromage jaune, beurre à l'ail.", image: "tower-sandwich.jpg" },
      { name: "Feuilleté jambon gruyère", price: "9,95 $ / 19,95 $", desc: "Pâte feuilletée, jambon, fromage gruyère, sauce blanche crémeuse avec pomme de terre, poireaux.", image: "feuillete-ham.jpg" },
      { name: "Miche de porc", price: "23,95 $", desc: "Miche de pain artisanale, porc effiloché maison, fromage à la crème épicé aux cornichons, laitue iceberg, moutarde au miel. Servi avec salade de carottes crémeuse.", image: "miche-porc.jpg" },
      { name: "« Le Rhé-Actif »", price: "24,95 $", desc: "Pain ciabata, provolone, mortadelle, calabrese, capicollo, salade, tomates, oignons rouges, mayonnaise thaï. Servi avec salade de patates maison.", image: "sandwich-mac.jpg" },
      { name: "Pizza « Vodka » 🌶🌶🌶", price: "25,95 $", desc: "Sauce rosée à la vodka, saucisses épicées (Ferme J.N Beauchemin), oignons croustillants, mozzarella, huile à l'ail, tomates confites au gras de canard.", image: "pizza-oven.jpg" },
      { name: "« Philly T »", price: "25,95 $", desc: "Pain baguette, fromages (jaune, mozzarella, provolone), poivrons rouges, oignons blancs, brisket (Les Cowboys du BBQ), mayonnaise épicée. Servi avec salade de pâte maison et cup de sauce BBQ.", image: "tower-sandwich.jpg" },
    ],
  },
  {
    id: "bar",
    label: "Au bar",
    tagline: "Cocktails maison, vins choisis, bières du coin — le bar reste ouvert tard.",
    dishes: [
      { name: "Sorel-Spritz", price: "14,00 $", desc: "Vin pétillant, Aperol, sirop maison aux canneberges du Lac St-Pierre, branche de romarin frais.", image: "tap-pour.jpg" },
      { name: "Old Fashioned du Florent", price: "16,00 $", desc: "Rye canadien, sirop d'érable d'Yamaska, bitter aux noix grillées, zeste d'orange brûlé au chalumeau.", image: "florent-glass.jpg" },
      { name: "Negroni Sapin", price: "15,00 $", desc: "Gin local Québec Distillerie, Campari, vermouth maison infusé sapinette des bois — boisé, presque résineux.", image: "florent-glass.jpg" },
      { name: "Vin de la maison", price: "9,00 $ / 38,00 $", desc: "Rouge ou blanc, sélection rotative du sommelier — au verre ou à la bouteille. Demandez la suggestion.", image: "tap-pour.jpg" },
      { name: "Pinte Riverbend", price: "8,00 $", desc: "Blonde houblonnée brassée à Sorel par Riverbend Brewing Co. — locale, fraîche, désaltérante.", image: "florent-glass.jpg" },
      { name: "Espresso & digestif", price: "5,00 $ / 9,00 $", desc: "Café espresso bien serré, accompagné d'un Amaro maison ou d'un cognac à l'ancienne. Pour finir en beauté.", image: "interior-bar.jpg" },
    ],
  },
];

function Menu() {
  const categories = useMenuCategoriesData();
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0].id);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? categories[0];
  const dishes = activeCategory.dishes;
  const activeDish = dishes[Math.min(activeIndex, dishes.length - 1)];

  const handleCategoryChange = (id: string) => {
    setActiveCategoryId(id);
    setActiveIndex(0);
  };

  return (
    <>
      <div className="w-full overflow-hidden py-4 bg-bg-primary border-t border-border">
        <div className="flex whitespace-nowrap animate-marquee-slow w-max">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center text-[0.875rem] font-medium tracking-[0.2em] uppercase text-cream-soft">
              <span className="px-8">★ FERME J.N BEAUCHEMIN</span>
              <span className="px-8">★ FROMAGERIE FUOCO</span>
              <span className="px-8">★ LES COWBOYS DU BBQ</span>
              <span className="px-8">★ HUILE D'OLIVE QC</span>
            </div>
          ))}
        </div>
      </div>

      <section id="menu" className="bg-bg-primary py-32 relative">
        <SectionMarker number="03" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          
          <div className="mb-16">
            <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-6">
              03 — Au menu ce soir
            </div>
            
            {/* Image-through-text reveal (with @supports fallback in CSS) */}
            <h2 className="ardoise-clip font-display text-[clamp(4.5rem,12vw,12rem)] leading-[1.2] pb-[0.3em] pl-[0.08em] mb-8 max-w-full overflow-visible">
              L'ardoise
            </h2>
            <AnimatePresence mode="wait">
              <motion.p
                key={activeCategory.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="font-sans italic text-cream-soft/80 max-w-2xl text-lg"
              >
                {activeCategory.tagline}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Category tabs */}
          <div
            role="tablist"
            aria-label="Catégories du menu"
            className="flex gap-1 md:gap-3 mb-12 border-b border-border overflow-x-auto no-scrollbar"
          >
            {categories.map((c) => {
              const isActive = c.id === activeCategoryId;
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`menu-panel-${c.id}`}
                  id={`menu-tab-${c.id}`}
                  onClick={() => handleCategoryChange(c.id)}
                  className={`relative px-4 md:px-6 py-4 text-[0.85rem] font-medium tracking-[0.18em] uppercase transition-colors whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-inset ${
                    isActive ? "text-cream" : "text-cream-soft/75 hover:text-cream"
                  }`}
                >
                  <span className="flex items-baseline gap-2">
                    {c.label}
                    <span className={`font-serif italic text-[0.7rem] tracking-normal normal-case transition-colors ${isActive ? 'text-orange' : 'text-cream-soft/75'}`}>
                      {String(c.dishes.length).padStart(2, '0')}
                    </span>
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="menu-tab-underline"
                      className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-orange"
                      transition={{ duration: 0.4, ease: EASE_SMOOTH }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Two-column: list left, sticky photo right */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-8 lg:gap-16 items-start">
            
            {/* Left: dish list */}
            <div
              role="tabpanel"
              id={`menu-panel-${activeCategory.id}`}
              aria-labelledby={`menu-tab-${activeCategory.id}`}
              className="grid grid-cols-1"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="grid grid-cols-1"
                >
                  {dishes.map((dish, i) => {
                    const isActive = i === activeIndex;
                    return (
                      <div
                        key={`${activeCategory.id}-${i}`}
                        className={`group grid grid-cols-[40px_1fr_auto] md:grid-cols-[60px_1fr_auto] gap-4 md:gap-8 py-8 border-b border-border cursor-default transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-inset ${isActive ? "bg-bg-secondary/40" : "hover:bg-bg-secondary/30"} px-3 md:px-6`}
                        onMouseEnter={() => setActiveIndex(i)}
                        onFocus={() => setActiveIndex(i)}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isActive}
                        aria-label={`Aperçu de ${dish.name}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setActiveIndex(i);
                          }
                        }}
                      >
                        <div className={`font-serif italic text-lg md:text-xl pt-1 transition-colors ${isActive ? "text-orange" : "text-orange/70"}`}>
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <motion.div 
                          className="flex flex-col gap-1"
                          animate={{ x: isActive ? 12 : 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <h3 className="font-serif font-semibold text-[1.5rem] md:text-[1.75rem] text-cream leading-tight">
                            {dish.name}
                          </h3>
                          <p className="font-sans font-light italic text-cream-soft/85 max-w-[600px] leading-relaxed text-sm md:text-base">
                            {dish.desc}
                          </p>
                        </motion.div>
                        <div className="font-serif font-semibold text-[1.25rem] md:text-[1.5rem] text-orange whitespace-nowrap pt-1">
                          {dish.price}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: sticky photo collage that cross-fades on dish focus */}
            <div className="lg:sticky lg:top-32 w-full">
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-bg-secondary ring-1 ring-cream/10">
                <AnimatePresence mode="sync">
                  <motion.img
                    key={activeDish.image}
                    src={imgSrc(activeDish.image)}
                    alt={activeDish.name}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                {/* Bottom gradient + caption overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/40 to-transparent p-6 pt-16 z-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="flex items-end justify-between gap-4"
                    >
                      <div>
                        <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-orange mb-1">
                          ◦ {String(activeIndex + 1).padStart(2, '0')} — Aperçu
                        </div>
                        <div className="font-display text-cream text-[1.75rem] leading-none">
                          {activeDish.name.replace(/«\s*|\s*»/g, "")}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[0.7rem] font-medium tracking-[0.2em] uppercase text-cream-soft/75">
                <span>— Glissez sur un plat</span>
                <span className="font-serif italic normal-case tracking-normal text-cream-soft/85">{String(activeIndex + 1).padStart(2, '0')} / {String(dishes.length).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="font-sans italic text-cream-soft/85 text-sm">
              « L'ardoise change. Suivez-nous sur les réseaux pour voir les ajouts du chef. »
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

type PatronVoice = {
  quote: string;
  name: string;
  context: string;
  source: string;
  date: string;
  image: string;
};

const PATRON_VOICES: PatronVoice[] = [
  {
    quote: "Le grilled-cheese / vin orange du jeudi soir, c'est devenu notre rituel. Ils nous accueillent comme à la maison — sauf qu'à la maison, on ne mange pas aussi bien.",
    name: "Marie-Pier Lafontaine",
    context: "Sorel-Tracy · Habituée du jeudi",
    source: "Google",
    date: "Mars 2026",
    image: "tap-pour.jpg",
  },
  {
    quote: "Sans réservation un mardi, Florent nous a placés au comptoir avec un pichet de gamay et une planche. Trois heures plus tard, on parlait encore avec la table d'à côté.",
    name: "Étienne Caron",
    context: "Trois-Rivières · Premier passage",
    source: "Tripadvisor",
    date: "Janvier 2026",
    image: "interior-bar.jpg",
  },
  {
    quote: "La pizza Vodka. Trois fois par mois. Pas la peine d'en dire plus.",
    name: "Jean-Sébastien Boucher",
    context: "Saint-Hyacinthe · 14 visites",
    source: "Instagram",
    date: "Avril 2026",
    image: "pizza-oven.jpg",
  },
];

const VOICE_SLOTS = ["voice1", "voice2", "voice3"] as const;

function Testimonials() {
  const photos = usePhotos();
  return (
    <section id="voix" className="bg-bg-primary pt-32 pb-32 relative overflow-hidden">
      <SectionMarker number="—" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 mb-20 md:mb-24">
        <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-6">
          <span aria-hidden="true">◦ </span>Interlude — Voix de la salle
        </div>
        <h2 className="font-display text-cream leading-[1.18] pb-[0.28em] pl-[0.06em] text-[clamp(3.5rem,10vw,9rem)] mb-8">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="block"
          >
            Bouche à oreille
          </motion.span>
        </h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="font-serif italic text-cream-soft/85 max-w-2xl text-lg md:text-xl"
        >
          Quelques voix glanées au comptoir, dans la presse, sur le téléphone du midi.
        </motion.p>
      </div>

      {/* Featured press critique — split editorial layout */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 mb-24 md:mb-32">
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-center border-y border-border py-12 md:py-16"
        >
          <div className="md:col-span-7 relative">
            <div className="aspect-[5/4] overflow-hidden ring-1 ring-cream/10">
              <img
                src={photos.press.url}
                alt={photos.press.alt}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Press stamp */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-cream-soft text-bg-primary px-4 py-2 font-sans text-[0.65rem] md:text-[0.7rem] font-medium tracking-[0.22em] uppercase rotate-2 shadow-lg">
              <span aria-hidden="true">✶ </span>Presse · 2025
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="text-[0.7rem] font-medium tracking-[0.22em] uppercase text-orange mb-5">
              <span aria-hidden="true">✶ </span>Critique gastronomique
            </div>
            <blockquote className="font-serif italic font-light text-cream leading-[1.18] text-[clamp(1.6rem,2.5vw,2.2rem)] mb-8">
              <span aria-hidden="true" className="text-orange/70 select-none">«&nbsp;</span>
              Une cuisine qui ne joue pas la carte du « bistro chic », mais celle, plus rare, de la générosité tenue jusqu'au bout. À 19h45 un samedi, c'est une vraie réussite.
              <span aria-hidden="true" className="text-orange/70 select-none">&nbsp;»</span>
            </blockquote>
            <cite className="not-italic block">
              <div className="font-serif text-cream text-lg md:text-xl">Geneviève Forget</div>
              <div className="font-sans text-[0.72rem] tracking-[0.22em] uppercase text-cream-soft/80 mt-2 flex items-center gap-3">
                <span aria-hidden="true" className="inline-block w-8 h-px bg-orange/70" />
                Le Devoir
                <span aria-hidden="true" className="text-orange/70">·</span>
                12 mai 2025
              </div>
            </cite>
          </div>
        </motion.article>
      </div>

      {/* Patron voices — asymmetric staggered grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-14">
          {PATRON_VOICES.map((v, i) => (
            <motion.article
              key={v.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.12 }}
              className={`flex flex-col group ${
                i === 0 ? "" : i === 1 ? "md:mt-8 lg:mt-16" : "md:mt-16 lg:mt-32"
              }`}
            >
              {/* Photo with rating overlay */}
              <div className="relative aspect-[4/5] overflow-hidden ring-1 ring-cream/10 mb-6">
                <img
                  src={photos[VOICE_SLOTS[i]].url}
                  alt={photos[VOICE_SLOTS[i]].alt}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-bg-primary/85 backdrop-blur-sm px-3 py-1.5">
                  <span
                    className="text-orange tracking-[0.15em] text-sm leading-none"
                    aria-label="5 étoiles sur 5"
                  >
                    ★★★★★
                  </span>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="font-serif italic text-cream/95 text-[1.08rem] md:text-[1.18rem] leading-[1.55] mb-6">
                <span aria-hidden="true" className="text-orange/80">«&nbsp;</span>
                {v.quote}
                <span aria-hidden="true" className="text-orange/80">&nbsp;»</span>
              </blockquote>

              {/* Attribution */}
              <div className="mt-auto pt-5 border-t border-border">
                <div className="font-serif text-cream text-base md:text-lg leading-tight">
                  {v.name}
                </div>
                <div className="font-sans italic text-cream-soft/80 text-[0.85rem] mt-1.5">
                  {v.context}
                </div>
                <div className="flex items-center gap-3 mt-3 text-[0.7rem] font-medium tracking-[0.22em] uppercase text-cream-soft/70">
                  <span aria-hidden="true" className="inline-block w-6 h-px bg-orange/60" />
                  <span>{v.source}</span>
                  <span aria-hidden="true" className="text-orange/60">·</span>
                  <span>{v.date}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export type AgendaEvent = {
  id: string;
  date: { day: string; month: string };
  isoDate: string;
  title: string;
  desc: string;
  tag: string;
  soldOut?: boolean;
};

const agendaEvents: AgendaEvent[] = [
  { id: "sapinage",   date: { day: "30", month: "AVR" },  isoDate: "2026-04-30", title: "Soirée Cocktails du Sapinage", desc: "Cinq cocktails signature au sapin baumier, à découvrir au 5 à 7. Bouchées chaudes incluses.", tag: "5 à 7 · 17h–19h" },
  { id: "jazz",       date: { day: "09", month: "MAI" },  isoDate: "2026-05-09", title: "Trio Jazz Manouche", desc: "Trois instrumentistes du Sud-Ouest, en visite pour une soirée. Entrée libre, bon vin recommandé.", tag: "Live · 20h" },
  { id: "fete-meres", date: { day: "17", month: "MAI" },  isoDate: "2026-05-17", title: "Brunch — Fête des mères", desc: "Menu 4 services, mimosas maison, places limitées. Réservation fortement suggérée.", tag: "Menu spécial · 38 $", soldOut: true },
  { id: "huitres",    date: { day: "23", month: "MAI" },  isoDate: "2026-05-23", title: "Huîtres & bulles", desc: "Trois variétés de la Côte-Nord, accord avec champagnes et pétillants québécois.", tag: "Soirée · 19h" },
  { id: "open-mic",   date: { day: "06", month: "JUIN" }, isoDate: "2026-06-06", title: "Open Mic — Poésie & guitare", desc: "Soirée micro ouvert, ambiance feutrée. Inscrivez-vous sur place.", tag: "Acoustique · 20h" },
  { id: "fete-musique", date: { day: "21", month: "JUIN" }, isoDate: "2026-06-21", title: "Fête de la musique", desc: "Buffet québécois, DJ jusqu'à 1h. La devanture devient une terrasse-piste.", tag: "Toute la soirée" },
];

// -----------------------------------------------------------------------------
// CMS DATA HOOKS — read from the API, fall back to the constants above so the
// public site always renders even if the API is unreachable.
// -----------------------------------------------------------------------------
const MONTHS_FR = [
  "JANV", "FÉVR", "MARS", "AVR", "MAI", "JUIN",
  "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC",
];
const DAY_FULL_FR = [
  "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi",
];

// Resolve an image reference. Stored values may be full paths ("/images/x.jpg",
// "/api/uploads/...", "https://...") or bare filenames from the legacy constants.
export function imgSrc(image: string): string {
  if (!image) return "";
  if (image.startsWith("/") || image.startsWith("http")) return image;
  return `/images/${image}`;
}

export function useMenuCategoriesData(): MenuCategory[] {
  const { data } = useGetMenu();
  if (!data || data.length === 0) return menuCategories;
  return data.map((c) => ({
    id: c.slug,
    label: c.label,
    tagline: c.tagline,
    dishes: c.items.map((it) => ({
      name: it.name,
      price: it.price,
      desc: it.description,
      image: it.image ?? "",
    })),
  }));
}

export function useAgendaEventsData(): AgendaEvent[] {
  const { data } = useListEvents();
  if (!data || data.length === 0) return agendaEvents;
  return data.map((e) => {
    const parts = e.isoDate.split("-");
    const monthIdx = (Number(parts[1]) || 1) - 1;
    return {
      id: String(e.id),
      date: { day: parts[2] ?? "", month: MONTHS_FR[monthIdx] ?? "" },
      isoDate: e.isoDate,
      title: e.title,
      desc: e.description,
      tag: e.tag,
      soldOut: e.soldOut,
    };
  });
}

type ScheduleMap = Record<number, { open: number; close: number } | null>;

function useScheduleData(): ScheduleMap {
  const { data } = useListHours();
  if (!data || data.length === 0) return SCHEDULE;
  const out: ScheduleMap = {};
  for (const row of data) {
    out[row.dayOfWeek] =
      row.closed || row.openHour == null || row.closeHour == null
        ? null
        : { open: row.openHour, close: row.closeHour };
  }
  for (let i = 0; i < 7; i++) {
    if (!(i in out)) out[i] = SCHEDULE[i] ?? null;
  }
  return out;
}

// Builds the marquee strings by grouping consecutive days that share hours.
export function useHoursItems(): string[] {
  const schedule = useScheduleData();
  const order = [2, 3, 4, 5, 6, 0, 1]; // Tue → Sun, then Mon
  const groups: { days: number[]; band: { open: number; close: number } | null }[] = [];
  for (const day of order) {
    const band = schedule[day] ?? null;
    const last = groups[groups.length - 1];
    const same =
      last &&
      ((last.band === null && band === null) ||
        (!!last.band &&
          !!band &&
          last.band.open === band.open &&
          last.band.close === band.close));
    if (same) last.days.push(day);
    else groups.push({ days: [day], band });
  }
  return groups.map((g) => {
    const first = DAY_FULL_FR[g.days[0]];
    const lastD = DAY_FULL_FR[g.days[g.days.length - 1]];
    const span = g.days.length === 1 ? first : `${first} au ${lastD}`;
    if (!g.band) {
      return g.days.length === 1 ? `Fermé le ${first}` : `Fermé ${first} au ${lastD}`;
    }
    return `${span}  ·  ${g.band.open}h – ${g.band.close}h`;
  });
}

type PhotoMap = Record<string, { url: string; alt: string }>;
const PHOTO_FALLBACK: PhotoMap = {
  hero: { url: "/images/interior-bar.jpg", alt: "Salle à manger de Chez Florent" },
  about1: { url: "/images/tap-pour.jpg", alt: "Service au comptoir Chez Florent" },
  about2: { url: "/images/florent-glass.jpg", alt: "Verre signature Chez Florent" },
  about3: { url: "/images/facade-pizza.jpg", alt: "La devanture, 57 rue du Roi" },
  press: { url: "/images/interior-bar.jpg", alt: "Salle à manger de Chez Florent" },
  voice1: { url: "/images/tap-pour.jpg", alt: "" },
  voice2: { url: "/images/interior-bar.jpg", alt: "" },
  voice3: { url: "/images/pizza-oven.jpg", alt: "" },
  facade: { url: "/images/facade-pizza.jpg", alt: "Devanture de Chez Florent, 57 rue du Roi à Sorel-Tracy" },
};

export function usePhotos(): PhotoMap {
  const { data } = useListPhotos();
  const out: PhotoMap = { ...PHOTO_FALLBACK };
  if (data) {
    for (const p of data) out[p.slot] = { url: p.url, alt: p.alt };
  }
  return out;
}

// Persists the selected event so the Reservation form can prefill the note field.
export const PREFILL_KEY = "chez-florent-event-prefill";

function Agenda() {
  const agendaEvents = useAgendaEventsData();
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section id="agenda" className="bg-cream-soft pt-32 pb-32 relative">
      <SectionMarker number="04" tone="light" />
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="mb-16">
          <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-bg-primary/60 mb-6">
            04 — La programmation
          </div>
          <h2 className="font-display text-bg-primary leading-[1.18] pb-[0.28em] pl-[0.08em] text-[clamp(3.75rem,10vw,9.5rem)]">
            L'agenda
          </h2>
          <p className="font-sans italic text-bg-primary/65 max-w-2xl text-lg mt-6">
            Soirées, dégustations et concerts à venir — choisissez votre prochaine.
          </p>
        </div>

        <div className="border-t border-bg-primary/15">
          {agendaEvents.map((event, i) => {
            const isActive = i === activeIdx;
            const sharedProps = {
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: "-50px" },
              transition: { duration: 0.6, ease: EASE, delay: i * 0.05 },
              onMouseEnter: () => setActiveIdx(i),
              onFocus: () => setActiveIdx(i),
              "aria-label": event.soldOut
                ? `${event.date.day} ${event.date.month} · ${event.title} — complet`
                : `${event.date.day} ${event.date.month} · ${event.title} — réserver par téléphone`,
              className: `group grid grid-cols-[64px_1fr_auto] md:grid-cols-[120px_1fr_auto] gap-4 md:gap-12 py-8 md:py-10 border-b border-bg-primary/15 transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-inset ${event.soldOut ? 'opacity-60 cursor-not-allowed' : isActive ? 'bg-bg-primary/[0.06]' : 'hover:bg-bg-primary/[0.04]'} px-3 md:px-6`,
            } as const;
            const inner = (
              <>
                <div className="flex flex-col">
                  <div className={`font-serif italic font-light text-[2rem] md:text-[2.75rem] leading-none transition-colors ${isActive && !event.soldOut ? 'text-orange' : 'text-bg-primary'}`}>
                    {event.date.day}
                  </div>
                  <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-bg-primary/60 mt-1">
                    {event.date.month}
                  </div>
                </div>
                <motion.div
                  animate={{ x: isActive && !event.soldOut ? 12 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex flex-col gap-1"
                >
                  <h3 className="font-serif font-semibold text-[1.35rem] md:text-[1.65rem] text-bg-primary leading-tight">
                    {event.title}
                  </h3>
                  <p className="font-sans font-light italic text-bg-primary/70 max-w-[600px] leading-relaxed text-sm md:text-base">
                    {event.desc}
                  </p>
                </motion.div>
                <div className="flex flex-col items-end justify-between gap-2 pt-1">
                  <span className={`text-[0.7rem] font-medium tracking-[0.2em] uppercase whitespace-nowrap ${event.soldOut ? 'text-bg-primary/70' : 'text-orange'}`}>
                    {event.tag}
                  </span>
                  <span className="hidden md:inline-block text-[0.7rem] font-sans tracking-[0.15em] uppercase whitespace-nowrap">
                    {event.soldOut ? (
                      <span className="text-bg-primary/70">— Complet</span>
                    ) : (
                      <span className="text-bg-primary/75 group-hover:text-bg-primary transition-colors">Réserver par tél. →</span>
                    )}
                  </span>
                </div>
              </>
            );
            if (event.soldOut) {
              return (
                <motion.div key={event.id} {...sharedProps} aria-disabled="true">
                  {inner}
                </motion.div>
              );
            }
            return (
              <motion.a
                key={event.id}
                href="tel:+14507431448"
                {...sharedProps}
              >
                {inner}
              </motion.a>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center gap-6">
          <a
            href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/evenements`}
            className="inline-flex items-center gap-3 px-7 py-3 border border-bg-primary/30 text-bg-primary text-[0.75rem] font-medium tracking-[0.2em] uppercase rounded-[2px] hover:bg-bg-primary hover:text-cream transition-all duration-300"
          >
            Voir le calendrier complet
            <span aria-hidden="true">→</span>
          </a>
          <p className="font-sans text-bg-primary/75 text-sm text-center max-w-md">
            <span className="font-semibold text-bg-primary">Réservation des soirées par téléphone uniquement.</span>{" "}
            Appelez-nous au{" "}
            <a href="tel:+14507431448" className="text-orange font-semibold underline underline-offset-2 hover:text-orange-dark whitespace-nowrap">
              450 743-1448
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

function HoursBand() {
  const status = useOpenStatus();
  const hoursItems = useHoursItems();

  return (
    <div id="horaires" className="bg-bg-primary text-cream border-y border-border overflow-hidden py-6 md:py-8 relative">
      <div className="flex whitespace-nowrap animate-marquee-slow w-max font-serif italic font-light text-cream text-[clamp(2rem,5.5vw,4.5rem)] leading-none">
        {[...Array(4)].map((_, repeat) => (
          <div key={repeat} className="flex items-center">
            <span className="px-8 inline-flex items-center gap-4">
              <span className="relative inline-flex w-2.5 h-2.5 shrink-0">
                {status.open && (
                  <span className="absolute inset-0 rounded-full bg-orange opacity-60 animate-ping"></span>
                )}
                <span className={`relative inline-block w-2.5 h-2.5 rounded-full ${status.open ? 'bg-orange' : 'bg-cream-soft/40'}`}></span>
              </span>
              {status.label}
            </span>
            {hoursItems.map((item, i) => (
              <React.Fragment key={i}>
                <span aria-hidden="true" className="text-cream-soft/35 px-2">✶</span>
                <span className="px-8">{item}</span>
              </React.Fragment>
            ))}
            <span aria-hidden="true" className="text-cream-soft/35 px-2">✶</span>
            <span className="px-8 inline-flex items-center gap-3">
              Réservez votre table
              <span aria-hidden="true" className="text-orange">↘</span>
            </span>
            <span aria-hidden="true" className="text-cream-soft/35 px-2">✶</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Returns the human-readable hours string for today (e.g. "17h – 22h" or "Fermé").
function useTodaysHours() {
  const schedule = useScheduleData();
  const today = schedule[new Date().getDay()];
  return today ? `${today.open}h – ${today.close}h` : "Fermé aujourd'hui";
}

type EventPrefill = { id: string; title: string; date: string; display: string };

function Reservation() {
  const [prefill, setPrefill] = useState<EventPrefill | null>(null);
  const liveStatus = useOpenStatus();
  const todaysHours = useTodaysHours();

  // Read event prefill from sessionStorage on mount + when Agenda fires custom event.
  // With the TableAgent widget we can't auto-fill its fields, so we surface the event
  // as a reminder for the guest to mention it in their reservation note.
  useEffect(() => {
    const read = () => {
      try {
        const raw = sessionStorage.getItem(PREFILL_KEY);
        if (!raw) return;
        const data = JSON.parse(raw) as EventPrefill;
        if (data && data.title && data.date) setPrefill(data);
      } catch {}
    };
    read();
    window.addEventListener("chez-florent:event-prefill", read);
    return () => window.removeEventListener("chez-florent:event-prefill", read);
  }, []);

  const clearPrefill = () => {
    try { sessionStorage.removeItem(PREFILL_KEY); } catch {}
    setPrefill(null);
  };

  return (
    <>
      <HoursBand />

      <section id="reservation" className="bg-bg-primary py-32 md:py-40 px-6 md:px-12 relative overflow-hidden">
        <SectionMarker number="05" />

        {/* Massive ghost number behind everything for editorial weight */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-display text-[40vw] md:text-[28vw] text-cream/[0.025] leading-none -translate-y-12">
            05
          </span>
        </div>

        {/* Soft orange accent wash — top-right, very subtle */}
        <div aria-hidden="true" className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] -translate-y-1/3 translate-x-1/4 pointer-events-none rounded-full" style={{ background: "radial-gradient(circle, rgba(216, 90, 44, 0.10) 0%, transparent 60%)" }} />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* HEADER — full width, dramatic */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mb-12 md:mb-16 max-w-5xl"
          >
            <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
              <span aria-hidden="true">✶ </span>05 — Une table pour vous
            </div>
            <h2 className="font-display text-[clamp(4.5rem,12vw,13rem)] text-cream leading-[1.18] pb-[0.28em] mb-8">
              Réserver
            </h2>
            <div className="flex items-baseline gap-4">
              <div className="h-[1px] w-12 bg-orange shrink-0 translate-y-[-0.4em]"></div>
              <p className="font-serif italic text-cream-soft/90 text-lg md:text-2xl max-w-2xl leading-snug">
                Le téléphone reste le plus chaleureux — la réservation en ligne fait très bien aussi.
              </p>
            </div>
          </motion.div>

          {/* 3-Step path — what happens with the online widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 border-y border-border py-10 md:py-12 mb-16 md:mb-20"
          >
            {[
              { n: "01", title: "Choisissez", body: "Date, heure, nombre de couverts — les disponibilités sont en temps réel." },
              { n: "02", title: "Confirmation immédiate", body: "Votre table est confirmée sur-le-champ, avec un courriel de confirmation." },
              { n: "03", title: "À ce soir", body: "Une table près du four — sauf si vous nous demandez le coin tranquille." },
            ].map((s, i) => (
              <div key={s.n} className="flex flex-col gap-2 relative md:pl-6">
                {i > 0 && <div aria-hidden="true" className="hidden md:block absolute left-0 top-2 bottom-2 w-[1px] bg-border" />}
                <div className="text-[0.7rem] font-medium tracking-[0.22em] uppercase text-orange">{s.n}</div>
                <h3 className="font-serif italic text-cream text-2xl md:text-3xl leading-tight">{s.title}</h3>
                <p className="font-sans text-cream-soft/80 text-sm md:text-[0.95rem] leading-relaxed max-w-[28ch]">{s.body}</p>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* LEFT — Info / live status / phone — sticky on desktop */}
            <aside className="lg:col-span-5 lg:sticky lg:top-32 self-start space-y-8">
              {/* Phone CTA — the signature moment, oversized Pacifico */}
              <a
                href="tel:+14507431448"
                className="block group relative border border-border bg-bg-secondary/50 backdrop-blur-sm p-7 md:p-9 hover:border-orange/50 transition-colors overflow-hidden"
                aria-label="Appeler Chez Florent au 450 743-1448"
              >
                <div aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-[3px] bg-orange" />
                <div className="text-[0.7rem] tracking-[0.22em] uppercase text-orange mb-3">
                  <span aria-hidden="true">✶ </span>Le plus chaleureux
                </div>
                <div className="font-display text-cream text-[clamp(2.25rem,4.6vw,3rem)] group-hover:text-orange transition-colors leading-[0.95] mb-3 whitespace-nowrap">
                  450&nbsp;743&#8209;1448
                </div>
                <div className="text-[0.75rem] tracking-[0.18em] uppercase text-cream-soft/85 group-hover:text-cream transition-colors">
                  Touchez pour appeler <span aria-hidden="true">↘</span>
                </div>
              </a>

              {/* Live status panel */}
              <div className="border border-border bg-bg-secondary/30 backdrop-blur-sm p-7 md:p-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="text-[0.7rem] tracking-[0.22em] uppercase text-cream-soft/85">
                    <span aria-hidden="true">◦ </span>En ce moment
                  </div>
                  <span className="relative inline-flex w-2 h-2 shrink-0">
                    {liveStatus.open && (
                      <span className="absolute inset-0 rounded-full bg-orange opacity-60 animate-ping"></span>
                    )}
                    <span className={`relative inline-block w-2 h-2 rounded-full ${liveStatus.open ? 'bg-orange' : 'bg-cream-soft/40'}`}></span>
                  </span>
                </div>
                <div className="font-serif italic text-cream text-2xl md:text-3xl leading-none mb-6">
                  {liveStatus.label}
                </div>
                <div className="flex items-baseline justify-between gap-4 pt-5 border-t border-border">
                  <div className="text-[0.7rem] tracking-[0.22em] uppercase text-cream-soft/85">
                    Aujourd'hui
                  </div>
                  <div className="font-serif text-cream text-lg md:text-xl">
                    {todaysHours}
                  </div>
                </div>
              </div>

              {/* Editorial promise — three lines with bullets */}
              <ul className="space-y-3 pl-1">
                {[
                  "Disponibilités et confirmation en temps réel",
                  "Courriel de confirmation automatique",
                  "Groupes de 9 et plus : appelez-nous directement",
                ].map((line, i) => (
                  <li key={i} className="flex items-start gap-3 font-sans text-[0.95rem] text-cream-soft/85">
                    <span aria-hidden="true" className="text-cream-soft/45 leading-none pt-[0.35rem]">✶</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </aside>

            {/* RIGHT — branded panel wrapping the live TableAgent widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, ease: EASE }}
              className="lg:col-span-7 bg-bg-primary border border-border relative"
            >
              {/* Panel header bar — in our brand */}
              <div className="flex items-center justify-between gap-4 px-6 md:px-8 py-5 border-b border-border">
                <div className="text-[0.7rem] font-medium tracking-[0.22em] uppercase text-orange">
                  <span aria-hidden="true">✶ </span>Réservation en ligne
                </div>
                <div aria-hidden="true" className="text-[0.65rem] font-medium tracking-[0.25em] uppercase text-cream-soft/75">
                  ◦ Temps réel
                </div>
              </div>

              {/* Event reminder (from Agenda) — informational, since the widget can't be pre-filled */}
              {prefill && (
                <div className="flex flex-wrap items-center justify-between gap-3 bg-orange/10 border-b border-orange/40 px-6 md:px-8 py-4">
                  <div className="font-sans text-sm text-cream">
                    <span className="text-[0.7rem] font-medium tracking-[0.22em] uppercase text-orange mr-2">Événement</span>
                    Pour <span className="font-serif italic">{prefill.title}</span> — {prefill.display}.{" "}
                    <span className="text-cream-soft">Mentionnez-le dans la note de réservation.</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearPrefill}
                    className="text-[0.7rem] tracking-[0.18em] uppercase text-cream-soft hover:text-cream underline underline-offset-4"
                  >
                    Retirer
                  </button>
                </div>
              )}

              {/* The real TableAgent booking widget — light surface on a cream backing
                  so it reads as an intentional inset card inside our dark panel. */}
              <div className="bg-cream-soft p-3 md:p-4">
                <iframe
                  title="Réserver une table chez Florent"
                  src="https://tableagent.com/iframe/chez-florent/"
                  sandbox="allow-forms allow-modals allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
                  className="w-full min-w-[300px] min-h-[760px] border-0 block bg-cream-soft"
                  style={{ minHeight: 760 }}
                />
              </div>

              {/* Footnote — fallback to phone */}
              <div className="px-6 md:px-8 py-5 border-t border-border">
                <p className="font-serif italic text-cream-soft/85 text-sm">
                  Un souci avec le formulaire ?{" "}
                  <a href="tel:+14507431448" className="text-cream underline underline-offset-4 hover:text-orange transition-colors not-italic">
                    Appelez-nous au 450 743-1448
                  </a>
                  .
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

function Contact() {
  const photos = usePhotos();
  return (
    <section id="contact" className="bg-cream-soft py-32 px-6 md:px-12 relative overflow-hidden">
      <SectionMarker number="06" tone="light" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-16"
        >
          <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-bg-primary/60 mb-4">
            06 — Nous trouver
          </div>
          <h2 className="font-display text-[clamp(3.5rem,9vw,8rem)] text-bg-primary leading-[1.18] pb-[0.28em] mb-6">
            Passez nous voir
          </h2>
          <p className="font-sans italic text-bg-primary/70 max-w-xl text-base md:text-lg">
            À deux pas du marché — la porte est ouverte du mardi au dimanche.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row mt-16">
          {/* Left Column (60%) */}
          <motion.div 
            className="w-full lg:w-[60%] flex flex-col justify-between pr-0 lg:pr-12 z-20 relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          >
            <div className="lg:bg-transparent p-6 lg:p-0">
              <address className="font-serif text-[1.75rem] text-bg-primary not-italic mb-12 leading-snug">
                <strong className="font-semibold block text-orange mb-2">Chez Florent</strong>
                57 Rue du Roi<br />
                Sorel-Tracy, Québec<br />
                J3P 4M6
              </address>

              <table className="w-full max-w-[400px] text-bg-primary/85 font-sans mb-16 border-collapse text-lg">
                <tbody>
                  <tr className="border-b border-bg-primary/20">
                    <td className="py-4 font-medium tracking-wider text-sm">LUN</td>
                    <td className="py-4 text-right italic text-bg-primary/70">Fermé</td>
                  </tr>
                  <tr className="border-b border-bg-primary/20">
                    <td className="py-4 font-medium tracking-wider text-sm">MAR — JEU</td>
                    <td className="py-4 text-right">17h00 → 22h00</td>
                  </tr>
                  <tr className="border-b border-bg-primary/20">
                    <td className="py-4 font-medium tracking-wider text-sm">VEN — SAM</td>
                    <td className="py-4 text-right">17h00 → 23h00</td>
                  </tr>
                  <tr className="border-b border-bg-primary/20">
                    <td className="py-4 font-medium tracking-wider text-sm">DIM</td>
                    <td className="py-4 text-right">17h00 → 21h00</td>
                  </tr>
                </tbody>
              </table>

              <div className="font-sans text-bg-primary/85 mb-12">
                <div className="text-[0.75rem] uppercase tracking-[0.2em] mb-2 opacity-90">Appelez-nous</div>
                <a
                  href="tel:+14507431448"
                  aria-label="Appeler Chez Florent au 450 743-1448"
                  className="font-display text-[clamp(2.5rem,5vw,4rem)] text-bg-primary link-underline hover:text-orange transition-colors"
                >
                  450 743-1448
                </a>
              </div>
            </div>

            <div className="flex gap-8 text-[0.875rem] font-medium tracking-[0.2em] uppercase text-bg-primary mt-8 lg:mt-0 p-6 lg:p-0">
              <a
                href="https://www.instagram.com/chezflorent.bistro/"
                target="_blank"
                rel="noopener noreferrer me"
                className="link-underline"
                aria-label="Instagram de Chez Florent (nouvel onglet)"
              >Instagram</a>
              <span aria-hidden="true" className="text-orange">·</span>
              <a
                href="https://www.facebook.com/chezflorent.bistro/"
                target="_blank"
                rel="noopener noreferrer me"
                className="link-underline"
                aria-label="Facebook de Chez Florent (nouvel onglet)"
              >Facebook</a>
            </div>
          </motion.div>

          {/* Right Column (40%) Overlapping */}
          <motion.div 
            className="w-full lg:w-[40%] mt-12 lg:mt-0 lg:-ml-[80px] z-10"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
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
  );
}

type LegalKey = "mentions" | "confidentialite";

const LEGAL_COPY: Record<LegalKey, { title: string; body: string[] }> = {
  mentions: {
    title: "Mentions légales",
    body: [
      "Chez Florent — Bistro · 57 Rue du Roi, Sorel-Tracy (QC) J3P 4M6 · Téléphone : 450 743-1448.",
      "Site édité à des fins de présentation. Les visuels et l'ardoise peuvent évoluer selon les arrivages et la saison.",
      "Hébergement et conception : équipe Chez Florent, Sorel-Tracy. Tous droits réservés.",
    ],
  },
  confidentialite: {
    title: "Confidentialité",
    body: [
      "Le formulaire de réservation collecte uniquement les informations nécessaires pour confirmer votre table : nom, téléphone, date, heure, nombre de personnes et note facultative.",
      "Aucune donnée n'est transmise à des tiers. Vos coordonnées servent uniquement à vous rappeler pour confirmer ou ajuster la réservation.",
      "Pour toute demande de suppression, écrivez-nous ou appelez-nous au 450 743-1448.",
    ],
  },
};

function LegalModal({ which, onClose }: { which: LegalKey; onClose: () => void }) {
  const copy = LEGAL_COPY[which];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <motion.div
      key="legal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="fixed inset-0 z-[120] bg-bg-primary/80 backdrop-blur-md flex items-center justify-center p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-title"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative max-w-2xl w-full bg-bg-tertiary border border-border p-8 md:p-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-5 text-cream-soft hover:text-cream text-2xl leading-none"
        >×</button>
        <div className="text-[0.7rem] tracking-[0.22em] uppercase text-orange mb-4">Information</div>
        <h3 id="legal-title" className="font-display text-cream text-3xl md:text-4xl mb-6">
          {copy.title}
        </h3>
        <div className="space-y-4 font-sans text-cream-soft text-sm leading-relaxed">
          {copy.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Footer() {
  const [legal, setLegal] = useState<LegalKey | null>(null);
  const year = new Date().getFullYear();
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <footer className="bg-bg-primary pt-20 relative z-10 overflow-hidden flex flex-col">
      {/* Quick links + contact */}
      <div className="w-full px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 pb-12">
          <div>
            <div className="text-[0.7rem] tracking-[0.22em] uppercase text-cream-soft/85 mb-4">Le bistro</div>
            <address className="not-italic font-serif text-cream text-base leading-relaxed">
              57 Rue du Roi<br />
              Sorel-Tracy (QC)<br />
              J3P 4M6
            </address>
          </div>
          <div>
            <div className="text-[0.7rem] tracking-[0.22em] uppercase text-cream-soft/85 mb-4">Contact</div>
            <a href="tel:+14507431448" className="block font-display text-cream text-2xl hover:text-orange transition-colors">450 743-1448</a>
            <div className="font-sans text-sm text-cream-soft/85 mt-2">Mar–Dim · dès 17h</div>
          </div>
          <nav aria-label="Navigation rapide">
            <div className="text-[0.7rem] tracking-[0.22em] uppercase text-cream-soft/85 mb-4">Visiter</div>
            <ul className="space-y-2 font-sans text-cream text-sm">
              <li><a href={`${base}/`} className="hover:text-orange transition-colors">Accueil</a></li>
              <li><a href={`${base}/a-propos`} className="hover:text-orange transition-colors">À propos</a></li>
              <li><a href={`${base}/menu`} className="hover:text-orange transition-colors">Menu</a></li>
              <li><a href={`${base}/evenements`} className="hover:text-orange transition-colors">Agenda</a></li>
              <li><a href={`${base}/contact`} className="hover:text-orange transition-colors">Nous trouver</a></li>
            </ul>
          </nav>
          <div>
            <div className="text-[0.7rem] tracking-[0.22em] uppercase text-cream-soft/85 mb-4">Suivre</div>
            <ul className="space-y-2 font-sans text-cream text-sm">
              <li>
                <a href="https://www.instagram.com/chezflorent.bistro/" target="_blank" rel="noopener noreferrer me" className="hover:text-orange transition-colors">
                  Instagram <span aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/chezflorent.bistro/" target="_blank" rel="noopener noreferrer me" className="hover:text-orange transition-colors">
                  Facebook <span aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="w-full px-6 md:px-12 border-t border-border">
        <div className="max-w-7xl mx-auto py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[0.75rem] tracking-[0.1em] uppercase text-cream-soft/85">
          <div>© {year} Chez Florent</div>
          <div className="flex gap-6">
            <button type="button" onClick={() => setLegal("mentions")} className="hover:text-cream transition-colors">Mentions légales</button>
            <button type="button" onClick={() => setLegal("confidentialite")} className="hover:text-cream transition-colors">Confidentialité</button>
          </div>
          <div>Conçu avec <span aria-hidden="true">♥</span><span className="sr-only">amour</span> à Sorel-Tracy</div>
        </div>
      </div>

      {/* Massive Wordmark — SVG auto-fits viewport width, no overflow */}
      <div className="w-full bg-bg-primary pt-8 pb-4 relative">
        <svg
          viewBox="0 0 1100 300"
          preserveAspectRatio="xMidYMid meet"
          className="block w-full h-auto overflow-visible"
          aria-label="Chez Florent"
          role="img"
        >
          <text
            x="550"
            y="240"
            textAnchor="middle"
            textLength="1040"
            lengthAdjust="spacingAndGlyphs"
            fontWeight="400"
            style={{
              fontFamily: "'Pacifico', cursive",
              fontSize: "200px",
              fill: "rgb(244, 201, 160)",
              fillOpacity: 0.95,
              letterSpacing: "0",
            }}
          >
            Chez Florent
          </text>
        </svg>
        <div className="absolute right-4 bottom-3 md:right-8 md:bottom-5 font-sans text-xs tracking-widest text-cream/60">
          <span aria-hidden="true">◦ </span>MMXXVI
        </div>
      </div>

      <AnimatePresence>
        {legal && <LegalModal which={legal} onClose={() => setLegal(null)} />}
      </AnimatePresence>
    </footer>
  );
}

export function FilmGrain() {
  return (
    <div className="film-grain">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <filter id="noiseFilter">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.65" 
            numOctaves="3" 
            stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}

export default function App() {
  const activeSection = useActiveSection();
  // Preview mode: the admin embeds the public site in an iframe with
  // `?preview=<sectionId>` to show a live preview of a section. In this mode we
  // skip the intro animation and jump straight to the requested section.
  const previewSection =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("preview")
      : null;
  const previewMode = previewSection !== null;
  const [showPreloader, setShowPreloader] = useState(!previewMode);

  // Intro logic
  useEffect(() => {
    if (previewMode) return;
    const played = sessionStorage.getItem('chez-florent-intro-played');
    if (played) {
      setShowPreloader(false);
    }
  }, [previewMode]);

  const handlePreloaderComplete = useCallback(() => {
    setShowPreloader(false);
    sessionStorage.setItem('chez-florent-intro-played', '1');
  }, []);

  // Lenis Smooth Scroll
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || showPreloader || previewMode) return;

    const lenis = new Lenis({ 
      duration: 1.2, 
      smoothWheel: true, 
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) 
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Intercept anchors
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.hash && anchor.hash.startsWith('#')) {
        const el = document.querySelector(anchor.hash);
        if (el) {
          e.preventDefault();
          lenis.scrollTo(el as HTMLElement, { offset: -80 });
        }
      }
    };
    document.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      document.removeEventListener('click', handleClick);
    };
  }, [showPreloader]);

  // Preview mode: render ONLY the targeted section, with no navbar, hero or
  // footer, so the admin preview shows that single section in isolation and the
  // client cannot navigate the rest of the site.
  if (previewMode) {
    return (
      <div className="min-h-[100dvh] w-full bg-bg-primary text-cream selection:bg-orange selection:text-bg-primary relative">
        <FilmGrain />
        <div className="overflow-x-hidden">
          {previewSection === "hero" && <Hero />}
          {previewSection === "a-propos" && <About />}
          {previewSection === "menu" && <Menu />}
          {previewSection === "voix" && <Testimonials />}
          {previewSection === "agenda" && <Agenda />}
          {previewSection === "reservation" && <Reservation />}
          {previewSection === "contact" && <Contact />}
          {previewSection === "horaires" && <HoursBand />}
          {![
            "hero",
            "a-propos",
            "menu",
            "voix",
            "agenda",
            "reservation",
            "contact",
            "horaires",
          ].includes(previewSection ?? "") && (
            <div className="flex min-h-[100dvh] items-center justify-center px-6 text-center font-serif text-lg text-cream-soft/60">
              Section inconnue.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-bg-primary text-cream selection:bg-orange selection:text-bg-primary relative">
      <ScrollProgress />
      <FilmGrain />
      
      <AnimatePresence>
        {showPreloader && <Preloader key="preloader" onComplete={handlePreloaderComplete} />}
      </AnimatePresence>

      <div className="overflow-x-hidden">
        <Navbar activeSection={activeSection} />
        <main>
          <Hero />
          <About />
          <Menu />
          <Testimonials />
          <Agenda />
          <Reservation />
          <Contact />
        </main>
        <Footer />
      </div>
    </div>
  );
}
