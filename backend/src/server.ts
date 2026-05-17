import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { connectToDatabase } from "./db/connect.js";
import { logger } from "./lib/logger.js";
import { paymentRouter } from "./routes/payment.routes.js";

type RawBodyRequest = Request & { rawBody?: string };

const app = express();
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8082",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:8082",
  "https://meerasakhrani.in",
  "https://www.meerasakhrani.in",
]);

const isTrustedBrowserOrigin = (origin?: string | null) => {
  if (!origin || origin === "null") {
    return true;
  }

  if (env.nodeEnv !== "production") {
    try {
      const { hostname, protocol } = new URL(origin);
      if (
        protocol === "http:" &&
        (hostname === "localhost" || hostname === "127.0.0.1")
      ) {
        return true;
      }
    } catch {
      return false;
    }
  }

  return allowedOrigins.has(origin);
};

const saveRawBody = (
  request: RawBodyRequest,
  _response: Response,
  buffer: Buffer,
) => {
  request.rawBody = buffer.toString("utf8");
};

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (isTrustedBrowserOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed."));
    },
  }),
);

app.use(express.json({ verify: saveRawBody }));
app.use(express.urlencoded({ extended: true, verify: saveRawBody }));
app.use(express.text({ type: "text/plain", verify: saveRawBody }));

app.get("/api/health", async (_request, response) => {
  const connection = await connectToDatabase();

  response.status(200).json({
    backend: "ok",
    status: "ok",
    mongodb: connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/payments", paymentRouter);

app.use(
  (error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    logger.error("Unhandled backend error.", { message, error });

    response.status(500).json({
      message,
    });
  },
);

app.listen(env.port, () => {
  logger.info(`ICICI backend listening on port ${env.port}.`);
});
