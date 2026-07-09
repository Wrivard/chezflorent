/**
 * Build-time SSR entry for the prerender pipeline.
 *
 * `scripts/prerender.mjs` imports this after `vite build` (built via
 * `vite build --ssr`) and calls `render(routeId)` to get the FULL HTML of each
 * public page — every section, straight from the real React components. The
 * QueryClient is created with queries disabled, so no network fetch fires and
 * every page falls back to its DEFAULT_* content (the same source of truth the
 * live components use). This means there is no separate hand-maintained copy of
 * the page copy: the crawlable HTML is generated from the components themselves.
 *
 * The output is injected into <div id="root"> and hidden from JS visitors via
 * the `.seo-prerender` wrapper (React's createRoot().render() discards it on
 * mount), so it exists purely for crawlers.
 */
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import EventsPage from "./EventsPage";
import MenuPage from "./MenuPage";
import AboutPage from "./AboutPage";
import ContactPage from "./ContactPage";
import GroupReservationPage from "./GroupReservationPage";
import PrivacyPage from "./PrivacyPage";

export type RouteId =
  | "home"
  | "menu"
  | "a-propos"
  | "contact"
  | "evenements"
  | "groupes"
  | "confidentialite";

function pageFor(routeId: RouteId) {
  switch (routeId) {
    case "menu":
      return <MenuPage />;
    case "a-propos":
      return <AboutPage />;
    case "contact":
      return <ContactPage />;
    case "evenements":
      return <EventsPage />;
    case "groupes":
      return <GroupReservationPage />;
    case "confidentialite":
      return <PrivacyPage />;
    case "home":
    default:
      return <App />;
  }
}

export function render(routeId: RouteId): string {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { enabled: false, retry: false },
    },
  });

  return renderToString(
    <QueryClientProvider client={queryClient}>
      <div className="site-root">{pageFor(routeId)}</div>
    </QueryClientProvider>,
  );
}
