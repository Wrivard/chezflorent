import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCurrentAdmin,
  useLogout,
  getGetCurrentAdminQueryKey,
} from "@workspace/api-client-react";
import Login from "./Login";
import EventsEditor from "./EventsEditor";
import MenuEditor from "./MenuEditor";
import HoursEditor from "./HoursEditor";
import PhotosEditor from "./PhotosEditor";
import GroupContentEditor from "./GroupContentEditor";
import AboutContentEditor from "./AboutContentEditor";
import AccountEditor from "./AccountEditor";
import MessagesEditor from "./MessagesEditor";
import { Button, cn } from "./ui";

const TABS = [
  { id: "agenda", label: "Agenda" },
  { id: "menu", label: "Menu" },
  { id: "groupes", label: "Groupes" },
  { id: "apropos", label: "À propos" },
  { id: "horaires", label: "Horaires" },
  { id: "photos", label: "Photos" },
  { id: "messages", label: "Messages" },
  { id: "compte", label: "Compte" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminApp() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>("agenda");

  const { data: admin, isLoading, isError } = useGetCurrentAdmin();

  const logout = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetCurrentAdminQueryKey(),
        });
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary text-cream-soft/60">
        Chargement…
      </div>
    );
  }

  if (isError || !admin) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-bg-primary text-cream-soft">
      <header className="sticky top-0 z-30 border-b border-border bg-bg-primary/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Chez Florent"
              className="h-14 w-auto object-contain md:h-16"
            />
            <div className="hidden sm:block border-l border-border pl-3">
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-orange">
                Espace de gestion
              </p>
              <p className="text-xs text-cream-soft/55">
                Contenu du site
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-cream-soft/60 sm:inline">
              {admin.email}
            </span>
            <Button
              variant="ghost"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              Déconnexion
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 md:px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium tracking-[0.04em] transition-colors",
                tab === t.id
                  ? "border-orange text-cream"
                  : "border-transparent text-cream-soft/55 hover:text-cream",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
        {tab === "agenda" && <EventsEditor />}
        {tab === "menu" && <MenuEditor />}
        {tab === "groupes" && <GroupContentEditor />}
        {tab === "apropos" && <AboutContentEditor />}
        {tab === "horaires" && <HoursEditor />}
        {tab === "photos" && <PhotosEditor />}
        {tab === "messages" && <MessagesEditor />}
        {tab === "compte" && <AccountEditor />}
      </main>
    </div>
  );
}
