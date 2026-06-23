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
import { Button, cn } from "./ui";

const TABS = [
  { id: "agenda", label: "Agenda" },
  { id: "menu", label: "Menu" },
  { id: "horaires", label: "Horaires" },
  { id: "photos", label: "Photos" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminApp() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>("agenda");

  const {
    data: admin,
    isLoading,
    isError,
  } = useGetCurrentAdmin();

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
      <div className="flex min-h-screen items-center justify-center bg-stone-100 text-stone-500">
        Chargement…
      </div>
    );
  }

  if (isError || !admin) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="font-serif text-xl text-stone-900">Chez Florent</h1>
            <p className="text-xs text-stone-500">Gestion du contenu</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-stone-500 sm:inline">
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
        <nav className="mx-auto flex max-w-4xl gap-1 px-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "border-b-2 px-4 py-2 text-sm font-medium transition",
                tab === t.id
                  ? "border-[#b5471f] text-[#b5471f]"
                  : "border-transparent text-stone-500 hover:text-stone-800",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {tab === "agenda" && <EventsEditor />}
        {tab === "menu" && <MenuEditor />}
        {tab === "horaires" && <HoursEditor />}
        {tab === "photos" && <PhotosEditor />}
      </main>
    </div>
  );
}
