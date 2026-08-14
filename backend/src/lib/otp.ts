import crypto from "node:crypto";
import bcrypt from "bcryptjs";

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

export const detectContactChannel = (rawContact: string): OtpChannel | null => {
  const contact = rawContact.trim();

  if (EMAIL_PATTERN.test(contact)) {
    return "email";
  }

  const digits = contact.replace(/\D/g, "");
  if (/^(91)?[6-9]\d{9}$/.test(digits)) {
    return "phone";
  }

  return null;
};

export const normaliseContact = (rawContact: string, channel: OtpChannel) => {
  const contact = rawContact.trim();

  if (channel === "email") {
    return contact.toLowerCase();
  }

  const digits = contact.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
};
