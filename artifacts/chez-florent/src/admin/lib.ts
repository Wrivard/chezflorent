export const DAY_NAMES = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

// Calendar starts on Monday (Québec convention).
export const WEEKDAY_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export const PHOTO_LABELS: Record<string, string> = {
  hero: "Image d'en-tête (haut de page)",
  about1: "Section « À propos » — photo 1",
  about2: "Section « À propos » — photo 2",
  about3: "Section « À propos » — photo 3",
  about4: "Section « À propos » — photo 4",
  about5: "Section « À propos » — photo 5",
  about6: "Section « À propos » — photo 6",
  about8: "Section « À propos » — photo 8",
  press: "Critique de presse — photo",
  voice1: "Témoignage client — photo 1",
  voice2: "Témoignage client — photo 2",
  voice3: "Témoignage client — photo 3",
  facade: "Devanture (section contact)",
};

export interface PhotoSlotDef {
  slot: string;
  label: string;
  ratio: string;
}

export interface PhotoGroup {
  title: string;
  description: string;
  slots: PhotoSlotDef[];
}

// Every photographic image on the public site, grouped by the section where it
// appears so the client can find and change any of them.
export const PHOTO_GROUPS: PhotoGroup[] = [
  {
    title: "En-tête",
    description:
      "La grande image d'arrière-plan tout en haut de la page d'accueil.",
    slots: [{ slot: "hero", label: "Image d'en-tête", ratio: "16/9" }],
  },
  {
    title: "À propos",
    description: "Les huit photos superposées de la section « La maison ».",
    slots: [
      { slot: "about1", label: "À propos — photo 1", ratio: "4/3" },
      { slot: "about2", label: "À propos — photo 2", ratio: "3/4" },
      { slot: "about3", label: "À propos — photo 3", ratio: "5/4" },
      { slot: "about4", label: "À propos — photo 4", ratio: "4/3" },
      { slot: "about5", label: "À propos — photo 5", ratio: "3/4" },
      { slot: "about6", label: "À propos — photo 6", ratio: "4/3" },
      { slot: "about8", label: "À propos — photo 8", ratio: "3/4" },
    ],
  },
  {
    title: "Critique de presse",
    description: "La photo qui accompagne la citation de presse.",
    slots: [{ slot: "press", label: "Photo de la critique", ratio: "5/4" }],
  },
  {
    title: "Témoignages clients",
    description: "Les trois photos qui illustrent les avis des clients.",
    slots: [
      { slot: "voice1", label: "Témoignage — photo 1", ratio: "4/5" },
      { slot: "voice2", label: "Témoignage — photo 2", ratio: "4/5" },
      { slot: "voice3", label: "Témoignage — photo 3", ratio: "4/5" },
    ],
  },
  {
    title: "Devanture",
    description: "La photo de la façade affichée dans la section contact.",
    slots: [{ slot: "facade", label: "Devanture du restaurant", ratio: "4/5" }],
  },
  {
    title: "Page Groupes — Formules",
    description:
      "Les photos des formules de la page « Groupes & privatisation ».",
    slots: [
      { slot: "grp-formule-1", label: "Formule 1 — photo", ratio: "4/3" },
      { slot: "grp-formule-2", label: "Formule 2 — photo", ratio: "4/3" },
      { slot: "grp-formule-3", label: "Formule 3 — photo", ratio: "4/3" },
    ],
  },
  {
    title: "Page Groupes — Occasions",
    description:
      "Les photos des occasions de la page « Groupes & privatisation ».",
    slots: [
      { slot: "grp-occasion-1", label: "Occasion 1 — photo", ratio: "4/5" },
      { slot: "grp-occasion-2", label: "Occasion 2 — photo", ratio: "4/5" },
      { slot: "grp-occasion-3", label: "Occasion 3 — photo", ratio: "4/5" },
    ],
  },
  {
    title: "Page À propos",
    description:
      "Les photos de la page « À propos » : en-tête, histoire et chef.",
    slots: [
      { slot: "apropos-hero", label: "En-tête (image de fond)", ratio: "16/9" },
      { slot: "apropos-1", label: "Histoire — photo 1 (grande)", ratio: "4/3" },
      { slot: "apropos-2", label: "Histoire — photo 2 (portrait)", ratio: "3/4" },
      { slot: "apropos-3", label: "Histoire — photo 3 (portrait)", ratio: "3/4" },
      { slot: "apropos-chef", label: "Photo du chef (portrait)", ratio: "3/4" },
    ],
  },
  {
    title: "Galerie « Un soir chez Florent »",
    description:
      "Les quinze photos du carrousel d'ambiance sur la page d'accueil.",
    slots: Array.from({ length: 15 }, (_, i) => ({
      slot: `gallery${i + 1}`,
      label: `Galerie — photo ${i + 1}`,
      ratio: "3/4",
    })),
  },
];

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
