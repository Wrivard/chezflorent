import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import AdminApp from "./admin/AdminApp";
import EventsPage from "./EventsPage";
import { queryClient } from "./lib/queryClient";
import "./index.css";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const adminPath = `${base}/admin`;
const eventsPath = `${base}/evenements`;
const current = window.location.pathname.replace(/\/$/, "");
const isAdmin = current === adminPath || current.startsWith(`${adminPath}/`);
const isEvents = current === eventsPath || current.startsWith(`${eventsPath}/`);

function Root() {
  if (isAdmin) return <AdminApp />;
  if (isEvents) return <EventsPage />;
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Root />
  </QueryClientProvider>,
);
