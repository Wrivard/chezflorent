// Vercel Serverless Function entry point.
//
// Vercel runs every file under the top-level `api/` directory as a serverless
// function. `vercel.json` rewrites all `/api/*` requests to this single
// function, which simply hands the request to the Express app. The Express app
// itself mounts every route under `/api`, so the original URL is preserved.
//
// In production (Vercel) the app uses:
//   - DATABASE_URL          → Neon Postgres (use the pooled connection string)
//   - SESSION_SECRET        → signs the auth cookie
//   - BLOB_READ_WRITE_TOKEN → photo uploads go to Vercel Blob
// See DEPLOY.md for the full list.
import app from "../artifacts/api-server/src/app";

export default app;
