import { useMemo, useState } from "react";
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
  Badge,
  Button,
  Card,
  Checkbox,
  ErrorText,
  Field,
  IconButton,
  ConfirmModal,
  Modal,
  SectionHeading,
  SectionPreview,
  TextInput,
  Textarea,
} from "./ui";
import { MONTHS_FR, WEEKDAY_SHORT } from "./lib";

interface Draft {
  isoDate: string;
  title: string;
  tag: string;
  description: string;
  soldOut: boolean;
  sortOrder: number;
}

function emptyDraft(isoDate: string, sortOrder: number): Draft {
  return { isoDate, title: "", tag: "", description: "", soldOut: false, sortOrder };
}

function toDraft(e: Event): Draft {
  return {
    isoDate: e.isoDate,
    title: e.title,
    tag: e.tag,
    description: e.description,
    soldOut: e.soldOut,
    sortOrder: e.sortOrder,
  };
}

function parseISO(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function fmtISO(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function fmtLong(iso: string): string {
  const d = parseISO(iso);
  if (!d) return iso;
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

// Monday-first weekday index (0 = Monday … 6 = Sunday).
function mondayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

type ModalState =
  | { mode: "closed" }
  | { mode: "create"; isoDate: string }
  | { mode: "edit"; event: Event };

function EventForm({
  initial,
  onSubmit,
  onCancel,
  onDelete,
  pending,
  error,
}: {
  initial: Draft;
  onSubmit: (draft: Draft) => void;
  onCancel: () => void;
  onDelete?: () => void;
  pending: boolean;
  error: unknown;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date">
          <TextInput
            type="date"
            value={draft.isoDate}
            onChange={(e) => setDraft({ ...draft, isoDate: e.target.value })}
          />
        </Field>
        <Field label="Étiquette" hint="ex. « 5 à 7 · 17h–19h »">
          <TextInput
            value={draft.tag}
            onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Titre">
            <TextInput
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description">
            <Textarea
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </Field>
        </div>
        <div className="flex items-end">
          <Checkbox
            label="Complet (sold out)"
            checked={draft.soldOut}
            onChange={(e) => setDraft({ ...draft, soldOut: e.target.checked })}
          />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => onSubmit(draft)}
            disabled={pending || !draft.title || !draft.isoDate}
          >
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Annuler
          </Button>
        </div>
        {onDelete && (
          <Button variant="danger" onClick={onDelete}>
            Supprimer
          </Button>
        )}
      </div>
      <ErrorText error={error} />
    </div>
  );
}

export default function EventsEditor() {
  const queryClient = useQueryClient();
  const { data: events, isLoading, isError, error } = useListEvents();
  const [cursor, setCursor] = useState<Date>(() => new Date());
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [dlg, setDlg] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
  }>({ open: false, message: "", onConfirm: () => {} });
  function openDlg(message: string, onConfirm: () => void) {
    setDlg({ open: true, message, onConfirm });
  }

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListEventsQueryKey() });

  const create = useCreateEvent({
    mutation: { onSuccess: () => { invalidate(); setModal({ mode: "closed" }); } },
  });
  const update = useUpdateEvent({
    mutation: { onSuccess: () => { invalidate(); setModal({ mode: "closed" }); } },
  });
  const remove = useDeleteEvent({
    mutation: { onSuccess: () => { invalidate(); setModal({ mode: "closed" }); } },
  });

  const list = useMemo(() => events ?? [], [events]);

  const byDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const e of list) {
      const arr = map.get(e.isoDate) ?? [];
      arr.push(e);
      map.set(e.isoDate, arr);
    }
    return map;
  }, [list]);

  const nextSortOrder =
    list.length > 0 ? Math.max(...list.map((e) => e.sortOrder)) + 1 : 0;

  const upcoming = useMemo(
    () => [...list].sort((a, b) => a.isoDate.localeCompare(b.isoDate)),
    [list],
  );

  if (isLoading) return <p className="text-cream-soft/60">Chargement…</p>;
  if (isError) return <ErrorText error={error} />;

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lead = mondayIndex(first);
  const todayISO = fmtISO(new Date());

  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <SectionHeading
        eyebrow="Programmation"
        title="Agenda du restaurant"
        description="Cliquez sur une date pour ajouter un événement, ou sur un événement pour le modifier."
        action={
          <Button
            onClick={() =>
              setModal({ mode: "create", isoDate: todayISO })
            }
          >
            + Ajouter un événement
          </Button>
        }
      />

      <Card className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <IconButton
            label="Mois précédent"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </IconButton>
          <h3 className="font-serif text-xl capitalize text-cream">
            {MONTHS_FR[month]} {year}
          </h3>
          <IconButton
            label="Mois suivant"
            onClick={() => setCursor(new Date(year, month + 1, 1))}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </IconButton>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAY_SHORT.map((d) => (
            <div
              key={d}
              className="pb-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cream-soft/50"
            >
              {d}
            </div>
          ))}
          {cells.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} className="min-h-[84px]" />;
            const iso = fmtISO(date);
            const dayEvents = byDate.get(iso) ?? [];
            const isToday = iso === todayISO;
            return (
              <button
                key={iso}
                onClick={() => setModal({ mode: "create", isoDate: iso })}
                className={`group flex min-h-[84px] flex-col rounded-lg border p-1.5 text-left transition-colors ${
                  isToday
                    ? "border-orange/50 bg-orange/5"
                    : "border-border bg-bg-tertiary/40 hover:border-cream-soft/30 hover:bg-bg-tertiary/70"
                }`}
              >
                <span
                  className={`mb-1 text-xs font-medium ${
                    isToday ? "text-orange" : "text-cream-soft/60"
                  }`}
                >
                  {date.getDate()}
                </span>
                <span className="flex flex-1 flex-col gap-1">
                  {dayEvents.map((ev) => (
                    <span
                      key={ev.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModal({ mode: "edit", event: ev });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          setModal({ mode: "edit", event: ev });
                        }
                      }}
                      className={`truncate rounded px-1.5 py-1 text-[0.7rem] font-medium leading-tight transition-colors ${
                        ev.soldOut
                          ? "bg-red-500/15 text-red-200 line-through"
                          : "bg-orange/20 text-cream hover:bg-orange/30"
                      }`}
                      title={ev.title}
                    >
                      {ev.title}
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream-soft/50">
        Tous les événements ({upcoming.length})
      </div>
      {upcoming.length === 0 && (
        <p className="text-cream-soft/60">Aucun événement pour le moment.</p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {upcoming.map((ev) => {
          const d = parseISO(ev.isoDate);
          return (
            <button
              key={ev.id}
              onClick={() => setModal({ mode: "edit", event: ev })}
              className="flex items-stretch gap-4 rounded-xl border border-border bg-bg-secondary p-4 text-left transition-colors hover:border-cream-soft/30"
            >
              <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-bg-tertiary py-2">
                <span className="font-serif text-2xl leading-none text-orange">
                  {d ? d.getDate() : "—"}
                </span>
                <span className="mt-1 text-[0.6rem] uppercase tracking-[0.12em] text-cream-soft/60">
                  {d ? MONTHS_FR[d.getMonth()].slice(0, 4) : ""}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate font-serif text-base text-cream">
                    {ev.title}
                  </h4>
                  {ev.soldOut && <Badge tone="danger">Complet</Badge>}
                </div>
                {ev.tag && (
                  <div className="mt-0.5 text-xs text-orange/90">{ev.tag}</div>
                )}
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-cream-soft/60">
                  {ev.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <SectionPreview
        section="agenda"
        title="La section « Agenda » du site"
        description="Voici à quoi ressemble votre programmation sur la page publique."
      />

      <ConfirmModal
        open={dlg.open}
        message={dlg.message}
        onConfirm={dlg.onConfirm}
        onClose={() => setDlg((d) => ({ ...d, open: false }))}
      />

      <Modal
        open={modal.mode === "create"}
        onClose={() => setModal({ mode: "closed" })}
        title="Nouvel événement"
      >
        {modal.mode === "create" && (
          <>
            <p className="mb-4 text-sm text-cream-soft/60">
              {fmtLong(modal.isoDate)}
            </p>
            <EventForm
              initial={emptyDraft(modal.isoDate, nextSortOrder)}
              onSubmit={(draft) => create.mutate({ data: draft })}
              onCancel={() => setModal({ mode: "closed" })}
              pending={create.isPending}
              error={create.error}
            />
          </>
        )}
      </Modal>

      <Modal
        open={modal.mode === "edit"}
        onClose={() => setModal({ mode: "closed" })}
        title="Modifier l'événement"
      >
        {modal.mode === "edit" && (
          <EventForm
            key={modal.event.id}
            initial={toDraft(modal.event)}
            onSubmit={(draft) =>
              update.mutate({ id: modal.event.id, data: draft })
            }
            onCancel={() => setModal({ mode: "closed" })}
            onDelete={() =>
              openDlg(
                `Supprimer « ${modal.event.title} » ?`,
                () => remove.mutate({ id: modal.event.id }),
              )
            }
            pending={update.isPending || remove.isPending}
            error={update.error ?? remove.error}
          />
        )}
      </Modal>
    </div>
  );
}
