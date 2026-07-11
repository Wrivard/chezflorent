import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion, AnimatePresence, useMotionValue } from "framer-motion";
import Lenis from 'lenis';
import {
  useGetMenu,
  useListEvents,
  useListHours,
  useListPhotos,
  useGetMenuMarquee,
  useCreateMessage,
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
//   Sun 17h–21h · Mon–Wed 11h30–21h · Thu–Fri 11h30–23h · Sat 17h–23h
const SCHEDULE: Record<number, { open: number; close: number } | null> = {
  0: { open: 17,   close: 21 }, // Dimanche
  1: { open: 11.5, close: 21 }, // Lundi
  2: { open: 11.5, close: 21 }, // Mardi
  3: { open: 11.5, close: 21 }, // Mercredi
  4: { open: 11.5, close: 23 }, // Jeudi
  5: { open: 11.5, close: 23 }, // Vendredi
  6: { open: 17,   close: 23 }, // Samedi
};
const DAY_NAMES_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const DAY_SHORT_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

// Converts a decimal hour to a display string: 11.5 → "11h30", 17 → "17h".
function formatHour(h: number): string {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h${String(mins).padStart(2, "0")}` : `${hrs}h`;
}

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
      return { open: true, label: `Ouvert · ferme à ${formatHour(today.close)}` };
    }
    // Open day but before opening time
    if (totalMinutes < today.open * 60) {
      return { open: false, label: `Fermé · ouvre aujourd'hui ${formatHour(today.open)}` };
    }
  }

  // After closing time today, or closed all day — find next open day
  for (let i = 1; i <= 7; i++) {
    const nextDayIdx = (day + i) % 7;
    const next = schedule[nextDayIdx];
    if (next) {
      const dayLabel = i === 1 ? "demain" : DAY_NAMES_FR[nextDayIdx];
      return { open: false, label: `Fermé · ouvre ${dayLabel} ${formatHour(next.open)}` };
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
  onGroupsPage = false,
  onOtherPage = false,
}: {
  activeSection: string;
  onEventsPage?: boolean;
  onMenuPage?: boolean;
  onAboutPage?: boolean;
  onContactPage?: boolean;
  onGroupsPage?: boolean;
  onOtherPage?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bistroOpen, setBistroOpen] = useState(false);
  const bistroRef = useRef<HTMLDivElement>(null);
  const status = useOpenStatus();
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const onSubPage = onEventsPage || onMenuPage || onAboutPage || onContactPage || onGroupsPage || onOtherPage;
  const bistroActive = onAboutPage || onContactPage || onEventsPage;
  const sectionHref = (id: string) =>
    onSubPage ? `${base}/#${id}` : `#${id}`;
  const homeHref = onSubPage ? `${base}/` : "#accueil";
  const eventsHref = `${base}/evenements`;
  const menuHref = `${base}/menu`;
  const aboutHref = `${base}/a-propos`;
  const contactHref = `${base}/contact`;
  const groupsHref = `${base}/groupes`;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!bistroOpen) return;
    const handlePointer = (e: MouseEvent) => {
      if (bistroRef.current && !bistroRef.current.contains(e.target as Node)) {
        setBistroOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBistroOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [bistroOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

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
              <a href={menuHref} className={`link-underline hover:text-cream transition-colors ${onMenuPage ? "active text-cream" : ""}`}>Menu</a>

              {/* Le restaurant — dropdown grouping secondary pages */}
              <div
                ref={bistroRef}
                className="relative"
                onMouseEnter={() => setBistroOpen(true)}
                onMouseLeave={() => setBistroOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setBistroOpen((v) => !v)}
                  aria-expanded={bistroOpen}
                  aria-haspopup="true"
                  className={`link-underline inline-flex items-center gap-1.5 uppercase tracking-[0.2em] hover:text-cream transition-colors ${bistroActive ? "active text-cream" : ""}`}
                >
                  Le restaurant
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                    className={`transition-transform duration-300 ${bistroOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M2.5 4.5L6 8l3.5-3.5" />
                  </svg>
                </button>
                <AnimatePresence>
                  {bistroOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2, ease: EASE_SMOOTH }}
                      className="absolute right-0 top-full pt-4 min-w-[200px]"
                    >
                      <div className="flex flex-col bg-bg-primary/95 backdrop-blur-md border border-border rounded-[2px] overflow-hidden shadow-2xl">
                        <a href={aboutHref} className={`px-5 py-3.5 hover:bg-cream/5 hover:text-cream transition-colors border-b border-border/60 ${onAboutPage ? "text-cream bg-cream/5" : ""}`}>À propos</a>
                        <a href={contactHref} className={`px-5 py-3.5 hover:bg-cream/5 hover:text-cream transition-colors border-b border-border/60 ${onContactPage ? "text-cream bg-cream/5" : ""}`}>Contact</a>
                        <a href={eventsHref} className={`px-5 py-3.5 hover:bg-cream/5 hover:text-cream transition-colors ${onEventsPage ? "text-cream bg-cream/5" : ""}`}>Agenda</a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <a href={groupsHref} className={`link-underline hover:text-cream transition-colors ${onGroupsPage ? "active text-cream" : ""}`}>Groupes</a>
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
            data-lenis-prevent
            className="fixed inset-0 z-50 bg-bg-primary flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 shrink-0">
              <a href={homeHref} onClick={closeMenu} aria-label="Chez Florent — Accueil" className="flex items-center">
                <img src="/logo.png" alt="Chez Florent logo" className="h-20 object-contain" />
              </a>
              <button onClick={closeMenu} aria-label="Fermer le menu" className="text-cream p-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-10 pt-2 flex flex-col gap-7 text-[1.65rem] leading-tight font-serif text-cream">
              <a href={homeHref} onClick={closeMenu} className="hover:text-orange transition-colors">Accueil</a>
              <a href={aboutHref} onClick={closeMenu} className="hover:text-orange transition-colors">À propos</a>
              <a href={menuHref} onClick={closeMenu} className="hover:text-orange transition-colors">Menu</a>
              <a href={eventsHref} onClick={closeMenu} className="hover:text-orange transition-colors">Agenda</a>
              <a href={groupsHref} onClick={closeMenu} className="hover:text-orange transition-colors">Groupes & privatisation</a>
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
    visible: { clipPath: "inset(-0.1em -0.5em -1em -0.2em)", y: 0, transition: { duration: 0.8, ease: EASE } }
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
            background: "linear-gradient(180deg, rgba(0,25,30,0.85) 0%, rgba(0,25,30,0.55) 40%, rgba(0,25,30,0.9) 100%)"
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, transparent 40%, rgba(0,25,30,0.6) 100%)"
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
              <span aria-hidden="true" className="text-cream-soft/45 mr-3">✶</span>RESTAURANT — SOREL-TRACY / DEPUIS 2025
            </motion.div>
            
            <motion.div variants={fadeVariants} className="hidden md:flex flex-col gap-2 text-[0.65rem] font-medium tracking-[0.3em] uppercase text-cream-soft text-right">
              <span>N° 01</span>
              <span>—</span>
              <span>CUISINE</span>
              <span>DU MARCHÉ</span>
            </motion.div>
          </div>

          {/* Broken Type Headline */}
          <h1 className="font-serif font-light text-cream leading-[1.08] pb-[0.18em] text-[13.5vw] md:text-[clamp(2rem,11vw,11rem)] mb-16 w-full">
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
                Restaurant de quartier, 75 places assises, 7 jours sur 7.
              </p>
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
              <span className="font-serif italic text-2xl text-cream px-6">Bière de microbrasserie</span>
              <span aria-hidden="true" className="text-cream-soft/45 text-sm">✶</span>
              <span className="font-serif italic text-2xl text-cream px-6">Vins québécois</span>
              <span aria-hidden="true" className="text-cream-soft/45 text-sm">✶</span>
              <span className="font-serif italic text-2xl text-cream px-6">Four à bois</span>
              <span aria-hidden="true" className="text-cream-soft/45 text-sm">✶</span>
              <span className="font-serif italic text-2xl text-cream px-6">Jeux de société</span>
              <span aria-hidden="true" className="text-cream-soft/45 text-sm">✶</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  const photos = usePhotos();

  const sliderRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const slide = el.querySelector<HTMLElement>("[data-center-slide]");
    if (!slide) return;
    el.scrollLeft = slide.offsetLeft - (el.clientWidth - slide.clientWidth) / 2;
  }, []);

  // Mouse drag-to-scroll for the mobile slider (touch swipe works natively)
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    let isDown = false;
    let dragged = false;
    let startX = 0;
    let startScroll = 0;

    const onDown = (e: MouseEvent) => {
      isDown = true;
      dragged = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.style.scrollSnapType = "none";
      el.style.cursor = "grabbing";
    };
    const onMove = (e: MouseEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) dragged = true;
      el.scrollLeft = startScroll - dx;
    };
    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = "";
      // Snap to the nearest slide, then restore CSS snapping
      const slides = Array.from(el.children) as HTMLElement[];
      if (slides.length) {
        const target = el.scrollLeft + el.clientWidth / 2;
        const nearest = slides.reduce((best, s) => {
          const c = s.offsetLeft + s.clientWidth / 2;
          const bc = best.offsetLeft + best.clientWidth / 2;
          return Math.abs(c - target) < Math.abs(bc - target) ? s : best;
        });
        el.scrollTo({
          left: nearest.offsetLeft - (el.clientWidth - nearest.clientWidth) / 2,
          behavior: "smooth",
        });
      }
      window.setTimeout(() => {
        el.style.scrollSnapType = "";
      }, 400);
    };
    const onClick = (e: Event) => {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
        dragged = false;
      }
    };

    el.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", endDrag);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", endDrag);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  const quoteWords = "« On vient ici pour rester. »".split(" ");

  return (
    <section id="a-propos" className="bg-cream-soft pt-32 pb-32 overflow-hidden relative">
      <SectionMarker number="02" tone="light" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-bg-primary/60 mb-6">
          02 — LA MAISON
        </div>

        {/* Massive Pull Quote — dark green text on cream */}
        <h2 className="font-serif italic font-light text-bg-primary leading-[1.1] pb-[0.22em] text-[clamp(2.25rem,11vw,10rem)] mb-10 max-w-6xl flex flex-wrap gap-x-[0.3em] gap-y-4">
          {quoteWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ clipPath: "inset(100% -0.5em -0.6em -0.3em)", y: 20 }}
              whileInView={{ clipPath: "inset(-0.2em -0.5em -0.6em -0.3em)", y: 0 }}
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
          L'endroit idéal pour sortir de la maison sans avoir à se mettre sur son 31 — une ambiance conviviale, familiale et décontractée. Viens prendre un verre.
        </motion.p>

        {/* Mobile-only horizontal slider: swipe left-right through the
            7 collage photos. Hidden on md+ where the 5-column collage shows. */}
        <div ref={sliderRef} data-lenis-prevent className="md:hidden mb-24 -mx-6 px-6 flex gap-4 overflow-x-auto snap-x snap-mandatory cursor-grab select-none [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["about6", "about1", "about2", "about4", "about8", "about5", "about3"] as const).map((slot, i) => (
            <div key={slot} data-center-slide={i === 3 || undefined} className="w-[78%] shrink-0 snap-center aspect-[4/5] overflow-hidden ring-1 ring-bg-primary/10">
              <img loading="lazy" decoding="async" src={photos[slot].url} alt={photos[slot].alt} draggable={false} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Editorial photo collage — 5 balanced columns, vertically centered:
            tall edges, two stacked pairs, and one large hero photo in the
            middle. Uniform gaps, no overlap. Hidden on mobile (slider above). */}
        <div className="mb-24 md:mb-32 hidden md:flex md:items-center gap-4 md:gap-6">
          <div className="w-full md:w-[15%] shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0 }}
            className="aspect-[4/3] md:aspect-[9/16] overflow-hidden ring-1 ring-bg-primary/10"
          >
            <img loading="lazy" decoding="async" src={photos.about6.url} alt={photos.about6.alt} className="w-full h-full object-cover" />
          </motion.div>
          </div>

          <div className="w-full md:w-[19%] shrink-0 flex flex-col gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.08 }}
            className="aspect-square overflow-hidden ring-1 ring-bg-primary/10"
          >
            <img loading="lazy" decoding="async" src={photos.about1.url} alt={photos.about1.alt} className="w-full h-full object-cover" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.14 }}
            className="aspect-[3/4] overflow-hidden ring-1 ring-bg-primary/10"
          >
            <img loading="lazy" decoding="async" src={photos.about2.url} alt={photos.about2.alt} className="w-full h-full object-cover" />
          </motion.div>
          </div>

          <div className="w-full md:flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            className="aspect-[4/3] md:aspect-[4/5] overflow-hidden ring-1 ring-bg-primary/10"
          >
            <img loading="lazy" decoding="async" src={photos.about4.url} alt={photos.about4.alt} className="w-full h-full object-cover" />
          </motion.div>
          </div>

          <div className="w-full md:w-[19%] shrink-0 flex flex-col gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.16 }}
            className="aspect-[3/4] overflow-hidden ring-1 ring-bg-primary/10"
          >
            <img loading="lazy" decoding="async" src={photos.about8.url} alt={photos.about8.alt} className="w-full h-full object-cover" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.22 }}
            className="aspect-square overflow-hidden ring-1 ring-bg-primary/10"
          >
            <img loading="lazy" decoding="async" src={photos.about5.url} alt={photos.about5.alt} className="w-full h-full object-cover" />
          </motion.div>
          </div>

          <div className="w-full md:w-[15%] shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.12 }}
            className="aspect-[4/3] md:aspect-[9/16] overflow-hidden ring-1 ring-bg-primary/10"
          >
            <img loading="lazy" decoding="async" src={photos.about3.url} alt={photos.about3.alt} className="w-full h-full object-cover" />
          </motion.div>
          </div>
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
              « Super belle ambiance, le personnel très accueillant, très beaux choix de vin, spiritueux et bières québécoises. Les propriétaires sont présents et très sympathiques. »
            </blockquote>
            <figcaption className="mt-4 font-sans text-[0.75rem] tracking-[0.2em] uppercase text-bg-primary/65 flex items-center gap-3">
              <span aria-hidden="true" className="inline-block w-8 h-px bg-orange/70" />
              Charles Frenette
              <span aria-hidden="true" className="text-orange/70">·</span>
              <span className="font-serif normal-case italic tracking-normal text-bg-primary/70">Avis Google</span>
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
              « Un très bel endroit où l'on sent, dès l'entrée, un accueil chaleureux. Une belle diversité de bières qu'on dirait fraîchement brassées du matin, un petit verre de vin québécois servi avec le sourire, et voilà. Un fabuleux petit joyau sorelois. »
            </blockquote>
            <figcaption className="mt-4 font-sans text-[0.75rem] tracking-[0.2em] uppercase text-bg-primary/65 flex items-center gap-3">
              <span aria-hidden="true" className="inline-block w-8 h-px bg-orange/70" />
              Paul Larochelle
              <span aria-hidden="true" className="text-orange/70">·</span>
              <span className="font-serif normal-case italic tracking-normal text-bg-primary/70">Avis Google</span>
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}

export type Dish = { name: string; price: string; desc: string; image: string };
export type MenuCategory = { id: string; label: string; tagline: string; dishes: Dish[] };

// Categories shown on the homepage menu tabs (with photos). The Menu page shows
// a broader set — see MENU_SLUGS.
export const FOOD_SLUGS = ["ardoise", "encas", "salades", "pizzas", "hoagies"];

// All site-owned fixed printed-menu categories (never imported from Untappd).
// Used to separate the fixed menu from imported drinks on the Menu page, and
// MUST stay in sync with PROTECTED_SLUGS in the api-server importUntappdMenu.ts
// so a re-import never deletes them.
export const FIXED_MENU_SLUGS = [
  "ardoise",
  "encas",
  "salades",
  "pizzas",
  "hoagies",
  "desserts",
  "cafes-thes",
  "alcools",
  "extras",
];

// Fixed categories displayed in the Menu page's main "La cuisine" tab bar.
// "ardoise" (the chef's rotating specials, formerly a PDF) leads the list so it
// is the default tab. NOTE: "alcools" is intentionally NOT shown here (removed
// from the main menu per request); it stays a fixed/protected category above
// (kept in the DB and editable in the admin), just hidden from the public Menu
// page.
export const MENU_SLUGS = [
  "ardoise",
  "encas",
  "salades",
  "pizzas",
  "hoagies",
  "desserts",
  "cafes-thes",
  "extras",
];

// Static fallback used only when the API returns no menu (DB is the source of
// truth once seeded). Mirrors MENU_SEED in the api-server.
const menuCategories: MenuCategory[] = [
  {
    id: "encas",
    label: "Encas",
    tagline: "Petites bouchées pour ouvrir la soirée.",
    dishes: [
      { name: "Bol de chips", price: "6,00 $", desc: "Croustilles Covered Bridge.", image: "dish-tasting.png" },
      { name: "Saucissons secs", price: "6,25 $", desc: "Porc Épique.", image: "dish-charcuterie.png" },
      { name: "Bol d'olives", price: "6,25 $", desc: "Olives méli-mélo.", image: "dish-charcuterie.png" },
      { name: "Soupe du jour", price: "6,95 $", desc: "Servie avec pain au levain (Maison Jaune).", image: "naan-dip.jpg" },
      { name: "Frites épicées", price: "7,25 $", desc: "Mayonnaise ordinaire, jalapenos ou épicée / sauce ranch au bleu / ketchup.", image: "dish-tasting.png" },
      { name: "Pizza à l'ail", price: "15,95 $", desc: "Trempette marinara.", image: "pizza-oven.jpg" },
      { name: "Trempette et chips de maïs", price: "15,95 $", desc: "Guacamole, salsa maison, crème sûre, fromage râpé.", image: "naan-dip.jpg" },
      { name: "Crostini bruschetta", price: "17,00 $", desc: "Pain baguette, cheddar fort, glaze balsamique, mayonnaise lime.", image: "bread-tearing.png" },
      { name: "Choux-fleurs « pop-corn »", price: "17,50 $", desc: "Trempette avocat-lime.", image: "dish-tasting.png" },
    ],
  },
  {
    id: "salades",
    label: "Salades",
    tagline: "Prix : accompagnement / repas.",
    dishes: [
      { name: "Verte", price: "5,50 $ / 9,50 $", desc: "Mélange de salade, vinaigre balsamique, huile d'olive.", image: "bufarella-mint.jpg" },
      { name: "Maison", price: "7,95 $ / 11,95 $", desc: "Mélange de salade, concombres, tomates, oignons marinés, vinaigrette citron-érable.", image: "bufarella-mint.jpg" },
      { name: "César", price: "10,50 $ / 16,50 $", desc: "Laitue romaine, bacon, croutons, parmesan, sauce césar maison.", image: "bufarella-mint.jpg" },
      { name: "Canneberge", price: "12,25 $ / 20,50 $", desc: "Mélange de salade, cheddar fort, noix de Grenoble caramélisées, oignons marinés, canneberges séchées.", image: "bufarella-mint.jpg" },
      { name: "Truite fumée", price: "14,95 $ / 24,95 $", desc: "Truite fumée (Les Cowboys du BBQ), mélange de salade, radis, concombres, fenouils. Vinaigrette citron-érable ou sauce maison ranch au bleu.", image: "bufarella-mint.jpg" },
    ],
  },
  {
    id: "pizzas",
    label: "Pizzas four à bois",
    tagline: "Fromage végétalien +2,00 $ · Pâte sans gluten Oggi +4,95 $.",
    dishes: [
      { name: "Margherita", price: "20,95 $", desc: "Sauce tomate, bufarella, parmesan, basilic.", image: "pizza-oven.jpg" },
      { name: "4 fromages", price: "21,95 $", desc: "Mozzarella, cheddar fort, parmesan, provolone. Beurre à l'ail +2,50 $.", image: "dish-pizza.png" },
      { name: "Pesto", price: "21,95 $", desc: "Courgette, roquette, parmesan.", image: "pizza-planche.jpg" },
      { name: "Calabrese", price: "22,95 $", desc: "Sauce tomate, mozzarella, oignons blancs, miel (Les Ruchers Bérard).", image: "facade-pizza.jpg" },
      { name: "Pepperoni", price: "22,95 $", desc: "Sauce tomate, mozzarella.", image: "chef-four-a-bois.jpg" },
      { name: "La Toute", price: "23,95 $", desc: "Sauce tomate, mozzarella, pepperoni, poivrons, bacon, champignons.", image: "pizza-oven.jpg" },
      { name: "Prosciutto", price: "24,95 $", desc: "Sauce tomate, mozzarella, bufarella, roquette, glaze balsamique, parmesan.", image: "dish-pizza.png" },
      { name: "La « Bigflo »", price: "24,95 $", desc: "Fromage jaune, viande hachée, cornichons, salade romaine, sauce maison style « bigmac ».", image: "pizza-planche.jpg" },
      { name: "La Québécoise", price: "25,95 $", desc: "Sauce tomate, mozzarella, bacon, pepperoni, oignons rouges, chair de saucisses (Ferme J.N Beauchemin), oignons verts.", image: "facade-pizza.jpg" },
      { name: "La Maï Maï", price: "25,95 $", desc: "Sauce crème citron-romarin, truite fumée (Les Cowboys du BBQ), oignons verts, roquette, fenouils.", image: "chef-four-a-bois.jpg" },
      { name: "La « Sweet Lou »", price: "25,95 $", desc: "Sauce tomate et sauce BBQ, mozzarella, brisket (Les Cowboys du BBQ), fromage de chèvre, oignons marinés.", image: "pizza-oven.jpg" },
    ],
  },
  {
    id: "hoagies",
    label: "Hoagies",
    tagline: "Servis avec frites ou salade (Verte, Maison, César, Canneberge +1,25 $, Truite fumée +5,50 $). Option « sans accompagnement » disponible à moindre coût.",
    dishes: [
      { name: "BLT su flo'", price: "20,95 $", desc: "Mayonnaise jalapenos, bacon, laitue, tomates. Champignons shiitake (protéine végétale) +4,00 $ · option « sans bacon ».", image: "sandwich-mac.jpg" },
      { name: "Légumes et fromage de chèvre", price: "21,25 $", desc: "Pesto de tomates séchées, courgettes, poivrons, champignons, roquette.", image: "dish-sandwich.png" },
      { name: "Jambon", price: "23,50 $", desc: "Jambon (Porc Épique), mayonnaise moutarde, fromage suisse, roquette.", image: "feuillete-ham.jpg" },
      { name: "Charcuteux", price: "24,95 $", desc: "Mayonnaise balsamique, prosciutto, calabrese, bufarella, tomates, roquette.", image: "tower-sandwich.jpg" },
      { name: "Brisket", price: "24,95 $", desc: "Brisket (Les Cowboys du BBQ), moutarde maison, cornichons. Fromage provolone +1,00 $.", image: "miche-porc.jpg" },
    ],
  },
  {
    id: "desserts",
    label: "Desserts",
    tagline: "Pâtisseries en rotation chaque semaine — prix variable.",
    dishes: [
      { name: "Pâtisseries invitées", price: "", desc: "Le Comptoir d'Alexandrine, Christophe, Pâtisserie Aveline — en rotation chaque semaine, prix variable.", image: "" },
      { name: "Croustade maison", price: "7,95 $", desc: "Servie avec crème glacée.", image: "" },
      { name: "Pizza dessert maison", price: "9,95 $", desc: "≈ 10 pouces.", image: "" },
    ],
  },
  {
    id: "cafes-thes",
    label: "Cafés & thés",
    tagline: "",
    dishes: [
      { name: "Café décaféiné", price: "3,00 $", desc: "", image: "" },
      { name: "Café filtre", price: "3,50 $", desc: "Wiltor.", image: "" },
      { name: "Thé vert / thé chaï / thé noir", price: "3,50 $", desc: "", image: "" },
      { name: "Tisane gingembre et citron / camomille", price: "3,50 $", desc: "", image: "" },
    ],
  },
  {
    id: "alcools",
    label: "Alcools",
    tagline: "Prix : 1 oz / avec café.",
    dishes: [
      { name: "Coureur des bois", price: "9,00 $ / 10,00 $", desc: "Crème d'érable.", image: "" },
      { name: "Crémette espresso", price: "9,00 $ / 10,00 $", desc: "", image: "" },
      { name: "Tioméo, rhum chocolat café", price: "10,00 $ / 11,00 $", desc: "Rosemont.", image: "" },
    ],
  },
  {
    id: "extras",
    label: "Extras",
    tagline: "Suppléments à ajouter à vos plats.",
    dishes: [
      { name: "Viandes", price: "+3,50 $", desc: "", image: "" },
      { name: "Légumes", price: "+1,75 $", desc: "", image: "" },
      { name: "Champignons shiitake", price: "+4,00 $", desc: "Protéine végétale.", image: "" },
      { name: "Fromages", price: "+2,75 $", desc: "", image: "" },
      { name: "Bufarella", price: "+5,50 $", desc: "", image: "" },
    ],
  },
  {
    id: "ardoise",
    label: "L'ardoise",
    tagline: "Les spéciaux du chef — au gré des arrivages du marché.",
    dishes: [
      { name: "Grilled cheese sur baguette", price: "6,95 $ / 12,95 $", desc: "Provolone, mozzarella, fromage jaune, beurre à l'ail.", image: "dish-sandwich.png" },
      { name: "HoagieDog", price: "22,95 $", desc: "Hoagie (pâte à pizza pliée), saucisse mangue-coriandre (Ferme J.N Beauchemin), salade de choux crémeuse, sauce aïoli à la lime.", image: "" },
      { name: "Pas une poutine", price: "15,95 $", desc: "Focaccia maison en cube, sauce à poutine, fromage en grain, oignons verts. Extra saucisse hot-dog : 2,50 $.", image: "" },
      { name: "Bufarella « Terre promise »", price: "17,95 $", desc: "Boule de fromage bufarella (Fromagerie Fuoco) accompagnée d'une purée d'haricots noirs, maïs poêlé épicé, mayonnaise avocat-coriandre, calabrese séchée émiettée, oignons blancs marinés, tomates en dés. Servi avec pain brioché.", image: "bufarella-mint.jpg" },
      { name: "Salade « Embarque ma belle »", price: "12,25 $ / 20,50 $", desc: "Mélange printanier, menthe, feta, melon d'eau, vinaigrette menthe et Limoncello (Distillerie 3 Lacs), jus de citron, amandes grillées. Contient de l'alcool.", image: "" },
      { name: "Pizza « Salut, Cowboy »", price: "25,95 $", desc: "Purée de fraise au basilic, bufarella (Fromagerie Fuoco), noix de Grenoble, tomates séchées, huile d'olive.", image: "pizza-oven.jpg" },
      { name: "Pizza Box", price: "32,95 $ / 35,95 $ la boîte", desc: "2 pains plats par boîte pour faire 4 petites pizzas. Boîte végé (32,95 $) : Margherita, 4 Fromages, Pesto Courgette, la Végé. Boîte viande (35,95 $) : Québécoise, Sweet Lou, Prosciutto, Pepperoni.", image: "" },
      { name: "« Messieurs patates »", price: "10,95 $", desc: "Bouchées de pommes de terre frits, parmesan, huile de truffe, beurre à l'ail confit maison, poivre moulu, sirop d'érable. Servi avec sauce marinara.", image: "dish-tasting.png" },
      { name: "« Philly T »", price: "25,95 $", desc: "Pain baguette, fromages (jaune, mozzarella, provolone), poivrons rouges, onions blancs, brisket (Les Cowboys du BBQ), mayonnaise épicée. Servi avec salade de pâte maison et cup de sauce BBQ.", image: "miche-porc.jpg" },
    ],
  },
];

function Menu() {
  const allCategories = useMenuCategoriesData();
  const suppliers = useMenuSuppliers();
  // Order tabs to follow FOOD_SLUGS so "L'ardoise" leads, like the Menu page.
  const categories = FOOD_SLUGS.map((slug) =>
    allCategories.find((c) => c.id === slug),
  ).filter((c): c is MenuCategory => Boolean(c));
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id ?? "");
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? categories[0];
  if (!activeCategory) return null;
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
              {suppliers.map((s, j) => (
                <span key={j} className="px-8">★ {s}</span>
              ))}
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
            <h2 className="ardoise-clip font-display text-[clamp(2.25rem,12vw,12rem)] leading-[1.2] pb-[0.3em] pl-[0.08em] mb-8 max-w-full overflow-visible">
              Le Menu
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

            <a
              href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/menu`}
              className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 border border-orange text-orange text-[0.75rem] font-medium tracking-[0.2em] uppercase hover:bg-orange hover:text-bg-primary transition-all duration-300 rounded-[2px]"
            >
              Voir le menu complet
              <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Category tabs */}
          <div
            role="tablist"
            aria-label="Catégories du menu"
            data-lenis-prevent
            className="flex gap-1 md:gap-3 mb-12 border-b border-border overflow-x-auto overflow-y-hidden overscroll-x-contain no-scrollbar [-webkit-overflow-scrolling:touch]"
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
                  className={`relative shrink-0 px-4 md:px-6 py-4 text-[0.85rem] font-medium tracking-[0.18em] uppercase transition-colors whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-inset ${
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
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange"
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
                        className={`group grid grid-cols-[40px_minmax(0,1fr)_auto] md:grid-cols-[60px_1fr_auto] gap-x-4 gap-y-1 md:gap-x-8 py-8 border-b border-border cursor-default transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-inset ${isActive ? "bg-bg-secondary/40" : "hover:bg-bg-secondary/30"} px-3 md:px-6`}
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
                        <div className={`row-span-2 font-serif italic text-lg md:text-xl pt-1 transition-colors ${isActive ? "text-orange" : "text-orange/70"}`}>
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <motion.div 
                          className="min-w-0"
                          animate={{ x: isActive ? 12 : 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <h3 className="menu-item-name font-medium text-[1.35rem] md:text-[1.6rem] text-cream leading-tight tracking-[-0.01em]">
                            {dish.name}
                          </h3>
                        </motion.div>
                        <div className="font-serif font-semibold text-[1.25rem] md:text-[1.5rem] text-orange md:whitespace-nowrap max-w-[55vw] md:max-w-none pt-1 justify-self-end text-right">
                          {dish.price}
                        </div>
                        <motion.p
                          className="col-start-2 col-span-2 md:col-span-1 font-sans font-light italic text-cream-soft/85 max-w-[600px] leading-relaxed text-sm md:text-base"
                          animate={{ x: isActive ? 12 : 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          {dish.desc}
                        </motion.p>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: sticky photo collage that cross-fades on dish focus */}
            <div className="lg:sticky lg:top-32 w-full">
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-bg-secondary ring-1 ring-cream/10">
                {activeDish?.image ? (
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
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-cream-soft/40 font-serif italic">
                    Chez Florent
                  </div>
                )}
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
              « L'ardoise change chaque mois — au gré du chef et des arrivages. »
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

type RendezvousItem = {
  title: string;
  desc: string;
  slot: "press" | "voice1" | "voice2" | "voice3";
};

const RENDEZVOUS: RendezvousItem[] = [
  {
    title: "Jeux de société",
    desc: "Une pleine bibliothèque de jeux à portée de main. Choisis ta boîte, prends une pinte, et que le meilleur gagne.",
    slot: "voice1",
  },
  {
    title: "Soirée Hitster",
    desc: "Vinyles, vins nature et bouchées de l'ardoise — la soirée où on se donne rendez-vous.",
    slot: "press",
  },
  {
    title: "Run club",
    desc: "On part ensemble, on revient assoiffés. Un parcours décontracté suivi d'une bière de microbrasserie bien méritée.",
    slot: "voice2",
  },
  {
    title: "Quiz",
    desc: "Testez vos connaissances en équipe, une pinte à la main. Le quiz du quartier, avec cartes-cadeaux à gagner pour les plus futés.",
    slot: "voice3",
  },
];

function Rendezvous() {
  const photos = usePhotos();
  return (
    <section id="voix" className="bg-bg-primary pt-32 pb-32 relative overflow-hidden">
      <SectionMarker number="—" />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 mb-20 md:mb-24">
        <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-6">
          <span aria-hidden="true">◦ </span>Interlude — Ce qui nous rassemble
        </div>
        <h2 className="font-display text-cream leading-[1.18] pb-[0.28em] pl-[0.06em] text-[clamp(2rem,10vw,9rem)] mb-8">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="block"
          >
            Nos rendez-vous
          </motion.span>
        </h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          className="font-serif italic text-cream-soft/85 max-w-2xl text-lg md:text-xl"
        >
          Des soirées qui reviennent, semaine après semaine — pas besoin d'occasion, juste l'envie de sortir de la maison.
        </motion.p>
      </div>

      {/* Recurring rendez-vous — asymmetric staggered grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 lg:gap-10">
          {RENDEZVOUS.map((r, i) => (
            <motion.article
              key={r.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
              className={`flex flex-col group ${
                i % 2 === 1 ? "lg:mt-12" : ""
              }`}
            >
              {/* Photo */}
              <div className="relative aspect-[4/5] overflow-hidden ring-1 ring-cream/10 mb-6">
                <img
                  src={photos[r.slot].url}
                  alt={photos[r.slot].alt}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
              </div>

              {/* Title + description */}
              <h3 className="font-serif font-semibold text-cream text-[1.35rem] md:text-[1.5rem] leading-tight mb-3">
                {r.title}
              </h3>
              <p className="font-sans font-light text-cream-soft/85 text-[0.95rem] leading-[1.7]">
                {r.desc}
              </p>
            </motion.article>
          ))}
        </div>

        <div className="mt-16 md:mt-20 text-center">
          <a
            href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/evenements`}
            className="mt-6 inline-flex items-center gap-3 px-7 py-3 border border-cream/30 text-cream text-[0.75rem] font-medium tracking-[0.2em] uppercase rounded-[2px] hover:bg-cream hover:text-bg-primary transition-all duration-300"
          >
            Voir tous les événements
            <span aria-hidden="true">→</span>
          </a>
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
  { id: "5a7-du-jour", date: { day: "03", month: "JUIL" }, isoDate: "2026-07-03", title: "5 à 7 — Découvertes du jour", desc: "Le sommelier ouvre quelques bouteilles à découvrir, planche de charcuteries en accompagnement. Passe faire un tour !", tag: "5 à 7 · 17h–19h" },
  { id: "sapinage",   date: { day: "16", month: "JUIL" }, isoDate: "2026-07-16", title: "Soirée Cocktails du Sapinage", desc: "Cinq cocktails signature au sapin baumier, à découvrir au 5 à 7. Bouchées chaudes incluses.", tag: "5 à 7 · 17h–19h" },
  { id: "jazz",       date: { day: "25", month: "JUIL" }, isoDate: "2026-07-25", title: "Trio Jazz Manouche", desc: "Trois instrumentistes du Sud-Ouest, en visite pour une soirée. Entrée libre, bon vin recommandé.", tag: "Live · 20h" },
  { id: "vins-qc",    date: { day: "01", month: "AOÛT" }, isoDate: "2026-08-01", title: "Dégustation de vins québécois", desc: "Six vins d'ici présentés par le sommelier, bouchées d'accompagnement incluses. Places limitées.", tag: "Soirée · 19h" },
  { id: "huitres",    date: { day: "08", month: "AOÛT" }, isoDate: "2026-08-08", title: "Huîtres & bulles", desc: "Trois variétés de la Côte-Nord, accord avec champagnes et pétillants québécois.", tag: "Soirée · 19h" },
  { id: "jeux-geants", date: { day: "12", month: "AOÛT" }, isoDate: "2026-08-12", title: "Soirée jeux de société géants", desc: "Version XL de nos classiques, en équipes. Pintes de microbrasserie pour les gagnants.", tag: "Dès 18h" },
  { id: "brunch",     date: { day: "15", month: "AOÛT" }, isoDate: "2026-08-15", title: "Brunch gourmand — 4 services", desc: "Menu 4 services, mimosas maison, places limitées. Réservation fortement suggérée.", tag: "Menu spécial · 38 $", soldOut: true },
  { id: "5a7-brasseries", date: { day: "20", month: "AOÛT" }, isoDate: "2026-08-20", title: "5 à 7 des microbrasseries", desc: "Quatre brasseries de la région en dégustation, planche de charcuteries incluse.", tag: "5 à 7 · 17h–19h" },
  { id: "open-mic",   date: { day: "22", month: "AOÛT" }, isoDate: "2026-08-22", title: "Open Mic — Poésie & guitare", desc: "Soirée micro ouvert, ambiance feutrée. Inscrivez-vous sur place.", tag: "Acoustique · 20h" },
  { id: "quatre-mains", date: { day: "29", month: "AOÛT" }, isoDate: "2026-08-29", title: "Table d'hôte à quatre mains", desc: "Notre chef reçoit un invité le temps d'un soir pour un menu dégustation en duo.", tag: "Menu spécial · 45 $" },
  { id: "fin-ete",    date: { day: "05", month: "SEPT" }, isoDate: "2026-09-05", title: "Buffet & DJ — Fin d'été", desc: "Buffet québécois, DJ jusqu'à 1h. La devanture devient une terrasse-piste.", tag: "Toute la soirée" },
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
  const base: AgendaEvent[] =
    !data || data.length === 0
      ? agendaEvents
      : data.map((e) => {
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

  // Only show upcoming events (today included), soonest first.
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return base
    .filter((e) => e.isoDate >= todayIso)
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate));
}

const DEFAULT_MENU_SUPPLIERS = [
  "Les Cowboys du BBQ",
  "Fuoco",
  "L'or de l'Italie",
  "Wiltor Café",
  "Ferme J.N Beauchemin",
  "Charcuteries Porc Épique",
  "Christophe",
  "Le Comptoir Alexandrine",
  "Pâtisserie Aveline",
  "Comont",
  "Flirt",
  "Statera",
  "Rosemont",
  "Helix",
  "La Barberie",
  "Auval",
  "Dunham",
  "5e Baron",
  "Cheptel",
  "Messorem",
  "Bad Bones",
  "Prospecteur",
  "Stadaconé",
  "Domaine du Fleuve",
  "Domaine l'Espiègle",
  "Nival",
  "Domaine Gélinas",
  "Vignoble Ste-Pétronile",
  "Gutsy",
  "Brasserie du Bas-Canada",
  "Albion",
  "Artisans du Terroir",
  "Les Ouches",
  "Wein Goutte",
  "Herman",
  "Tête d'allumette",
  "Gaspard",
  "Sir John",
];

// The suppliers shown in the scrolling band on the Menu page. Editable in the
// admin (« Menu » tab); falls back to defaults so the band is never empty.
function useMenuSuppliers(): string[] {
  const { data } = useGetMenuMarquee();
  const suppliers = data?.suppliers?.filter((s) => s.trim() !== "");
  return suppliers && suppliers.length > 0 ? suppliers : DEFAULT_MENU_SUPPLIERS;
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
    return `${span}  ·  ${formatHour(g.band.open)} – ${formatHour(g.band.close)}`;
  });
}

