import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListPhotos,
  useUpdatePhoto,
  getListPhotosQueryKey,
} from "@workspace/api-client-react";
import type { SitePhoto } from "@workspace/api-client-react";
import { Button, Card, ErrorText, Field, TextInput } from "./ui";
import { PHOTO_LABELS, uploadImage } from "./lib";

function PhotoRow({ photo }: { photo: SitePhoto }) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState(photo.url);
  const [alt, setAlt] = useState(photo.alt);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<unknown>(null);

  const update = useUpdatePhoto({
    mutation: {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: getListPhotosQueryKey() }),
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

  return (
    <Card>
      <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-md border border-stone-200 bg-stone-100">
            {url ? (
              <img
                src={url}
                alt={alt}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="font-serif text-lg text-stone-900">
            {PHOTO_LABELS[photo.slot] ?? photo.slot}
          </h3>
          <Field label="Texte alternatif" hint="Décrit l'image (accessibilité)">
            <TextInput value={alt} onChange={(e) => setAlt(e.target.value)} />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100">
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
              onClick={() =>
                update.mutate({ slot: photo.slot, data: { url, alt } })
              }
              disabled={update.isPending || uploading || !url}
            >
              {update.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
          <ErrorText error={uploadError ?? update.error} />
        </div>
      </div>
    </Card>
  );
}

export default function PhotosEditor() {
  const { data: photos, isLoading, isError, error } = useListPhotos();

  if (isLoading) return <p className="text-stone-500">Chargement…</p>;
  if (isError) return <ErrorText error={error} />;

  return (
    <div className="space-y-4">
      {(photos ?? []).map((photo) => (
        <PhotoRow key={photo.slot} photo={photo} />
      ))}
    </div>
  );
}
