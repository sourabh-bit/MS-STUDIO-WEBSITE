import { connectToDatabase } from "../db/connect.js";
import { HttpError } from "../lib/http-error.js";
import { isValidGstin } from "../lib/gstin.js";
import { detectContactChannel, isValidEmail, normaliseContact } from "../lib/otp.js";
import { Registration } from "../models/Registration.js";
import type { CreateRegistrationInput } from "../types/registration.js";

const EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced"];

export const createRegistration = async (input: CreateRegistrationInput) => {
  await connectToDatabase();

  const name = input.name.trim();

  if (name.length < 2) {
    throw new HttpError(400, "Enter your full name.");
  }

  if (detectContactChannel(input.phone) !== "phone") {
    throw new HttpError(400, "Enter a valid 10-digit mobile number.");
  }

  const phone = normaliseContact(input.phone, "phone");
  const email = input.email.trim().toLowerCase();

  if (!isValidEmail(email)) {
    throw new HttpError(400, "Enter a valid email address.");
  }

  if (!EXPERIENCE_LEVELS.includes(input.experienceLevel)) {
    throw new HttpError(400, "Select your experience level.");
  }

  const gstin = input.gstin?.trim().toUpperCase() || "";

  if (gstin && !isValidGstin(gstin)) {
    throw new HttpError(400, "Enter a valid 15-character GSTIN.");
  }

  if (!input.courseName.trim() || !Number.isFinite(input.amount) || input.amount <= 0) {
    throw new HttpError(400, "Missing course details.");
  }

  const registration = await Registration.create({
    name,
    phone,
    email,
    experienceLevel: input.experienceLevel,
    hasGstin: Boolean(gstin),
    gstin,
    courseName: input.courseName.trim(),
    variant: input.variant === "online" ? "online" : "offline",
    amount: input.amount,
  });

  return { id: String(registration._id) };
};
