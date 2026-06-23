import express, { type Express } from "express";
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

export default app;
