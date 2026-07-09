import { Resend } from "resend";
import { logger } from "./logger";

const KIND_LABELS: Record<string, string> = {
  question: "Question",
  fournisseur: "Fournisseur",
  groupe: "Demande de groupe",
};

/**
 * Fire-and-forget email notification for contact-form submissions
 * (question, fournisseur, groupe).
 *
 * Sends via Resend as soon as a RESEND_API_KEY is configured. Without a key
 * it logs and does nothing (the message is already stored in the database and
 * visible in the admin), so development never crashes or requires the key.
 *
 * Env:
 * - RESEND_API_KEY — Resend API key (required for sending)
 * - RESEND_FROM_EMAIL — verified sender (e.g. bonjour@kua.quebec)
 * - RECIPIENT_EMAIL — recipient of the submissions
 * (Legacy fallbacks: RESEND_FROM, GROUP_NOTIFY_EMAIL.)
 */
export async function notifyContactMessage(fields: {
  kind: string;
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  supplyType?: string | null;
  subject: string;
  message: string;
}): Promise<void> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    logger.info("RESEND_API_KEY not set — message stored, email skipped");
    return;
  }
  const to =
    process.env["RECIPIENT_EMAIL"] ||
    process.env["GROUP_NOTIFY_EMAIL"] ||
    "groupes@chezflorent.ca";
  const rawFrom =
    process.env["RESEND_FROM_EMAIL"] ||
    process.env["RESEND_FROM"] ||
    "onboarding@resend.dev";
  const from = rawFrom.includes("<") ? rawFrom : `Chez Florent <${rawFrom}>`;

  const kindLabel = KIND_LABELS[fields.kind] ?? fields.kind;
  const subject = fields.subject?.trim()
    ? `${kindLabel} — ${fields.subject.trim()}`
    : `${kindLabel} — ${fields.name}`;

  const lines = [
    `Type : ${kindLabel}`,
    `Nom : ${fields.name}`,
    `Courriel : ${fields.email}`,
    `Téléphone : ${fields.phone || "—"}`,
  ];
  if (fields.company?.trim()) lines.push(`Entreprise : ${fields.company.trim()}`);
  if (fields.supplyType?.trim())
    lines.push(`Type de produits : ${fields.supplyType.trim()}`);
  if (fields.subject?.trim()) lines.push(`Sujet : ${fields.subject.trim()}`);
  lines.push(
    "",
    fields.message || "(aucun détail fourni)",
    "",
    "— Envoyé automatiquement depuis chezflorent.ca",
  );

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: fields.email,
      subject: `[chezflorent.ca] ${subject}`,
      text: lines.join("\n"),
    });
    if (error) {
      logger.error({ error }, "Resend API error");
    } else {
      logger.info({ to, kind: fields.kind }, "Contact notification sent");
    }
  } catch (err) {
    logger.error({ err }, "Failed to send contact notification");
  }
}
