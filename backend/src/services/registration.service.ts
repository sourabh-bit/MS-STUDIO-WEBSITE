import { connectToDatabase } from "../db/connect.js";
import { HttpError } from "../lib/http-error.js";
import { isValidGstin } from "../lib/gstin.js";
import { detectContactChannel, isValidEmail, normaliseContact } from "../lib/otp.js";
import { Registration } from "../models/Registration.js";
import type { CreateRegistrationInput, RegistrationVariant } from "../types/registration.js";

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

// Keyed on phone (the OTP-verified identity) rather than a stored userId,
// since Registration predates any link to the User model — phone is
// already the thing we trust as "this specific person."
export const hasRegistered = async (
  phone: string,
  courseName: string,
  variant: RegistrationVariant,
) => {
  await connectToDatabase();

  if (detectContactChannel(phone) !== "phone") {
    return false;
  }

  const normalisedPhone = normaliseContact(phone, "phone");

  const existing = await Registration.findOne({
    phone: normalisedPhone,
    courseName: courseName.trim(),
    variant,
  });

  return Boolean(existing);
};
