import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import AdminApp from "./admin/AdminApp";
import EventsPage from "./EventsPage";
import MenuPage from "./MenuPage";
import AboutPage from "./AboutPage";
import ContactPage from "./ContactPage";
import GroupReservationPage from "./GroupReservationPage";
import PrivacyPage from "./PrivacyPage";
import NotFoundPage from "./NotFoundPage";
import { queryClient } from "./lib/queryClient";
import "./index.css";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const adminPath = `${base}/admin`;
const eventsPath = `${base}/evenements`;
const menuPath = `${base}/menu`;
const aboutPath = `${base}/a-propos`;
const contactPath = `${base}/contact`;
const groupsPath = `${base}/groupes`;
const privacyPath = `${base}/confidentialite`;
const current = window.location.pathname.replace(/\/$/, "");
const isAdmin = current === adminPath || current.startsWith(`${adminPath}/`);
const isEvents = current === eventsPath || current.startsWith(`${eventsPath}/`);
const isMenu = current === menuPath || current.startsWith(`${menuPath}/`);
const isAbout = current === aboutPath || current.startsWith(`${aboutPath}/`);
const isContact = current === contactPath || current.startsWith(`${contactPath}/`);
const isGroups = current === groupsPath || current.startsWith(`${groupsPath}/`);
const isPrivacy =
  current === privacyPath || current.startsWith(`${privacyPath}/`);
const isHome = current === base;

function Root() {
  if (isAdmin) return <AdminApp />;
  if (isEvents) return <EventsPage />;
  if (isMenu) return <MenuPage />;
  if (isAbout) return <AboutPage />;
  if (isContact) return <ContactPage />;
  if (isGroups) return <GroupReservationPage />;
  if (isPrivacy) return <PrivacyPage />;
  if (isHome) return <App />;
  return <NotFoundPage />;
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Root />
  </QueryClientProvider>,
);
