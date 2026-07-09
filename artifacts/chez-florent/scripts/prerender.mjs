/**
 * Build-time prerender script.
 *
 * Reads the Vite-built dist/public/index.html and emits one HTML file per
 * public route with:
 *   - Route-specific <title>, <meta name="description">, <link rel="canonical">
 *   - Route-specific Open Graph and Twitter card tags
 *   - Route-specific hreflang alternate links
 *   - Static HTML pre-populated inside <div id="root"> so non-JS crawlers
 *     (GPTBot, ClaudeBot, PerplexityBot, etc.) see real headings and copy.
 *     React's createRoot().render() replaces this content for JS browsers.
 *
 * Also generates:
 *   - dist/public/404.html  — returned for unknown paths (see vercel.json routes)
 *
 * Run:  node scripts/prerender.mjs
 * (called automatically from the "build" npm script after vite build)
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "..", "dist", "public");
const templatePath = join(distDir, "index.html");

const BASE = "https://chezflorent.ca";
const SITE_NAME = "Chez Florent";
const OG_IMAGE = `${BASE}/opengraph.jpg`;

// ---------------------------------------------------------------------------
// Route definitions
// ---------------------------------------------------------------------------

const ROUTES = [
  {
    path: "menu",
    title: "Le menu — Chez Florent",
    description:
      "Découvrez la cuisine de Chez Florent : une ardoise qui change selon les humeurs du chef et les arrivages du marché. Cuisine française et québécoise à Sorel-Tracy.",
    ogTitle: "Le menu — Chez Florent",
    ogDescription:
      "Une ardoise qui change selon les humeurs du chef et les arrivages du marché.",
    ogType: "restaurant.menu",
    staticContent: `
<main style="font-family:Georgia,serif;color:#0e1f1c;background:#f5f0e8;padding:2rem 1.5rem;max-width:860px;margin:0 auto">
  <nav style="margin-bottom:2rem;font-family:Arial,sans-serif;font-size:0.85rem">
    <a href="/" style="color:#d85a2c">Chez Florent</a> &rsaquo; Le menu
  </nav>
  <h1 style="font-size:2.5rem;margin-bottom:0.5rem">Le menu</h1>
  <p style="font-size:1.1rem;margin-bottom:2rem;font-style:italic;color:#555">
    Une ardoise qui change selon les humeurs du chef et les arrivages du marché.
    Cuisine française et québécoise à Sorel-Tracy.
  </p>
  <section>
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">La cuisine</h2>
    <p>
      Chez Florent propose une cuisine de marché : les plats évoluent au rythme
      des saisons et des producteurs locaux. Le chef Tommy Therrien compose des
      assiettes simples, préparées avec une qualité inébranlable, à partir de
      produits sélectionnés auprès de fournisseurs régionaux — Ferme J.N
      Beauchemin, Fromagerie Fuoco, Les Cowboys du BBQ.
    </p>
  </section>
  <section style="margin-top:2rem">
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">Le bar</h2>
    <p>
      Une sélection de bières artisanales québécoises, vins naturels et
      cocktails de saison. Riverbend Brewing Co. en vedette — brassée à
      Sorel-Tracy.
    </p>
  </section>
  <section style="margin-top:2rem">
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">Réservations</h2>
    <p>
      Réservez votre table par téléphone au
      <a href="tel:+14507431448" style="color:#d85a2c">450&nbsp;743-1448</a>.
      57 Rue du Roi, Sorel-Tracy (QC) J3P&nbsp;4M6.
    </p>
  </section>
</main>`,
  },
  {
    path: "a-propos",
    title: "La maison — Chez Florent",
    description:
      "L'histoire de Chez Florent : un restaurant de quartier à Sorel-Tracy fondé par Maxime et Marie-Laurence, en hommage à Florent, bâtisseur de la cantine Nic et Flo dans les années 1970.",
    ogTitle: "La maison — Chez Florent",
    ogDescription:
      "Un restaurant de quartier, une certaine idée du temps qui passe — et des gens qui le font vivre.",
    ogType: "restaurant",
    staticContent: `
<main style="font-family:Georgia,serif;color:#0e1f1c;background:#f5f0e8;padding:2rem 1.5rem;max-width:860px;margin:0 auto">
  <nav style="margin-bottom:2rem;font-family:Arial,sans-serif;font-size:0.85rem">
    <a href="/" style="color:#d85a2c">Chez Florent</a> &rsaquo; La maison
  </nav>
  <h1 style="font-size:2.5rem;margin-bottom:0.5rem">La maison</h1>
  <p style="font-size:1.1rem;font-style:italic;color:#555;margin-bottom:2rem">
    Un restaurant de quartier, une certaine idée du temps qui passe — et des gens qui le font vivre.
  </p>
  <section>
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">Notre histoire</h2>
    <p style="margin-bottom:1rem">
      Florent était le grand-père de Marie-Laurence, copropriétaire de
      l'établissement. En hommage à son parcours entrepreneurial avec la
      cantine Nic et Flo — fondée dans les années 1970 avec sa douce moitié
      Nicole — Maxime et Marie-Laurence ont choisi de dédier ce restaurant à
      cet homme grand, jovial et profondément apprécié.
    </p>
    <p>
      En mai 2025, Chez Florent ouvre ses portes au cœur de Sorel-Tracy,
      animé par le désir de créer un lieu rassembleur mettant de l'avant le
      monde brassicole et viticole québécois, ainsi que les maraîchers locaux.
    </p>
  </section>
  <section style="margin-top:2rem">
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">Le chef — Tommy Therrien</h2>
    <p>
      Tommy Therrien a développé son expertise culinaire dans plusieurs
      établissements reconnus — Distingo, Club Saint-James, Café Monk,
      L'Aurochs Steakhouse. Chez Florent, il compose chaque assiette comme
      une histoire de transmission, de passion et de partage.
    </p>
  </section>
  <section style="margin-top:2rem">
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">Nos producteurs</h2>
    <ul style="margin:0;padding-left:1.25rem">
      <li>Ferme J.N Beauchemin — saucisses &amp; charcuteries</li>
      <li>Fromagerie Fuoco — bufarella et fromages du moment</li>
      <li>Les Cowboys du BBQ — brisket fumé lentement</li>
      <li>Riverbend Brewing Co. — bières brassées à Sorel</li>
    </ul>
  </section>
  <section style="margin-top:2rem">
    <p>
      57 Rue du Roi, Sorel-Tracy (QC) J3P&nbsp;4M6 ·
      <a href="tel:+14507431448" style="color:#d85a2c">450&nbsp;743-1448</a>
    </p>
  </section>
</main>`,
  },
  {
    path: "contact",
    title: "Nous trouver — Chez Florent",
    description:
      "Coordonnées, heures d'ouverture et plan d'accès de Chez Florent. 57 Rue du Roi, Sorel-Tracy. Réservations au 450 743-1448.",
    ogTitle: "Nous trouver — Chez Florent",
    ogDescription:
      "À deux pas du marché, au cœur de Sorel-Tracy. Réservez votre table au 450 743-1448.",
    ogType: "restaurant",
    staticContent: `
<main style="font-family:Georgia,serif;color:#0e1f1c;background:#f5f0e8;padding:2rem 1.5rem;max-width:860px;margin:0 auto">
  <nav style="margin-bottom:2rem;font-family:Arial,sans-serif;font-size:0.85rem">
    <a href="/" style="color:#d85a2c">Chez Florent</a> &rsaquo; Nous trouver
  </nav>
  <h1 style="font-size:2.5rem;margin-bottom:0.5rem">Passez nous voir</h1>
  <p style="font-size:1.1rem;font-style:italic;color:#555;margin-bottom:2rem">
    À deux pas du marché, au cœur de Sorel-Tracy.
  </p>
  <section>
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">Adresse</h2>
    <address style="font-style:normal;margin-bottom:1rem">
      <strong>Chez Florent</strong><br>
      57 Rue du Roi<br>
      Sorel-Tracy, Québec J3P&nbsp;4M6
    </address>
    <p>
      Téléphone :
      <a href="tel:+14507431448" style="color:#d85a2c">450&nbsp;743-1448</a>
    </p>
  </section>
  <section style="margin-top:2rem">
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">Heures d'ouverture</h2>
    <ul style="margin:0;padding-left:1.25rem">
      <li>Mardi – jeudi : 17 h à 22 h</li>
      <li>Vendredi – samedi : 17 h à 23 h</li>
      <li>Dimanche : 17 h à 21 h</li>
    </ul>
  </section>
  <section style="margin-top:2rem">
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">Réservations</h2>
    <p>
      Les réservations se font par téléphone uniquement.
      Appelez-nous au
      <a href="tel:+14507431448" style="color:#d85a2c">450&nbsp;743-1448</a>.
    </p>
  </section>
  <section style="margin-top:2rem">
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">Nous suivre</h2>
    <p>
      <a href="https://www.instagram.com/chezflorent.bistro/" style="color:#d85a2c" rel="noopener noreferrer">Instagram</a>
      ·
      <a href="https://www.facebook.com/chezflorent.bistro/" style="color:#d85a2c" rel="noopener noreferrer">Facebook</a>
    </p>
  </section>
</main>`,
  },
  {
    path: "evenements",
    title: "Les événements — Chez Florent",
    description:
      "Soirées, dégustations et concerts à venir chez Florent à Sorel-Tracy. Consultez le calendrier et réservez votre place au 450 743-1448.",
    ogTitle: "Les événements — Chez Florent",
    ogDescription:
      "Soirées, dégustations et concerts à venir. Réservez votre place au 450 743-1448.",
    ogType: "restaurant",
    staticContent: `
<main style="font-family:Georgia,serif;color:#0e1f1c;background:#f5f0e8;padding:2rem 1.5rem;max-width:860px;margin:0 auto">
  <nav style="margin-bottom:2rem;font-family:Arial,sans-serif;font-size:0.85rem">
    <a href="/" style="color:#d85a2c">Chez Florent</a> &rsaquo; Les événements
  </nav>
  <h1 style="font-size:2.5rem;margin-bottom:0.5rem">Les événements</h1>
  <p style="font-size:1.1rem;font-style:italic;color:#555;margin-bottom:2rem">
    Soirées, dégustations et concerts à venir. Parcourez le calendrier
    et cliquez sur une date pour les détails.
  </p>
  <section>
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">La programmation</h2>
    <p>
      Chez Florent accueille régulièrement des soirées thématiques,
      des dégustations de vins et bières, et des concerts intimistes.
      La programmation est mise à jour au fil des saisons — suivez-nous sur
      <a href="https://www.instagram.com/chezflorent.bistro/" style="color:#d85a2c" rel="noopener noreferrer">Instagram</a>
      pour ne rien manquer.
    </p>
  </section>
  <section style="margin-top:2rem">
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">Réserver une place</h2>
    <p>
      Les réservations pour nos soirées se font par téléphone uniquement.
      Appelez-nous au
      <a href="tel:+14507431448" style="color:#d85a2c">450&nbsp;743-1448</a>.
    </p>
    <p style="margin-top:0.75rem">
      57 Rue du Roi, Sorel-Tracy (QC) J3P&nbsp;4M6.
    </p>
  </section>
</main>`,
  },
  {
    path: "groupes",
    title: "Groupes & privatisation — Chez Florent",
    description:
      "Organisez votre événement de groupe chez Florent : grande tablée, privatisation complète, anniversaires, événements corporatifs. Dès 8 personnes. Sorel-Tracy.",
    ogTitle: "Groupes & privatisation — Chez Florent",
    ogDescription:
      "Un anniversaire, une célébration, ou le restaurant rien qu'à vous. On s'occupe de tout, dès 8 personnes.",
    ogType: "restaurant",
    staticContent: `
<main style="font-family:Georgia,serif;color:#0e1f1c;background:#f5f0e8;padding:2rem 1.5rem;max-width:860px;margin:0 auto">
  <nav style="margin-bottom:2rem;font-family:Arial,sans-serif;font-size:0.85rem">
    <a href="/" style="color:#d85a2c">Chez Florent</a> &rsaquo; Groupes &amp; privatisation
  </nav>
  <h1 style="font-size:2.5rem;margin-bottom:0.5rem">Groupes &amp; privatisation</h1>
  <p style="font-size:1.1rem;font-style:italic;color:#555;margin-bottom:2rem">
    Un party de bureau, un anniversaire, un mariage intime ou une envie de
    privatiser le restaurant au complet — on s'occupe de tout.
  </p>
  <section>
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">Les formules</h2>
    <ul style="margin:0;padding-left:1.25rem">
      <li style="margin-bottom:0.75rem">
        <strong>L'apéro</strong> — Format debout autour du bar, jusqu'à une
        trentaine de personnes. Idéal pour un 5&nbsp;à&nbsp;7 ou un lancement.
      </li>
      <li style="margin-bottom:0.75rem">
        <strong>La grande tablée</strong> — 20 à 35 personnes attablées.
        Un dépôt de 200&nbsp;$ est demandé à la réservation, appliqué à
        la facture finale.
      </li>
      <li>
        <strong>Le restaurant, rien qu'à vous</strong> — Privatisation
        complète du jeudi au samedi. Sans frais dès 60 convives ;
        500&nbsp;$ pour 50, 1&nbsp;000&nbsp;$ pour 40, 1&nbsp;500&nbsp;$ pour 30.
      </li>
    </ul>
  </section>
  <section style="margin-top:2rem">
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">Pour toutes les occasions</h2>
    <ul style="margin:0;padding-left:1.25rem">
      <li>Anniversaires &amp; fêtes de famille</li>
      <li>Événements corporatifs, 5&nbsp;à&nbsp;7, party de bureau</li>
      <li>Mariages, fiançailles, célébrations intimes</li>
    </ul>
  </section>
  <section style="margin-top:2rem">
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">Comment réserver</h2>
    <ol style="margin:0;padding-left:1.25rem">
      <li>Appelez-nous ou écrivez-nous pour discuter de la date et du groupe.</li>
      <li>Le chef bâtit le menu selon votre occasion et votre budget.</li>
      <li>Le jour venu, vous n'avez qu'à réunir vos gens.</li>
    </ol>
    <p style="margin-top:1rem">
      Téléphone : <a href="tel:+14507431448" style="color:#d85a2c">450&nbsp;743-1448</a><br>
      Courriel : <a href="mailto:groupes@chezflorent.ca" style="color:#d85a2c">groupes@chezflorent.ca</a><br>
      57 Rue du Roi, Sorel-Tracy (QC) J3P&nbsp;4M6
    </p>
  </section>
</main>`,
  },
  {
    path: "confidentialite",
    title: "Politique de confidentialité — Chez Florent",
    description:
      "Politique de confidentialité de Chez Florent, conformément à la Loi 25 du Québec. Comment nous recueillons, utilisons et protégeons vos renseignements personnels.",
    ogTitle: "Politique de confidentialité — Chez Florent",
    ogDescription:
      "Comment Chez Florent recueille, utilise et protège vos renseignements personnels. Conforme à la Loi 25 du Québec.",
    ogType: "website",
    staticContent: `
<main style="font-family:Georgia,serif;color:#0e1f1c;background:#f5f0e8;padding:2rem 1.5rem;max-width:860px;margin:0 auto">
  <nav style="margin-bottom:2rem;font-family:Arial,sans-serif;font-size:0.85rem">
    <a href="/" style="color:#d85a2c">Chez Florent</a> &rsaquo; Politique de confidentialité
  </nav>
  <h1 style="font-size:2.5rem;margin-bottom:0.5rem">Politique de confidentialité</h1>
  <p style="font-size:1.1rem;font-style:italic;color:#555;margin-bottom:1rem">
    Conformément à la Loi 25 du Québec (Loi modernisant des dispositions législatives
    en matière de protection des renseignements personnels).
  </p>
  <p style="font-size:0.85rem;color:#888;margin-bottom:2rem">Dernière mise à jour : 30 juin 2026</p>
  <section>
    <h2 style="font-size:1.3rem;margin-bottom:0.5rem">1. Responsable de la protection des renseignements personnels</h2>
    <p>
      Chez Florent a désigné un responsable de la protection des renseignements personnels.
      Pour toute question : 57 Rue du Roi, Sorel-Tracy (QC) J3P&nbsp;4M6 — 450&nbsp;743-1448.
    </p>
  </section>
  <section style="margin-top:1.5rem">
    <h2 style="font-size:1.3rem;margin-bottom:0.5rem">2. Renseignements recueillis</h2>
    <p>
      Nous ne recueillons que les renseignements nécessaires : votre nom, numéro
      de téléphone, date et heure de réservation, nombre de personnes, et toute
      note ou demande particulière.
    </p>
  </section>
  <section style="margin-top:1.5rem">
    <h2 style="font-size:1.3rem;margin-bottom:0.5rem">3. Fins de la collecte</h2>
    <p>
      Vos renseignements sont utilisés uniquement pour confirmer et gérer votre
      réservation, communiquer avec vous, répondre à vos questions, et respecter
      nos obligations légales.
    </p>
  </section>
  <section style="margin-top:1.5rem">
    <h2 style="font-size:1.3rem;margin-bottom:0.5rem">9. Vos droits</h2>
    <p>
      Conformément à la Loi 25, vous pouvez accéder à vos renseignements, en
      demander la rectification, retirer votre consentement, ou porter plainte
      auprès de la Commission d'accès à l'information du Québec (cai.gouv.qc.ca).
    </p>
  </section>
</main>`,
  },
];

// Static content for the home page (written into index.html's #root)
const HOME_STATIC_CONTENT = `
<main style="font-family:Georgia,serif;color:#0e1f1c;background:#f5f0e8;padding:2rem 1.5rem;max-width:860px;margin:0 auto">
  <h1 style="font-size:2.5rem;margin-bottom:0.5rem">Chez Florent — Restaurant à Sorel-Tracy</h1>
  <p style="font-size:1.1rem;font-style:italic;color:#555;margin-bottom:2rem">
    Un restaurant de quartier, une certaine idée du temps qui passe.
    L'ardoise change selon les humeurs du chef et les arrivages du marché.
  </p>
  <section>
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">La cuisine</h2>
    <p>
      Cuisine française et québécoise, produits locaux, bières artisanales et vins
      naturels. Chef Tommy Therrien, 57 Rue du Roi, Sorel-Tracy.
    </p>
  </section>
  <nav style="margin-top:2rem">
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">Explorer</h2>
    <ul style="list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:1rem">
      <li><a href="/menu" style="color:#d85a2c">Le menu</a></li>
      <li><a href="/a-propos" style="color:#d85a2c">La maison</a></li>
      <li><a href="/contact" style="color:#d85a2c">Nous trouver</a></li>
      <li><a href="/evenements" style="color:#d85a2c">Les événements</a></li>
      <li><a href="/groupes" style="color:#d85a2c">Groupes &amp; privatisation</a></li>
    </ul>
  </nav>
  <section style="margin-top:2rem">
    <h2 style="font-size:1.4rem;margin-bottom:0.75rem">Réservations</h2>
    <p>
      Par téléphone au <a href="tel:+14507431448" style="color:#d85a2c">450&nbsp;743-1448</a>.
      57 Rue du Roi, Sorel-Tracy (QC) J3P&nbsp;4M6.
    </p>
  </section>
</main>`;

// ---------------------------------------------------------------------------
// 404 page
// ---------------------------------------------------------------------------

const NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="fr-CA">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page introuvable — Chez Florent</title>
  <meta name="description" content="La page que vous cherchez n'existe pas. Revenez à l'accueil de Chez Florent, restaurant à Sorel-Tracy." />
  <meta name="robots" content="noindex" />
  <link rel="canonical" href="${BASE}/" />
  <style>
    body { font-family: Georgia, serif; background: #0e1f1c; color: #f5f0e8;
           display: flex; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; padding: 2rem; box-sizing: border-box; }
    .wrap { max-width: 480px; text-align: center; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    p  { color: rgba(245,240,232,0.7); line-height: 1.7; }
    a  { color: #d85a2c; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="wrap">
    <p style="font-size:4rem;margin:0">404</p>
    <h1>Page introuvable</h1>
    <p>
      Cette page n'existe pas ou a été déplacée.
    </p>
    <p style="margin-top:1.5rem">
      <a href="/">Retour à l'accueil</a>
    </p>
  </div>
</body>
</html>`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Replace a single-line self-closing or paired tag attribute in the HTML head.
 * Works on <meta>, <link>, and <title> tags.
 */
