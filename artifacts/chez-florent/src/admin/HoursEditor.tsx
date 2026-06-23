import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListHours,
  useUpdateHours,
  getListHoursQueryKey,
} from "@workspace/api-client-react";
import type { Hours } from "@workspace/api-client-react";
import { Button, Card, Checkbox, ErrorText, Field, TextInput } from "./ui";
import { DAY_NAMES } from "./lib";

function HoursRow({ hours }: { hours: Hours }) {
  const queryClient = useQueryClient();
  const [closed, setClosed] = useState(hours.closed);
  const [openHour, setOpenHour] = useState<string>(
    hours.openHour != null ? String(hours.openHour) : "",
  );
  const [closeHour, setCloseHour] = useState<string>(
    hours.closeHour != null ? String(hours.closeHour) : "",
  );

  const update = useUpdateHours({
    mutation: {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: getListHoursQueryKey() }),
    },
  });

  return (
    <Card>
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-28">
          <span className="block font-serif text-lg text-stone-900">
            {DAY_NAMES[hours.dayOfWeek]}
          </span>
        </div>
        <Checkbox
          label="Fermé"
          checked={closed}
          onChange={(e) => setClosed(e.target.checked)}
        />
        {!closed && (
          <>
            <Field label="Ouverture (h)">
              <TextInput
                type="number"
                min={0}
                max={23}
                className="w-24"
                value={openHour}
                onChange={(e) => setOpenHour(e.target.value)}
              />
            </Field>
            <Field label="Fermeture (h)">
              <TextInput
                type="number"
                min={0}
                max={23}
                className="w-24"
                value={closeHour}
                onChange={(e) => setCloseHour(e.target.value)}
              />
            </Field>
          </>
        )}
        <Button
          onClick={() =>
            update.mutate({
              dayOfWeek: hours.dayOfWeek,
              data: {
                closed,
                openHour: closed || openHour === "" ? null : Number(openHour),
                closeHour:
                  closed || closeHour === "" ? null : Number(closeHour),
              },
            })
          }
          disabled={update.isPending}
        >
          {update.isPending ? "…" : "Enregistrer"}
        </Button>
      </div>
      <ErrorText error={update.error} />
    </Card>
  );
}

export default function HoursEditor() {
  const { data: hours, isLoading, isError, error } = useListHours();

  if (isLoading) return <p className="text-stone-500">Chargement…</p>;
  if (isError) return <ErrorText error={error} />;

  const list = [...(hours ?? [])].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500">
        Indiquez l'heure d'ouverture et de fermeture sur 24h (ex. 17 et 22).
        L'horaire affiché sur le site est regroupé automatiquement.
      </p>
      {list.map((row) => (
        <HoursRow key={row.dayOfWeek} hours={row} />
      ))}
    </div>
  );
}
