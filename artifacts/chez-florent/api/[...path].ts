// Vercel Serverless Function entry point (catch-all) — used when the Vercel
// project's Root Directory is set to `artifacts/chez-florent`.
//
// Mirror of the repo-root `api/[...path].ts`: the `[...path]` filename makes
// Vercel route every `/api/*` request to this single function automatically,
// preserving the original URL. The Express app mounts every route under
// `/api`, so the original path resolves correctly.
import app from "../../api-server/src/app";

export default app;
