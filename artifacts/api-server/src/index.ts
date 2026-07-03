import app from "./app";
import { logger } from "./lib/logger";
import { ensureAdminSeed } from "./lib/ensureAdmin";

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
});
