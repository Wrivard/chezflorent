import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navbar,
  Footer,
  FilmGrain,
  ScrollProgress,
  SectionMarker,
  useAgendaEventsData,
  EASE,
  EASE_SMOOTH,
  PREFILL_KEY,
  type AgendaEvent,
} from "./App";

const MONTHS_FULL_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const WEEKDAYS_SHORT_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAY_FULL_FR = [
  "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi",
];

const pad = (n: number) => String(n).padStart(2, "0");

function parseIso(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y: y || 0, m: (m || 1) - 1, d: d || 1 };
}

function fullDateLabel(iso: string): string {
  const { y, m, d } = parseIso(iso);
  const weekday = DAY_FULL_FR[new Date(y, m, d).getDay()];
  return `${weekday} ${d} ${MONTHS_FULL_FR[m]} ${y}`;
}

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function navigateToReservation(event: AgendaEvent): void {
  try {
    sessionStorage.setItem(
      PREFILL_KEY,
      JSON.stringify({
        id: event.id,
        title: event.title,
        date: event.isoDate,
        display: `${event.date.day} ${event.date.month}`,
      }),
    );
  } catch {}
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  window.location.href = `${base}/#reservation`;
}

// -----------------------------------------------------------------------------
// CALENDAR
// -----------------------------------------------------------------------------
function EventsCalendar({
  events,
  onSelectDate,
}: {
  events: AgendaEvent[];
  onSelectDate: (iso: string) => void;
}) {
  const byDate = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>();
    for (const e of events) {
      const arr = map.get(e.isoDate) ?? [];
      arr.push(e);
      map.set(e.isoDate, arr);
    }
    return map;
  }, [events]);

  const initial = useMemo(() => {
    const sorted = [...events].sort((a, b) => a.isoDate.localeCompare(b.isoDate));
    const t = todayIso();
    const target = sorted.find((e) => e.isoDate >= t) ?? sorted[sorted.length - 1];
    if (target) {
      const { y, m } = parseIso(target.isoDate);
      return { y, m };
    }
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  }, [events]);

  const [view, setView] = useState(initial);
  const didInit = useRef(false);
  useEffect(() => {
    if (!didInit.current && events.length > 0) {
      setView(initial);
      didInit.current = true;
    }
  }, [events, initial]);

  const { y, m } = view;
  const startOffset = (new Date(y, m, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const t = todayIso();

  const goPrev = () =>
    setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const goNext = () =>
    setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));

  return (
    <div>
      {/* Month header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-serif text-bg-primary text-[1.75rem] md:text-[2.5rem] leading-none capitalize">
          {MONTHS_FULL_FR[m]}{" "}
          <span className="text-bg-primary/45">{y}</span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Mois précédent"
            className="w-11 h-11 flex items-center justify-center border border-bg-primary/25 text-bg-primary rounded-[2px] hover:bg-bg-primary hover:text-cream transition-colors"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Mois suivant"
            className="w-11 h-11 flex items-center justify-center border border-bg-primary/25 text-bg-primary rounded-[2px] hover:bg-bg-primary hover:text-cream transition-colors"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1.5 md:gap-2 mb-2">
        {WEEKDAYS_SHORT_FR.map((d) => (
          <div
            key={d}
            className="text-center text-[0.6rem] md:text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-bg-primary/70 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="min-h-[58px] md:min-h-[112px]" />;
          }
          const iso = `${y}-${pad(m + 1)}-${pad(day)}`;
          const dayEvents = byDate.get(iso) ?? [];
          const hasEvents = dayEvents.length > 0;
          const isToday = iso === t;

          const base =
            "min-h-[58px] md:min-h-[150px] rounded-[4px] p-1.5 md:p-2.5 text-left transition-all duration-300 flex flex-col";

          if (!hasEvents) {
            return (
              <div
                key={iso}
                className={`${base} border ${
                  isToday
                    ? "border-orange/70 bg-orange/5"
                    : "border-bg-primary/10"
                }`}
              >
                <span
                  className={`font-serif text-[0.85rem] md:text-base ${
                    isToday ? "text-orange font-bold" : "text-bg-primary/60"
                  }`}
                >
                  {day}
                </span>
              </div>
            );
          }

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(iso)}
              aria-label={`${dayEvents.length} événement${
                dayEvents.length > 1 ? "s" : ""
              } le ${fullDateLabel(iso)}`}
              className={`${base} border bg-white/70 hover:bg-white shadow-sm hover:shadow-md cursor-pointer group ${
                isToday ? "border-orange ring-1 ring-orange ring-inset" : "border-bg-primary/15"
              }`}
            >
              <span
                className={`font-serif font-bold text-[0.85rem] md:text-base ${
                  isToday ? "text-orange" : "text-bg-primary"
                }`}
              >
                {day}
              </span>

              {/* Desktop: event detail chips */}
              <div className="hidden md:flex flex-col gap-1.5 mt-2 overflow-hidden">
                {dayEvents.slice(0, 2).map((e) => (
                  <div
                    key={e.id}
                    className={`rounded-[4px] px-2 py-1.5 ${
                      e.soldOut
                        ? "bg-bg-primary/[0.06] border border-bg-primary/20"
                        : "bg-orange"
                    }`}
                  >
                    <span
                      className={`block text-[0.72rem] font-semibold leading-snug line-clamp-2 ${
                        e.soldOut ? "text-bg-primary/55 line-through" : "text-bg-primary"
                      }`}
                    >
                      {e.title}
                    </span>
                    {e.soldOut ? (
                      <span className="inline-block mt-1 text-[0.55rem] font-bold tracking-[0.16em] uppercase bg-bg-primary text-cream px-1.5 py-0.5 rounded-[2px]">
                        Complet
                      </span>
                    ) : (
                      <span className="block mt-0.5 text-[0.58rem] font-medium tracking-[0.12em] uppercase text-bg-primary/70 truncate">
                        {e.tag}
                      </span>
                    )}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-[0.62rem] font-semibold tracking-wide text-orange-dark pl-0.5">
                    +{dayEvents.length - 2} autre{dayEvents.length - 2 > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Mobile: dots */}
              <div className="md:hidden flex flex-wrap items-center gap-1 mt-auto">
                {dayEvents.slice(0, 3).map((e) => (
                  <span
                    key={e.id}
                    className={`w-2 h-2 rounded-full ${
                      e.soldOut ? "bg-bg-primary/30" : "bg-orange"
                    }`}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[0.55rem] font-semibold text-orange-dark">
                    +{dayEvents.length - 3}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-5 mt-6 text-[0.72rem] font-medium text-bg-primary/70">
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-[3px] bg-orange" /> Événement
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-[3px] bg-bg-primary/25" /> Complet
        </span>
        <span className="hidden sm:inline text-bg-primary/45 italic font-sans">
          Cliquez sur une date pour les détails
        </span>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// UPCOMING LIST (mobile-friendly + secondary desktop view)
// -----------------------------------------------------------------------------
function UpcomingList({
  events,
  onSelectDate,
}: {
  events: AgendaEvent[];
  onSelectDate: (iso: string) => void;
}) {
  const t = todayIso();
  const upcoming = [...events]
    .filter((e) => e.isoDate >= t)
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  const list = upcoming.length > 0 ? upcoming : [...events].sort((a, b) => a.isoDate.localeCompare(b.isoDate));

  return (
    <div>
      <div className="text-[0.7rem] font-medium tracking-[0.2em] uppercase text-bg-primary/60 mb-6">
        À venir
      </div>
      <div className="grid sm:grid-cols-2 gap-x-12 border-t border-bg-primary/15">
        {list.map((event, i) => (
          <motion.button
            key={event.id}
            type="button"
            onClick={() => onSelectDate(event.isoDate)}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: EASE, delay: i * 0.04 }}
            className="w-full text-left grid grid-cols-[52px_1fr_auto] gap-4 py-5 border-b border-bg-primary/15 group hover:bg-bg-primary/[0.04] transition-colors px-2"
          >
            <div className="flex flex-col">
              <span className="font-serif italic font-light text-[1.6rem] leading-none text-bg-primary group-hover:text-orange transition-colors">
                {event.date.day}
              </span>
              <span className="text-[0.62rem] font-medium tracking-[0.18em] uppercase text-bg-primary/55 mt-1">
                {event.date.month}
              </span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-serif font-semibold text-[1.1rem] text-bg-primary leading-tight truncate">
                {event.title}
              </span>
              <span className="font-sans italic text-bg-primary/65 text-sm truncate">
                {event.desc}
              </span>
            </div>
            <div className="flex items-center">
              {event.soldOut ? (
                <span className="text-[0.62rem] font-bold tracking-[0.16em] uppercase whitespace-nowrap bg-bg-primary text-cream px-2.5 py-1 rounded-[2px]">
                  Complet
                </span>
              ) : (
                <span className="text-[0.65rem] font-medium tracking-[0.18em] uppercase whitespace-nowrap text-orange">
                  {event.tag}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// MODAL
// -----------------------------------------------------------------------------
function DayModal({
  iso,
  events,
  onClose,
}: {
  iso: string;
  events: AgendaEvent[];
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Événements du ${fullDateLabel(iso)}`}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.4, ease: EASE_SMOOTH }}
        className="relative w-full max-w-xl max-h-[88dvh] overflow-y-auto no-scrollbar bg-bg-secondary border border-border-strong rounded-[4px] shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-bg-secondary/95 backdrop-blur-sm border-b border-border px-6 md:px-8 py-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-[0.65rem] font-medium tracking-[0.22em] uppercase text-orange mb-2">
              <span aria-hidden="true">✶ </span>L'agenda
            </div>
            <h3 className="font-serif text-cream text-[1.35rem] md:text-[1.65rem] leading-tight capitalize">
              {fullDateLabel(iso)}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="shrink-0 w-10 h-10 flex items-center justify-center text-cream-soft hover:text-cream border border-border hover:border-border-strong rounded-[2px] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Events */}
        <div className="px-6 md:px-8 py-6 flex flex-col gap-6">
          {events.map((event) => (
            <article
              key={event.id}
              className="border-b border-border last:border-b-0 pb-6 last:pb-0"
            >
              <div
                className={`text-[0.65rem] font-medium tracking-[0.2em] uppercase mb-3 ${
                  event.soldOut ? "text-cream-soft/60" : "text-orange"
                }`}
              >
                {event.soldOut ? "Complet" : event.tag}
              </div>
              <h4 className="font-serif font-semibold text-cream text-[1.4rem] md:text-[1.6rem] leading-tight mb-3">
                {event.title}
              </h4>
              <p className="font-sans font-light italic text-cream-soft/80 leading-relaxed mb-5">
                {event.desc}
              </p>
              {event.soldOut ? (
                <div className="inline-flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.18em] uppercase text-cream-soft/60 border border-border px-5 py-3 rounded-[2px]">
                  Soirée complète
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigateToReservation(event)}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-orange text-bg-primary text-[0.72rem] font-medium tracking-[0.2em] uppercase rounded-[2px] hover:bg-orange-dark transition-colors"
                >
                  Réserver pour cette soirée
                  <span aria-hidden="true">→</span>
                </button>
              )}
            </article>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// PAGE
// -----------------------------------------------------------------------------
export default function EventsPage() {
  const events = useAgendaEventsData();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>();
    for (const e of events) {
      const arr = map.get(e.isoDate) ?? [];
      arr.push(e);
      map.set(e.isoDate, arr);
    }
    return map;
  }, [events]);

  const selectedEvents = selectedDate ? byDate.get(selectedDate) ?? [] : [];

  return (
    <div className="min-h-[100dvh] w-full bg-bg-primary text-cream selection:bg-orange selection:text-bg-primary relative">
      <ScrollProgress />
      <FilmGrain />

      <div className="overflow-x-hidden">
        <Navbar activeSection="" onEventsPage />

        <main>
          {/* Hero / header */}
          <section className="relative bg-bg-primary pt-40 md:pt-52 pb-20 md:pb-28 px-6 md:px-12 overflow-hidden">
            <SectionMarker number="04" />
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
                  <span aria-hidden="true">✶ </span>04 — La programmation
                </div>
                <h1 className="font-display text-cream leading-[1.18] pb-[0.28em] text-[clamp(3.5rem,11vw,11rem)]">
                  Les événements
                </h1>
                <p className="font-sans italic text-cream-soft/75 max-w-2xl text-lg mt-6">
                  Soirées, dégustations et concerts à venir. Parcourez le
                  calendrier et cliquez sur une date pour les détails.
                </p>
              </motion.div>
            </div>
          </section>

          {/* Calendar + list (light section, echoes the homepage Agenda) */}
          <section className="bg-cream-soft pt-20 md:pt-24 pb-28 md:pb-32 px-6 md:px-12 relative">
            <SectionMarker number="04" tone="light" />
            <div className="max-w-7xl mx-auto relative z-10">
              <EventsCalendar events={events} onSelectDate={setSelectedDate} />
              <div className="mt-20 md:mt-28">
                <UpcomingList events={events} onSelectDate={setSelectedDate} />
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      <AnimatePresence>
        {selectedDate && selectedEvents.length > 0 && (
          <DayModal
            iso={selectedDate}
            events={selectedEvents}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
