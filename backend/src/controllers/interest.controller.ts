import type { NextFunction, Request, Response } from "express";

import { isHttpError } from "../lib/http-error.js";
import { toClassVariant } from "../db/class-databases.js";
import { registerInterest } from "../services/interest.service.js";

export const registerInterestHandler = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { name, whatsappNumber, email, courseName, variant } = request.body as Record<string, unknown>;

    await registerInterest({
      name: String(name ?? ""),
      whatsappNumber: String(whatsappNumber ?? ""),
      email: String(email ?? ""),
      courseName: String(courseName ?? ""),
      variant: toClassVariant(variant),
    });

    response.status(201).json({ ok: true });
  } catch (error) {
    if (isHttpError(error)) {
      response.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
};
