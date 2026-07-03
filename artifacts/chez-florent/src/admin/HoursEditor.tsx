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

// The site stores hours as decimal numbers (11.5 = 11h30). In the CMS we edit
// them as real "HH:MM" times and convert at the boundary, so the owner never
// deals with decimals. Midnight closing is stored as 24 (end of day), shown as
// "00:00" in the picker.
function decimalToTime(h: number | null | undefined): string {
  if (h == null) return "";
  const total = Math.round(h * 60);
  const hrs = Math.floor(total / 60) % 24;
  const mins = total % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function timeToDecimal(t: string, isClose: boolean): number | null {
  if (!t) return null;
  const [hStr, mStr] = t.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  let dec = h + m / 60;
  if (isClose && dec === 0) dec = 24;
  return dec;
}

type DayDraft = { closed: boolean; open: string; close: string };

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
            <Field label="Ouverture">
              <TextInput
                type="time"
                className="w-36"
                value={draft.open}
                onChange={(e) => onChange({ open: e.target.value })}
              />
            </Field>
            <Field label="Fermeture" hint="minuit = 00:00">
              <TextInput
                type="time"
                className="w-36"
                value={draft.close}
                onChange={(e) => onChange({ close: e.target.value })}
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
        open: decimalToTime(h.openHour),
        close: decimalToTime(h.closeHour),
      }),
    );
    setDrafts(m);
  }, [hours]);

  function setDay(dayOfWeek: number, patch: Partial<DayDraft>) {
    setDrafts((prev) => {
      const next = new Map(prev);
      const cur = next.get(dayOfWeek) ?? {
        closed: false,
        open: "",
        close: "",
      };
      next.set(dayOfWeek, { ...cur, ...patch });
      return next;
    });
    setSaved(false);
  }

  async function saveAll() {
    const missing = [...drafts.entries()].filter(
      ([, d]) => !d.closed && (!d.open || !d.close),
    );
    if (missing.length > 0) {
      const names = missing
        .map(([day]) => DAY_NAMES[day])
        .filter(Boolean)
        .join(", ");
      setSaveError(
        new Error(
          `Indiquez une heure d'ouverture et de fermeture, ou cochez « Fermé » pour : ${names}.`,
        ),
      );
      setSaved(false);
      return;
    }
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
              openHour: d.closed ? null : timeToDecimal(d.open, false),
              closeHour: d.closed ? null : timeToDecimal(d.close, true),
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
        Indiquez l'heure d'ouverture et de fermeture. Pour une fermeture à
        minuit, utilisez 00:00. L'horaire affiché sur le site est regroupé
        automatiquement.
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
