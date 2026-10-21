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
import { CLASS_VARIANTS, type ClassVariant } from "../db/class-databases.js";
import { otpChallengeModelFor } from "../models/OtpChallenge.js";
import { userModelFor, type UserDocument } from "../models/User.js";
import { env } from "../config/env.js";

const OTP_HOURLY_LIMIT = 5;

export type RequestOtpInput = {
  name: string;
  mobile: string;
  email: string;
  // The class the person is logging in for — their OTP challenge and user
  // record are kept in that class's own database.
  variant: ClassVariant;
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
    throw new HttpError(400, "Enter a valid mobile number.");
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

  const OtpChallenge = otpChallengeModelFor(input.variant);

  const recentChallenge = env.otpDevMode
    ? null
    : await OtpChallenge.findOne({ contact: mobile }).sort({ createdAt: -1 });

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

  // Dev mode skips both throttles — they exist to protect SMS credits and
  // real phones, neither of which is involved when testing locally.
  if (!env.otpDevMode && requestsInLastHour >= OTP_HOURLY_LIMIT) {
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

  if (env.otpDevMode) {
    logger.warn("[OTP DEV MODE] Not sending SMS — code returned to the browser instead.", {
      mobile,
      code,
    });
  } else if (smsConfigured) {
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
    devCode: env.otpDevMode || (env.nodeEnv !== "production" && !smsConfigured) ? code : undefined,
  };
};

export const verifyOtp = async (rawMobile: string, rawCode: string, variant: ClassVariant) => {
  await connectToDatabase();

  const OtpChallenge = otpChallengeModelFor(variant);

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

  const user = await userModelFor(variant).findOneAndUpdate(
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

  const token = signSessionToken({ userId: String(user._id), variant });

  return { token, user: toPublicUser(user) };
};

// Students abroad whose SMS can't be delivered get their code by email
// instead, so the token then proves the email, not the phone. That route is
// closed to Indian numbers (they always verify by SMS), and it can never
// take over an account: if the typed number already belongs to someone
// with a different email, the email code is refused.
const resolveEmailVerifiedMobile = async (rawMobile: string, email: string) => {
  if (detectContactChannel(rawMobile) !== "phone") {
    throw new HttpError(400, "Enter a valid mobile number.");
  }

  const mobile = normaliseContact(rawMobile, "phone");

  if (mobile.startsWith("+91")) {
    throw new HttpError(400, "Indian numbers must verify with the code sent by SMS.");
  }

  for (const classVariant of CLASS_VARIANTS) {
    const existing = await userModelFor(classVariant).findOne({ phone: mobile });

    if (existing?.email && existing.email !== email) {
      throw new HttpError(
        409,
        "This mobile number is already registered with a different email. Use that email, or contact us on WhatsApp.",
      );
    }
  }

  return mobile;
};

// MSG91 OTP Widget login: the OTP itself was already sent and verified
// entirely client-side by the widget. This only trusts the resulting
// access token after confirming it server-side with MSG91 — the verified
// identity that comes back from that check is what counts, never whatever
// the client claims in the request body. Normally that's the mobile number;
// for a code sent by email it's the email, and the typed mobile is then
// accepted only under the rules in resolveEmailVerifiedMobile.
export const verifyWidgetLogin = async (
  accessToken: string,
  rawName: string,
  rawEmail: string,
  variant: ClassVariant,
  rawMobile = "",
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
  const verifiedChannel = verification.verified ? detectContactChannel(verification.mobile) : null;

  let mobile: string;

  if (verifiedChannel === "phone") {
    mobile = normaliseContact(verification.mobile, "phone");
  } else if (verifiedChannel === "email" && normaliseContact(verification.mobile, "email") === email) {
    mobile = await resolveEmailVerifiedMobile(rawMobile, email);
  } else {
    logger.warn("MSG91 widget token did not verify a usable identity.", {
      verified: verification.verified,
      identityType: verifiedChannel ?? "unrecognised",
    });
    throw new HttpError(400, "OTP verification failed. Please try again.");
  }

  const user = await userModelFor(variant).findOneAndUpdate(
    { phone: mobile },
    {
      $set: { name, email, lastLoginAt: new Date() },
      $setOnInsert: { phone: mobile },
    },
    { new: true, upsert: true },
  );

  const token = signSessionToken({ userId: String(user._id), variant });

  return { token, user: toPublicUser(user) };
};

export const getUserById = async (userId: string, variant: ClassVariant = "offline") => {
  await connectToDatabase();

  const user = await userModelFor(variant).findById(userId);
  return user ? toPublicUser(user) : null;
};

// One login works for both classes, but each class's database keeps its own
// copy of everyone who registers or pays for it — so someone who logged in
// on the online page and then enrols offline still appears in the offline
// database's users. Returns that class's user id for this person.
export const ensureUserInClass = async (
  variant: ClassVariant,
  user: { phone: string; name: string; email: string },
) => {
  await connectToDatabase();

  const classUser = await userModelFor(variant).findOneAndUpdate(
    { phone: user.phone },
    { $setOnInsert: { phone: user.phone, name: user.name, email: user.email } },
    { new: true, upsert: true },
  );

  return String(classUser._id);
};
