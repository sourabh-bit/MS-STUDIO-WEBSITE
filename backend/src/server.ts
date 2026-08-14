import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { connectToDatabase } from "./db/connect.js";
import { logger } from "./lib/logger.js";
import { startReconciliationScheduler } from "./lib/reconcile.js";
import { authRouter } from "./routes/auth.routes.js";
import { paymentRouter } from "./routes/payment.routes.js";

const app = express();

// Render (and most PaaS hosts) put the app behind a reverse proxy, so every
// request arrives with an X-Forwarded-For header. Without this, Express
// won't trust it, and express-rate-limit refuses to key rate limits off an
// untrusted IP and throws instead. `1` trusts exactly one hop — the
// platform's own proxy — not arbitrary client-supplied forwarding chains.
app.set("trust proxy", 1);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8082",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:8082",
  "https://meerasakhrani.com",
  "https://www.meerasakhrani.com",
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
    credentials: true,
  }),
);

app.use(cookieParser());

// Mounted before the global express.json() below so this router owns body
// parsing for its own routes — the ICICI return/advice endpoints need the
// raw request bytes, not whatever express.json() would (or wouldn't) parse.
app.use("/api/payments", paymentRouter);

app.use(express.json());

app.get("/api/health", async (_request, response) => {
  const connection = await connectToDatabase();

  response.status(200).json({
    backend: "ok",
    status: "ok",
    mongodb: connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRouter);

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
  logger.info(`Backend listening on port ${env.port}.`);
  startReconciliationScheduler();
});
