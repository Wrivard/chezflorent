---
name: SEO prerender via build-time SSR
description: How Chez Florent generates full crawlable per-page HTML from the real React components at build time.
---

# Prerender = build-time SSR of the real components (not hand-written summaries)

`artifacts/chez-florent/scripts/prerender.mjs` no longer hand-writes per-page
static HTML. It imports a `render(routeId)` function from a Vite SSR bundle built
from `src/prerender-entry.tsx`, and injects the resulting full-page HTML into
`<div id="root">` (wrapped in `.seo-prerender`, hidden from JS visitors).

**Why:** the owner wanted Google/crawlers to see every SECTION of every page, not
short summaries. Hand-written summaries also duplicated copy (another sync point,
which this project already has too many of). SSR renders the actual components, so
the crawlable HTML tracks the components with zero extra copy to maintain.

**How it works / how to apply:**
- Build script order matters: `vite build` (client → dist/public) THEN
  `vite build --ssr src/prerender-entry.tsx --outDir dist/ssr` THEN
  `node scripts/prerender.mjs`. dist/ssr is a sibling of dist/public; only
  dist/public is deployed (Vercel outputDirectory), dist/ssr is throwaway.
- `prerender-entry.tsx` mirrors `main.tsx`'s route→component mapping and wraps in
  a QueryClientProvider whose queries are `enabled:false`. `renderToString` never
  runs effects anyway, so no fetch fires; every page renders its `data ?? DEFAULT_*`
  fallback. **Consequence/limit:** the prerendered block shows the baked DEFAULT_*
  copy, NOT live CMS edits. Real JS visitors (and Googlebot, which runs JS) still
  see live content; the static block is only for non-JS crawlers. Accepted trade-off.
- `route.path` equals the SSR routeId for every route, so the loop passes
  `render(route.path)`; home uses `render("home")`.
- `cleanSSR()` strips ALL inline `style="..."` (framer-motion renders opacity:0 /
  clip-path / transform initial states that would hide text from CSS-aware
  crawlers) and forces every `<img>` to `loading="lazy"` (the block is
  display:none for JS visitors, so lazy imgs inside it are never fetched — saves
  bandwidth). Safe because React escapes `"` as `&quot;`, so the regex can't
  over-match.
- SSR-safety was fine because pages guard `window` access behind effects /
  `typeof window`; if a new page adds render-time browser-API access, the SSR
  build will crash — guard it with `typeof window !== "undefined"`.
