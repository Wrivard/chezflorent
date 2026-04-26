import React, { useEffect, useState } from "react";

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
}

function Navbar() {
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-bg-primary/90 backdrop-blur-md border-b border-border"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <a
            href="#accueil"
            className="flex items-center gap-3 text-cream hover:text-orange transition-colors"
          >
            <img src="/logo.png" alt="Chez Florent logo" className="w-9 h-9 object-contain" />
            <span className="font-display text-[28px] mt-1">Chez Florent</span>
          </a>

          <div className="hidden md:flex items-center gap-8 text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft">
            <a href="#menu" className="link-underline hover:text-cream transition-colors">Menu</a>
            <a href="#reservation" className="link-underline hover:text-cream transition-colors">Réservation</a>
            <a href="#contact" className="link-underline hover:text-cream transition-colors">Contact</a>
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
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-bg-primary pt-24 px-6 pb-6 flex flex-col">
          <div className="flex flex-col gap-8 text-2xl font-serif text-cream">
            <a href="#menu" onClick={closeMenu}>L'ardoise</a>
            <a href="#reservation" onClick={closeMenu}>Réserver une table</a>
            <a href="#contact" onClick={closeMenu}>Nous trouver</a>
          </div>
        </div>
      )}
    </>
  );
}

function Hero() {
  return (
    <section id="accueil" className="relative min-h-[100dvh] flex flex-col justify-center px-6 md:px-12 max-w-7xl mx-auto pt-20">
      {/* Decorative vertical line */}
      <div className="absolute left-6 md:left-12 top-32 bottom-[40%] w-[1px] bg-orange/50"></div>
      
      {/* Small corner logo badge */}
      <div className="absolute top-32 right-6 md:right-12 opacity-85 pointer-events-none">
        <img src="/logo.png" alt="" className="w-20 h-20 object-contain grayscale-[20%] brightness-90" />
      </div>

      <div className="pl-6 md:pl-12 w-full">
        <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-8">
          Bistro — Sorel-Tracy
        </div>

        <h1 className="font-serif italic font-light text-cream leading-[0.95] text-[clamp(4rem,10vw,9rem)] mb-10 max-w-5xl">
          Une cuisine qui<br />
          raconte des <span className="relative inline-block">
            histoires.
            <svg className="absolute -bottom-1 md:-bottom-3 left-0 w-full h-auto text-orange" viewBox="0 0 200 15" fill="none" preserveAspectRatio="none">
              <path d="M2 10C50 -2 150 -2 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
        </h1>

        <p className="font-sans font-light text-[1.0625rem] leading-[1.7] text-cream-soft max-w-[480px] mb-12">
          « Chez Florent, c'est l'ardoise qui change selon les humeurs du chef et les arrivages du marché. Des assiettes à partager, des produits d'ici, des soirées qui s'étirent. »
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
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
        </div>
      </div>

      <div className="absolute bottom-12 right-6 md:right-12 text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft">
        ↓ Défiler
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="a-propos" className="bg-bg-secondary py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto reveal">
        <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-6">
          02 — La maison
        </div>
        <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] text-cream mb-16">
          Chez nous,
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 text-[1.0625rem] leading-[1.7]">
          <div className="font-serif font-normal text-cream-soft max-w-[700px]">
            « Florent n'est pas seulement un nom au-dessus de la porte. C'est une certaine idée du bistro : celle où l'on s'attable sans cérémonie, où le vin se verse au pichet, et où la cuisine ne triche jamais avec ses produits. »
          </div>
          <div className="font-sans font-light text-cream-soft max-w-[700px]">
            « On travaille avec des fermiers qu'on appelle par leur prénom — la Ferme J.N Beauchemin pour les saucisses, Fromagerie Fuoco pour la bufarella, Les Cowboys du BBQ pour le brisket. Le reste, c'est de l'huile de coude et du temps. »
          </div>
        </div>
      </div>
    </section>
  );
}

