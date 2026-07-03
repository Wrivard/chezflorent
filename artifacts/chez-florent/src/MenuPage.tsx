import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navbar,
  Footer,
  FilmGrain,
  ScrollProgress,
  SectionMarker,
  useMenuCategoriesData,
  imgSrc,
  EASE,
  EASE_SMOOTH,
  MENU_SLUGS,
  FIXED_MENU_SLUGS,
  ARDOISE_PDF_URL,
  type MenuCategory,
} from "./App";

// -----------------------------------------------------------------------------
// SUPPLIERS MARQUEE
// -----------------------------------------------------------------------------
function SuppliersMarquee() {
  return (
    <div className="w-full overflow-hidden py-4 bg-bg-primary border-t border-b border-border">
      <div className="flex whitespace-nowrap animate-marquee-slow w-max">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center text-[0.875rem] font-medium tracking-[0.2em] uppercase text-cream-soft"
          >
            <span className="px-8">★ FERME J.N BEAUCHEMIN</span>
            <span className="px-8">★ FROMAGERIE FUOCO</span>
            <span className="px-8">★ LES COWBOYS DU BBQ</span>
            <span className="px-8">★ HUILE D'OLIVE QC</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// MENU BOARD — tabs + dish list + sticky photo (mirrors the homepage L'ardoise)
// -----------------------------------------------------------------------------
function BoardHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-10 md:mb-12">
      <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-3">
        <span aria-hidden="true">✶ </span>
        {kicker}
      </div>
      <h2 className="font-display text-cream text-[clamp(2.75rem,7vw,5rem)] leading-[1.1]">
        {title}
      </h2>
    </div>
  );
}