// Builds the "Passez nous voir" hours table rows from the CMS schedule,
// grouping consecutive days that share the same hours (Mon → Sun).
export function useHoursRows(): { label: string; value: string; closed: boolean }[] {
  const schedule = useScheduleData();
  const order = [1, 2, 3, 4, 5, 6, 0]; // Mon → Sun
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
    const first = DAY_SHORT_FR[g.days[0]]!.toUpperCase();
    const lastD = DAY_SHORT_FR[g.days[g.days.length - 1]]!.toUpperCase();
    const label = g.days.length === 1 ? first : `${first} — ${lastD}`;
    if (!g.band) return { label, value: "Fermé", closed: true };
    return {
      label,
      value: `${formatHour(g.band.open)} → ${formatHour(g.band.close)}`,
      closed: false,
    };
  });
}

// Returns the open-days range derived from the CMS schedule.
// e.g. { short: "Mar–Dim", long: "mardi au dimanche" }
export function useOpenDaysLabel(): { short: string; long: string } {
  const schedule = useScheduleData();
  const order = [2, 3, 4, 5, 6, 0, 1]; // Tue → Sun → Mon
  const openDays = order.filter((d) => schedule[d] != null);
  if (openDays.length === 0) return { short: "Sur réservation", long: "sur réservation" };
  const first = openDays[0];
  const last = openDays[openDays.length - 1];
  if (first === last) {
    return { short: DAY_SHORT_FR[first]!, long: DAY_NAMES_FR[first]! };
  }
  return {
    short: `${DAY_SHORT_FR[first]}–${DAY_SHORT_FR[last]}`,
    long: `${DAY_NAMES_FR[first]} au ${DAY_NAMES_FR[last]}`,
  };
}