const dishes = [
  {
    name: "Trempette de poireaux rôtis",
    price: "16,95 $",
    desc: "Bacon fumé, servi avec pain plat gratiné."
  },
  {
    name: "Grilled cheese sur baguette",
    price: "5,95 $ / 11,95 $",
    desc: "Provolone, mozzarella, fromage jaune, beurre à l'ail."
  },
  {
    name: "Feuilleté jambon gruyère",
    price: "9,95 $ / 19,95 $",
    desc: "Pâte feuilletée, jambon, fromage gruyère, sauce blanche crémeuse avec pomme de terre, poireaux."
  },
  {
    name: "Bufarella potato",
    price: "17,95 $",
    desc: "Boule de fromage bufarella (Fromagerie Fuoco) accompagnée de hummus de patate douce, coulis de bleuets à l'érable, huile épicée, menthe et crumble au parmesan. Servi avec pain naan grillé."
  },
  {
    name: "Miche de porc",
    price: "23,95 $",
    desc: "Miche de pain artisanale, porc effiloché maison, fromage à la crème épicé aux cornichons, laitue iceberg, moutarde au miel. Servi avec salade de carottes crémeuse."
  },
  {
    name: "« Le Rhé-Actif »",
    price: "24,95 $",
    desc: "Pain ciabata, provolone, mortadelle, calabrese, capicollo, salade, tomates, oignons rouges, mayonnaise thaï. Servi avec salade de patates maison."
  },
  {
    name: "Pizza « Vodka » 🌶🌶🌶",
    price: "25,95 $",
    desc: "Sauce rosée à la vodka, saucisses épicées (Ferme J.N Beauchemin), oignons croustillants, mozzarella, huile à l'ail, tomates confites au gras de canard."
  },
  {
    name: "Assiette de charcuterie",
    price: "35,95 $",
    desc: "Calabrese, prosciutto, saucissons secs, olives méli-mélo, fromages du moment, pickle d'oignons rouges, petits cornichons. Servi avec pain et croutons."
  },
  {
    name: "« Philly T »",
    price: "25,95 $",
    desc: "Pain baguette, fromages (jaune, mozzarella, provolone), poivrons rouges, oignons blancs, brisket (Les Cowboys du BBQ), mayonnaise épicée. Servi avec salade de pâte maison et cup de sauce BBQ."
  }
];

