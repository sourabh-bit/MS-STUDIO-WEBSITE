import type { NextFunction, Response } from "express";

import { isHttpError } from "../lib/http-error.js";
import type { AuthenticatedRequest } from "../middleware/require-auth.js";
import { toClassVariant } from "../db/class-databases.js";
import { ensureUserInClass } from "../services/auth.service.js";
import { createRegistration, hasRegistered } from "../services/registration.service.js";

export const createRegistrationHandler = async (
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

    const {
      name,
      email,
      city,
      state,
      country,
      instagramHandle,
      experienceMonths,
      pan,
      gstin,
      billerName,
      address,
      postalCode,
      courseName,
      variant,
      amount,
    } = request.body as Record<string, unknown>;

    // The phone on a registration is always the OTP-verified login number,
    // never a free-typed one: it's the key that links this registration to
    // the person's payments, invoice and sheet row. A different number here
    // used to leave orphaned rows nothing would ever match.
    const phone = user.phone;

    if (!phone) {
      response.status(400).json({
        message: "Your account is missing a verified mobile number. Please log in again.",
      });
      return;
    }

    // State and PAN are checked in createRegistration — both only apply to
    // buyers in India.
    if (!name || !email || !city || !courseName || !amount) {
      response.status(400).json({ message: "Missing required fields." });
      return;
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      response.status(400).json({ message: "Invalid amount." });
      return;
    }

    const classVariant = toClassVariant(variant);
    await ensureUserInClass(classVariant, user);

    const parsedExperienceMonths =
      experienceMonths === undefined || experienceMonths === null || experienceMonths === ""
        ? undefined
        : Number(experienceMonths);

    const result = await createRegistration({
      name: String(name),
      phone: String(phone),
      email: String(email),
      city: String(city),
      state: state ? String(state) : "",
      country: country ? String(country) : undefined,
      instagramHandle: instagramHandle ? String(instagramHandle) : undefined,
      experienceMonths: parsedExperienceMonths,
      pan: pan ? String(pan) : undefined,
      gstin: gstin ? String(gstin) : undefined,
      billerName: billerName ? String(billerName) : undefined,
      address: address ? String(address) : undefined,
      postalCode: postalCode ? String(postalCode) : undefined,
      courseName: String(courseName),
      variant: classVariant,
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
