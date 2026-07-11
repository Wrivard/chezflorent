import { syncUntappdMenu } from "../lib/untappdSync";
import { logger } from "../lib/logger";

/**
 * Manual one-shot import of the Untappd drinks menu into the CMS.
 *
 * The actual logic lives in ../lib/untappdSync — the API server also runs it
 * automatically (TTL-based refresh on GET /api/menu + authenticated
 * POST /api/menu/untappd-sync). This script remains for intentional re-pulls
 * from the command line: `pnpm --filter @workspace/api-server run import:untappd`.
 */

syncUntappdMenu()
  .then((result) => {
    if (result.skipped) {
      logger.warn("Another sync was already running — nothing done.");
    }
    process.exit(0);
  })
  .catch((err) => {
    logger.error({ err }, "Untappd import failed");
    process.exit(1);
  });
