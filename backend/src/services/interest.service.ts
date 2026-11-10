import { connectToDatabase } from "../db/connect.js";
import type { ClassVariant } from "../db/class-databases.js";
import { HttpError } from "../lib/http-error.js";
import { detectContactChannel, isValidEmail, normaliseContact } from "../lib/otp.js";
import { appendInterestRow } from "../lib/sheets.js";
import { interestModelFor } from "../models/Interest.js";

export type RegisterInterestInput = {
  name: string;
  whatsappNumber: string;
  email: string;
  courseName: string;
  variant: ClassVariant;
};

export const registerInterest = async (input: RegisterInterestInput) => {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const courseName = input.courseName.trim();
  const rawWhatsapp = input.whatsappNumber.trim();

  if (name.length < 2) {
    throw new HttpError(400, "Enter your full name.");
  }

  if (detectContactChannel(rawWhatsapp) !== "phone") {
    throw new HttpError(400, "Enter a valid WhatsApp number.");
  }

  if (!isValidEmail(email)) {
    throw new HttpError(400, "Enter a valid email address.");
  }

  if (!courseName) {
    throw new HttpError(400, "Unknown course. Please refresh the page and try again.");
  }

  const whatsappNumber = normaliseContact(rawWhatsapp, "phone");

  await connectToDatabase();

  await interestModelFor(input.variant).findOneAndUpdate(
    { whatsappNumber, courseName },
    { $set: { name, email } },
    { upsert: true, setDefaultsOnInsert: true },
  );

  // Best-effort, like every other sheet write — never fails the request.
  await appendInterestRow({ name, whatsappNumber, email, courseName, variant: input.variant });
};
