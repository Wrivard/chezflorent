import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import AdminApp from "./admin/AdminApp";
import EventsPage from "./EventsPage";
import MenuPage from "./MenuPage";
import { queryClient } from "./lib/queryClient";
import "./index.css";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const adminPath = `${base}/admin`;
const eventsPath = `${base}/evenements`;
const menuPath = `${base}/menu`;
const current = window.location.pathname.replace(/\/$/, "");
const isAdmin = current === adminPath || current.startsWith(`${adminPath}/`);
const isEvents = current === eventsPath || current.startsWith(`${eventsPath}/`);
const isMenu = current === menuPath || current.startsWith(`${menuPath}/`);

function Root() {
  if (isAdmin) return <AdminApp />;
  if (isEvents) return <EventsPage />;
  if (isMenu) return <MenuPage />;
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Root />
  </QueryClientProvider>,
);