// Returns the earliest opening hour across all open days (e.g. 17).
export function useEarliestOpenHour(): string | null {
  const schedule = useScheduleData();
  const hours = Object.values(schedule)
    .filter((s): s is { open: number; close: number } => s != null)
    .map((s) => s.open);
  return hours.length > 0 ? formatHour(Math.min(...hours)) : null;
}

// Canonical social profile links — single source of truth used by both the UI
// and the Restaurant JSON-LD structured data.
export const CANONICAL_SOCIAL_LINKS = [
  "https://www.instagram.com/chez.florent",
  "https://www.facebook.com/p/Chez-Florent-61558102300719/",
];

// schema.org day names indexed by JS getDay() (0 = Sunday).
const SCHEMA_DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

// Converts a decimal hour (17, 11.5) to a schema.org-compatible "HH:MM" string.
function toSchemaTime(h: number): string {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

// Keeps the Restaurant JSON-LD in <head> in sync with the live hours from the API.
// Patches the static baseline in index.html (id="restaurant-schema") so the
// openingHoursSpecification always reflects the admin-editable schedule.
export function useRestaurantSchema() {
  const schedule = useScheduleData();

  useEffect(() => {
    const openingHoursSpecification = Object.entries(schedule)
      .filter(([, slot]) => slot != null)
      .map(([day, slot]) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: SCHEMA_DAY_NAMES[Number(day)],
        opens: toSchemaTime((slot as { open: number; close: number }).open),
        closes: toSchemaTime((slot as { open: number; close: number }).close),
      }));

    const schema = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: "Chez Florent",
      url: "https://chezflorent.ca/",
      image: "https://chezflorent.ca/opengraph.jpg",
      description:
        "Restaurant de quartier à Sorel-Tracy. L'ardoise change selon les humeurs du chef et les arrivages du marché.",
      telephone: "+1-450-743-1448",
      priceRange: "$$",
      servesCuisine: ["Cuisine française", "Cuisine québécoise"],
      address: {
        "@type": "PostalAddress",
        streetAddress: "57 Rue du Roi",
        addressLocality: "Sorel-Tracy",
        addressRegion: "QC",
        postalCode: "J3P 4M6",
        addressCountry: "CA",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 46.0419,
        longitude: -73.1163,
      },
      openingHoursSpecification,
      acceptsReservations: "True",
      sameAs: CANONICAL_SOCIAL_LINKS,
    };

    let el = document.getElementById("restaurant-schema") as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = "restaurant-schema";
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);
  }, [schedule]);
}