function Menu() {
  return (
    <section id="menu" className="bg-bg-primary py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto reveal">
        <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-6">
          03 — L'ardoise
        </div>
        <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] text-cream mb-4">
          L'ardoise du moment
        </h2>
        <p className="font-sans italic text-cream-soft mb-16 max-w-2xl">
          Notre carte évolue selon les saisons et l'humeur du chef. Voici ce qui s'y trouve aujourd'hui.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
          {dishes.map((dish, i) => (
            <div key={i} className="flex flex-col">
              <div className="flex justify-between items-baseline mb-2 gap-4">
                <h3 className="font-serif font-semibold text-[1.75rem] text-cream">{dish.name}</h3>
                <div className="font-serif font-semibold text-[1.25rem] text-orange whitespace-nowrap">{dish.price}</div>
              </div>
              <p className="font-sans font-light italic text-cream-soft max-w-[520px] leading-[1.6] mb-6">
                {dish.desc}
              </p>
              <div className="h-[1px] w-full bg-border mt-auto"></div>
            </div>
          ))}
        </div>

        <div className="text-center mt-20">
          <p className="font-sans italic text-cream-soft/60">
            « L'ardoise change. Suivez-nous sur les réseaux pour voir les ajouts du chef. »
          </p>
        </div>
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
    <section id="reservation" className="bg-bg-primary py-32 px-6 md:px-12 border-t border-border">
      <div className="max-w-[640px] mx-auto reveal">
        <div className="text-center mb-16">
          <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-6">
            04 — Réserver
          </div>
          <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] text-cream mb-4">
            Une table pour vous
          </h2>
          <p className="font-sans text-cream-soft">
            Pour les groupes de plus de 8 personnes, contactez-nous directement par téléphone.
          </p>
        </div>

        {status === "success" ? (
          <div className="text-center py-16">
            <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
              ✶ Merci
            </div>
            <p className="font-serif italic text-[1.5rem] text-cream mb-8">
              Nous vous confirmons par téléphone d'ici 24h.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="text-[0.875rem] text-cream-soft link-underline"
            >
              Faire une nouvelle réservation
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col">
                <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="name"
                  className="bg-transparent border-b border-border text-cream py-2 focus:outline-none focus:border-orange transition-colors rounded-none"
                />
                {errors.name && <span className="text-orange text-xs mt-1">{errors.name}</span>}
              </div>
              <div className="flex flex-col">
                <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="bg-transparent border-b border-border text-cream py-2 focus:outline-none focus:border-orange transition-colors rounded-none"
                />
                {errors.phone && <span className="text-orange text-xs mt-1">{errors.phone}</span>}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2">
                Courriel (optionnel)
              </label>
              <input
                type="email"
                name="email"
                className="bg-transparent border-b border-border text-cream py-2 focus:outline-none focus:border-orange transition-colors rounded-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col">
                <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  className="bg-transparent border-b border-border text-cream py-2 focus:outline-none focus:border-orange transition-colors rounded-none [color-scheme:dark]"
                />
                {errors.date && <span className="text-orange text-xs mt-1">{errors.date}</span>}
              </div>
              <div className="flex flex-col">
                <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2">
                  Heure
                </label>
                <input
                  type="time"
                  name="time"
                  className="bg-transparent border-b border-border text-cream py-2 focus:outline-none focus:border-orange transition-colors rounded-none [color-scheme:dark]"
                />
                {errors.time && <span className="text-orange text-xs mt-1">{errors.time}</span>}
              </div>
              <div className="flex flex-col">
                <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2">
                  Personnes
                </label>
                <select
                  name="guests"
                  className="bg-bg-primary border-b border-border text-cream py-2 focus:outline-none focus:border-orange transition-colors rounded-none appearance-none"
                >
                  <option value="">Sélectionner</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                  <option value="9+">9+</option>
                </select>
                {errors.guests && <span className="text-orange text-xs mt-1">{errors.guests}</span>}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-2">
                Message / Demande spéciale
              </label>
              <textarea
                name="message"
                rows={3}
                className="bg-transparent border-b border-border text-cream py-2 focus:outline-none focus:border-orange transition-colors rounded-none resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="mt-4 w-full py-4 bg-orange text-bg-primary font-medium text-[1rem] transition-transform duration-300 hover:bg-orange-dark hover:scale-[1.02] rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange"
            >
              Confirmer la réservation
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="bg-bg-secondary py-32 px-6 md:px-12 border-t border-border">
      <div className="max-w-7xl mx-auto reveal">
        <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft mb-6">
          05 — Nous trouver
        </div>
        <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] text-cream mb-16">
          Passez nous voir
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="flex flex-col justify-between">
            <div>
              <address className="font-serif text-[1.25rem] text-cream not-italic mb-12">
                <strong className="font-semibold block mb-2">Chez Florent</strong>
                123 Rue du Marché<br />
                Sorel-Tracy, Québec<br />
                J3P 3X3
              </address>

              <table className="w-full max-w-[400px] text-cream-soft font-sans mb-12 border-collapse">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-3 font-medium">MAR — JEU</td>
                    <td className="py-3 text-right">17h00 → 22h00</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 font-medium">VEN — SAM</td>
                    <td className="py-3 text-right">17h00 → 23h00</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-3 font-medium">DIM</td>
                    <td className="py-3 text-right">17h00 → 21h00</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">LUN</td>
                    <td className="py-3 text-right text-orange">FERMÉ</td>
                  </tr>
                </tbody>
              </table>

              <div className="font-sans text-cream-soft mb-12 flex flex-col gap-2">
                <div>Téléphone : <a href="tel:4501234567" className="link-underline">(450) 123-4567</a></div>
                <div>Courriel : <a href="mailto:bonjour@chezflorent.ca" className="link-underline">bonjour@chezflorent.ca</a></div>
              </div>
            </div>

            <div className="flex gap-6 text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream">
              <a href="#" className="link-underline">Instagram</a>
              <span className="text-orange">·</span>
              <a href="#" className="link-underline">Facebook</a>
            </div>
          </div>

          <div className="bg-bg-tertiary aspect-[4/5] flex items-center justify-center border border-border">
            <span className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-cream-soft">
              [ Carte interactive ]
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-bg-primary pt-24 pb-12 px-6 md:px-12 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="font-display text-[2rem] text-cream">Chez Florent</span>
        </div>
        <div className="h-[1px] w-full bg-border mb-8"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[0.875rem] text-cream-soft/60">
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

function App() {
  useReveal();

  return (
    <div className="min-h-[100dvh] w-full bg-bg-primary text-cream overflow-x-hidden selection:bg-orange selection:text-bg-primary">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Menu />
        <Reservation />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
