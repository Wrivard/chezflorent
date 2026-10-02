export const EVENT_RESERVATIONS = {
  quiz: {
    url: "https://docs.google.com/forms/d/e/1FAIpQLSfRMdy0X7i5rPHZxGY3zBeFgmL6CYWqT-ZpxTz0P9vTCzkSDg/viewform",
    label: "Réserver pour le quiz",
  },
  hitster: {
    url: "https://docs.google.com/forms/d/e/1FAIpQLSd7QevS68znnGXnA9_3nfo1PV928HBQGvxn4vAFEDjqBxhVxA/viewform",
    label: "Réserver pour Hitster",
  },
} as const;

type ReservationEvent = {
  title: string;
  closed?: boolean;
  soldOut?: boolean;
};

/** Titles only: tags/descriptions may mention a different activity.
 * Unicode word boundaries avoid matching quizmaster, Quizé or Hitster2000.
 * Ambiguous titles deliberately have no automatic form.
 */
export function getEventReservation(event: ReservationEvent) {
  if (event.closed || event.soldOut) return null;
  const title = event.title.normalize("NFKC");
  const quiz = /(?<![\p{L}\p{M}\p{N}_])quiz(?![\p{L}\p{M}\p{N}_])/iu.test(title);
  const hitster = /(?<![\p{L}\p{M}\p{N}_])hitster(?![\p{L}\p{M}\p{N}_])/iu.test(title);
  if (quiz === hitster) return null;
  return quiz ? EVENT_RESERVATIONS.quiz : EVENT_RESERVATIONS.hitster;
}