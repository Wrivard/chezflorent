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
// SSR bundle built by `vite build --ssr src/prerender-entry.tsx` (runs before
// this script in the "build" npm script). render(routeId) returns the FULL HTML
// of a page — every section — straight from the real React components, so there
// is no second hand-maintained copy of the page copy to keep in sync.
import { render } from "../dist/ssr/prerender-entry.js";

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
  },
];


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

// The static SEO content must stay in the DOM for non-JS crawlers, but must
// never flash on screen for real visitors. An inline script adds a `js` class
// to <html> as soon as the parser reaches it (before the body is painted),
// and a style rule hides the prerendered block whenever that class is present.
const HIDE_PRERENDER_HEAD = `<script>document.documentElement.classList.add("js")</script><style>html.js .seo-prerender{display:none}</style>`;

// The React components use framer-motion, whose initial states render as inline
// styles like `opacity:0` / `clip-path:inset(...)` / `transform:...`. Those would
// hide text from CSS-aware crawlers. The prerendered block exists purely for
// crawlers to read text (JS visitors never see it), so we strip ALL inline style
// attributes from the SSR output — leaving headings, copy, links and images.
// We also force every <img> to loading="lazy": the block is display:none for JS
// visitors, and browsers never fetch lazy images inside a hidden subtree, so we
// avoid downloading images no real visitor will ever see.
function cleanSSR(html) {
  return html
    .replace(/\s+style="[^"]*"/g, "")
    .replace(/\s+loading="[^"]*"/g, "")
    .replace(/<img\b/g, '<img loading="lazy"');
}

function setStaticContent(html, staticHtml) {
  return html
    .replace(
      /<div id="root"><\/div>/,
      `<div id="root"><div class="seo-prerender">${staticHtml}\n</div></div>`
    )
    .replace(/<\/head>/i, `${HIDE_PRERENDER_HEAD}\n</head>`);
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
const patchedHome = setStaticContent(template, cleanSSR(render("home")));
writeFileSync(templatePath, patchedHome, "utf-8");
console.log("[prerender] Patched dist/public/index.html (home static content)");

// Generate per-route HTML files
for (const route of ROUTES) {
  // No trailing slash: must match sitemap.xml <loc> entries and internal links.
  const url = `${BASE}/${route.path}`;
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
  html = setStaticContent(html, cleanSSR(render(route.path)));

  const dir = join(distDir, route.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf-8");
  console.log(`[prerender] /${route.path}/index.html — "${route.title}"`);
}

// Write 404 page
writeFileSync(join(distDir, "404.html"), NOT_FOUND_HTML, "utf-8");
console.log("[prerender] 404.html");

console.log(`[prerender] Done. ${ROUTES.length + 1} routes + 404 page.`);
