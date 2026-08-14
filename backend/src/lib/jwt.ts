import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { logger } from "./logger.js";

const DEV_FALLBACK_SECRET = "dev-insecure-secret-change-me";

const getSecret = () => {
  if (env.authJwtSecret) {
    return env.authJwtSecret;
  }

  if (env.nodeEnv === "production") {
    throw new Error("AUTH_JWT_SECRET must be set in production.");
  }

  logger.warn(
    "AUTH_JWT_SECRET is not set — using an insecure development fallback. Set it before deploying.",
  );
  return DEV_FALLBACK_SECRET;
};

export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

export type SessionTokenPayload = {
  userId: string;
};

export const signSessionToken = (payload: SessionTokenPayload) =>
  jwt.sign(payload, getSecret(), { expiresIn: SESSION_TTL_SECONDS });

export const verifySessionToken = (token: string): SessionTokenPayload | null => {
  try {
    return jwt.verify(token, getSecret()) as SessionTokenPayload;
  } catch {
    return null;
  }
};
