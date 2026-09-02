import { connectToDatabase } from "../db/connect.js";
import { HttpError } from "../lib/http-error.js";
import { isValidGstin } from "../lib/gstin.js";
import { isValidPan } from "../lib/pan.js";
import { detectContactChannel, isValidEmail, normaliseContact } from "../lib/otp.js";
import { appendRegistrationRow } from "../lib/sheets.js";
import { getSecondInstallmentTotal } from "../config/installment.js";
import { Registration } from "../models/Registration.js";
import type { CreateRegistrationInput, RegistrationVariant } from "../types/registration.js";

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

  const instagramHandle = input.instagramHandle?.trim() || "";

  const city = input.city.trim();

  if (!city) {
    throw new HttpError(400, "Enter your city.");
  }

  const state = input.state.trim();

  if (!state) {
    throw new HttpError(400, "Select your state.");
  }

  const pan = input.pan.trim().toUpperCase();

  if (!isValidPan(pan)) {
    throw new HttpError(400, "Enter a valid 10-character PAN (e.g. ABCDE1234F).");
  }

  const experienceMonths =
    input.experienceMonths === undefined || input.experienceMonths === null
      ? null
      : Number(input.experienceMonths);

  if (experienceMonths !== null && (!Number.isFinite(experienceMonths) || experienceMonths < 0)) {
    throw new HttpError(400, "Enter a valid number of months.");
  }

  const gstin = input.gstin?.trim().toUpperCase() || "";

  if (gstin && !isValidGstin(gstin)) {
    throw new HttpError(400, "Enter a valid 15-character GSTIN.");
  }

  // Biller name and address are only asked for (and shown) once the GST
  // toggle is on — without them a GST invoice can't legally be issued, so
  // they're required together with a GSTIN rather than each optional on
  // their own.
  const billerName = input.billerName?.trim() || "";
  const address = input.address?.trim() || "";

  if (gstin && !billerName) {
    throw new HttpError(400, "Enter the name the GST invoice should be billed to.");
  }

  if (gstin && !address) {
    throw new HttpError(400, "Enter the billing address for the GST invoice.");
  }

  if (!input.courseName.trim() || !Number.isFinite(input.amount) || input.amount <= 0) {
    throw new HttpError(400, "Missing course details.");
  }

  const registration = await Registration.create({
    name,
    phone,
    email,
    city,
    state,
    instagramHandle,
    experienceMonths,
    pan,
    hasGstin: Boolean(gstin),
    gstin,
    billerName,
    address,
    courseName: input.courseName.trim(),
    variant: input.variant === "online" ? "online" : "offline",
    amount: input.amount,
  });

  // Best-effort — never let a Sheets outage block a registration.
  const courseName = input.courseName.trim();
  await appendRegistrationRow({
    name,
    phone,
    email,
    city,
    state,
    billerName,
    courseName,
    variant: input.variant === "online" ? "online" : "offline",
    advanceAmount: input.amount,
    pan,
    gstin,
    secondInstallmentTotal: getSecondInstallmentTotal(courseName),
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
