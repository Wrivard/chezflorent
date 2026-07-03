import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetAboutContent,
  useUpdateAboutContent,
  getGetAboutContentQueryKey,
} from "@workspace/api-client-react";
import type {
  AboutContent,
  AboutVoice,
  AboutSupplier,
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
  label,
  value,
  onChange,
}: {
  label: string;
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
        {label}
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

const BLANK_VOICE: AboutVoice = { quote: "", name: "", role: "" };
const BLANK_SUPPLIER: AboutSupplier = { name: "", note: "" };

function num(i: number): string {
  return String(i + 1).padStart(2, "0");
}

function EditorInner({ initial }: { initial: AboutContent }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<AboutContent>(initial);
  const [baseline, setBaseline] = useState<AboutContent>(initial);
  const [saved, setSaved] = useState(false);

  const update = useUpdateAboutContent({
    mutation: {
      onSuccess: (data) => {
        setBaseline(data);
        setDraft(data);
        queryClient.invalidateQueries({
          queryKey: getGetAboutContentQueryKey(),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      },
    },
  });

  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);

  const setText = (key: keyof AboutContent["texts"], v: string) =>
    setDraft((d) => ({ ...d, texts: { ...d.texts, [key]: v } }));
  const setImage = (key: keyof AboutContent["images"], v: string) =>
    setDraft((d) => ({ ...d, images: { ...d.images, [key]: v } }));
  const setVoice = (i: number, patch: Partial<AboutVoice>) =>
    setDraft((d) => ({
      ...d,
      voices: d.voices.map((v, idx) => (idx === i ? { ...v, ...patch } : v)),
    }));
  const setSupplier = (i: number, patch: Partial<AboutSupplier>) =>
    setDraft((d) => ({
      ...d,
      suppliers: d.suppliers.map((s, idx) =>
        idx === i ? { ...s, ...patch } : s,
      ),
    }));

  const t = draft.texts;

  return (
    <div>
      <SectionHeading
        eyebrow="Page À propos"
        title="La maison"
        description="Modifiez les textes, les images, les voix de la maison et la liste des producteurs de la page « À propos »."
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
                hint="ex. « 02 — La maison »"
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
              Notre histoire
            </p>
            <div className="grid gap-4">
              <AreaRow
                label="Grande citation / question"
                value={t.quote}
                onChange={(v) => setText("quote", v)}
                hint="S'affiche en très grand. ex. « Quand nous allons Chez Florent, chez qui allons-nous ? »"
              />
              <AreaRow
                label="Réponse (paragraphes)"
                value={t.storyP1}
                onChange={(v) => setText("storyP1", v)}
                hint="Séparez les paragraphes par une ligne vide."
              />
              <TextRow
                label="Deuxième question"
                value={t.storyQuestion2 ?? ""}
                onChange={(v) => setText("storyQuestion2", v)}
                hint="ex. « D'où vient l'idée d'ouvrir le restaurant ? »"
              />
              <AreaRow
                label="Réponse à la deuxième question (paragraphes)"
                value={t.storyP2}
                onChange={(v) => setText("storyP2", v)}
                hint="Séparez les paragraphes par une ligne vide."
              />
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-orange/80">
              Titres des sections
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextRow
                label="Voix — petit titre"
                value={t.voicesMarker}
                onChange={(v) => setText("voicesMarker", v)}
              />
              <TextRow
                label="Producteurs — petit titre"
                value={t.suppliersMarker}
                onChange={(v) => setText("suppliersMarker", v)}
              />
              <div className="sm:col-span-2">
                <AreaRow
                  label="Note de clôture"
                  value={t.closingNote}
                  onChange={(v) => setText("closingNote", v)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* IMAGES */}
        <Card>
          <h3 className="mb-4 font-serif text-xl text-cream">Images</h3>
          <div className="grid gap-5 sm:grid-cols-3">
            <ImageField
              label="Image de fond (héro)"
              value={draft.images.hero}
              onChange={(url) => setImage("hero", url)}
            />
            <ImageField
              label="Photo 1 (grande)"
              value={draft.images.story1}
              onChange={(url) => setImage("story1", url)}
            />
            <ImageField
              label="Photo 2 (portrait)"
              value={draft.images.story2}
              onChange={(url) => setImage("story2", url)}
            />
          </div>
        </Card>

        {/* VOICES */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-xl text-cream">
              Voix — « Les voix de la maison »
            </h3>
            <Button
              variant="subtle"
              onClick={() =>
                setDraft((d) => ({ ...d, voices: [...d.voices, BLANK_VOICE] }))
              }
            >
              + Ajouter une voix
            </Button>
          </div>
          <div className="space-y-4">
            {draft.voices.length === 0 && (
              <p className="text-sm text-cream-soft/50">Aucune voix.</p>
            )}
            {draft.voices.map((v, i) => (
              <RowShell
                key={i}
                badge={num(i)}
                removeLabel="Supprimer la voix"
                onRemove={() =>
                  setDraft((d) => ({
                    ...d,
                    voices: d.voices.filter((_, idx) => idx !== i),
                  }))
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextRow
                    label="Nom"
                    value={v.name}
                    onChange={(val) => setVoice(i, { name: val })}
                  />
                  <TextRow
                    label="Rôle"
                    value={v.role}
                    onChange={(val) => setVoice(i, { role: val })}
                    hint="ex. « Propriétaire »"
                  />
                  <div className="sm:col-span-2">
                    <AreaRow
                      label="Citation"
                      value={v.quote}
                      onChange={(val) => setVoice(i, { quote: val })}
                    />
                  </div>
                </div>
              </RowShell>
            ))}
          </div>
        </Card>

        {/* SUPPLIERS */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-xl text-cream">
              Producteurs — « Nos producteurs »
            </h3>
            <Button
              variant="subtle"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  suppliers: [...d.suppliers, BLANK_SUPPLIER],
                }))
              }
            >
              + Ajouter un producteur
            </Button>
          </div>
          <p className="mb-4 text-sm text-cream-soft/55">
            Le numéro de chaque producteur (01, 02, …) suit automatiquement
            l'ordre.
          </p>
          <div className="space-y-4">
            {draft.suppliers.length === 0 && (
              <p className="text-sm text-cream-soft/50">Aucun producteur.</p>
            )}
            {draft.suppliers.map((s, i) => (
              <RowShell
                key={i}
                badge={num(i)}
                removeLabel="Supprimer le producteur"
                onRemove={() =>
                  setDraft((d) => ({
                    ...d,
                    suppliers: d.suppliers.filter((_, idx) => idx !== i),
                  }))
                }
              >
                <div className="grid gap-4">
                  <TextRow
                    label="Nom"
                    value={s.name}
                    onChange={(val) => setSupplier(i, { name: val })}
                  />
                  <AreaRow
                    label="Note"
                    value={s.note}
                    onChange={(val) => setSupplier(i, { note: val })}
                  />
                </div>
              </RowShell>
            ))}
          </div>
        </Card>
      </div>

      <AboutPreview />
    </div>
  );
}

function AboutPreview() {
  const [nonce, setNonce] = useState(0);
  const src = `${import.meta.env.BASE_URL}a-propos`;
  return (
    <div className="mt-12 border-t border-border pt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-orange">
            <span aria-hidden="true">✶ </span>Aperçu en direct
          </div>
          <h3 className="font-serif text-lg text-cream">La page « À propos »</h3>
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
          title="Page À propos"
          loading="lazy"
          className="w-full border-0"
          style={{ height: 720 }}
        />
      </div>
    </div>
  );
}

export default function AboutContentEditor() {
  const { data, isLoading, isError, error } = useGetAboutContent();

  if (isLoading) return <p className="text-cream-soft/60">Chargement…</p>;
  if (isError) return <ErrorText error={error} />;
  if (!data) return <ErrorText error={new Error("Contenu introuvable.")} />;

  return <EditorInner initial={data} />;
}
