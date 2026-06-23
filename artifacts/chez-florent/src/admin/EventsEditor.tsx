import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  getListEventsQueryKey,
} from "@workspace/api-client-react";
import type { Event } from "@workspace/api-client-react";
import {
  Button,
  Card,
  Checkbox,
  ErrorText,
  Field,
  TextInput,
  Textarea,
} from "./ui";

interface Draft {
  isoDate: string;
  title: string;
  tag: string;
  description: string;
  soldOut: boolean;
  sortOrder: number;
}

function emptyDraft(sortOrder: number): Draft {
  return {
    isoDate: "",
    title: "",
    tag: "",
    description: "",
    soldOut: false,
    sortOrder,
  };
}

function DraftFields({
  draft,
  onChange,
}: {
  draft: Draft;
  onChange: (next: Draft) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Date">
        <TextInput
          type="date"
          value={draft.isoDate}
          onChange={(e) => onChange({ ...draft, isoDate: e.target.value })}
        />
      </Field>
      <Field label="Étiquette" hint="ex. « 5 à 7 · 17h–19h »">
        <TextInput
          value={draft.tag}
          onChange={(e) => onChange({ ...draft, tag: e.target.value })}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Titre">
          <TextInput
            value={draft.title}
            onChange={(e) => onChange({ ...draft, title: e.target.value })}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Description">
          <Textarea
            value={draft.description}
            onChange={(e) =>
              onChange({ ...draft, description: e.target.value })
            }
          />
        </Field>
      </div>
      <Field label="Ordre d'affichage">
        <TextInput
          type="number"
          value={draft.sortOrder}
          onChange={(e) =>
            onChange({ ...draft, sortOrder: Number(e.target.value) })
          }
        />
      </Field>
      <div className="flex items-end">
        <Checkbox
          label="Complet (sold out)"
          checked={draft.soldOut}
          onChange={(e) => onChange({ ...draft, soldOut: e.target.checked })}
        />
      </div>
    </div>
  );
}

function EventRow({ event }: { event: Event }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>({
    isoDate: event.isoDate,
    title: event.title,
    tag: event.tag,
    description: event.description,
    soldOut: event.soldOut,
    sortOrder: event.sortOrder,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });

  const update = useUpdateEvent({ mutation: { onSuccess: invalidate } });
  const remove = useDeleteEvent({ mutation: { onSuccess: invalidate } });

  return (
    <Card>
      <DraftFields draft={draft} onChange={setDraft} />
      <div className="mt-4 flex items-center gap-3">
        <Button
          onClick={() => update.mutate({ id: event.id, data: draft })}
          disabled={update.isPending}
        >
          {update.isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            if (confirm(`Supprimer « ${event.title} » ?`)) {
              remove.mutate({ id: event.id });
            }
          }}
          disabled={remove.isPending}
        >
          Supprimer
        </Button>
      </div>
      <ErrorText error={update.error ?? remove.error} />
    </Card>
  );
}

function AddEvent({ nextSortOrder }: { nextSortOrder: number }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft(nextSortOrder));

  const create = useCreateEvent({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });
        setDraft(emptyDraft(nextSortOrder + 1));
        setOpen(false);
      },
    },
  });

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>+ Ajouter un événement</Button>
    );
  }

  return (
    <Card className="border-dashed">
      <h3 className="mb-4 font-serif text-lg text-stone-900">
        Nouvel événement
      </h3>
      <DraftFields draft={draft} onChange={setDraft} />
      <div className="mt-4 flex items-center gap-3">
        <Button
          onClick={() => create.mutate({ data: draft })}
          disabled={create.isPending || !draft.title || !draft.isoDate}
        >
          {create.isPending ? "Ajout…" : "Ajouter"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
      <ErrorText error={create.error} />
    </Card>
  );
}

export default function EventsEditor() {
  const { data: events, isLoading, isError, error } = useListEvents();

  if (isLoading) return <p className="text-stone-500">Chargement…</p>;
  if (isError) return <ErrorText error={error} />;

  const list = events ?? [];
  const nextSortOrder =
    list.length > 0 ? Math.max(...list.map((e) => e.sortOrder)) + 1 : 0;

  return (
    <div className="space-y-5">
      <AddEvent nextSortOrder={nextSortOrder} />
      {list.length === 0 && (
        <p className="text-stone-500">Aucun événement pour le moment.</p>
      )}
      {list.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </div>
  );
}
