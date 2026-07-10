// Vercel Serverless Function entry point (catch-all) — used when the Vercel
// project's Root Directory is set to `artifacts/chez-florent`.
//
// Mirror of the repo-root `api/index.mjs`: the vercel.json rewrite
// `{ "source": "/api/:path*", "destination": "/api" }` routes every `/api/*`
// request to this single function while preserving the original URL. The
// Express app mounts every route under `/api`, so the original path resolves
// correctly. (A `[...path].mjs` catch-all filename does NOT work: Vercel only
// generated a single-segment route for it → nested paths returned 404.)
//
// This file is plain JavaScript and imports the esbuild bundle produced by
// `pnpm --filter @workspace/api-server build` (see vercel.json buildCommand).
// Importing the bundle instead of the TypeScript source avoids @vercel/node's
// strict nodenext type-checking of the whole api-server source tree.
import app from "../../api-server/dist/app.mjs";

export default app;
