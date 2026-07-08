import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListMessages,
  useUpdateMessage,
  useDeleteMessage,
  getListMessagesQueryKey,
} from "@workspace/api-client-react";
import type { Message } from "@workspace/api-client-react";
import {
  Badge,
  Button,
  Card,
  ConfirmModal,
  ErrorText,
  SectionHeading,
} from "./ui";

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("fr-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <span className="min-w-[90px] shrink-0 text-cream-soft/50">{label}</span>
      <span className="text-cream-soft break-words">{value}</span>
    </div>
  );
}

export default function MessagesEditor() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useListMessages();
  const [filter, setFilter] = useState<"all" | "new">("all");
  const [toDelete, setToDelete] = useState<Message | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey() });
  const update = useUpdateMessage({ mutation: { onSuccess: invalidate } });
  const remove = useDeleteMessage({
    mutation: {
      onSuccess: () => {
        invalidate();
        setToDelete(null);
      },
    },
  });

  if (isLoading) {
    return <p className="text-cream-soft/60">Chargement…</p>;
  }
  if (isError) {
    return <ErrorText error={error} />;
  }

  const list = data ?? [];
  const newCount = list.filter((m) => !m.handled).length;
  const shown = filter === "new" ? list.filter((m) => !m.handled) : list;

  return (
    <div>
      <SectionHeading
        eyebrow="Boîte de réception"
        title="Messages reçus"
        description="Questions des clients et demandes de fournisseurs envoyées depuis le site."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "primary" : "ghost"}
          onClick={() => setFilter("all")}
        >
          Tous ({list.length})
        </Button>
        <Button
          variant={filter === "new" ? "primary" : "ghost"}
          onClick={() => setFilter("new")}
        >
          Non lus ({newCount})
        </Button>
      </div>

      {shown.length === 0 ? (
        <p className="text-cream-soft/60">Aucun message pour l’instant.</p>
      ) : (
        <div className="grid gap-3">
          {shown.map((m) => (
            <Card key={m.id} className={m.handled ? "opacity-60" : ""}>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={m.kind === "question" ? "neutral" : "orange"}>
                    {m.kind === "fournisseur"
                      ? "Fournisseur"
                      : m.kind === "groupe"
                        ? "Groupe"
                        : "Question"}
                  </Badge>
                  {!m.handled && <Badge tone="danger">Non lu</Badge>}
                  <span className="text-xs text-cream-soft/40">
                    {fmtDateTime(m.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="subtle"
                    onClick={() =>
                      update.mutate({
                        id: m.id,
                        data: { handled: !m.handled },
                      })
                    }
                    disabled={update.isPending}
                  >
                    {m.handled ? "Marquer non lu" : "Marquer lu"}
                  </Button>
                  <Button variant="danger" onClick={() => setToDelete(m)}>
                    Supprimer
                  </Button>
                </div>
              </div>

              <h3 className="mb-1 font-serif text-lg text-cream">{m.name}</h3>

              <div className="mb-4 grid gap-1">
                <Row label="Courriel" value={m.email} />
                <Row label="Téléphone" value={m.phone} />
                <Row label="Entreprise" value={m.company} />
                <Row label="Fournit" value={m.supplyType} />
                <Row label="Sujet" value={m.subject} />
              </div>

              <p className="whitespace-pre-wrap text-sm leading-relaxed text-cream-soft/90">
                {m.message}
              </p>

              <div className="mt-4">
                <a
                  href={`mailto:${m.email}${
                    m.subject ? `?subject=${encodeURIComponent("Re: " + m.subject)}` : ""
                  }`}
                  className="text-xs font-medium uppercase tracking-[0.16em] text-orange hover:text-orange-dark"
                >
                  Répondre par courriel →
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        open={toDelete !== null}
        message={
          toDelete
            ? `Supprimer définitivement le message de ${toDelete.name} ?`
            : ""
        }
        onConfirm={() => {
          if (toDelete) remove.mutate({ id: toDelete.id });
        }}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
