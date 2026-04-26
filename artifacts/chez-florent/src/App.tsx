import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion, AnimatePresence } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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

function Navbar({ activeSection }: { activeSection: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-bg-primary/90 backdrop-blur-md border-b border-border py-4"
            : "bg-transparent border-b border-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <a
            href="#accueil"
            className="flex items-center gap-3 text-cream hover:text-orange transition-colors"
          >
            <img src="/logo.png" alt="Chez Florent logo" className="w-9 h-9 object-contain" />
            <span className="font-display text-[28px] mt-1">Chez Florent</span>
          </a>

          <div className="hidden md:flex items-center gap-8 text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft">
            <a href="#accueil" className={`link-underline hover:text-cream transition-colors ${activeSection === "accueil" ? "active text-cream" : ""}`}>Accueil</a>
            <a href="#a-propos" className={`link-underline hover:text-cream transition-colors ${activeSection === "a-propos" ? "active text-cream" : ""}`}>À propos</a>
            <a href="#menu" className={`link-underline hover:text-cream transition-colors ${activeSection === "menu" ? "active text-cream" : ""}`}>Menu</a>
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
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-0 z-40 bg-bg-primary pt-32 px-6 pb-6 flex flex-col"
          >
            <div className="flex flex-col gap-8 text-3xl font-serif text-cream">
              <a href="#accueil" onClick={closeMenu} className="hover:text-orange transition-colors">Accueil</a>
              <a href="#a-propos" onClick={closeMenu} className="hover:text-orange transition-colors">À propos</a>
              <a href="#menu" onClick={closeMenu} className="hover:text-orange transition-colors">L'ardoise</a>
              <a href="#reservation" onClick={closeMenu} className="hover:text-orange transition-colors">Réserver une table</a>
              <a href="#contact" onClick={closeMenu} className="hover:text-orange transition-colors">Nous trouver</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } }
  };

  return (
    <section id="accueil" className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-bg-primary">
        <div 
          className="absolute inset-0 bg-cover bg-center animate-kenburns origin-center"
          style={{
            backgroundImage: "url('/images/hero-interior.png')",
            filter: "saturate(1.1) contrast(1.1)"
          }}
        />
        {/* Layered overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(14,31,28,0.72) 0%, rgba(14,31,28,0.55) 40%, rgba(14,31,28,0.85) 100%)"
          }}
        />
        {/* Vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, transparent 40%, rgba(14,31,28,0.6) 100%)"
          }}
        />
      </div>

      <div className="relative z-10 px-6 md:px-12 max-w-7xl w-full mx-auto pt-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="pl-0 md:pl-12 w-full"
        >
          <motion.div variants={itemVariants} className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-8 flex items-center gap-3">
            <span>✶</span> Bistro — Sorel-Tracy
          </motion.div>

          <h1 className="font-serif italic font-light text-cream leading-[0.95] text-[clamp(4rem,10vw,9rem)] mb-10 max-w-5xl">
            <motion.div variants={itemVariants} className="overflow-hidden">
              <span className="block">Une cuisine qui</span>
            </motion.div>
            <motion.div variants={itemVariants} className="overflow-hidden">
              <span className="block">raconte des <span className="relative inline-block">
                histoires.
                <svg className="absolute -bottom-1 md:-bottom-3 left-0 w-full h-auto text-orange" viewBox="0 0 200 15" fill="none" preserveAspectRatio="none">
                  <path d="M2 10C50 -2 150 -2 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span></span>
            </motion.div>
          </h1>

          <motion.p variants={itemVariants} className="font-sans font-light text-[1.0625rem] leading-[1.7] text-cream-soft max-w-[480px] mb-12">
            « Chez Florent, c'est l'ardoise qui change selon les humeurs du chef et les arrivages du marché. Des assiettes à partager, des produits d'ici, des soirées qui s'étirent. »
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <a
              href="#menu"
              className="inline-flex justify-center items-center px-8 py-4 bg-orange text-bg-primary font-medium transition-transform duration-300 hover:bg-orange-dark hover:scale-[1.02] rounded-[2px]"
            >
              Voir l'ardoise →
            </a>
            <a
              href="#reservation"
              className="inline-flex justify-center items-center px-8 py-4 border border-cream text-cream font-medium transition-transform duration-300 hover:bg-cream hover:text-bg-primary hover:scale-[1.02] rounded-[2px]"
            >
              Réserver une table
            </a>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <div className="w-[1px] h-12 bg-orange/50 animate-pulse-gentle"></div>
      </div>
    </section>
  );
}

function About() {
  const { scrollYProgress } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  const y = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 150]);

  return (
    <section id="a-propos" className="bg-bg-secondary pt-32 pb-0 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          <div className="lg:col-span-5 relative">
            <motion.div 
              style={{ y }}
              className="relative w-full aspect-[4/5] overflow-hidden"
            >
              <img 
                src="/images/about-hands.png" 
                alt="Mains de chef cuisinant" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-6 text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft"
            >
              ✶ La maison
            </motion.div>
          </div>

          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-6 flex items-center gap-4">
                <span>02 / 05</span>
                <span className="w-12 h-[1px] bg-orange/50"></span>
              </div>
              <h2 className="font-display text-[clamp(3.5rem,8vw,7rem)] text-cream mb-12 leading-[0.9]">
                Chez nous,
              </h2>
              
              <div className="flex flex-col gap-8 text-[1.125rem] leading-[1.8]">
                <div className="font-serif font-normal text-cream-soft text-[1.25rem]">
                  « Florent n'est pas seulement un nom au-dessus de la porte. C'est une certaine idée du bistro : celle où l'on s'attable sans cérémonie, où le vin se verse au pichet, et où la cuisine ne triche jamais avec ses produits. »
                </div>
                <div className="font-sans font-light text-cream-soft/80">
                  « On travaille avec des fermiers qu'on appelle par leur prénom — la Ferme J.N Beauchemin pour les saucisses, Fromagerie Fuoco pour la bufarella, Les Cowboys du BBQ pour le brisket. Le reste, c'est de l'huile de coude et du temps. »
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      <div className="w-full overflow-hidden border-y border-border py-6 bg-bg-primary">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center">
              <span className="font-serif italic text-[clamp(2rem,5vw,4rem)] text-cream-soft px-8">PRODUITS LOCAUX</span>
              <span className="text-orange text-2xl">✶</span>
              <span className="font-serif italic text-[clamp(2rem,5vw,4rem)] text-cream-soft px-8">FERME J.N BEAUCHEMIN</span>
              <span className="text-orange text-2xl">✶</span>
              <span className="font-serif italic text-[clamp(2rem,5vw,4rem)] text-cream-soft px-8">FROMAGERIE FUOCO</span>
              <span className="text-orange text-2xl">✶</span>
              <span className="font-serif italic text-[clamp(2rem,5vw,4rem)] text-cream-soft px-8">LES COWBOYS DU BBQ</span>
              <span className="text-orange text-2xl">✶</span>
              <span className="font-serif italic text-[clamp(2rem,5vw,4rem)] text-cream-soft px-8">VIN D'IMPORTATION</span>
              <span className="text-orange text-2xl">✶</span>
              <span className="font-serif italic text-[clamp(2rem,5vw,4rem)] text-cream-soft px-8">TABLE ARTISANALE</span>
              <span className="text-orange text-2xl">✶</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const dishes = [
  {
    name: "Trempette de poireaux rôtis",
    price: "16,95 $",
    desc: "Bacon fumé, servi avec pain plat gratiné.",
    image: "bread-tearing.png"
  },
  {
    name: "Grilled cheese sur baguette",
    price: "5,95 $ / 11,95 $",
    desc: "Provolone, mozzarella, fromage jaune, beurre à l'ail.",
    image: "bread-tearing.png"
  },
  {
    name: "Feuilleté jambon gruyère",
    price: "9,95 $ / 19,95 $",
    desc: "Pâte feuilletée, jambon, fromage gruyère, sauce blanche crémeuse avec pomme de terre, poireaux.",
    image: "about-hands.png"
  },
  {
    name: "Bufarella potato",
    price: "17,95 $",
    desc: "Boule de fromage bufarella (Fromagerie Fuoco) accompagnée de hummus de patate douce, coulis de bleuets à l'érable, huile épicée, menthe et crumble au parmesan. Servi avec pain naan grillé.",
    image: "about-hands.png"
  },
  {
    name: "Miche de porc",
    price: "23,95 $",
    desc: "Miche de pain artisanale, porc effiloché maison, fromage à la crème épicé aux cornichons, laitue iceberg, moutarde au miel. Servi avec salade de carottes crémeuse.",
    image: "bread-tearing.png"
  },
  {
    name: "« Le Rhé-Actif »",
    price: "24,95 $",
    desc: "Pain ciabata, provolone, mortadelle, calabrese, capicollo, salade, tomates, oignons rouges, mayonnaise thaï. Servi avec salade de patates maison.",
    image: "dish-charcuterie.png"
  },
  {
    name: "Pizza « Vodka » 🌶🌶🌶",
    price: "25,95 $",
    desc: "Sauce rosée à la vodka, saucisses épicées (Ferme J.N Beauchemin), oignons croustillants, mozzarella, huile à l'ail, tomates confites au gras de canard.",
    image: "dish-pizza.png"
  },
  {
    name: "Assiette de charcuterie",
    price: "35,95 $",
    desc: "Calabrese, prosciutto, saucissons secs, olives méli-mélo, fromages du moment, pickle d'oignons rouges, petits cornichons. Servi avec pain et croutons.",
    image: "dish-charcuterie.png"
  },
  {
    name: "« Philly T »",
    price: "25,95 $",
    desc: "Pain baguette, fromages (jaune, mozzarella, provolone), poivrons rouges, oignons blancs, brisket (Les Cowboys du BBQ), mayonnaise épicée. Servi avec salade de pâte maison et cup de sauce BBQ.",
    image: "dish-charcuterie.png"
  }
];

function Menu() {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const mouseX = useSpring(0, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 50 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <section id="menu" className="bg-bg-primary py-32 relative border-t border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-6 flex items-center gap-4">
            <span>03 / 05</span>
            <span className="w-12 h-[1px] bg-orange/50"></span>
          </div>
          <h2 className="font-display text-[clamp(3.5rem,8vw,7rem)] text-cream mb-4">
            L'ardoise du moment
          </h2>
          <p className="font-sans italic text-cream-soft mb-20 max-w-2xl text-lg">
            Notre carte évolue selon les saisons et l'humeur du chef. Voici ce qui s'y trouve aujourd'hui.
          </p>
        </motion.div>

        <div 
          ref={menuRef}
          className="relative lg:cursor-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredImage(null)}
        >
          <div className="grid grid-cols-1 gap-y-0 relative z-10">
            {dishes.map((dish, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }}
                className="group border-b border-border py-8 flex flex-col md:flex-row md:items-center gap-6 relative"
                onMouseEnter={() => setHoveredImage(dish.image)}
              >
                <div className="text-orange font-serif italic text-lg w-12 hidden md:block">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <h3 className="font-serif font-semibold text-[2rem] text-cream mb-2 group-hover:text-orange transition-colors duration-300">
                    {dish.name}
                  </h3>
                  <p className="font-sans font-light italic text-cream-soft/80 max-w-[600px] leading-[1.6]">
                    {dish.desc}
                  </p>
                </div>
                <div className="font-serif font-semibold text-[1.5rem] text-orange whitespace-nowrap self-start md:self-center">
                  {dish.price}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Floating Image Cursor */}
          <motion.div
            className="pointer-events-none absolute z-0 w-[280px] aspect-[4/5] hidden lg:block overflow-hidden rounded-sm"
            style={{
              x: mouseX,
              y: mouseY,
              translateX: "-50%",
              translateY: "-50%"
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: hoveredImage ? 1 : 0, 
              scale: hoveredImage ? 1 : 0.8 
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <AnimatePresence mode="wait">
              {hoveredImage && (
                <motion.img
                  key={hoveredImage}
                  src={`/images/${hoveredImage}`}
                  alt=""
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full object-cover"
                />
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-24"
        >
          <p className="font-sans italic text-cream-soft/60">
            « L'ardoise change. Suivez-nous sur les réseaux pour voir les ajouts du chef. »
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function AmbianceStrip() {
  return (
    <section className="bg-bg-primary pt-16 pb-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex items-center justify-between"
        >
          <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft flex items-center gap-4">
            <span className="text-orange">✶</span> AMBIANCE
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 w-full">
        {[
          { src: "wine-pour.png", alt: "Service du vin" },
          { src: "exterior-dusk.png", alt: "L'extérieur au crépuscule", className: "object-cover object-center h-full aspect-[3/4] md:aspect-auto" },
          { src: "ambiance-smoke.png", alt: "Ambiance fumée" }
        ].map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
            className="overflow-hidden relative group aspect-[3/4]"
          >
            <img 
              src={`/images/${img.src}`} 
              alt={img.alt} 
              className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-110 ${img.className || ''}`}
            />
          </motion.div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center mt-16">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          className="font-serif italic text-[clamp(1.5rem,3vw,2rem)] text-cream-soft leading-tight"
        >
          « On ne vient pas chez Florent pour manger vite. On vient pour rester. »
        </motion.p>
      </div>
    </section>
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
    <section id="reservation" className="bg-bg-secondary py-32 px-6 md:px-12 border-t border-border">
      <motion.div 
        className="max-w-[640px] mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <div className="text-center mb-16">
          <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-6 flex justify-center items-center gap-4">
            <span className="w-8 h-[1px] bg-orange/50"></span>
            <span>04 / 05</span>
            <span className="w-8 h-[1px] bg-orange/50"></span>
          </div>
          <h2 className="font-display text-[clamp(3.5rem,8vw,7rem)] text-cream mb-6">
            Une table pour vous
          </h2>
          <p className="font-sans text-cream-soft text-lg">
            Pour les groupes de plus de 8 personnes, contactez-nous directement par téléphone.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="text-center py-20 bg-bg-primary border border-border p-8"
            >
              <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
                ✶ Merci
              </div>
              <p className="font-serif italic text-[2rem] text-cream mb-8">
                Nous vous confirmons par téléphone d'ici 24h.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="text-[0.875rem] text-cream-soft link-underline uppercase tracking-wider"
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
              className="flex flex-col gap-10 bg-bg-primary p-8 md:p-12 border border-border" 
              noValidate
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col relative group">
                  <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2 transition-colors group-focus-within:text-orange">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="bg-transparent border-b border-border text-cream py-3 focus:outline-none focus:border-orange transition-colors rounded-none text-lg"
                  />
                  {errors.name && <span className="text-orange text-xs mt-2 absolute -bottom-5">{errors.name}</span>}
                </div>
                <div className="flex flex-col relative group">
                  <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2 transition-colors group-focus-within:text-orange">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="bg-transparent border-b border-border text-cream py-3 focus:outline-none focus:border-orange transition-colors rounded-none text-lg"
                  />
                  {errors.phone && <span className="text-orange text-xs mt-2 absolute -bottom-5">{errors.phone}</span>}
                </div>
              </div>

              <div className="flex flex-col relative group">
                <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2 transition-colors group-focus-within:text-orange">
                  Courriel (optionnel)
                </label>
                <input
                  type="email"
                  name="email"
                  className="bg-transparent border-b border-border text-cream py-3 focus:outline-none focus:border-orange transition-colors rounded-none text-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="flex flex-col relative group">
                  <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2 transition-colors group-focus-within:text-orange">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    className="bg-transparent border-b border-border text-cream py-3 focus:outline-none focus:border-orange transition-colors rounded-none [color-scheme:dark] text-lg"
                  />
                  {errors.date && <span className="text-orange text-xs mt-2 absolute -bottom-5">{errors.date}</span>}
                </div>
                <div className="flex flex-col relative group">
                  <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2 transition-colors group-focus-within:text-orange">
                    Heure
                  </label>
                  <input
                    type="time"
                    name="time"
                    className="bg-transparent border-b border-border text-cream py-3 focus:outline-none focus:border-orange transition-colors rounded-none [color-scheme:dark] text-lg"
                  />
                  {errors.time && <span className="text-orange text-xs mt-2 absolute -bottom-5">{errors.time}</span>}
                </div>
                <div className="flex flex-col relative group">
                  <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2 transition-colors group-focus-within:text-orange">
                    Personnes
                  </label>
                  <select
                    name="guests"
                    className="bg-bg-primary border-b border-border text-cream py-3 focus:outline-none focus:border-orange transition-colors rounded-none appearance-none text-lg"
                  >
                    <option value="">Sélectionner</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                    <option value="9+">9+</option>
                  </select>
                  {errors.guests && <span className="text-orange text-xs mt-2 absolute -bottom-5">{errors.guests}</span>}
                </div>
              </div>

              <div className="flex flex-col relative group">
                <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2 transition-colors group-focus-within:text-orange">
                  Message / Demande spéciale
                </label>
                <textarea
                  name="message"
                  rows={3}
                  className="bg-transparent border-b border-border text-cream py-3 focus:outline-none focus:border-orange transition-colors rounded-none resize-none text-lg"
                ></textarea>
              </div>

              <button
                type="submit"
                className="mt-6 w-full py-5 bg-orange text-bg-primary font-medium text-[1.125rem] transition-transform duration-300 hover:bg-orange-dark hover:scale-[1.02] rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange"
              >
                Confirmer la réservation
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="bg-bg-primary py-32 px-6 md:px-12 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-6 flex items-center gap-4">
            <span>05 / 05</span>
            <span className="w-12 h-[1px] bg-orange/50"></span>
          </div>
          <h2 className="font-display text-[clamp(3.5rem,8vw,7rem)] text-cream mb-16">
            Passez nous voir
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <motion.div 
            className="flex flex-col justify-between"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          >
            <div>
              <address className="font-serif text-[1.5rem] text-cream not-italic mb-16 leading-relaxed">
                <strong className="font-semibold block mb-4 text-orange">Chez Florent</strong>
                123 Rue du Marché<br />
                Sorel-Tracy, Québec<br />
                J3P 3X3
              </address>

              <table className="w-full max-w-[400px] text-cream-soft font-sans mb-16 border-collapse text-lg">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-4 font-medium">MAR — JEU</td>
                    <td className="py-4 text-right">17h00 → 22h00</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 font-medium">VEN — SAM</td>
                    <td className="py-4 text-right">17h00 → 23h00</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 font-medium">DIM</td>
                    <td className="py-4 text-right">17h00 → 21h00</td>
                  </tr>
                  <tr>
                    <td className="py-4 font-medium">LUN</td>
                    <td className="py-4 text-right text-orange font-medium">FERMÉ</td>
                  </tr>
                </tbody>
              </table>

              <div className="font-sans text-cream-soft mb-12 flex flex-col gap-4 text-lg">
                <div>Téléphone : <a href="tel:4501234567" className="link-underline hover:text-cream transition-colors">(450) 123-4567</a></div>
                <div>Courriel : <a href="mailto:bonjour@chezflorent.ca" className="link-underline hover:text-cream transition-colors">bonjour@chezflorent.ca</a></div>
              </div>
            </div>

            <div className="flex gap-8 text-[0.875rem] font-medium tracking-[0.2em] uppercase text-cream">
              <a href="#" className="link-underline">Instagram</a>
              <span className="text-orange">·</span>
              <a href="#" className="link-underline">Facebook</a>
            </div>
          </motion.div>

          <motion.div 
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
          >
            <div className="bg-bg-tertiary aspect-[4/5] overflow-hidden group">
              <img 
                src="/images/exterior-dusk.png" 
                alt="Devanture de Chez Florent au crépuscule" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
            <span className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft/80 text-center block">
              Chez Florent — Sorel-Tracy
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-bg-primary pt-24 pb-12 px-6 md:px-12 border-t border-border relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-display text-[3rem] text-cream">Chez Florent</span>
        </div>
        <div className="h-[1px] w-full bg-border mb-8"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[0.875rem] text-cream-soft/60">
          <div>© 2026 Chez Florent. Tous droits réservés.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-cream transition-colors">Mentions légales</a>
            <span>·</span>
            <a href="#" className="hover:text-cream transition-colors">Politique de confidentialité</a>
          </div>
          <div>Site conçu avec ♥ à Sorel-Tracy</div>
        </div>
      </div>
    </footer>
  );
}

// Film Grain Overlay Component
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

function App() {
  const activeSection = useActiveSection();

  return (
    <div className="min-h-[100dvh] w-full bg-bg-primary text-cream overflow-x-hidden selection:bg-orange selection:text-bg-primary relative">
      <FilmGrain />
      <Navbar activeSection={activeSection} />
      <main>
        <Hero />
        <About />
        <Menu />
        <AmbianceStrip />
        <Reservation />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