type PhotoMap = Record<string, { url: string; alt: string }>;
const PHOTO_FALLBACK: PhotoMap = {
  hero: { url: "/images/salle-manger.webp", alt: "Salle à manger de Chez Florent" },
  about1: { url: "/images/proprietaires-dos.jpg", alt: "Florent et ses associés, de dos, au comptoir" },
  about2: { url: "/images/trio-biere.jpg", alt: "Trio de bières de microbrasserie québécoises" },
  about3: { url: "/images/pizza-planche.jpg", alt: "Pizza du four à bois servie sur planche" },
  about4: { url: "/images/maison-plats.jpg", alt: "Plats de la maison et pinte partagée" },
  about5: { url: "/images/maison-pizza-biere.jpg", alt: "Pointe de pizza et pinte Florent" },
  about6: { url: "/images/maison-vin.jpg", alt: "Vin québécois versé au verre" },
  about8: { url: "/images/maison-four.jpg", alt: "Le four à bois de la maison" },
  press: { url: "/images/interior-bar.jpg", alt: "Salle à manger de Chez Florent" },
  voice1: { url: "/images/jeux-societe.jpg", alt: "Un jeu de société sur une table Chez Florent" },
  voice2: { url: "/images/run-club.png", alt: "Coureuse accompagnée de son chien sur la piste cyclable — run club Chez Florent" },
  voice3: { url: "/images/quiz-gagnant.jpg", alt: "Une carte-cadeau gagnée lors d'un quiz Chez Florent" },
  facade: { url: "/images/facade-pizza.jpg", alt: "Devanture de Chez Florent, 57 rue du Roi à Sorel-Tracy" },
  "grp-formule-1": { url: "/images/tap-pour.jpg", alt: "Formule — service au comptoir" },
  "grp-formule-2": { url: "/images/bread-tearing.png", alt: "Formule — pain partagé" },
  "grp-formule-3": { url: "/images/dish-charcuterie.png", alt: "Formule — planche de charcuterie" },
  "grp-occasion-1": { url: "/images/interior-bar.jpg", alt: "Occasion — la salle Chez Florent" },
  "grp-occasion-2": { url: "/images/tap-pour.jpg", alt: "Occasion — au comptoir" },
  "grp-occasion-3": { url: "/images/florent-glass.jpg", alt: "Occasion — verre signature" },
  "apropos-hero": { url: "/images/suflo-crew-dos.jpg", alt: "L'équipe Su Flo de dos au comptoir" },
  "evenements-hero": { url: "/images/jeu-cribbage.jpg", alt: "Jeu de cribbage sur une table Chez Florent" },
  "contact-hero": { url: "/images/salle-rouge.jpg", alt: "La salle à manger rouge de Chez Florent" },
  "apropos-1": { url: "/images/suflo-crew-dos.jpg", alt: "L'équipe de Chez Florent" },
  "apropos-2": { url: "/images/equipe-bar.jpg", alt: "L'équipe au bar" },
  "apropos-3": { url: "/images/chef-four-a-bois.jpg", alt: "Le chef au four à bois" },
  "apropos-chef": { url: "/images/chef-four-a-bois.jpg", alt: "Portrait du chef" },
  // Ordre alterné bouffe → alcool → resto (note cliente), photo de salle en
  // double retirée (ancienne g-photo-12).
  gallery1: { url: "/images/g-photo-02.jpg", alt: "Pizzas du four à bois et verres" },
  gallery2: { url: "/images/g-photo-01.jpg", alt: "Vin blanc versé au comptoir" },
  gallery3: { url: "/images/g-photo-10.jpg", alt: "La salle à manger Chez Florent" },
  gallery4: { url: "/images/g-photo-03.jpg", alt: "Pizza pour emporter" },
  gallery5: { url: "/images/g-photo-05.jpg", alt: "Bières de microbrasserie québécoises" },
  gallery6: { url: "/images/g-photo-11.jpg", alt: "La salle et le bar Chez Florent" },
  gallery7: { url: "/images/g-photo-04.jpg", alt: "Pizza au four à bois" },
  gallery8: { url: "/images/g-photo-07.jpg", alt: "Spiritueux québécois au bar" },
  gallery9: { url: "/images/g-photo-13.jpg", alt: "Le comptoir et les pompes à bière" },
  gallery10: { url: "/images/g-photo-06.jpg", alt: "Burger généreux Chez Florent" },
  gallery11: { url: "/images/g-photo-08.jpg", alt: "Casquettes Florent" },
  gallery12: { url: "/images/g-photo-09.jpg", alt: "Plats et pinte partagés" },
  gallery13: { url: "/images/g-photo-14.jpg", alt: "Assiette de l'ardoise" },
  gallery14: { url: "/images/g-photo-15.jpg", alt: "Pizza fromagée et pinte Florent" },
  gallery15: { url: "/images/g-photo-16.jpg", alt: "Bouchées gratinées" },
};

