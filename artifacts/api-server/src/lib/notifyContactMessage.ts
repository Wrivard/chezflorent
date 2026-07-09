import { Resend } from "resend";
import { logger } from "./logger";
import {
  type ContactFields,
  ownerNotificationEmail,
  userConfirmationEmail,
} from "./emailTemplates";

/**
 * Fire-and-forget email notifications for contact-form submissions
 * (question, fournisseur, groupe). Sends two branded emails per submission:
 * - a recap to the site owner (RECIPIENT_EMAIL), reply-to the submitter
 * - a confirmation with recap to the submitter, reply-to the owner
 *
 * Without RESEND_API_KEY it logs and does nothing (the message is already
 * stored in the database and visible in the admin), so development never
 * crashes or requires the key.
 *
 * Env:
 * - RESEND_API_KEY — Resend API key (required for sending)
 * - RESEND_FROM_EMAIL — verified sender (e.g. bonjour@kua.quebec)
 * - RECIPIENT_EMAIL — recipient of the owner recap
 * (Legacy fallbacks: RESEND_FROM, GROUP_NOTIFY_EMAIL.)
 */
export async function notifyContactMessage(
  fields: ContactFields,
): Promise<void> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    logger.info("RESEND_API_KEY not set — message stored, emails skipped");
    return;
  }
  const ownerTo =
    process.env["RECIPIENT_EMAIL"] ||
    process.env["GROUP_NOTIFY_EMAIL"] ||
    "chezflorent@outlook.com";
  const rawFrom =
    process.env["RESEND_FROM_EMAIL"] ||
    process.env["RESEND_FROM"] ||
    "onboarding@resend.dev";
  const from = rawFrom.includes("<") ? rawFrom : `Chez Florent <${rawFrom}>`;

  const resend = new Resend(apiKey);

  const owner = ownerNotificationEmail(fields);
  try {
    const { error } = await resend.emails.send({
      from,
      to: [ownerTo],
      replyTo: fields.email,
      subject: owner.subject,
      html: owner.html,
      text: owner.text,
    });
    if (error) {
      logger.error({ error }, "Resend API error (owner recap)");
    } else {
      logger.info({ to: ownerTo, kind: fields.kind }, "Owner recap sent");
    }
  } catch (err) {
    logger.error({ err }, "Failed to send owner recap");
  }

  const confirmation = userConfirmationEmail(fields);
  try {
    const { error } = await resend.emails.send({
      from,
      to: [fields.email],
      replyTo: ownerTo,
      subject: confirmation.subject,
      html: confirmation.html,
      text: confirmation.text,
    });
    if (error) {
      logger.error({ error }, "Resend API error (user confirmation)");
    } else {
      logger.info(
        { to: fields.email, kind: fields.kind },
        "User confirmation sent",
      );
    }
  } catch (err) {
    logger.error({ err }, "Failed to send user confirmation");
  }
}
