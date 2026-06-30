import { useRef, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListHours,
  useUpdateHours,
  getListHoursQueryKey,
} from "@workspace/api-client-react";
import type { Hours } from "@workspace/api-client-react";
import {
  Button,
  Card,
  Checkbox,
  ErrorText,
  Field,
  SectionPreview,
  TextInput,
} from "./ui";
import { DAY_NAMES } from "./lib";

type DayDraft = { closed: boolean; openHour: string; closeHour: string };

function HoursRow({
  dayOfWeek,
  draft,
  onChange,
}: {
  dayOfWeek: number;
  draft: DayDraft;
  onChange: (patch: Partial<DayDraft>) => void;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-28">
          <span className="block font-serif text-lg text-cream">
            {DAY_NAMES[dayOfWeek]}
          </span>
        </div>
        <Checkbox
          label="Fermé"
          checked={draft.closed}
          onChange={(e) => onChange({ closed: e.target.checked })}
        />
        {!draft.closed && (
          <>
            <Field label="Ouverture (h)" hint="ex. 11.5 = 11h30">
              <TextInput
                type="number"
                min={0}
                max={23}
                step={0.5}
                className="w-24"
                value={draft.openHour}
                onChange={(e) => onChange({ openHour: e.target.value })}
              />
            </Field>
            <Field label="Fermeture (h)" hint="ex. 23 = 23h00">
              <TextInput
                type="number"
                min={0}
                max={24}
                step={0.5}
                className="w-24"
                value={draft.closeHour}
                onChange={(e) => onChange({ closeHour: e.target.value })}
              />
            </Field>
          </>
        )}
      </div>
    </Card>
  );
}

export default function HoursEditor() {
  const queryClient = useQueryClient();
  const { data: hours, isLoading, isError, error } = useListHours();
  const [drafts, setDrafts] = useState<Map<number, DayDraft>>(new Map());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  const [saved, setSaved] = useState(false);
  const initializedRef = useRef(false);

  const update = useUpdateHours();

  useEffect(() => {
    if (!hours || initializedRef.current) return;
    initializedRef.current = true;
    const m = new Map<number, DayDraft>();
    hours.forEach((h: Hours) =>
      m.set(h.dayOfWeek, {
        closed: h.closed,
        openHour: h.openHour != null ? String(h.openHour) : "",
        closeHour: h.closeHour != null ? String(h.closeHour) : "",
      }),
    );
    setDrafts(m);
  }, [hours]);

  function setDay(dayOfWeek: number, patch: Partial<DayDraft>) {
    setDrafts((prev) => {
      const next = new Map(prev);
      const cur = next.get(dayOfWeek) ?? {
        closed: false,
        openHour: "",
        closeHour: "",
      };
      next.set(dayOfWeek, { ...cur, ...patch });
      return next;
    });
    setSaved(false);
  }

  async function saveAll() {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await Promise.all(
        [...drafts.entries()].map(([dayOfWeek, d]) =>
          update.mutateAsync({
            dayOfWeek,
            data: {
              closed: d.closed,
              openHour:
                d.closed || d.openHour === "" ? null : Number(d.openHour),
              closeHour:
                d.closed || d.closeHour === "" ? null : Number(d.closeHour),
            },
          }),
        ),
      );
      queryClient.invalidateQueries({ queryKey: getListHoursQueryKey() });
      setSaved(true);
    } catch (err) {
      setSaveError(err);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <p className="text-cream-soft/60">Chargement…</p>;
  if (isError) return <ErrorText error={error} />;

  const list = [...(hours ?? [])].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div className="space-y-4">
      <p className="text-sm text-cream-soft/60">
        Indiquez l'heure d'ouverture et de fermeture sur 24h. Pour les demies-heures, utilisez 0.5 (ex. 11.5 = 11h30). L'horaire affiché sur le site est regroupé automatiquement.
      </p>
      {list.map((row) => {
        const draft = drafts.get(row.dayOfWeek);
        if (!draft) return null;
        return (
          <HoursRow
            key={row.dayOfWeek}
            dayOfWeek={row.dayOfWeek}
            draft={draft}
            onChange={(patch) => setDay(row.dayOfWeek, patch)}
          />
        );
      })}
      <div className="flex items-center gap-4 pt-2">
        <Button onClick={saveAll} disabled={saving || drafts.size === 0}>
          {saving ? "Enregistrement…" : "Enregistrer les horaires"}
        </Button>
        {saved && !saving && (
          <span className="text-sm text-orange">✓ Enregistré</span>
        )}
      </div>
      <ErrorText error={saveError} />

      <SectionPreview
        section="horaires"
        title="Le bandeau « Horaires » du site"
        description="Voici le bandeau d'ouverture tel qu'il défile sur la page publique."
        height={220}
      />
    </div>
  );
}
