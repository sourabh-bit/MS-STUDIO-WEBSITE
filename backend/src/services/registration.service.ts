import { connectToDatabase } from "../db/connect.js";
import { HttpError } from "../lib/http-error.js";
import { isValidGstin } from "../lib/gstin.js";
import { isValidPan } from "../lib/pan.js";
import { detectContactChannel, isIndianPhone, isValidEmail, normaliseContact } from "../lib/otp.js";
import { appendRegistrationRow } from "../lib/sheets.js";
import { getSecondInstallmentTotal } from "../config/installment.js";
import { OnlineRegistration } from "../models/OnlineRegistration.js";
import { Registration } from "../models/Registration.js";
import type { CreateRegistrationInput, RegistrationVariant } from "../types/registration.js";

// Online registrations live in their own database (see OnlineRegistration);
// offline ones stay where they've always been.
export const registrationModelFor = (variant: RegistrationVariant): typeof Registration =>
  variant === "online" ? OnlineRegistration : Registration;

const isDuplicateKeyError = (error: unknown) =>
  Boolean(error && typeof error === "object" && "code" in error && (error as { code?: unknown }).code === 11000);

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

  // International students (US, Canada, Bangladesh, Nepal…) have no Indian
  // state, PAN or GSTIN — those are only asked for, and required, in India.
  const country = input.country?.trim() || "India";
  const isIndia = country.toLowerCase() === "india";
  const state = input.state.trim();

  if (isIndia && !state) {
    throw new HttpError(400, "Select your state.");
  }

  // PAN is mandatory only for someone in India on an Indian (+91) number.
  // In India on a foreign number it's optional, but still checked if given.
  const isPanRequired = isIndia && isIndianPhone(phone);
  const pan = isIndia ? (input.pan ?? "").trim().toUpperCase() : "";

  if ((isPanRequired || pan) && !isValidPan(pan)) {
    throw new HttpError(400, "Enter a valid 10-character PAN (e.g. ABCDE1234F).");
  }

  const experienceMonths =
    input.experienceMonths === undefined || input.experienceMonths === null
      ? null
      : Number(input.experienceMonths);

  if (experienceMonths !== null && (!Number.isFinite(experienceMonths) || experienceMonths < 0)) {
    throw new HttpError(400, "Enter a valid number of months.");
  }

  const gstin = isIndia ? input.gstin?.trim().toUpperCase() || "" : "";

  if (gstin && !isValidGstin(gstin)) {
    throw new HttpError(400, "Enter a valid 15-character GSTIN.");
  }

  // Biller name and address are only asked for (and shown) once the GST
  // toggle is on — without them a GST invoice can't legally be issued, so
  // they're required together with a GSTIN rather than each optional on
  // their own.
  const billerName = input.billerName?.trim() || "";
  // Outside India this is the (required) residential address instead.
  const address = input.address?.trim() || "";
  const postalCode = isIndia ? "" : input.postalCode?.trim() || "";

  if (!isIndia && !address) {
    throw new HttpError(400, "Enter your full address.");
  }

  if (gstin && !billerName) {
    throw new HttpError(400, "Enter the name the GST invoice should be billed to.");
  }

  if (gstin && !address) {
    throw new HttpError(400, "Enter the billing address for the GST invoice.");
  }

  if (!input.courseName.trim() || !Number.isFinite(input.amount) || input.amount <= 0) {
    throw new HttpError(400, "Missing course details.");
  }

  const courseName = input.courseName.trim();
  const variant: RegistrationVariant = input.variant === "online" ? "online" : "offline";

  const details = {
    name,
    phone,
    email,
    city,
    state,
    country,
    postalCode,
    instagramHandle,
    experienceMonths,
    pan,
    hasGstin: Boolean(gstin),
    gstin,
    billerName,
    address,
    courseName,
    variant,
    amount: input.amount,
  };

  // One registration per person per course. A double-submit or a second
  // tab shouldn't create a duplicate record (or a duplicate sheet row) —
  // re-submitting just refreshes the details already on file.
  const Model = registrationModelFor(variant);

  const updateExisting = async () => {
    const existing = await Model.findOne({ phone, courseName, variant });

    if (!existing) {
      return null;
    }

    existing.set(details);
    await existing.save();
    return { id: String(existing._id) };
  };

  const updated = await updateExisting();

  if (updated) {
    return updated;
  }

  let registration;

  try {
    registration = await Model.create(details);
  } catch (error) {
    // Lost a race against a simultaneous submission for the same person
    // (the online collection's unique index caught it) — the other one
    // already created the record and its sheet row, so just update it.
    if (isDuplicateKeyError(error)) {
      const raced = await updateExisting();

      if (raced) {
        return raced;
      }
    }

    throw error;
  }

  // Best-effort — never let a Sheets outage block a registration.
  await appendRegistrationRow({
    name,
    phone,
    email,
    city,
    // The sheets have no Country column — fold it into State for anyone
    // outside India so the row still says where they're from.
    state: isIndia ? state : [state, country].filter(Boolean).join(", "),
    billerName,
    courseName,
    variant,
    advanceAmount: input.amount,
    pan,
    gstin,
    secondInstallmentTotal: getSecondInstallmentTotal(courseName),
    instagramHandle,
    experienceMonths,
    billingAddress: [address, postalCode].filter(Boolean).join(", "),
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

  const existing = await registrationModelFor(variant).findOne({
    phone: normalisedPhone,
    courseName: courseName.trim(),
    variant,
  });

  return Boolean(existing);
};