function replaceMeta(html, selector, replacement) {
  const rx = new RegExp(
    selector
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace("ATTR_CONTENT", '[^>]*'),
    "i"
  );
  return html.replace(rx, replacement);
}

function setTitle(html, title) {
  return html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
}

function setMetaName(html, name, content) {
  const rx = new RegExp(`<meta\\s+name="${name}"[^>]*>`, "i");
  return html.replace(rx, `<meta name="${name}" content="${escapeHtml(content)}" />`);
}

function setMetaProperty(html, property, content) {
  const rx = new RegExp(`<meta\\s+property="${property.replace(/\./g, "\\.")}"[^>]*>`, "i");
  return html.replace(rx, `<meta property="${property}" content="${escapeHtml(content)}" />`);
}

function setLinkCanonical(html, href) {
  return html.replace(
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${href}" />`
  );
}

function setHreflang(html, frHref, defaultHref) {
  return html
    .replace(
      /<link\s+rel="alternate"\s+hreflang="fr-ca"[^>]*>/i,
      `<link rel="alternate" hreflang="fr-ca" href="${frHref}" />`
    )
    .replace(
      /<link\s+rel="alternate"\s+hreflang="x-default"[^>]*>/i,
      `<link rel="alternate" hreflang="x-default" href="${defaultHref}" />`
    );
}

