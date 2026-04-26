import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion, AnimatePresence, useMotionValue } from "framer-motion";
import Lenis from 'lenis';

const EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];
const EASE_SMOOTH: [number, number, number, number] = [0.22, 1, 0.36, 1];

// -----------------------------------------------------------------------------
// 1) PRELOADER
// -----------------------------------------------------------------------------
function Preloader({ onComplete }: { onComplete: () => void }) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      onComplete();
      return;
    }
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-bg-primary flex flex-col items-center justify-center overflow-hidden"
      initial={{ clipPath: "inset(0 0 0 0)" }}
      animate={{ clipPath: "inset(0 0 0 0)" }}
      exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.9, ease: EASE } }}
    >
      <div className="text-center relative">
        <h1 className="font-display text-cream text-[clamp(4rem,12vw,10rem)] leading-none overflow-hidden">
          <motion.span
            className="block"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
          >
            Chez Florent
          </motion.span>
        </h1>
        <motion.div
          className="text-cream-soft font-sans uppercase tracking-[0.3em] text-[0.75rem] mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          BISTRO — SOREL-TRACY · DEPUIS 2018
        </motion.div>
      </div>

      {/* Loading bar */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-border">
        <motion.div
          className="h-full bg-orange origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2.5, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// 2) CUSTOM CURSOR
// -----------------------------------------------------------------------------
function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const ringX = useSpring(cursorX, { stiffness: 150, damping: 20 });
  const ringY = useSpring(cursorY, { stiffness: 150, damping: 20 });
  const dotX = useSpring(cursorX, { stiffness: 800, damping: 30 });
  const dotY = useSpring(cursorY, { stiffness: 800, damping: 30 });

  const [cursorState, setCursorState] = useState<"default" | "hover" | "hidden" | "view">("default");

  useEffect(() => {
    // Only enable if device has hover capability
    if (window.matchMedia("(hover: none)").matches) return;

    document.documentElement.classList.add("has-custom-cursor");

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('a') || target.closest('button')) {
        setCursorState("hover");
      } else if (target.closest('[data-cursor="hidden"]')) {
        setCursorState("hidden");
      } else if (target.closest('[data-cursor="view"]')) {
        setCursorState("view");
      } else {
        setCursorState("default");
      }
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  if (window.matchMedia("(hover: none)").matches) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[110] hidden lg:block overflow-hidden">
      <motion.div
        className="absolute left-0 top-0 w-2 h-2 bg-cream rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ x: dotX, y: dotY }}
        animate={{
          opacity: cursorState === "default" ? 1 : 0,
          scale: cursorState === "default" ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="absolute left-0 top-0 border border-cream/30 rounded-full flex items-center justify-center text-orange font-medium text-xs tracking-widest -translate-x-1/2 -translate-y-1/2"
        style={{ 
          x: ringX, 
          y: ringY,
          width: 40,
          height: 40
        }}
        animate={{
          width: cursorState === "hover" ? 80 : cursorState === "view" ? 100 : cursorState === "hidden" ? 0 : 40,
          height: cursorState === "hover" ? 80 : cursorState === "view" ? 100 : cursorState === "hidden" ? 0 : 40,
          backgroundColor: cursorState === "hover" ? "rgba(216, 90, 44, 0.2)" : cursorState === "view" ? "rgba(14, 31, 28, 0.6)" : "transparent",
          borderColor: cursorState === "hover" ? "transparent" : cursorState === "view" ? "rgba(244, 201, 160, 0.5)" : "rgba(244, 201, 160, 0.3)",
          backdropFilter: cursorState === "view" ? "blur(4px)" : "none",
        }}
        transition={{ duration: 0.2 }}
      >
        {cursorState === "view" && <span className="opacity-100">VOIR</span>}
      </motion.div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// PROGRESS BAR
// -----------------------------------------------------------------------------
function ScrollProgress() {
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

  const day = now.getDay();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const today = SCHEDULE[day];

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
    const next = SCHEDULE[nextDayIdx];
    if (next) {
      const dayLabel = i === 1 ? "demain" : DAY_NAMES_FR[nextDayIdx];
      return { open: false, label: `Fermé · ouvre ${dayLabel} ${next.open}h` };
    }
  }
  return { open: false, label: "Fermé" };
}

function Navbar({ activeSection }: { activeSection: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const status = useOpenStatus();

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
            ? "bg-bg-primary/90 backdrop-blur-md border-b border-border py-4"
            : "bg-transparent border-b border-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <a
            href="#accueil"
            aria-label="Chez Florent — Accueil"
            className="flex items-center text-cream hover:opacity-80 transition-opacity"
          >
            <img
              src="/logo.png"
              alt="Chez Florent logo"
              className={`object-contain transition-all duration-500 ${scrolled ? "h-12 md:h-14" : "h-16 md:h-20"}`}
            />
          </a>

          {/* Live status badge — center */}
          <a
            href="#contact"
            aria-label={`Statut du restaurant : ${status.label}`}
            className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-cream-soft/15 bg-bg-primary/40 backdrop-blur-sm text-[0.7rem] font-medium tracking-[0.18em] uppercase text-cream-soft/85 hover:text-cream hover:border-cream-soft/30 transition-colors group"
          >
            <span className="relative inline-flex w-1.5 h-1.5 shrink-0">
              {status.open && (
                <span className="absolute inset-0 rounded-full bg-orange opacity-60 animate-ping"></span>
              )}
              <span className={`relative inline-block w-1.5 h-1.5 rounded-full ${status.open ? 'bg-orange' : 'bg-cream-soft/40'}`}></span>
            </span>
            <span>{status.label}</span>
          </a>

          <div className="hidden md:flex items-center gap-8 text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft">
            <a href="#accueil" className={`link-underline hover:text-cream transition-colors ${activeSection === "accueil" ? "active text-cream" : ""}`}>Accueil</a>
            <a href="#a-propos" className={`link-underline hover:text-cream transition-colors ${activeSection === "a-propos" ? "active text-cream" : ""}`}>À propos</a>
            <a href="#menu" className={`link-underline hover:text-cream transition-colors ${activeSection === "menu" ? "active text-cream" : ""}`}>Menu</a>
            <a href="#agenda" className={`link-underline hover:text-cream transition-colors ${activeSection === "agenda" ? "active text-cream" : ""}`}>Agenda</a>
            <a href="#reservation" className={`link-underline hover:text-cream transition-colors ${activeSection === "reservation" ? "active text-cream" : ""}`}>Réservation</a>
            <a href="#contact" className={`link-underline hover:text-cream transition-colors ${activeSection === "contact" ? "active text-cream" : ""}`}>Contact</a>
            <a
              href="#reservation"
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
              <a href="#accueil" onClick={closeMenu} className="hover:text-orange transition-colors">Accueil</a>
              <a href="#a-propos" onClick={closeMenu} className="hover:text-orange transition-colors">À propos</a>
              <a href="#menu" onClick={closeMenu} className="hover:text-orange transition-colors">L'ardoise</a>
              <a href="#agenda" onClick={closeMenu} className="hover:text-orange transition-colors">Agenda</a>
              <a href="#reservation" onClick={closeMenu} className="hover:text-orange transition-colors">Réserver une table</a>
              <a href="#contact" onClick={closeMenu} className="hover:text-orange transition-colors">Nous trouver</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SectionMarker({ number, tone = "dark" }: { number: string; tone?: "dark" | "light" }) {
  const colorClass = tone === "light" ? "text-bg-primary/15" : "text-cream/10";
  const blendClass = tone === "light" ? "mix-blend-multiply" : "mix-blend-difference";
  return (
    <div className={`absolute top-16 right-6 md:right-12 font-display text-[clamp(4rem,10vw,8rem)] ${colorClass} leading-none ${blendClass} pointer-events-none select-none z-0`}>
      {number}
    </div>
  );
}

function Hero() {
  const prefersReducedMotion = useReducedMotion();

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
    <section id="accueil" className="relative min-h-[100dvh] flex flex-col justify-between overflow-hidden pt-32 pb-0">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-bg-primary">
        <div 
          className="absolute inset-0 bg-cover bg-center animate-kenburns origin-center"
          style={{
            backgroundImage: "url('/images/hero-interior.png')",
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
              <span className="text-orange mr-3">✶</span>BISTRO — SOREL-TRACY / DEPUIS 2018
            </motion.div>
            
            <motion.div variants={fadeVariants} className="hidden md:flex flex-col gap-2 text-[0.65rem] font-medium tracking-[0.3em] uppercase text-cream-soft text-right">
              <span>N° 01</span>
              <span>—</span>
              <span>ARDOISE</span>
              <span>DU SOIR</span>
            </motion.div>
          </div>

          {/* Broken Type Headline */}
          <h1 className="font-serif font-light text-cream leading-[0.95] text-[clamp(4.5rem,11vw,11rem)] mb-16 w-full">
            <motion.div variants={lineVariants} className="block italic">
              Une cuisine
            </motion.div>
            <motion.div variants={lineVariants} className="block italic ml-[8vw] md:ml-[12vw]">
              qui raconte
            </motion.div>
            <motion.div variants={lineVariants} className="block ml-[12vw] md:ml-[24vw]">
              des <span className="relative inline-block italic pb-[0.18em]">
                histoires.
                <motion.svg 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 1.5, ease: EASE_SMOOTH }}
                  className="absolute left-0 -bottom-3 md:-bottom-5 w-full h-auto text-orange pointer-events-none" 
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

          {/* Bottom layout */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mt-12 mb-20">
            <motion.p variants={fadeVariants} className="font-sans font-light text-[1.0625rem] leading-[1.7] text-cream-soft max-w-[380px]">
              « Chez Florent, c'est l'ardoise qui change selon les humeurs du chef et les arrivages du marché. Des assiettes à partager, des produits d'ici, des soirées qui s'étirent. »
            </motion.p>
            
            <motion.div variants={fadeVariants} className="flex flex-col sm:flex-row gap-4 w-full md:w-auto self-center md:absolute md:bottom-20 md:left-1/2 md:-translate-x-1/2">
              <a
                href="#menu"
                className="inline-flex justify-center items-center px-8 py-4 bg-orange text-bg-primary font-medium transition-transform duration-300 hover:bg-orange-dark hover:scale-[1.02] rounded-[2px]"
              >
                Voir l'ardoise →
              </a>
            </motion.div>

            <motion.div variants={fadeVariants} className="hidden md:block text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft">
              <span className="text-orange mr-2">★</span> 17H — 23H
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
              <span className="text-orange text-sm">✶</span>
              <span className="font-serif italic text-2xl text-cream px-6">PRODUITS LOCAUX</span>
              <span className="text-orange text-sm">✶</span>
              <span className="font-serif italic text-2xl text-cream px-6">TABLE ARTISANALE</span>
              <span className="text-orange text-sm">✶</span>
              <span className="font-serif italic text-2xl text-cream px-6">DEPUIS 2018</span>
              <span className="text-orange text-sm">✶</span>
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
        <h2 className="font-serif italic font-light text-bg-primary leading-[0.95] text-[clamp(4rem,11vw,10rem)] mb-10 max-w-6xl flex flex-wrap gap-x-[0.3em] gap-y-4">
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

        {/* Asymmetric Image Stack */}
        <div className="relative mb-32 min-h-[50vh] md:min-h-[80vh]">
          <motion.div 
            style={{ y: ySlow }}
            className="w-[80%] md:w-[50%] aspect-[4/3] overflow-hidden relative z-10 ring-1 ring-bg-primary/10"
          >
            <img src="/images/about-hands.png" alt="Mains de chef" className="w-full h-full object-cover" />
          </motion.div>
          
          <motion.div 
            style={{ y: yFast }}
            className="absolute top-[20%] right-0 w-[50%] md:w-[30%] aspect-[3/4] overflow-hidden z-20 mt-20 ring-1 ring-bg-primary/10"
          >
            <img src="/images/wine-glass-macro.png" alt="Verre de vin" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        {/* Text Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl ml-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="font-serif font-normal text-bg-primary text-[1.125rem] leading-[1.8]"
          >
            « Florent n'est pas seulement un nom au-dessus de la porte. C'est une certaine idée du bistro : celle où l'on s'attable sans cérémonie, où le vin se verse au pichet, et où la cuisine ne triche jamais avec ses produits. »
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="font-sans font-light text-bg-primary/75 text-[1rem] leading-[1.8]"
          >
            « On travaille avec des fermiers qu'on appelle par leur prénom — la Ferme J.N Beauchemin pour les saucisses, Fromagerie Fuoco pour la bufarella, Les Cowboys du BBQ pour le brisket. Le reste, c'est de l'huile de coude et du temps. »
          </motion.div>
        </div>
      </div>
    </section>
  );
}

type Dish = { name: string; price: string; desc: string; image: string };
type MenuCategory = { id: string; label: string; tagline: string; dishes: Dish[] };

const menuCategories: MenuCategory[] = [
  {
    id: "partager",
    label: "À partager",
    tagline: "Pour ouvrir la soirée — un verre, une planche, le temps qui ralentit.",
    dishes: [
      { name: "Trempette de poireaux rôtis", price: "16,95 $", desc: "Bacon fumé, servi avec pain plat gratiné.", image: "bread-tearing.png" },
      { name: "Bufarella potato", price: "17,95 $", desc: "Boule de fromage bufarella (Fromagerie Fuoco) accompagnée de hummus de patate douce, coulis de bleuets à l'érable, huile épicée, menthe et crumble au parmesan. Servi avec pain naan grillé.", image: "dish-tasting.png" },
      { name: "Assiette de charcuterie", price: "35,95 $", desc: "Calabrese, prosciutto, saucissons secs, olives méli-mélo, fromages du moment, pickle d'oignons rouges, petits cornichons. Servi avec pain et croutons.", image: "dish-charcuterie.png" },
    ],
  },
  {
    id: "plats",
    label: "Les plats",
    tagline: "Le coeur de l'ardoise — sandwichs travaillés, plats roboratifs, à manger sans manières.",
    dishes: [
      { name: "Grilled cheese sur baguette", price: "5,95 $ / 11,95 $", desc: "Provolone, mozzarella, fromage jaune, beurre à l'ail.", image: "dish-sandwich.png" },
      { name: "Feuilleté jambon gruyère", price: "9,95 $ / 19,95 $", desc: "Pâte feuilletée, jambon, fromage gruyère, sauce blanche crémeuse avec pomme de terre, poireaux.", image: "about-hands.png" },
      { name: "Miche de porc", price: "23,95 $", desc: "Miche de pain artisanale, porc effiloché maison, fromage à la crème épicé aux cornichons, laitue iceberg, moutarde au miel. Servi avec salade de carottes crémeuse.", image: "dish-sandwich.png" },
      { name: "« Le Rhé-Actif »", price: "24,95 $", desc: "Pain ciabata, provolone, mortadelle, calabrese, capicollo, salade, tomates, oignons rouges, mayonnaise thaï. Servi avec salade de patates maison.", image: "dish-charcuterie.png" },
      { name: "Pizza « Vodka » 🌶🌶🌶", price: "25,95 $", desc: "Sauce rosée à la vodka, saucisses épicées (Ferme J.N Beauchemin), oignons croustillants, mozzarella, huile à l'ail, tomates confites au gras de canard.", image: "dish-pizza.png" },
      { name: "« Philly T »", price: "25,95 $", desc: "Pain baguette, fromages (jaune, mozzarella, provolone), poivrons rouges, oignons blancs, brisket (Les Cowboys du BBQ), mayonnaise épicée. Servi avec salade de pâte maison et cup de sauce BBQ.", image: "dish-tasting.png" },
    ],
  },
  {
    id: "bar",
    label: "Au bar",
    tagline: "Cocktails maison, vins choisis, bières du coin — le bar reste ouvert tard.",
    dishes: [
      { name: "Sorel-Spritz", price: "14,00 $", desc: "Vin pétillant, Aperol, sirop maison aux canneberges du Lac St-Pierre, branche de romarin frais.", image: "wine-pour.png" },
      { name: "Old Fashioned du Florent", price: "16,00 $", desc: "Rye canadien, sirop d'érable d'Yamaska, bitter aux noix grillées, zeste d'orange brûlé au chalumeau.", image: "ambiance-smoke.png" },
      { name: "Negroni Sapin", price: "15,00 $", desc: "Gin local Québec Distillerie, Campari, vermouth maison infusé sapinette des bois — boisé, presque résineux.", image: "wine-pour.png" },
      { name: "Vin de la maison", price: "9,00 $ / 38,00 $", desc: "Rouge ou blanc, sélection rotative du sommelier — au verre ou à la bouteille. Demandez la suggestion.", image: "wine-pour.png" },
      { name: "Pinte Riverbend", price: "8,00 $", desc: "Blonde houblonnée brassée à Sorel par Riverbend Brewing Co. — locale, fraîche, désaltérante.", image: "exterior-dusk.png" },
      { name: "Espresso & digestif", price: "5,00 $ / 9,00 $", desc: "Café espresso bien serré, accompagné d'un Amaro maison ou d'un cognac à l'ancienne. Pour finir en beauté.", image: "ambiance-smoke.png" },
    ],
  },
];

function Menu() {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(menuCategories[0].id);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCategory = menuCategories.find((c) => c.id === activeCategoryId) ?? menuCategories[0];
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
            <h2 className="ardoise-clip font-serif font-semibold uppercase text-[clamp(4rem,12vw,12rem)] leading-[0.85] tracking-tighter mb-8 max-w-full">
              L'ARDOISE
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
            {menuCategories.map((c) => {
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
                    isActive ? "text-cream" : "text-cream-soft/55 hover:text-cream-soft"
                  }`}
                >
                  <span className="flex items-baseline gap-2">
                    {c.label}
                    <span className={`font-serif italic text-[0.7rem] tracking-normal normal-case transition-colors ${isActive ? 'text-orange' : 'text-cream-soft/40'}`}>
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
                          <p className="font-sans font-light italic text-cream-soft/70 max-w-[600px] leading-relaxed text-sm md:text-base">
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
                    src={`/images/${activeDish.image}`}
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
              <div className="mt-4 flex items-center justify-between text-[0.7rem] font-medium tracking-[0.2em] uppercase text-cream-soft/50">
                <span>— Glissez sur un plat</span>
                <span className="font-serif italic normal-case tracking-normal text-cream-soft/70">{String(activeIndex + 1).padStart(2, '0')} / {String(dishes.length).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="font-sans italic text-cream-soft/60 text-sm">
              « L'ardoise change. Suivez-nous sur les réseaux pour voir les ajouts du chef. »
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function AmbianceStrip() {
  return (
    <section className="bg-bg-primary pb-0 pt-32 relative">
      <SectionMarker number="—" />
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-20 relative z-10">
        <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-6">
          ◦ Interlude — L'ambiance
        </div>
        <h2 className="font-serif font-light italic text-cream leading-[0.95] text-[clamp(2.5rem,6vw,5rem)] max-w-4xl">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="block"
          >
            « On ne vient pas chez Florent pour manger vite.
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
            className="block text-orange"
          >
            On vient pour rester. »
          </motion.span>
        </h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
          className="font-sans italic text-cream-soft/70 max-w-2xl text-base md:text-lg mt-8"
        >
          Trois instants d'une soirée chez nous — de la salle au crépuscule.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 w-full">
        {[
          { src: "wine-pour.png", alt: "Service du vin", caption: "◦ La salle" },
          { src: "exterior-dusk.png", alt: "L'extérieur", caption: "◦ La devanture", className: "object-cover object-center h-full aspect-[4/5] md:aspect-auto" },
          { src: "ambiance-smoke.png", alt: "Ambiance fumée", caption: "◦ La fin de soirée" }
        ].map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
            className="overflow-hidden relative group aspect-[4/5] md:aspect-[3/4]"
            data-cursor="view"
          >
            <img 
              src={`/images/${img.src}`} 
              alt={img.alt} 
              className={`w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 ${img.className || ''}`}
            />
            <div className="absolute bottom-6 left-6 z-10">
              <span className="font-sans text-[0.85rem] text-cream drop-shadow-md">{img.caption}</span>
              <div className="h-[1px] bg-orange w-0 group-hover:w-full transition-all duration-500 ease-out mt-1"></div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

type AgendaEvent = {
  date: { day: string; month: string };
  title: string;
  desc: string;
  tag: string;
};

const agendaEvents: AgendaEvent[] = [
  { date: { day: "30", month: "AVR" }, title: "Soirée Cocktails du Sapinage", desc: "Cinq cocktails signature au sapin baumier, à découvrir au 5 à 7. Bouchées chaudes incluses.", tag: "5 à 7 · 17h–19h" },
  { date: { day: "09", month: "MAI" }, title: "Trio Jazz Manouche", desc: "Trois instrumentistes du Sud-Ouest, en visite pour une soirée. Entrée libre, bon vin recommandé.", tag: "Live · 20h" },
  { date: { day: "17", month: "MAI" }, title: "Brunch — Fête des mères", desc: "Menu 4 services, mimosas maison, places limitées. Réservation fortement suggérée.", tag: "Menu spécial · 38 $" },
  { date: { day: "23", month: "MAI" }, title: "Huîtres & bulles", desc: "Trois variétés de la Côte-Nord, accord avec champagnes et pétillants québécois.", tag: "Soirée · 19h" },
  { date: { day: "06", month: "JUIN" }, title: "Open Mic — Poésie & guitare", desc: "Soirée micro ouvert, ambiance feutrée. Inscrivez-vous sur place.", tag: "Acoustique · 20h" },
  { date: { day: "21", month: "JUIN" }, title: "Fête de la musique", desc: "Buffet québécois, DJ jusqu'à 1h. La devanture devient une terrasse-piste.", tag: "Toute la soirée" },
];

function Agenda() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section id="agenda" className="bg-bg-primary pt-32 pb-32 relative border-t border-border">
      <SectionMarker number="04" />
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="mb-16">
          <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-6">
            04 — La programmation
          </div>
          <h2 className="font-serif font-light italic text-cream leading-[0.85] tracking-tighter text-[clamp(3.5rem,10vw,9rem)]">
            L'agenda
          </h2>
          <p className="font-sans italic text-cream-soft/80 max-w-2xl text-lg mt-6">
            Soirées, dégustations et concerts à venir — choisissez votre prochaine.
          </p>
        </div>

        <div className="border-t border-border">
          {agendaEvents.map((event, i) => {
            const isActive = i === activeIdx;
            return (
              <motion.a
                href="#reservation"
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }}
                onMouseEnter={() => setActiveIdx(i)}
                onFocus={() => setActiveIdx(i)}
                aria-label={`${event.date.day} ${event.date.month} · ${event.title} — réserver`}
                className={`group grid grid-cols-[64px_1fr_auto] md:grid-cols-[120px_1fr_auto] gap-4 md:gap-12 py-8 md:py-10 border-b border-border transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-inset ${isActive ? 'bg-bg-secondary/40' : 'hover:bg-bg-secondary/30'} px-3 md:px-6`}
              >
                <div className="flex flex-col">
                  <div className={`font-serif italic font-light text-[2rem] md:text-[2.75rem] leading-none transition-colors ${isActive ? 'text-orange' : 'text-cream'}`}>
                    {event.date.day}
                  </div>
                  <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-cream-soft/60 mt-1">
                    {event.date.month}
                  </div>
                </div>
                <motion.div
                  animate={{ x: isActive ? 12 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex flex-col gap-1"
                >
                  <h3 className="font-serif font-semibold text-[1.35rem] md:text-[1.65rem] text-cream leading-tight">
                    {event.title}
                  </h3>
                  <p className="font-sans font-light italic text-cream-soft/70 max-w-[600px] leading-relaxed text-sm md:text-base">
                    {event.desc}
                  </p>
                </motion.div>
                <div className="flex flex-col items-end justify-between gap-2 pt-1">
                  <span className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-orange whitespace-nowrap">
                    {event.tag}
                  </span>
                  <span className="hidden md:inline-block text-[0.7rem] font-sans tracking-[0.15em] uppercase text-cream-soft/50 group-hover:text-cream transition-colors whitespace-nowrap">
                    Réserver →
                  </span>
                </div>
              </motion.a>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="font-sans italic text-cream-soft/55 text-sm">
            « La programmation peut changer — un coup de fil et c'est confirmé. »
          </p>
        </div>
      </div>
    </section>
  );
}

function HoursBand() {
  const status = useOpenStatus();
  const hoursItems = [
    "Mardi au Jeudi  ·  17h – 22h",
    "Vendredi  ·  Samedi  ·  17h – 23h",
    "Dimanche  ·  17h – 21h",
    "Fermé le Lundi",
  ];

  return (
    <div className="bg-cream-soft text-bg-primary relative">
      {/* Top row: live status + hours marquee — Inter caps */}
      <div className="overflow-hidden border-b border-bg-primary/10 py-3.5">
        <div className="flex whitespace-nowrap animate-marquee-slow w-max font-sans text-[0.78rem] font-medium tracking-[0.22em] uppercase text-bg-primary/80">
          {[...Array(3)].map((_, repeat) => (
            <div key={repeat} className="flex items-center">
              <span className="px-7 inline-flex items-center gap-2.5 text-bg-primary">
                <span className="relative inline-flex w-1.5 h-1.5 shrink-0">
                  {status.open && (
                    <span className="absolute inset-0 rounded-full bg-orange opacity-60 animate-ping"></span>
                  )}
                  <span className={`relative inline-block w-1.5 h-1.5 rounded-full ${status.open ? 'bg-orange' : 'bg-bg-primary/40'}`}></span>
                </span>
                {status.label}
              </span>
              {hoursItems.map((item, i) => (
                <React.Fragment key={i}>
                  <span className="text-bg-primary/30 px-2">✶</span>
                  <span className="px-7">{item}</span>
                </React.Fragment>
              ))}
              <span className="text-bg-primary/30 px-2">✶</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row: huge italic invitation, scrolling opposite direction */}
      <div className="overflow-hidden py-7 md:py-10">
        <div className="flex whitespace-nowrap animate-marquee-reverse w-max font-serif italic font-light text-bg-primary text-[clamp(2.75rem,8vw,6.5rem)] leading-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center">
              <span className="px-8">Réservez votre table</span>
              <span className="px-2 text-orange">↘</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Reservation() {
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    const required = ["name", "phone", "date", "time", "guests"];
    required.forEach(field => {
      if (!fd.get(field)) {
        newErrors[field] = "Ce champ est requis";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStatus("success");
  };

  return (
    <>
      <HoursBand />

      <section id="reservation" className="bg-bg-tertiary py-32 px-6 md:px-12 relative">
        <SectionMarker number="05" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mb-16 text-center flex flex-col items-center"
          >
            <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-6">
              05 — Une table pour vous
            </div>
            <h2 className="font-serif font-light uppercase text-[clamp(4rem,12vw,14rem)] text-cream leading-[0.85] tracking-tighter mb-6">
              RÉSERVER
            </h2>
            <p className="font-sans italic text-cream-soft/80 max-w-xl text-base md:text-lg mb-6">
              On vous garde la meilleure table — confirmation par téléphone d'ici 24h.
            </p>
            <div className="w-20 h-[1px] bg-orange mb-8"></div>
          </motion.div>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="text-center py-24 bg-bg-primary border border-border p-8"
              >
                <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
                  ✶ Confirmé
                </div>
                <h3 className="font-serif italic text-[clamp(3rem,8vw,5rem)] text-cream mb-8 leading-none">
                  MERCI
                </h3>
                <p className="font-sans font-light text-cream-soft text-lg mb-12">
                  Nous vous confirmons par téléphone d'ici 24h.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-[0.875rem] text-cream link-underline uppercase tracking-widest font-medium"
                >
                  Faire une nouvelle réservation
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit} 
                className="flex flex-col gap-12 bg-bg-primary p-8 md:p-16 border border-border shadow-2xl relative" 
                noValidate
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="flex flex-col relative group">
                    <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2 transition-colors group-focus-within:text-orange">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="bg-transparent border-b border-border text-cream py-3 focus:outline-none focus:border-orange transition-colors rounded-none text-xl font-serif"
                    />
                    {errors.name && <span className="text-orange text-xs mt-2 absolute -bottom-6">{errors.name}</span>}
                  </div>
                  <div className="flex flex-col relative group">
                    <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2 transition-colors group-focus-within:text-orange">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="bg-transparent border-b border-border text-cream py-3 focus:outline-none focus:border-orange transition-colors rounded-none text-xl font-serif"
                    />
                    {errors.phone && <span className="text-orange text-xs mt-2 absolute -bottom-6">{errors.phone}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="flex flex-col relative group">
                    <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2 transition-colors group-focus-within:text-orange">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      className="bg-transparent border-b border-border text-cream py-3 focus:outline-none focus:border-orange transition-colors rounded-none [color-scheme:dark] text-xl font-serif"
                    />
                    {errors.date && <span className="text-orange text-xs mt-2 absolute -bottom-6">{errors.date}</span>}
                  </div>
                  <div className="flex flex-col relative group">
                    <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2 transition-colors group-focus-within:text-orange">
                      Heure
                    </label>
                    <input
                      type="time"
                      name="time"
                      className="bg-transparent border-b border-border text-cream py-3 focus:outline-none focus:border-orange transition-colors rounded-none [color-scheme:dark] text-xl font-serif"
                    />
                    {errors.time && <span className="text-orange text-xs mt-2 absolute -bottom-6">{errors.time}</span>}
                  </div>
                  <div className="flex flex-col relative group">
                    <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2 transition-colors group-focus-within:text-orange">
                      Personnes
                    </label>
                    <select
                      name="guests"
                      className="bg-transparent border-b border-border text-cream py-3 focus:outline-none focus:border-orange transition-colors rounded-none appearance-none text-xl font-serif"
                    >
                      <option value="" className="bg-bg-primary text-base font-sans">Sélectionner</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n} className="bg-bg-primary text-base font-sans">{n}</option>)}
                      <option value="9+" className="bg-bg-primary text-base font-sans">9+</option>
                    </select>
                    {errors.guests && <span className="text-orange text-xs mt-2 absolute -bottom-6">{errors.guests}</span>}
                  </div>
                </div>

                <div className="flex flex-col relative group mt-4">
                  <MagneticButton 
                    type="submit"
                    className="w-full md:w-auto self-center px-12 py-5 bg-orange text-bg-primary font-medium tracking-wide uppercase transition-colors hover:bg-orange-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange"
                  >
                    Confirmer la réservation
                  </MagneticButton>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}

function Contact() {
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
          <h2 className="font-display text-[clamp(4rem,10vw,9rem)] text-bg-primary leading-none mb-6">
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
                123 Rue du Marché<br />
                Sorel-Tracy, Québec<br />
                J3P 3X3
              </address>

              <table className="w-full max-w-[400px] text-bg-primary/80 font-sans mb-16 border-collapse text-lg">
                <tbody>
                  <tr className="border-b border-bg-primary/15">
                    <td className="py-4 font-medium tracking-wider text-sm">MAR — JEU</td>
                    <td className="py-4 text-right">17h00 → 22h00</td>
                  </tr>
                  <tr className="border-b border-bg-primary/15">
                    <td className="py-4 font-medium tracking-wider text-sm">VEN — SAM</td>
                    <td className="py-4 text-right">17h00 → 23h00</td>
                  </tr>
                  <tr className="border-b border-bg-primary/15">
                    <td className="py-4 font-medium tracking-wider text-sm">DIM</td>
                    <td className="py-4 text-right">17h00 → 21h00</td>
                  </tr>
                </tbody>
              </table>

              <div className="font-sans text-bg-primary/70 mb-12">
                <div className="text-[0.75rem] uppercase tracking-[0.2em] mb-2 opacity-80">Appelez-nous</div>
                <a href="tel:4501234567" className="font-serif font-light text-[clamp(2.5rem,5vw,4rem)] text-bg-primary link-underline hover:text-orange transition-colors">
                  (450) 123-4567
                </a>
              </div>
            </div>

            <div className="flex gap-8 text-[0.875rem] font-medium tracking-[0.2em] uppercase text-bg-primary mt-8 lg:mt-0 p-6 lg:p-0">
              <a href="#" className="link-underline">Instagram</a>
              <span className="text-orange">·</span>
              <a href="#" className="link-underline">Facebook</a>
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
                src="/images/exterior-dusk.png" 
                alt="Devanture de Chez Florent au crépuscule" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            <span className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-bg-primary/60 mt-4 block text-right">
              — Notre façade sur la rue du Marché
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-bg-primary pt-12 relative z-10 overflow-hidden flex flex-col">
      <div className="w-full px-6 md:px-12 border-t border-border">
        <div className="max-w-7xl mx-auto py-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[0.75rem] tracking-[0.1em] uppercase text-cream-soft/60">
          <div>© 2026 Chez Florent</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-cream transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-cream transition-colors">Confidentialité</a>
          </div>
          <div>Conçu avec ♥ à Sorel-Tracy</div>
        </div>
      </div>

      {/* Massive Wordmark — SVG auto-fits viewport width, no overflow */}
      <div className="w-full bg-bg-primary pt-8 pb-4 relative">
        <svg
          viewBox="0 0 1100 240"
          preserveAspectRatio="xMidYMid meet"
          className="block w-full h-auto"
          aria-label="Chez Florent"
          role="img"
        >
          <text
            x="550"
            y="195"
            textAnchor="middle"
            textLength="1060"
            lengthAdjust="spacingAndGlyphs"
            style={{
              fontFamily: "'Caveat Brush', cursive",
              fontSize: "260px",
              fill: "rgb(244, 201, 160)",
              fillOpacity: 0.95,
            }}
          >
            CHEZ FLORENT
          </text>
        </svg>
        <div className="absolute right-4 bottom-3 md:right-8 md:bottom-5 font-sans text-xs tracking-widest text-cream/50">
          ◦ MMXXVI
        </div>
      </div>
    </footer>
  );
}

function FilmGrain() {
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
  const [showPreloader, setShowPreloader] = useState(true);

  // Intro logic
  useEffect(() => {
    const played = sessionStorage.getItem('chez-florent-intro-played');
    if (played) {
      setShowPreloader(false);
    }
  }, []);

  const handlePreloaderComplete = useCallback(() => {
    setShowPreloader(false);
    sessionStorage.setItem('chez-florent-intro-played', '1');
  }, []);

  // Lenis Smooth Scroll
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || showPreloader) return;

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

  return (
    <div className="min-h-[100dvh] w-full bg-bg-primary text-cream selection:bg-orange selection:text-bg-primary relative">
      <CustomCursor />
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
          <AmbianceStrip />
          <Agenda />
          <Reservation />
          <Contact />
        </main>
        <Footer />
      </div>
    </div>
  );
}
