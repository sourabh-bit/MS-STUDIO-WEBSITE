import { connectToDatabase } from "../db/connect.js";
import { HttpError } from "../lib/http-error.js";
import { logger } from "../lib/logger.js";
import { signSessionToken } from "../lib/jwt.js";
import {
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_TTL_SECONDS,
  detectContactChannel,
  generateOtpCode,
  hashOtpCode,
  isValidEmail,
  normaliseContact,
  verifyOtpCode,
} from "../lib/otp.js";
import { isSmsConfigured, sendOtpSms } from "../lib/sms.js";
import { verifyMsg91WidgetToken } from "../lib/msg91-widget.js";
import { OtpChallenge } from "../models/OtpChallenge.js";
import { User, type UserDocument } from "../models/User.js";
import { env } from "../config/env.js";

const OTP_HOURLY_LIMIT = 5;

export type RequestOtpInput = {
  name: string;
  mobile: string;
  email: string;
};

const toPublicUser = (user: UserDocument) => ({
  id: String(user._id),
  phone: user.phone,
  email: user.email,
  name: user.name,
});

const normaliseMobileOrThrow = (rawMobile: string) => {
  const channel = detectContactChannel(rawMobile);

  if (channel !== "phone") {
    throw new HttpError(400, "Enter a valid 10-digit mobile number.");
  }

  return normaliseContact(rawMobile, "phone");
};

export const requestOtp = async (input: RequestOtpInput) => {
  await connectToDatabase();

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const mobile = normaliseMobileOrThrow(input.mobile);

  if (name.length < 2) {
    throw new HttpError(400, "Enter your full name.");
  }

  if (!isValidEmail(email)) {
    throw new HttpError(400, "Enter a valid email address.");
  }

  const recentChallenge = await OtpChallenge.findOne({ contact: mobile }).sort({
    createdAt: -1,
  });

  if (recentChallenge) {
    const secondsSinceLast =
      (Date.now() - recentChallenge.createdAt.getTime()) / 1000;

    if (secondsSinceLast < OTP_RESEND_COOLDOWN_SECONDS) {
      throw new HttpError(
        429,
        `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLast)}s before requesting another code.`,
      );
    }
  }

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const requestsInLastHour = await OtpChallenge.countDocuments({
    contact: mobile,
    createdAt: { $gte: hourAgo },
  });

  if (requestsInLastHour >= OTP_HOURLY_LIMIT) {
    throw new HttpError(
      429,
      "Too many code requests. Please try again in an hour.",
    );
  }

  const code = generateOtpCode();
  const codeHash = await hashOtpCode(code);

  await OtpChallenge.create({
    contact: mobile,
    channel: "phone",
    name,
    email,
    codeHash,
    attempts: 0,
    expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
  });

  const smsConfigured = isSmsConfigured();

  if (smsConfigured) {
    await sendOtpSms(mobile, code);
  } else {
    logger.warn("MSG91 is not configured — logging OTP instead of sending it.", {
      mobile,
      code,
    });
  }

  return {
    mobile,
    expiresInSeconds: OTP_TTL_SECONDS,
    devCode: env.nodeEnv !== "production" && !smsConfigured ? code : undefined,
  };
};

export const verifyOtp = async (rawMobile: string, rawCode: string) => {
  await connectToDatabase();

  const mobile = normaliseMobileOrThrow(rawMobile);
  const code = rawCode.trim();

  if (!/^\d{6}$/.test(code)) {
    throw new HttpError(400, "Enter the 6-digit code sent to you.");
  }

  const challenge = await OtpChallenge.findOne({
    contact: mobile,
    consumedAt: null,
  }).sort({ createdAt: -1 });

  if (!challenge || challenge.expiresAt.getTime() < Date.now()) {
    throw new HttpError(
      400,
      "This code has expired. Please request a new one.",
    );
  }

  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    throw new HttpError(
      429,
      "Too many incorrect attempts. Please request a new code.",
    );
  }

  const isMatch = await verifyOtpCode(code, challenge.codeHash);

  if (!isMatch) {
    challenge.attempts += 1;
    await challenge.save();

    const remaining = OTP_MAX_ATTEMPTS - challenge.attempts;
    throw new HttpError(
      400,
      remaining > 0
        ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
        : "Too many incorrect attempts. Please request a new code.",
    );
  }

  challenge.consumedAt = new Date();
  await challenge.save();

  const user = await User.findOneAndUpdate(
    { phone: mobile },
    {
      $set: {
        name: challenge.name,
        email: challenge.email,
        lastLoginAt: new Date(),
      },
      $setOnInsert: { phone: mobile },
    },
    { new: true, upsert: true },
  );

  const token = signSessionToken({ userId: String(user._id) });

  return { token, user: toPublicUser(user) };
};

// MSG91 OTP Widget login: the OTP itself was already sent and verified
// entirely client-side by the widget. This only trusts the resulting
// access token after confirming it server-side with MSG91 — the verified
// mobile number that comes back from that check is the identity, never
// whatever the client claims in the request body.
export const verifyWidgetLogin = async (
  accessToken: string,
  rawName: string,
  rawEmail: string,
) => {
  await connectToDatabase();

  const name = rawName.trim();
  const email = rawEmail.trim().toLowerCase();

  if (name.length < 2) {
    throw new HttpError(400, "Enter your full name.");
  }

  if (!isValidEmail(email)) {
    throw new HttpError(400, "Enter a valid email address.");
  }

  const verification = await verifyMsg91WidgetToken(accessToken);

  if (!verification.verified || detectContactChannel(verification.mobile) !== "phone") {
    throw new HttpError(400, "OTP verification failed. Please try again.");
  }

  const mobile = normaliseContact(verification.mobile, "phone");

  const user = await User.findOneAndUpdate(
    { phone: mobile },
    {
      $set: { name, email, lastLoginAt: new Date() },
      $setOnInsert: { phone: mobile },
    },
    { new: true, upsert: true },
  );

  const token = signSessionToken({ userId: String(user._id) });

  return { token, user: toPublicUser(user) };
};

export const getUserById = async (userId: string) => {
  await connectToDatabase();

  const user = await User.findById(userId);
  return user ? toPublicUser(user) : null;
};