function setStaticContent(html, staticHtml) {
  return html.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${staticHtml}\n</div>`
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let template;
try {
  template = readFileSync(templatePath, "utf-8");
} catch (e) {
  console.error(`[prerender] ERROR: Could not read ${templatePath}`);
  console.error("  Run 'vite build' before running this script.");
  process.exit(1);
}

// Patch the home page (index.html itself) with static content
const patchedHome = setStaticContent(template, HOME_STATIC_CONTENT);
writeFileSync(templatePath, patchedHome, "utf-8");
console.log("[prerender] Patched dist/public/index.html (home static content)");

// Generate per-route HTML files
for (const route of ROUTES) {
  const url = `${BASE}/${route.path}/`;
  let html = template;

  html = setTitle(html, route.title);
  html = setMetaName(html, "description", route.description);
  html = setLinkCanonical(html, url);
  html = setHreflang(html, url, url);
  html = setMetaProperty(html, "og:type", route.ogType);
  html = setMetaProperty(html, "og:title", route.ogTitle);
  html = setMetaProperty(html, "og:description", route.ogDescription);
  html = setMetaProperty(html, "og:url", url);
  html = setMetaProperty(html, "og:image", OG_IMAGE);
  html = setMetaName(html, "twitter:title", route.ogTitle);
  html = setMetaName(html, "twitter:description", route.ogDescription);
  html = setStaticContent(html, route.staticContent);

  const dir = join(distDir, route.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf-8");
  console.log(`[prerender] /${route.path}/index.html — "${route.title}"`);
}

// Write 404 page
writeFileSync(join(distDir, "404.html"), NOT_FOUND_HTML, "utf-8");
console.log("[prerender] 404.html");

console.log(`[prerender] Done. ${ROUTES.length + 1} routes + 404 page.`);
