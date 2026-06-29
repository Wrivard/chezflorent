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
  GroupStep,
  GroupDetail,
} from "@workspace/api-client-react";
import {
  Button,
  Card,
  ErrorText,
  Field,
  IconButton,
  SectionHeading,
  TextInput,
  Textarea,
} from "./ui";
import { uploadImage } from "./lib";

// Mirrors App.tsx imgSrc so bare filenames preview correctly in the admin.
function imgPreview(image: string): string {
  if (!image) return "";
  if (image.startsWith("/") || image.startsWith("http")) return image;
  return `/images/${image}`;
}

const TrashIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

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

function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<unknown>(null);

  async function onFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      setUploadError(err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream-soft/60">
        Photo
      </span>
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-bg-tertiary">
          {value ? (
            <img
              src={imgPreview(value)}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-cream-soft transition-colors hover:text-cream hover:border-cream-soft/40">
          {uploading ? "Téléversement…" : "Choisir une image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <ErrorText error={uploadError} />
    </div>
  );
}

function RowShell({
  badge,
  onRemove,
  removeLabel,
  children,
}: {
  badge: string;
  onRemove: () => void;
  removeLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-tertiary/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-lg text-orange/70">{badge}</span>
        <IconButton
          label={removeLabel}
          className="border-red-400/30 text-red-300 hover:border-red-400/60"
          onClick={onRemove}
        >
          {TrashIcon}
        </IconButton>
      </div>
      {children}
    </div>
  );
}

const BLANK_FORMULE: GroupFormule = {
  name: "",
  kind: "",
  desc: "",
  price: "",
  unit: "",
  image: "",
};
const BLANK_OCCASION: GroupOccasion = {
  title: "",
  desc: "",
  image: "",
  tag: "",
};
const BLANK_STEP: GroupStep = { title: "", body: "" };
const BLANK_DETAIL: GroupDetail = { label: "", value: "" };

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

  const setText = (key: keyof GroupContent["texts"], v: string) =>
    setDraft((d) => ({ ...d, texts: { ...d.texts, [key]: v } }));

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
  const setStep = (i: number, patch: Partial<GroupStep>) =>
    setDraft((d) => ({
      ...d,
      steps: d.steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));
  const setDetail = (i: number, patch: Partial<GroupDetail>) =>
    setDraft((d) => ({
      ...d,
      details: d.details.map((x, idx) => (idx === i ? { ...x, ...patch } : x)),
    }));

  const t = draft.texts;

  return (
    <div>
      <SectionHeading
        eyebrow="Page Groupes"
        title="Groupes & privatisation"
        description="Modifiez les textes, les formules, les occasions, le déroulé et la fiche « L'essentiel » de la page Groupes. Les questions fréquentes restent gérées dans le code."
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
        {/* TEXTES */}
        <Card>
          <h3 className="mb-4 font-serif text-xl text-cream">Textes de la page</h3>

          <div className="mb-6">
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-orange/80">
              En-tête (héro)
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextRow
                label="Petit titre"
                value={t.heroMarker}
                onChange={(v) => setText("heroMarker", v)}
                hint="ex. « 07 — Groupes & privatisation »"
              />
              <TextRow
                label="Grand titre"
                value={t.heroTitle}
                onChange={(v) => setText("heroTitle", v)}
              />
              <div className="sm:col-span-2">
                <AreaRow
                  label="Phrase d'introduction"
                  value={t.heroLede}
                  onChange={(v) => setText("heroLede", v)}
                />
              </div>
            </div>
          </div>

          <div className="mb-6 border-t border-border pt-5">
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-orange/80">
              Le mot de Florent
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextRow
                label="Petit titre"
                value={t.manifestoMarker}
                onChange={(v) => setText("manifestoMarker", v)}
              />
              <TextRow
                label="Grand titre"
                value={t.manifestoTitle}
                onChange={(v) => setText("manifestoTitle", v)}
              />
              <div className="sm:col-span-2">
                <AreaRow
                  label="Paragraphe"
                  value={t.manifestoBody}
                  onChange={(v) => setText("manifestoBody", v)}
                />
              </div>
              <div className="sm:col-span-2">
                <AreaRow
                  label="Citation signée"
                  value={t.manifestoQuote}
                  onChange={(v) => setText("manifestoQuote", v)}
                />
              </div>
              <TextRow
                label="Signature — nom"
                value={t.signatureName}
                onChange={(v) => setText("signatureName", v)}
              />
              <TextRow
                label="Signature — rôle"
                value={t.signatureRole}
                onChange={(v) => setText("signatureRole", v)}
              />
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-orange/80">
              Titres des sections
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextRow
                label="Formules — petit titre"
                value={t.formulesMarker}
                onChange={(v) => setText("formulesMarker", v)}
              />
              <TextRow
                label="Formules — grand titre"
                value={t.formulesTitle}
                onChange={(v) => setText("formulesTitle", v)}
              />
              <div className="sm:col-span-2">
                <AreaRow
                  label="Formules — phrase d'introduction"
                  value={t.formulesLede}
                  onChange={(v) => setText("formulesLede", v)}
                />
              </div>
              <TextRow
                label="Occasions — petit titre"
                value={t.occasionsMarker}
                onChange={(v) => setText("occasionsMarker", v)}
              />
              <TextRow
                label="Occasions — grand titre"
                value={t.occasionsTitle}
                onChange={(v) => setText("occasionsTitle", v)}
              />
              <TextRow
                label="Déroulé — petit titre"
                value={t.stepsMarker}
                onChange={(v) => setText("stepsMarker", v)}
              />
              <TextRow
                label="Déroulé — grand titre"
                value={t.stepsTitle}
                onChange={(v) => setText("stepsTitle", v)}
              />
              <TextRow
                label="Fiche — titre"
                value={t.essentialTitle}
                onChange={(v) => setText("essentialTitle", v)}
                hint="ex. « L'essentiel »"
              />
              <TextRow
                label="Fiche — note de bas"
                value={t.essentialFootnote}
                onChange={(v) => setText("essentialFootnote", v)}
              />
            </div>
          </div>
        </Card>

        {/* FORMULES */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-xl text-cream">
              Formules — « L'art de recevoir »
            </h3>
            <Button
              variant="subtle"
              onClick={() =>
                setDraft((d) => ({ ...d, formules: [...d.formules, BLANK_FORMULE] }))
              }
            >
              + Ajouter une formule
            </Button>
          </div>
          <div className="space-y-4">
            {draft.formules.length === 0 && (
              <p className="text-sm text-cream-soft/50">Aucune formule.</p>
            )}
            {draft.formules.map((f, i) => (
              <RowShell
                key={i}
                badge={num(i)}
                removeLabel="Supprimer la formule"
                onRemove={() =>
                  setDraft((d) => ({
                    ...d,
                    formules: d.formules.filter((_, idx) => idx !== i),
                  }))
                }
              >
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
                  <div className="sm:col-span-2">
                    <ImageField
                      value={f.image}
                      onChange={(url) => setFormule(i, { image: url })}
                    />
                  </div>
                </div>
              </RowShell>
            ))}
          </div>
        </Card>

        {/* OCCASIONS */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-xl text-cream">
              Occasions — « On célèbre quoi ? »
            </h3>
            <Button
              variant="subtle"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  occasions: [...d.occasions, BLANK_OCCASION],
                }))
              }
            >
              + Ajouter une occasion
            </Button>
          </div>
          <div className="space-y-4">
            {draft.occasions.length === 0 && (
              <p className="text-sm text-cream-soft/50">Aucune occasion.</p>
            )}
            {draft.occasions.map((o, i) => (
              <RowShell
                key={i}
                badge={num(i)}
                removeLabel="Supprimer l'occasion"
                onRemove={() =>
                  setDraft((d) => ({
                    ...d,
                    occasions: d.occasions.filter((_, idx) => idx !== i),
                  }))
                }
              >
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
                  <div className="sm:col-span-2">
                    <ImageField
                      value={o.image}
                      onChange={(url) => setOccasion(i, { image: url })}
                    />
                  </div>
                </div>
              </RowShell>
            ))}
          </div>
        </Card>

        {/* STEPS */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-xl text-cream">
              Déroulé — « Comment ça se passe »
            </h3>
            <Button
              variant="subtle"
              onClick={() =>
                setDraft((d) => ({ ...d, steps: [...d.steps, BLANK_STEP] }))
              }
            >
              + Ajouter une étape
            </Button>
          </div>
          <p className="mb-4 text-sm text-cream-soft/55">
            Le numéro de chaque étape (01, 02, …) suit automatiquement l'ordre.
          </p>
          <div className="space-y-4">
            {draft.steps.length === 0 && (
              <p className="text-sm text-cream-soft/50">Aucune étape.</p>
            )}
            {draft.steps.map((s, i) => (
              <RowShell
                key={i}
                badge={num(i)}
                removeLabel="Supprimer l'étape"
                onRemove={() =>
                  setDraft((d) => ({
                    ...d,
                    steps: d.steps.filter((_, idx) => idx !== i),
                  }))
                }
              >
                <div className="grid gap-4">
                  <TextRow
                    label="Titre"
                    value={s.title}
                    onChange={(v) => setStep(i, { title: v })}
                  />
                  <AreaRow
                    label="Description"
                    value={s.body}
                    onChange={(v) => setStep(i, { body: v })}
                  />
                </div>
              </RowShell>
            ))}
          </div>
        </Card>

        {/* DETAILS */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-xl text-cream">
              Fiche — « L'essentiel »
            </h3>
            <Button
              variant="subtle"
              onClick={() =>
                setDraft((d) => ({ ...d, details: [...d.details, BLANK_DETAIL] }))
              }
            >
              + Ajouter une ligne
            </Button>
          </div>
          <div className="space-y-3">
            {draft.details.length === 0 && (
              <p className="text-sm text-cream-soft/50">Aucune ligne.</p>
            )}
            {draft.details.map((d, i) => (
              <div
                key={i}
                className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-bg-tertiary/30 p-3 sm:flex-nowrap"
              >
                <div className="min-w-0 flex-1">
                  <TextRow
                    label="Libellé"
                    value={d.label}
                    onChange={(v) => setDetail(i, { label: v })}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <TextRow
                    label="Valeur"
                    value={d.value}
                    onChange={(v) => setDetail(i, { value: v })}
                  />
                </div>
                <IconButton
                  label="Supprimer la ligne"
                  className="mb-1 border-red-400/30 text-red-300 hover:border-red-400/60"
                  onClick={() =>
                    setDraft((dd) => ({
                      ...dd,
                      details: dd.details.filter((_, idx) => idx !== i),
                    }))
                  }
                >
                  {TrashIcon}
                </IconButton>
              </div>
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
