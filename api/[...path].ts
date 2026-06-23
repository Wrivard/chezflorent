// Vercel Serverless Function entry point (catch-all).
//
// The `[...path]` filename makes Vercel route every `/api/*` request to this
// single function automatically (no rewrite needed), preserving the original
// URL. The function hands the request to the Express app, which mounts every
// route under `/api`, so the original path resolves correctly.
//
// In production (Vercel) the app uses:
//   - DATABASE_URL          → Neon Postgres (use the pooled connection string)
//   - SESSION_SECRET        → signs the auth cookie (required in production)
//   - BLOB_READ_WRITE_TOKEN → photo uploads go to Vercel Blob
// See DEPLOY.md for the full list.
import app from "../artifacts/api-server/src/app";

export default app;
