const BRAND = {
  bg: "#00191E",
  bgSoft: "#082830",
  cream: "#ECB989",
  orange: "#DE450F",
  ink: "#1a2b28",
  paper: "#F7F1E8",
};

export type ContactFields = {
  kind: string;
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  supplyType?: string | null;
  subject: string;
  message: string;
};

export const KIND_LABELS: Record<string, string> = {
  question: "Question",
  fournisseur: "Fournisseur",
  groupe: "Demande de groupe",
};

/** Strip CR/LF and control characters so user text can't break email headers. */
function headerSafe(value: string): string {
  return value.replace(/[\r\n\t\u0000-\u001f]+/g, " ").trim();
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function recapRows(fields: ContactFields): string {
  const kindLabel = KIND_LABELS[fields.kind] ?? fields.kind;
  const rows: Array<[string, string]> = [["Type de demande", kindLabel]];
  rows.push(["Nom", fields.name]);
  rows.push(["Courriel", fields.email]);
  if (fields.phone?.trim()) rows.push(["Téléphone", fields.phone.trim()]);
  if (fields.company?.trim()) rows.push(["Entreprise", fields.company.trim()]);
  if (fields.supplyType?.trim())
    rows.push(["Type de produits", fields.supplyType.trim()]);
  if (fields.subject?.trim()) rows.push(["Sujet", fields.subject.trim()]);

  return rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid rgba(0,25,30,0.08);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(0,25,30,0.55);white-space:nowrap;vertical-align:top;">${esc(label)}</td>
          <td style="padding:10px 16px;border-bottom:1px solid rgba(0,25,30,0.08);font-size:14px;color:${BRAND.ink};">${esc(value)}</td>
        </tr>`,
    )
    .join("");
}

function messageBlock(message: string): string {
  const body = message?.trim()
    ? esc(message.trim()).replace(/\n/g, "<br />")
    : "<em>(aucun détail fourni)</em>";
  return `
    <div style="margin-top:20px;">
      <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(0,25,30,0.55);margin-bottom:8px;">Message</div>
      <div style="background:#ffffff;border:1px solid rgba(0,25,30,0.1);border-radius:2px;padding:16px;font-size:14px;line-height:1.6;color:${BRAND.ink};">${body}</div>
    </div>`;
}

function layout(opts: {
  preheader: string;
  headline: string;
  intro: string;
  content: string;
  footerNote: string;
}): string {
  return `<!DOCTYPE html>
<html lang="fr-CA">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Chez Florent</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:Georgia,'Times New Roman',serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${esc(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="padding:36px 32px 28px;text-align:center;">
              <div style="font-size:26px;color:${BRAND.cream};letter-spacing:0.02em;">Chez Florent</div>
              <div style="font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(236,185,137,0.65);margin-top:8px;">Restaurant de quartier — Sorel-Tracy</div>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:${BRAND.paper};border-radius:3px;padding:36px 32px;">
              <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${BRAND.orange};margin-bottom:14px;">&#10038; ${esc(opts.headline)}</div>
              <div style="font-size:15px;line-height:1.65;color:${BRAND.ink};">${opts.intro}</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:#ffffff;border:1px solid rgba(0,25,30,0.1);border-radius:2px;">
                ${opts.content}
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:28px 32px;text-align:center;">
              <div style="font-size:12px;line-height:1.7;color:rgba(236,185,137,0.7);">
                ${opts.footerNote}
              </div>
              <div style="font-size:12px;line-height:1.7;color:rgba(236,185,137,0.7);margin-top:10px;">
                57 Rue du Roi, Sorel-Tracy (QC) &nbsp;·&nbsp; 450&nbsp;743-1448<br />
                <a href="https://chezflorent.ca" style="color:${BRAND.cream};text-decoration:underline;">chezflorent.ca</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Confirmation sent to the person who submitted the form. */
export function userConfirmationEmail(fields: ContactFields): {
  subject: string;
  html: string;
  text: string;
} {
  const kindLabel = KIND_LABELS[fields.kind] ?? fields.kind;
  const firstName = fields.name.trim().split(/\s+/)[0] || fields.name;
  const html = layout({
    preheader: "On a bien reçu votre demande — on vous revient sous 48 h ouvrables.",
    headline: "Demande bien reçue",
    intro: `Bonjour ${esc(firstName)},<br /><br />Merci de nous avoir écrit ! Votre demande (<strong>${esc(kindLabel.toLowerCase())}</strong>) est entre bonnes mains : on vous revient généralement sous <strong>48&nbsp;h ouvrables</strong>. Voici un récapitulatif de ce que vous nous avez envoyé.`,
    content: recapRows(fields) + `<tr><td colspan="2" style="padding:0 16px 16px;">${messageBlock(fields.message)}</td></tr>`,
    footerNote:
      "Ce courriel confirme la réception de votre demande envoyée via chezflorent.ca.<br />Besoin d'ajouter quelque chose ? Répondez simplement à ce courriel.",
  });
  const text = [
    `Bonjour ${firstName},`,
    "",
    `Merci de nous avoir écrit ! Votre demande (${kindLabel.toLowerCase()}) est entre bonnes mains : on vous revient généralement sous 48 h ouvrables.`,
    "",
    "Récapitulatif :",
    `- Type : ${kindLabel}`,
    `- Nom : ${fields.name}`,
    `- Courriel : ${fields.email}`,
    fields.phone?.trim() ? `- Téléphone : ${fields.phone.trim()}` : "",
    fields.company?.trim() ? `- Entreprise : ${fields.company.trim()}` : "",
    fields.supplyType?.trim() ? `- Type de produits : ${fields.supplyType.trim()}` : "",
    fields.subject?.trim() ? `- Sujet : ${fields.subject.trim()}` : "",
    "",
    fields.message || "(aucun détail fourni)",
    "",
    "— Chez Florent · 57 Rue du Roi, Sorel-Tracy · 450 743-1448 · chezflorent.ca",
  ]
    .filter((l) => l !== "")
    .join("\n");
  return {
    subject: "Chez Florent — votre demande est bien reçue",
    html,
    text,
  };
}

/** Recap sent to the restaurant owner. */
export function ownerNotificationEmail(fields: ContactFields): {
  subject: string;
  html: string;
  text: string;
} {
  const kindLabel = KIND_LABELS[fields.kind] ?? fields.kind;
  const subjectDetail = headerSafe(fields.subject?.trim() || fields.name);
  const html = layout({
    preheader: `${kindLabel} de ${fields.name}`,
    headline: "Nouvelle demande sur le site",
    intro: `Une nouvelle demande vient d'arriver via le formulaire du site (<strong>${esc(kindLabel.toLowerCase())}</strong>). Répondez directement à ce courriel pour écrire à ${esc(fields.name)} — la réponse partira à ${esc(fields.email)}.`,
    content: recapRows(fields) + `<tr><td colspan="2" style="padding:0 16px 16px;">${messageBlock(fields.message)}</td></tr>`,
    footerNote:
      "Cette demande est aussi visible dans l'admin du site, section Messages.",
  });
  const text = [
    `Nouvelle demande via chezflorent.ca`,
    "",
    `Type : ${kindLabel}`,
    `Nom : ${fields.name}`,
    `Courriel : ${fields.email}`,
    `Téléphone : ${fields.phone?.trim() || "—"}`,
    fields.company?.trim() ? `Entreprise : ${fields.company.trim()}` : "",
    fields.supplyType?.trim() ? `Type de produits : ${fields.supplyType.trim()}` : "",
    fields.subject?.trim() ? `Sujet : ${fields.subject.trim()}` : "",
    "",
    fields.message || "(aucun détail fourni)",
    "",
    "— Envoyé automatiquement depuis chezflorent.ca (aussi visible dans l'admin, section Messages)",
  ]
    .filter((l) => l !== "")
    .join("\n");
  return {
    subject: `[chezflorent.ca] ${kindLabel} — ${subjectDetail}`,
    html,
    text,
  };
}