const GALLERY_SLOTS = Array.from({ length: 15 }, (_, i) => `gallery${i + 1}`);

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
          <h2 className="font-display text-bg-primary leading-[1.18] pb-[0.28em] pl-[0.08em] text-[clamp(2rem,10vw,9.5rem)]">
            L'agenda
          </h2>
          <p className="font-sans italic text-bg-primary/65 max-w-2xl text-lg mt-6">
            Soirées, dégustations et concerts à venir — choisissez votre prochaine.
          </p>
        </div>

        <div className="border-t border-bg-primary/15">
          {agendaEvents.slice(0, 6).map((event, i) => {
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

// Returns the human-readable hours string for today (e.g. "11h30 – 21h" or "Fermé aujourd'hui").
function useTodaysHours() {
  const schedule = useScheduleData();
  const today = schedule[new Date().getDay()];
  return today ? `${formatHour(today.open)} – ${formatHour(today.close)}` : "Fermé aujourd'hui";
}

type EventPrefill = { id: string; title: string; date: string; display: string };

function Reservation() {
  const [prefill, setPrefill] = useState<EventPrefill | null>(null);
  const liveStatus = useOpenStatus();
  const todaysHours = useTodaysHours();
  const daysLabel = useOpenDaysLabel();

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
      {/* <HoursBand /> — bande défilante masquée; réactiver au besoin */}

      <section id="reservation" className="bg-bg-primary py-32 md:py-40 px-6 md:px-12 relative overflow-hidden">
        <SectionMarker number="04" />

        {/* Massive ghost number behind everything for editorial weight */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-display text-[40vw] md:text-[28vw] text-cream/[0.025] leading-none -translate-y-12">
            04
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
              <span aria-hidden="true">✶ </span>04 — Une table pour vous
            </div>
            <h2 className="font-display font-display-tight text-[clamp(2.5rem,12vw,13rem)] text-cream leading-[1.18] pb-[0.28em] mb-8">
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
              { n: "02", title: "Confirmation immédiate", body: "Votre table est confirmée sur-le-champ." },
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
                  "Groupes de 8 et plus : appelez-nous directement",
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
                  className="w-full min-h-[760px] border-0 block bg-cream-soft"
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

type FaqItem = { q: string; a: React.ReactNode };

function FAQ() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const faqs: FaqItem[] = [
    {
      q: "Réservation de groupe",
      a: (
        <>
          Party de bureau, anniversaire, ou envie de privatiser le restaurant au
          complet — on s'occupe de tout. Écris-nous ou appelle au{" "}
          <a href="tel:+14507431448" className="text-orange link-underline">450 743-1448</a>{" "}
          et jette un œil à notre{" "}
          <a href={`${base}/groupes`} className="text-orange link-underline">page groupes</a>.
        </>
      ),
    },
    {
      q: "Pâtes sans gluten, allergies et options",
      a: (
        <>
          On offre des pâtes sans gluten, ainsi que des options sans alcool,
          végétariennes et sans lactose — l'ardoise change chaque mois. Mentionne
          tes allergies au moment de réserver ou à ton arrivée : la cuisine
          s'adapte du mieux qu'elle peut.
        </>
      ),
    },
    {
      q: "Mobilité et accessibilité",
      a: (
        <>
          Le restaurant est accessible de plain-pied. Pour toute question
          d'accessibilité ou pour qu'on te réserve la place la plus pratique,
          appelle-nous avant ta visite au{" "}
          <a href="tel:+14507431448" className="text-orange link-underline">450 743-1448</a>.
        </>
      ),
    },
    {
      q: "Stationnement",
      a: (
        <>
          Du stationnement sur rue est disponible autour du restaurant, et les
          stationnements publics du centre-ville sont à quelques pas. Les soirs
          d'événement, prévois un petit délai.
        </>
      ),
    },
    {
      q: "Enfants et familles",
      a: (
        <>
          Les familles sont les bienvenues — chaises hautes disponibles et un
          menu qui plaît aux plus petits. Les jeux de société font patienter
          toute la tablée jusqu'au dessert.
        </>
      ),
    },
    {
      q: "Terrasse et animaux",
      a: (
        <>
          Dès les beaux jours, la devanture devient une terrasse. Les chiens
          tranquilles y sont acceptés — une gamelle d'eau les attend.
        </>
      ),
    },
    {
      q: "Cartes-cadeaux et paiement",
      a: (
        <>
          On offre des cartes-cadeaux, parfaites pour faire découvrir la maison.
          On accepte l'argent comptant ainsi que les cartes de débit et de
          crédit.
        </>
      ),
    },
  ];

  return (
    <section id="faq" className="bg-cream-soft pt-32 pb-32 relative">
      <SectionMarker number="—" tone="light" />
      <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-14"
        >
          <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-bg-primary/60 mb-6">
            <span aria-hidden="true">◦ </span>Bon à savoir
          </div>
          <h2 className="font-display text-bg-primary leading-[1.18] pb-[0.28em] pl-[0.06em] text-[clamp(1.75rem,8vw,7rem)]">
            Questions fréquentes
          </h2>
        </motion.div>

        <div className="border-t border-bg-primary/15">
          {faqs.map((f, i) => (
            <motion.details
              key={f.q}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 }}
              className="group border-b border-bg-primary/15 py-6"
            >
              <summary className="flex items-center justify-between gap-6 cursor-pointer list-none font-serif text-bg-primary text-[1.25rem] md:text-[1.55rem] leading-snug outline-none focus-visible:text-orange">
                <span>{f.q}</span>
                <span
                  aria-hidden="true"
                  className="text-orange text-2xl leading-none transition-transform duration-300 group-open:rotate-45 shrink-0"
                >
                  +
                </span>
              </summary>
              <div className="mt-4 font-sans font-light text-bg-primary/75 leading-[1.8] max-w-2xl text-[0.95rem] md:text-base">
                {f.a}
              </div>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}

// Human label for how soon an event is: "Ce soir" (today), "Demain" (tomorrow),
// otherwise the French weekday name (e.g. "Vendredi").
function eventLabel(isoDate: string): string {
  const parts = isoDate.split("-");
  const evt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  evt.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((evt.getTime() - today.getTime()) / 86_400_000);
  if (diff <= 0) return "Ce soir";
  if (diff === 1) return "Demain";
  const names = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  return names[evt.getDay()] ?? "Bientôt";
}

function TodayEventPopup() {
  const events = useAgendaEventsData();
  const [visibleId, setVisibleId] = useState<string | null>(null);

  // Stable primitive: the id of the soonest non-sold-out event happening within
  // the next 5 days (today included), or null. The 5-day lead means the popup
  // appears ahead of time — e.g. on Sunday you already see Friday's event.
  const now = new Date();
  const toIso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const todayIso = toIso(now);
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + 5);
  const horizonIso = toIso(horizon);
  const matchId =
    [...events]
      .filter(
        (e) => !e.soldOut && e.isoDate >= todayIso && e.isoDate <= horizonIso,
      )
      .sort((a, b) => a.isoDate.localeCompare(b.isoDate))[0]?.id ?? null;

  useEffect(() => {
    if (!matchId) return;
    try {
      if (sessionStorage.getItem(`cf-event-popup-${matchId}`)) return;
    } catch {
      /* sessionStorage unavailable — show anyway */
    }
    const t = setTimeout(() => setVisibleId(matchId), 1400);
    return () => clearTimeout(t);
  }, [matchId]);

  const event = visibleId
    ? events.find((e) => e.id === visibleId) ?? null
    : null;

  const dismiss = () => {
    if (visibleId) {
      try {
        sessionStorage.setItem(`cf-event-popup-${visibleId}`, "1");
      } catch {
        /* ignore */
      }
    }
    setVisibleId(null);
  };

  return (
    <AnimatePresence>
      {event && (
        <motion.aside
          role="dialog"
          aria-label={`Événement à venir : ${event.title}`}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="fixed bottom-4 left-4 sm:bottom-5 sm:left-5 z-[90] w-[min(76vw,290px)] sm:w-[min(92vw,380px)] bg-bg-primary text-cream ring-1 ring-cream/15 shadow-2xl p-4 sm:p-6"
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Fermer"
            className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-cream-soft/70 hover:text-cream text-lg sm:text-xl leading-none transition-colors"
          >
            ×
          </button>
          <div className="text-[0.6rem] sm:text-[0.7rem] font-medium tracking-[0.2em] sm:tracking-[0.22em] uppercase text-orange mb-2 sm:mb-3">
            <span aria-hidden="true">✶ </span>
            {eventLabel(event.isoDate)} · encore des places
          </div>
          <h3 className="font-serif font-semibold text-cream text-[1.05rem] sm:text-[1.35rem] leading-tight mb-1.5 sm:mb-2 pr-6">
            {event.title}
          </h3>
          <p className="font-sans font-light text-cream-soft/85 text-[0.78rem] sm:text-[0.9rem] leading-[1.55] sm:leading-[1.65] mb-4 sm:mb-5 line-clamp-3 sm:line-clamp-none">
            {event.desc}
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="tel:+14507431448"
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-orange text-bg-primary text-[0.65rem] sm:text-[0.72rem] font-medium tracking-[0.16em] sm:tracking-[0.18em] uppercase rounded-[2px] hover:brightness-105 transition"
            >
              Réserver par tél.
            </a>
            <span className="text-[0.62rem] sm:text-[0.7rem] font-medium tracking-[0.16em] sm:tracking-[0.18em] uppercase text-cream-soft/70">
              {event.tag}
            </span>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

const SUPPLY_TYPES = [
  "Bière",
  "Vin",
  "Spiritueux",
  "Café / Thé",
  "Produits alimentaires",
  "Autre",
] as const;

type ContactKind = "question" | "fournisseur";

const emptyContactForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  supplyType: SUPPLY_TYPES[0] as string,
  subject: "",
  message: "",
};

export function ContactForm() {
  const [kind, setKind] = useState<ContactKind>("question");
  const [form, setForm] = useState({ ...emptyContactForm });
  const [done, setDone] = useState(false);

  const create = useCreateMessage({
    mutation: {
      onSuccess: () => {
        setDone(true);
        setForm({ ...emptyContactForm });
      },
    },
  });

  const set =
    (k: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const isFournisseur = kind === "fournisseur";
  const canSubmit =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.message.trim() !== "" &&
    (!isFournisseur || form.company.trim() !== "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    create.mutate({
      data: {
        kind,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: isFournisseur ? form.company.trim() : "",
        supplyType: isFournisseur ? form.supplyType : "",
        subject: isFournisseur ? "" : form.subject.trim(),
        message: form.message.trim(),
      },
    });
  };

  const switchKind = (k: ContactKind) => {
    setKind(k);
    setDone(false);
  };

  const inputCls =
    "w-full bg-transparent border border-bg-primary/25 px-4 py-3 text-bg-primary placeholder:text-bg-primary/40 rounded-[2px] focus:border-orange focus:outline-none transition-colors";
  const labelCls =
    "block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-bg-primary/60 mb-2";

  if (done) {
    return (
      <div className="border border-bg-primary/20 bg-bg-primary/[0.03] p-8 md:p-10 text-center rounded-[2px]">
        <div className="text-[0.7rem] font-medium tracking-[0.22em] uppercase text-orange mb-3">
          <span aria-hidden="true">✶ </span>Message envoyé
        </div>
        <h3 className="font-serif text-[1.6rem] text-bg-primary mb-3">
          Merci, on vous revient bientôt.
        </h3>
        <p className="font-sans text-bg-primary/70 mb-6 max-w-md mx-auto">
          Votre message a bien été reçu. Nous répondons généralement sous 48 h
          ouvrables.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="inline-flex items-center gap-2 px-6 py-3 border border-bg-primary/30 text-bg-primary text-[0.72rem] font-medium tracking-[0.18em] uppercase rounded-[2px] hover:bg-bg-primary hover:text-cream transition-all duration-300"
        >
          Écrire un autre message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="border border-bg-primary/15 bg-bg-primary/[0.02] p-6 md:p-10 rounded-[2px]"
    >
      <div
        className="inline-flex mb-8 border border-bg-primary/20 rounded-[2px] overflow-hidden"
        role="tablist"
        aria-label="Type de demande"
      >
        {(
          [
            ["question", "J'ai une question"],
            ["fournisseur", "Je suis fournisseur"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={kind === value}
            onClick={() => switchKind(value)}
            className={`px-5 py-2.5 text-[0.72rem] font-medium tracking-[0.14em] uppercase transition-colors ${
              kind === value
                ? "bg-bg-primary text-cream"
                : "bg-transparent text-bg-primary/60 hover:text-bg-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="cf-name">
            Nom {isFournisseur ? "du contact" : ""}
          </label>
          <input
            id="cf-name"
            className={inputCls}
            value={form.name}
            onChange={set("name")}
            required
            autoComplete="name"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="cf-email">
            Courriel
          </label>
          <input
            id="cf-email"
            type="email"
            className={inputCls}
            value={form.email}
            onChange={set("email")}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="cf-phone">
            Téléphone <span className="normal-case text-bg-primary/40">(optionnel)</span>
          </label>
          <input
            id="cf-phone"
            type="tel"
            className={inputCls}
            value={form.phone}
            onChange={set("phone")}
            autoComplete="tel"
          />
        </div>

        {isFournisseur ? (
          <div>
            <label className={labelCls} htmlFor="cf-company">
              Entreprise
            </label>
            <input
              id="cf-company"
              className={inputCls}
              value={form.company}
              onChange={set("company")}
              required
              autoComplete="organization"
            />
          </div>
        ) : (
          <div>
            <label className={labelCls} htmlFor="cf-subject">
              Sujet <span className="normal-case text-bg-primary/40">(optionnel)</span>
            </label>
            <input
              id="cf-subject"
              className={inputCls}
              value={form.subject}
              onChange={set("subject")}
            />
          </div>
        )}

        {isFournisseur && (
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="cf-supply">
              Ce que vous proposez
            </label>
            <select
              id="cf-supply"
              className={`${inputCls} appearance-none`}
              value={form.supplyType}
              onChange={set("supplyType")}
            >
              {SUPPLY_TYPES.map((t) => (
                <option key={t} value={t} className="text-bg-primary">
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="cf-message">
            {isFournisseur ? "Présentez-nous vos produits" : "Votre message"}
          </label>
          <textarea
            id="cf-message"
            className={`${inputCls} min-h-[130px] resize-y`}
            value={form.message}
            onChange={set("message")}
            required
            placeholder={
              isFournisseur
                ? "Gamme de produits, région, échantillons, conditions…"
                : "Réservation de groupe, allergies, événement privé…"
            }
          />
        </div>
      </div>

      {create.isError && (
        <p className="mt-4 text-sm text-red-700">
          Une erreur est survenue. Vérifiez vos informations et réessayez.
        </p>
      )}

      <div className="mt-7 flex items-center gap-4">
        <button
          type="submit"
          disabled={!canSubmit || create.isPending}
          className="inline-flex items-center gap-3 px-7 py-3 bg-bg-primary text-cream text-[0.75rem] font-medium tracking-[0.2em] uppercase rounded-[2px] hover:bg-orange hover:text-bg-primary transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-bg-primary disabled:hover:text-cream"
        >
          {create.isPending ? "Envoi…" : "Envoyer"}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}

function Contact() {
  const hoursRows = useHoursRows();
  return (
    <section id="contact" className="bg-cream-soft py-32 px-6 md:px-12 relative overflow-hidden">
      <SectionMarker number="05" tone="light" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-16"
        >
          <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-bg-primary/60 mb-4">
            05 — Nous trouver
          </div>
          <h2 className="font-display text-[clamp(2rem,9vw,8rem)] text-bg-primary leading-[1.18] pb-[0.28em] mb-6">
            Passez nous voir
          </h2>
          <p className="font-sans italic text-bg-primary/70 max-w-xl text-base md:text-lg">
            À deux pas du marché — la porte est ouverte toute la semaine.
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
                  {hoursRows.map((row) => (
                    <tr key={row.label} className="border-b border-bg-primary/20">
                      <td className="py-4 font-medium tracking-wider text-sm">{row.label}</td>
                      {row.closed ? (
                        <td className="py-4 text-right italic text-bg-primary/70">{row.value}</td>
                      ) : (
                        <td className="py-4 text-right">{row.value}</td>
                      )}
                    </tr>
                  ))}
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

            <div className="flex items-center gap-4 mt-8 lg:mt-0 p-6 lg:p-0">
              <a
                href="https://www.instagram.com/chez.florent"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Instagram de Chez Florent (nouvel onglet)"
                className="w-12 h-12 flex items-center justify-center border border-bg-primary/25 rounded-full text-bg-primary hover:bg-bg-primary hover:text-cream transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/p/Chez-Florent-61558102300719/"
                target="_blank"
                rel="noopener noreferrer me"
                aria-label="Facebook de Chez Florent (nouvel onglet)"
                className="w-12 h-12 flex items-center justify-center border border-bg-primary/25 rounded-full text-bg-primary hover:bg-bg-primary hover:text-cream transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d="M14 8.5V6.7c0-.8.2-1.2 1.3-1.2H17V2.3c-.4-.1-1.4-.2-2.6-.2-2.5 0-4.2 1.5-4.2 4.3v2.1H7.5V12h2.7v9h3.5v-9h2.6l.4-3.5H14z" />
                </svg>
              </a>
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
            <div className="flex justify-end mb-4">
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 border border-bg-primary/30 text-bg-primary hover:bg-bg-primary hover:text-cream transition-all duration-300 rounded-[2px] text-[0.72rem] font-medium tracking-[0.2em] uppercase whitespace-nowrap"
              >
                Itinéraire <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="bg-bg-primary aspect-[4/5] overflow-hidden ring-1 ring-bg-primary/15">
              <iframe
                title="Carte — Chez Florent, 57 Rue du Roi, Sorel-Tracy"
                src={MAPS_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full border-0 grayscale-[0.2] contrast-[1.05]"
                allowFullScreen
              />
            </div>
            <span className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-bg-primary/75 mt-4 block text-right">
              — 57 rue du Roi, Sorel-Tracy
            </span>
          </motion.div>
        </div>

      </div>
    </section>
  );
}

const MAPS_EMBED =
  "https://www.google.com/maps?q=57+Rue+du+Roi,+Sorel-Tracy,+QC+J3P+4M6&output=embed";
const MAPS_LINK =
  "https://www.google.com/maps/search/?api=1&query=57+Rue+du+Roi+Sorel-Tracy+QC+J3P+4M6";

// Shared "how to find us" map band — rendered above the footer on every page.
export function MapSection() {
  return (
    <section className="bg-bg-primary pt-16 md:pt-20 pb-20 md:pb-24 px-6 md:px-12 relative">
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
  );
}

type Review = { name: string; quote: string; meta: string };
const REVIEWS: Review[] = [
  {
    name: "Charles Frenette",
    quote:
      "Super belle ambiance, le personnel très accueillant, très beaux choix de vin, spiritueux et bières québécoises. Les propriétaires sont présents et très sympathiques.",
    meta: "Avis Google",
  },
  {
    name: "Paul Larochelle",
    quote:
      "Un très bel endroit où l'on sent, dès l'entrée, un accueil chaleureux. Une belle diversité de bières qu'on dirait fraîchement brassées du matin, un petit verre de vin québécois servi avec le sourire, et voilà. Un fabuleux petit joyau sorelois.",
    meta: "Avis Google",
  },
  {
    name: "Monique Rooke",
    quote: "Tout est parfait et délicieux. À refaire, encore et encore. ❤",
    meta: "Avis Google",
  },
];

function Stars() {
  return (
    <div className="flex gap-1 text-orange" aria-label="5 étoiles sur 5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.98 4.8 17.5l.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function Testimonials() {
  return (
    <section id="temoignages" className="bg-bg-primary py-32 px-6 md:px-12 relative overflow-hidden">
      <SectionMarker number="✶" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-16 max-w-3xl"
        >
          <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
            <span aria-hidden="true">✶ </span>Ils en parlent
          </div>
          <h2 className="font-serif italic font-light text-cream leading-[1.1] pb-[0.14em] text-[clamp(1.75rem,7vw,6rem)]">
            Le quartier a son mot à dire.
          </h2>
          <p className="font-sans italic text-cream-soft/70 max-w-xl text-base md:text-lg mt-6">
            Quelques mots laissés par ceux qui ont poussé la porte — cinq étoiles, et le cœur avec.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {REVIEWS.map((r, i) => (
            <motion.figure
              key={r.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.12 }}
              className="m-0 flex flex-col gap-5 border border-border bg-cream/[0.03] p-8 rounded-[2px] h-full"
            >
              <Stars />
              <blockquote className="font-serif text-cream text-[1.0625rem] leading-[1.75] flex-1">
                « {r.quote} »
              </blockquote>
              <figcaption className="flex items-center gap-3 text-[0.75rem] tracking-[0.2em] uppercase text-cream-soft/75 pt-4 border-t border-border">
                <span aria-hidden="true" className="inline-block w-8 h-px bg-orange/70 shrink-0" />
                <span className="text-cream">{r.name}</span>
                <span aria-hidden="true" className="text-orange/70">·</span>
                <span className="normal-case tracking-normal font-sans text-cream-soft/60">{r.meta}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const photos = usePhotos();
  const items = GALLERY_SLOTS.map((slot) => photos[slot]).filter(
    (p): p is { url: string; alt: string } => Boolean(p),
  );
  return (
    <section
      id="galerie"
      className="bg-bg-primary pt-4 pb-32 relative overflow-hidden"
    >
      {/* Centred header */}
      <div className="px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="max-w-3xl mx-auto text-center mb-12 md:mb-16 relative z-10"
        >
          <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
            <span aria-hidden="true">◦ </span>En images
          </div>
          <h2 className="font-serif italic font-light text-cream leading-[1.1] pb-[0.14em] text-[clamp(1.75rem,7vw,6rem)]">
            Un soir chez Florent.
          </h2>
          <p className="font-sans italic text-cream-soft/70 max-w-xl mx-auto text-base md:text-lg mt-6">
            La salle, le bar, les jeux et les verres partagés — quelques
            fragments de nos soirées.
          </p>
        </motion.div>
      </div>

      {/* Full-bleed auto-scrolling slider */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative w-full"
      >
        {/* Edge fades */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 md:w-32 bg-gradient-to-r from-bg-primary to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 md:w-32 bg-gradient-to-l from-bg-primary to-transparent"
        />

        <div
          role="group"
          aria-label="Galerie d'ambiance Chez Florent"
          className="flex w-max gap-3 md:gap-4 animate-marquee hover:[animation-play-state:paused]"
        >
          {[...items, ...items].map((p, i) => {
            const isClone = i >= items.length;
            return (
              <div
                key={`${p.url}-${i}`}
                aria-hidden={isClone ? "true" : undefined}
                className="group relative w-[220px] md:w-[300px] aspect-[3/4] shrink-0 overflow-hidden rounded-sm ring-1 ring-cream/10"
              >
                <img
                  src={p.url}
                  alt={isClone ? "" : p.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

export function Footer({ hideMap = false }: { hideMap?: boolean } = {}) {
  const year = new Date().getFullYear();
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <>
      {!hideMap && <MapSection />}
      <footer className="bg-bg-primary pt-20 relative z-10 overflow-hidden flex flex-col">
      {/* Quick links + contact */}
      <div className="w-full px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 pb-12">
          <div>
            <div className="text-[0.7rem] tracking-[0.22em] uppercase text-cream-soft/85 mb-4">Le restaurant</div>
            <address className="not-italic font-serif text-cream text-base leading-relaxed">
              57 Rue du Roi<br />
              Sorel-Tracy (QC)<br />
              J3P 4M6
            </address>
          </div>
          <div>
            <div className="text-[0.7rem] tracking-[0.22em] uppercase text-cream-soft/85 mb-4">Contact</div>
            <a href="tel:+14507431448" className="block font-display text-cream text-2xl hover:text-orange transition-colors">450 743-1448</a>
            <div className="font-sans text-sm text-cream-soft/85 mt-2">
              Lundi–Vendredi · dès 11h30<br />
              Samedi–Dimanche · dès 17h
            </div>
          </div>
          <nav aria-label="Navigation rapide">
            <div className="text-[0.7rem] tracking-[0.22em] uppercase text-cream-soft/85 mb-4">Visiter</div>
            <ul className="space-y-2 font-sans text-cream text-sm">
              <li><a href={`${base}/`} className="hover:text-orange transition-colors">Accueil</a></li>
              <li><a href={`${base}/a-propos`} className="hover:text-orange transition-colors">À propos</a></li>
              <li><a href={`${base}/menu`} className="hover:text-orange transition-colors">Menu</a></li>
              <li><a href={`${base}/evenements`} className="hover:text-orange transition-colors">Agenda</a></li>
              <li><a href={`${base}/groupes`} className="hover:text-orange transition-colors">Groupes & privatisation</a></li>
              <li><a href={`${base}/contact`} className="hover:text-orange transition-colors">Nous trouver</a></li>
            </ul>
          </nav>
          <div>
            <div className="text-[0.7rem] tracking-[0.22em] uppercase text-cream-soft/85 mb-4">Suivre</div>
            <ul className="space-y-2 font-sans text-cream text-sm">
              <li>
                <a href="https://www.instagram.com/chez.florent" target="_blank" rel="noopener noreferrer me" className="hover:text-orange transition-colors">
                  Instagram <span aria-hidden="true">↗</span>
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/p/Chez-Florent-61558102300719/" target="_blank" rel="noopener noreferrer me" className="hover:text-orange transition-colors">
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
          <div className="flex items-center gap-2">
            <span>Conçu avec <span aria-hidden="true">♥</span><span className="sr-only">amour</span> à Sorel-Tracy par</span>
            <a href="https://kua.quebec" target="_blank" rel="noopener noreferrer"><img loading="lazy" decoding="async" src="/images/kua-logo.png" alt="küa" className="h-[17.5px] w-auto" /></a>
          </div>
          <a href={`${base}/confidentialite`} className="hover:text-cream transition-colors">Confidentialité</a>
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
    </footer>
    </>
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
  useRestaurantSchema();
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
  const lenisRef = useRef<Lenis | null>(null);
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || showPreloader || previewMode) return;

    const lenis = new Lenis({ 
      duration: 1.2, 
      smoothWheel: true, 
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) 
    });
    lenisRef.current = lenis;

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
      lenisRef.current = null;
      document.removeEventListener('click', handleClick);
    };
  }, [showPreloader]);

  // When arriving from a sub-page link (e.g. /#reservation), the homepage may
  // still be running its intro/preloader, so the browser's native hash jump is
  // lost. Once the preloader is done, scroll to the targeted section ourselves.
  useEffect(() => {
    if (showPreloader || previewMode) return;
    const hash = window.location.hash;
    if (!hash || hash === "#") return;
    let el: Element | null = null;
    try {
      el = document.querySelector(hash);
    } catch {
      return;
    }
    if (!el) return;
    const rafId = requestAnimationFrame(() => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el as HTMLElement, { offset: -80 });
      } else {
        (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [showPreloader, previewMode]);

  // Preview mode: render ONLY the targeted section, with no navbar, hero or
  // footer, so the admin preview shows that single section in isolation and the
  // client cannot navigate the rest of the site.
  if (previewMode) {
    return (
      <div className="min-h-[100dvh] w-full bg-bg-primary text-cream selection:bg-orange selection:text-bg-primary relative">
        <FilmGrain />
        <div className="overflow-x-clip">
          {previewSection === "hero" && <Hero />}
          {previewSection === "a-propos" && <About />}
          {previewSection === "menu" && <Menu />}
          {previewSection === "galerie" && <Gallery />}
          {previewSection === "voix" && <Rendezvous />}
          {previewSection === "agenda" && <Agenda />}
          {previewSection === "reservation" && <Reservation />}
          {previewSection === "faq" && <FAQ />}
          {previewSection === "contact" && <Contact />}
          {previewSection === "horaires" && <HoursBand />}
          {![
            "hero",
            "a-propos",
            "menu",
            "galerie",
            "voix",
            "agenda",
            "reservation",
            "faq",
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

      <div className="overflow-x-clip">
        <Navbar activeSection={activeSection} />
        <main>
          <Hero />
          <About />
          <Menu />
          {/* <Testimonials /> — masqué; réactiver au besoin */}
          <Gallery />
          <Rendezvous />
          {/* <Agenda /> — masqué; réactiver au besoin */}
          <Reservation />
          {/* <FAQ /> — masqué; réactiver au besoin */}
          <Contact />
        </main>
        <Footer hideMap />
        <TodayEventPopup />
      </div>
    </div>
  );
}
