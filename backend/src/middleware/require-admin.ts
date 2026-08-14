import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";

const timingSafeStringEqual = (a: string, b: string) => {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
};

export const requireAdmin = (request: Request, response: Response, next: NextFunction) => {
  if (!env.adminApiKey) {
    response.status(501).json({ message: "ADMIN_API_KEY is not configured." });
    return;
  }

  const providedKey = String(request.headers["x-admin-key"] || "");

  if (!providedKey || !timingSafeStringEqual(providedKey, env.adminApiKey)) {
    response.status(401).json({ message: "Invalid admin key." });
    return;
  }

  next();
};
