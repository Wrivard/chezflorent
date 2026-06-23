import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListPhotos,
  useUpdatePhoto,
  getListPhotosQueryKey,
} from "@workspace/api-client-react";
import type { SitePhoto } from "@workspace/api-client-react";
import { Button, Card, ErrorText, Field, SectionHeading, TextInput } from "./ui";
import { PHOTO_GROUPS, type PhotoSlotDef, uploadImage } from "./lib";

function PhotoCard({
  def,
  photo,
}: {
  def: PhotoSlotDef;
  photo: SitePhoto | undefined;
}) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState(photo?.url ?? "");
  const [alt, setAlt] = useState(photo?.alt ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<unknown>(null);
  const [saved, setSaved] = useState(false);

  const update = useUpdatePhoto({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPhotosQueryKey() });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      },
    },
  });

  async function onFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const newUrl = await uploadImage(file);
      setUrl(newUrl);
    } catch (err) {
      setUploadError(err);
    } finally {
      setUploading(false);
    }
  }

  const missing = !photo;

  return (
    <Card className="flex flex-col">
      <div
        className="mb-3 w-full overflow-hidden rounded-lg border border-border bg-bg-tertiary"
        style={{ aspectRatio: def.ratio }}
      >
        {url ? (
          <img src={url} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-cream-soft/40">
            Aucune image
          </div>
        )}
      </div>
      <h4 className="font-serif text-base text-cream">{def.label}</h4>
      <div className="mt-3 space-y-3">
        <Field label="Texte alternatif" hint="Décrit l'image (accessibilité)">
          <TextInput value={alt} onChange={(e) => setAlt(e.target.value)} />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border-strong px-3 py-2 text-sm font-medium text-cream-soft transition-colors hover:text-cream hover:border-cream-soft/40">
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
          <Button
            onClick={() => update.mutate({ slot: def.slot, data: { url, alt } })}
            disabled={update.isPending || uploading || !url || missing}
          >
            {update.isPending ? "…" : saved ? "Enregistré ✓" : "Enregistrer"}
          </Button>
        </div>
        {missing && (
          <p className="text-xs text-amber-300/80">
            Cet emplacement n'est pas encore initialisé dans la base de données.
          </p>
        )}
        <ErrorText error={uploadError ?? update.error} />
      </div>
    </Card>
  );
}

export default function PhotosEditor() {
  const { data: photos, isLoading, isError, error } = useListPhotos();

  if (isLoading) return <p className="text-cream-soft/60">Chargement…</p>;
  if (isError) return <ErrorText error={error} />;

  const bySlot = new Map((photos ?? []).map((p) => [p.slot, p]));

  return (
    <div>
      <SectionHeading
        eyebrow="Galerie"
        title="Photos du site"
        description="Toutes les photos du site, regroupées par section. Changez n'importe laquelle en téléversant une nouvelle image."
      />
      <div className="space-y-10">
        {PHOTO_GROUPS.map((group) => (
          <section key={group.title}>
            <div className="mb-4">
              <h3 className="font-serif text-lg text-cream">{group.title}</h3>
              <p className="text-sm text-cream-soft/55">{group.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.slots.map((def) => (
                <PhotoCard
                  key={def.slot}
                  def={def}
                  photo={bySlot.get(def.slot)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
