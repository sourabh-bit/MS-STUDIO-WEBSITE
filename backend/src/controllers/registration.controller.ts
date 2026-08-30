import type { NextFunction, Request, Response } from "express";

import { isHttpError } from "../lib/http-error.js";
import type { AuthenticatedRequest } from "../middleware/require-auth.js";
import { createRegistration, hasRegistered } from "../services/registration.service.js";

export const createRegistrationHandler = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      phone,
      email,
      city,
      state,
      instagramHandle,
      experienceMonths,
      pan,
      gstin,
      courseName,
      variant,
      amount,
    } = request.body as Record<string, unknown>;

    if (!name || !phone || !email || !instagramHandle || !pan || !courseName || !amount) {
      response.status(400).json({ message: "Missing required fields." });
      return;
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      response.status(400).json({ message: "Invalid amount." });
      return;
    }

    const parsedExperienceMonths =
      experienceMonths === undefined || experienceMonths === null || experienceMonths === ""
        ? undefined
        : Number(experienceMonths);

    const result = await createRegistration({
      name: String(name),
      phone: String(phone),
      email: String(email),
      city: city ? String(city) : undefined,
      state: state ? String(state) : undefined,
      instagramHandle: String(instagramHandle),
      experienceMonths: parsedExperienceMonths,
      pan: String(pan),
      gstin: gstin ? String(gstin) : undefined,
      courseName: String(courseName),
      variant: String(variant).trim().toLowerCase() === "online" ? "online" : "offline",
      amount: parsedAmount,
    });

    response.status(201).json(result);
  } catch (error) {
    if (isHttpError(error)) {
      response.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
};

export const checkRegistrationHandler = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) => {
  try {
    const user = request.user;

    if (!user) {
      response.status(401).json({ message: "Please log in to continue." });
      return;
    }

    const courseName = String(request.query.courseName || "").trim();
    const variant = String(request.query.variant || "").trim().toLowerCase() === "online" ? "online" : "offline";

    if (!courseName) {
      response.status(400).json({ message: "courseName is required." });
      return;
    }

    const registered = await hasRegistered(user.phone, courseName, variant);
    response.status(200).json({ registered });
  } catch (error) {
    if (isHttpError(error)) {
      response.status(error.statusCode).json({ message: error.message });
      return;
    }

    next(error);
  }
};
