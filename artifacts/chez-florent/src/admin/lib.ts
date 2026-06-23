export const DAY_NAMES = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

export const PHOTO_LABELS: Record<string, string> = {
  hero: "Image d'en-tête (haut de page)",
  about1: "Section « À propos » — photo 1",
  about2: "Section « À propos » — photo 2",
  about3: "Section « À propos » — photo 3",
};

/**
 * Upload an image to the API. Returns the public URL of the stored file.
 * This endpoint is multipart/form-data and is not part of the OpenAPI client,
 * so it is called directly. Cookies are sent automatically (same-origin).
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    credentials: "same-origin",
  });
  if (!res.ok) {
    let message = "Échec du téléversement.";
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}