function DishList({
  activeCategory,
  dishes,
  activeIndex,
  setActiveIndex,
  twoCol,
}: {
  activeCategory: MenuCategory;
  dishes: MenuCategory["dishes"];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  twoCol: boolean;
}) {
  return (
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
          className={`grid grid-cols-1 ${twoCol ? "md:grid-cols-2 md:gap-x-10 lg:gap-x-16" : ""}`}
        >
          {dishes.map((dish, i) => {
            const isActive = i === activeIndex;
            return (
              <div
                key={`${activeCategory.id}-${i}`}
                className={`group grid grid-cols-[40px_1fr_auto] md:grid-cols-[60px_1fr_auto] gap-4 md:gap-8 py-8 border-b border-border cursor-default transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-inset ${
                  isActive ? "bg-bg-secondary/40" : "hover:bg-bg-secondary/30"
                } px-3 md:px-6`}
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
                <div
                  className={`font-serif italic text-lg md:text-xl pt-1 transition-colors ${
                    isActive ? "text-orange" : "text-orange/70"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
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
  );
}

function MenuBoard({
  categories,
  showPhoto = true,
  boardId = "menu",
}: {
  categories: MenuCategory[];
  showPhoto?: boolean;
  boardId?: string;
}) {
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
      {activeCategory.tagline ? (
        <AnimatePresence mode="wait">
          <motion.p
            key={activeCategory.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="font-sans italic text-cream-soft/80 max-w-2xl text-lg mb-12"
          >
            {activeCategory.tagline}
          </motion.p>
        </AnimatePresence>
      ) : null}

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
                <span
                  className={`font-serif italic text-[0.7rem] tracking-normal normal-case transition-colors ${
                    isActive ? "text-orange" : "text-cream-soft/75"
                  }`}
                >
                  {String(c.dishes.length).padStart(2, "0")}
                </span>
              </span>
              {isActive && (
                <motion.div
                  layoutId={`menu-page-tab-underline-${boardId}`}
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-orange"
                  transition={{ duration: 0.4, ease: EASE_SMOOTH }}
                />
              )}
            </button>
          );
        })}
      </div>

      {showPhoto ? (
        /* Two-column: list left, sticky photo right */
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-8 lg:gap-16 items-start">
          <DishList
            activeCategory={activeCategory}
            dishes={dishes}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            twoCol={false}
          />

          {/* Right: sticky photo that cross-fades on dish focus */}
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
                        ◦ {String(activeIndex + 1).padStart(2, "0")} — Aperçu
                      </div>
                      <div className="font-display text-cream text-[1.75rem] leading-none">
                        {activeDish?.name.replace(/«\s*|\s*»/g, "")}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[0.7rem] font-medium tracking-[0.2em] uppercase text-cream-soft/75">
              <span>— Glissez sur un plat</span>
              <span className="font-serif italic normal-case tracking-normal text-cream-soft/85">
                {String(activeIndex + 1).padStart(2, "0")} / {String(dishes.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Photo-less: full-width, two columns of items on larger screens */
        <DishList
          activeCategory={activeCategory}
          dishes={dishes}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          twoCol={true}
        />
      )}
    </>
  );
}

// -----------------------------------------------------------------------------
// PAGE
// -----------------------------------------------------------------------------
export default function MenuPage() {
  const allCategories = useMenuCategoriesData();
  const menu = allCategories.filter((c) => MENU_SLUGS.includes(c.id));
  const bar = allCategories.filter((c) => !FIXED_MENU_SLUGS.includes(c.id));

  return (
    <div className="min-h-[100dvh] w-full bg-bg-primary text-cream selection:bg-orange selection:text-bg-primary relative">
      <ScrollProgress />
      <FilmGrain />

      <div className="overflow-x-hidden">
        <Navbar activeSection="" onMenuPage />

        <main>
          {/* Hero / header */}
          <section className="relative bg-bg-primary pt-40 md:pt-52 pb-16 md:pb-20 px-6 md:px-12 overflow-hidden">
            {/* Background photo */}
            <img
              src={imgSrc("pizza-oven.jpg")}
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
            <SectionMarker number="03" />
            <div className="max-w-7xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <div className="text-[0.75rem] font-medium tracking-[0.2em] uppercase text-orange mb-6">
                  <span aria-hidden="true">✶ </span>03 — Au menu ce soir
                </div>
                <h1 className="ardoise-clip font-display leading-[1.18] pb-[0.28em] text-[clamp(2rem,11vw,11rem)] max-w-full overflow-visible">
                  Le menu
                </h1>
                <p className="font-sans italic text-cream-soft/75 max-w-2xl text-lg mt-6">
                  Notre carte complète — encas, salades, pizzas au four à bois,
                  hoagies, desserts et boissons. Pour les spéciaux qui changent
                  chaque semaine, consultez l'ardoise.
                </p>
                <a
                  href={ARDOISE_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 border border-orange text-orange text-[0.75rem] font-medium tracking-[0.2em] uppercase hover:bg-orange hover:text-bg-primary transition-all duration-300 rounded-[2px]"
                >
                  Voir l'ardoise (PDF)
                  <span aria-hidden="true">↗</span>
                </a>
              </motion.div>
            </div>
          </section>

          {/* Suppliers marquee */}
          <SuppliersMarquee />

          {/* Menu board — one unified fixed menu + a separate Untappd bar */}
          <section className="bg-bg-primary pt-16 md:pt-20 pb-28 md:pb-32 px-6 md:px-12 relative">
            <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-24 md:gap-32">
              {menu.length > 0 && (
                <div>
                  <BoardHeading
                    kicker="Encas, salades, pizzas, hoagies, desserts & cafés"
                    title="La cuisine"
                  />
                  <MenuBoard categories={menu} boardId="menu" />
                </div>
              )}

              {bar.length > 0 && (
                <div>
                  <BoardHeading
                    kicker="Bières & boissons — rafraîchi depuis Untappd"
                    title="Le bar"
                  />
                  <MenuBoard categories={bar} showPhoto={false} boardId="bar" />
                </div>
              )}
            </div>

            <div className="max-w-7xl mx-auto mt-16 text-center relative z-10">
              <p className="font-sans italic text-cream-soft/85 text-sm">
                « L'ardoise change chaque semaine — consultez-la en PDF pour les spéciaux du chef. »
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
