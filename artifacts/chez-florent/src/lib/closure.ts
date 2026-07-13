// Les « fermetures du resto » sont des événements ordinaires dont l'étiquette
// (tag) vaut cette valeur réservée. Aucune colonne dédiée en base de données :
// l'admin et le site public partagent cette constante pour reconnaître une
// fermeture et l'afficher différemment.
export const CLOSURE_TAG = "__fermeture__";

export function isClosureTag(tag: string | null | undefined): boolean {
  return tag === CLOSURE_TAG;
}
