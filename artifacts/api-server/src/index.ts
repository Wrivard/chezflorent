import app from "./app";
import { logger } from "./lib/logger";
import { ensureAdminSeed } from "./lib/ensureAdmin";
import { importContentSnapshot } from "./lib/importSnapshot";
import { ensureGalleryPhotos } from "./lib/ensureGalleryPhotos";
import { ensureArdoiseMenu } from "./lib/ensureArdoiseMenu";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Make sure the configured admin account exists in whatever database this
  // instance is connected to (production has its own DB the local seed never
  // touches). Runs after listen so a slow DB can't delay the healthcheck.
  void ensureAdminSeed();

  // Populate an empty database (e.g. a fresh production deploy) with the content
  // snapshot exported from development. Idempotent: skips any table that already
  // has rows, so it never overwrites edits made through the CMS.
  //
  // Run the gallery-slot backfill AFTER a SUCCESSFUL snapshot import: the import
  // only seeds photos when the table is empty, so seeding gallery rows while the
  // import is still pending a retry (it failed and rolled back) would leave
  // site_photos non-empty and make the next boot skip the original photos.
  void importContentSnapshot().then((ready) => {
    if (ready) {
      void ensureGalleryPhotos();
      void ensureArdoiseMenu();
    }
  });
});
