// Vercel Serverless Function entry point (catch-all).
//
// The vercel.json rewrite `{ "source": "/api/:path*", "destination": "/api" }`
// routes every `/api/*` request to this single `api/index.mjs` function while
// preserving the original URL. The function hands the request to the Express
// app, which mounts every route under `/api`, so the original path resolves
// correctly. (A `[...path].mjs` catch-all filename does NOT work here: Vercel
// only generated a single-segment route `^/api/([^/]+)$` for it, so nested
// paths like /api/auth/me returned 404.)
//
// This file is plain JavaScript and imports the esbuild bundle produced by
// `pnpm --filter @workspace/api-server build` (see vercel.json buildCommand).
// Importing the bundle instead of the TypeScript source avoids @vercel/node's
// strict nodenext type-checking of the whole api-server source tree.
//
// In production (Vercel) the app uses:
//   - DATABASE_URL          → Neon Postgres (use the pooled connection string)
//   - SESSION_SECRET        → signs the auth cookie (required in production)
//   - BLOB_READ_WRITE_TOKEN → photo uploads go to Vercel Blob
// See DEPLOY.md for the full list.
import app from "../artifacts/api-server/dist/app.mjs";

export default app;
