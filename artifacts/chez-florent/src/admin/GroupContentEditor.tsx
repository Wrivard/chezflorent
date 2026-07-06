import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetGroupContent,
  useUpdateGroupContent,
  getGetGroupContentQueryKey,
} from "@workspace/api-client-react";
import type {
  GroupContent,
  GroupFormule,
  GroupOccasion,
} from "@workspace/api-client-react";
import {
  Button,
  Card,
  ErrorText,
  Field,
  SectionHeading,
  TextInput,
  Textarea,
} from "./ui";

function TextRow({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <TextInput value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

function AreaRow({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

function RowShell({
  badge,
  children,
}: {
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-tertiary/30 p-4">
      <div className="mb-3">
        <span className="font-display text-lg text-orange/70">{badge}</span>
      </div>
      {children}
    </div>
  );
}

function num(i: number): string {
  return String(i + 1).padStart(2, "0");
}

function EditorInner({ initial }: { initial: GroupContent }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<GroupContent>(initial);
  const [baseline, setBaseline] = useState<GroupContent>(initial);
  const [saved, setSaved] = useState(false);

  const update = useUpdateGroupContent({
    mutation: {
      onSuccess: (data) => {
        setBaseline(data);
        setDraft(data);
        queryClient.invalidateQueries({
          queryKey: getGetGroupContentQueryKey(),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      },
    },
  });

  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);

  const setFormule = (i: number, patch: Partial<GroupFormule>) =>
    setDraft((d) => ({
      ...d,
      formules: d.formules.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    }));
  const setOccasion = (i: number, patch: Partial<GroupOccasion>) =>
    setDraft((d) => ({
      ...d,
      occasions: d.occasions.map((o, idx) =>
        idx === i ? { ...o, ...patch } : o,
      ),
    }));

  return (
    <div>
      <SectionHeading
        eyebrow="Page Groupes"
        title="Groupes & privatisation"
        description="Modifiez les formules et les occasions de la page Groupes. Les textes, le déroulé et la fiche « L'essentiel » sont fixes. Les photos se gèrent dans l'onglet « Photos »."
      />

      {/* Sticky save bar */}
      <div className="sticky top-[4.5rem] z-20 -mx-1 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg-secondary/95 px-4 py-3 backdrop-blur-md">
        <p className="text-sm text-cream-soft/65">
          {dirty
            ? "Vous avez des modifications non enregistrées."
            : "Tout est à jour."}
        </p>
        <div className="flex items-center gap-3">
          {update.isError && <ErrorText error={update.error} />}
          <Button
            onClick={() => update.mutate({ data: draft })}
            disabled={update.isPending || !dirty}
          >
            {update.isPending
              ? "Enregistrement…"
              : saved
                ? "Enregistré ✓"
                : "Enregistrer les modifications"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* FORMULES */}
        <Card>
          <div className="mb-4">
            <h3 className="font-serif text-xl text-cream">
              Formules — « L'art de recevoir »
            </h3>
          </div>
          <p className="mb-4 text-sm text-cream-soft/55">
            Les photos des formules se modifient dans l'onglet « Photos ».
          </p>
          <div className="space-y-4">
            {draft.formules.map((f, i) => (
              <RowShell key={i} badge={num(i)}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextRow
                    label="Nom"
                    value={f.name}
                    onChange={(v) => setFormule(i, { name: v })}
                  />
                  <TextRow
                    label="Type"
                    value={f.kind}
                    onChange={(v) => setFormule(i, { kind: v })}
                    hint="ex. « Repas attablé »"
                  />
                  <TextRow
                    label="Prix"
                    value={f.price}
                    onChange={(v) => setFormule(i, { price: v })}
                    hint="ex. « à p. de 45 $ » ou « Sur mesure »"
                  />
                  <TextRow
                    label="Unité"
                    value={f.unit}
                    onChange={(v) => setFormule(i, { unit: v })}
                    hint="ex. « / pers. » (laisser vide si aucune)"
                  />
                  <div className="sm:col-span-2">
                    <AreaRow
                      label="Description"
                      value={f.desc}
                      onChange={(v) => setFormule(i, { desc: v })}
                    />
                  </div>
                </div>
              </RowShell>
            ))}
          </div>
        </Card>

        {/* OCCASIONS */}
        <Card>
          <div className="mb-4">
            <h3 className="font-serif text-xl text-cream">
              Occasions — « On célèbre quoi ? »
            </h3>
          </div>
          <p className="mb-4 text-sm text-cream-soft/55">
            Les photos des occasions se modifient dans l'onglet « Photos ».
          </p>
          <div className="space-y-4">
            {draft.occasions.map((o, i) => (
              <RowShell key={i} badge={num(i)}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextRow
                    label="Titre"
                    value={o.title}
                    onChange={(v) => setOccasion(i, { title: v })}
                  />
                  <TextRow
                    label="Étiquette"
                    value={o.tag}
                    onChange={(v) => setOccasion(i, { tag: v })}
                    hint="ex. « Au bureau »"
                  />
                  <div className="sm:col-span-2">
                    <AreaRow
                      label="Description"
                      value={o.desc}
                      onChange={(v) => setOccasion(i, { desc: v })}
                    />
                  </div>
                </div>
              </RowShell>
            ))}
          </div>
        </Card>
      </div>

      <GroupPreview />
    </div>
  );
}

function GroupPreview() {
  const [nonce, setNonce] = useState(0);
  const src = `${import.meta.env.BASE_URL}groupes`;
  return (
    <div className="mt-12 border-t border-border pt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-orange">
            <span aria-hidden="true">✶ </span>Aperçu en direct
          </div>
          <h3 className="font-serif text-lg text-cream">La page « Groupes »</h3>
          <p className="mt-0.5 text-sm text-cream-soft/55">
            Après avoir enregistré, cliquez sur « Rafraîchir l'aperçu » pour voir
            vos changements.
          </p>
        </div>
        <Button variant="subtle" onClick={() => setNonce((n) => n + 1)}>
          ↻ Rafraîchir l'aperçu
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-border-strong bg-bg-primary">
        <iframe
          key={nonce}
          src={src}
          title="Page Groupes"
          loading="lazy"
          className="w-full border-0"
          style={{ height: 720 }}
        />
      </div>
    </div>
  );
}

export default function GroupContentEditor() {
  const { data, isLoading, isError, error } = useGetGroupContent();

  if (isLoading) return <p className="text-cream-soft/60">Chargement…</p>;
  if (isError) return <ErrorText error={error} />;
  if (!data) return <ErrorText error={new Error("Contenu introuvable.")} />;

  return <EditorInner initial={data} />;
}
