import { logger } from "./logger";

/**
 * Fire-and-forget email notification for group reservation requests.
 *
 * Ready for Resend: as soon as a RESEND_API_KEY secret is configured, each new
 * request is emailed to the restaurant. Without a key it logs and does nothing
 * (the request is already stored in the database and visible in the admin).
 *
 * Optional env:
 * - GROUP_NOTIFY_EMAIL — recipient (default groupes@chezflorent.ca)
 * - RESEND_FROM — verified sender (default onboarding@resend.dev, Resend's
 *   sandbox sender, which only delivers to the account owner's address until
 *   a domain is verified).
 */
export async function notifyGroupRequest(fields: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<void> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    logger.info("RESEND_API_KEY not set — group request stored, email skipped");
    return;
  }
  const to = process.env["GROUP_NOTIFY_EMAIL"] || "groupes@chezflorent.ca";
  const from =
    process.env["RESEND_FROM"] || "Chez Florent <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: fields.email,
        subject: `Nouvelle demande de groupe — ${fields.subject}`,
        text: [
          `Nom : ${fields.name}`,
          `Courriel : ${fields.email}`,
          `Téléphone : ${fields.phone || "—"}`,
          `Demande : ${fields.subject}`,
          "",
          fields.message || "(aucun détail fourni)",
          "",
          "— Envoyé automatiquement depuis chezflorent.ca",
        ].join("\n"),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      logger.error({ status: res.status, body }, "Resend API error");
    } else {
      logger.info({ to }, "Group request notification sent");
    }
  } catch (err) {
    logger.error({ err }, "Failed to send group request notification");
  }
}
