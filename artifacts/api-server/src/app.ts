import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { getSessionSecret } from "./lib/auth";
import { uploadsDir } from "./lib/storage";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(cookieParser(getSessionSecret()));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve locally-stored uploads (development / self-hosted fallback).
app.use("/api/uploads", express.static(uploadsDir()));

app.use("/api", router);

// Global JSON error handler: any uncaught route error (sync or async —
// Express 5 forwards rejected promises here) returns JSON instead of the
// default HTML error page, so the admin UI can show a real message.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  req.log?.error({ err }, "Unhandled route error");
  if (res.headersSent) {
    return;
  }
  const status =
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as { status?: unknown }).status === "number"
      ? (err as { status: number }).status
      : 500;
  res.status(status).json({
    error:
      status >= 500
        ? "Erreur interne du serveur. Réessayez plus tard."
        : (err instanceof Error && err.message) || "Requête invalide.",
  });
});

export default app;
