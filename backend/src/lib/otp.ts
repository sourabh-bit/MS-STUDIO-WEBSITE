import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export const OTP_LENGTH = 6;
export const OTP_TTL_SECONDS = 5 * 60;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

export const generateOtpCode = () =>
  crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");

export const hashOtpCode = (code: string) => bcrypt.hash(code, 10);

export const verifyOtpCode = (code: string, codeHash: string) =>
  bcrypt.compare(code, codeHash);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string) => EMAIL_PATTERN.test(value.trim());

export type OtpChannel = "phone" | "email";

// Accepts digits that already include a country code (e.g. MSG91's widget
// identifiers, or "919876543210") and, as a fallback for any caller that
// still sends a bare national number with no country code (the legacy
// non-widget OTP path), assumes India — its historical-only behavior.
const parsePhoneContact = (rawContact: string) => {
  const digits = rawContact.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  const withCountryCode = parsePhoneNumberFromString(`+${digits}`);
  if (withCountryCode?.isValid()) {
    return withCountryCode;
  }

  const indiaFallback = parsePhoneNumberFromString(digits, "IN");
  return indiaFallback?.isValid() ? indiaFallback : null;
};

export const detectContactChannel = (rawContact: string): OtpChannel | null => {
  const contact = rawContact.trim();

  if (EMAIL_PATTERN.test(contact)) {
    return "email";
  }

  return parsePhoneContact(contact) ? "phone" : null;
};

export const normaliseContact = (rawContact: string, channel: OtpChannel) => {
  const contact = rawContact.trim();

  if (channel === "email") {
    return contact.toLowerCase();
  }

  const phoneNumber = parsePhoneContact(contact);
  return phoneNumber ? phoneNumber.number : contact.replace(/\D/g, "");
};
