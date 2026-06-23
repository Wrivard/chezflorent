import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import AdminApp from "./admin/AdminApp";
import { queryClient } from "./lib/queryClient";
import "./index.css";

const base = import.meta.env.BASE_URL.replace(/\/$/, "");
const adminPath = `${base}/admin`;
const current = window.location.pathname.replace(/\/$/, "");
const isAdmin = current === adminPath || current.startsWith(`${adminPath}/`);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    {isAdmin ? <AdminApp /> : <App />}
  </QueryClientProvider>,
);
