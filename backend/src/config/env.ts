import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(currentDirectory, "../../");

dotenv.config({ path: path.join(backendRoot, ".env") });

const readRequired = (key: string) => {
  const value = process.env[key]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const readOptional = (key: string) => process.env[key]?.trim() || "";

const nodeEnv = readOptional("NODE_ENV") || "development";

// Which deployment this is: "production" (the live site), "staging" (the
// separate test deployment on Render/Vercel) or "development" (local).
// Separate from NODE_ENV on purpose: staging must run with
// NODE_ENV=production so cross-site cookies work between vercel.app and
// onrender.com, yet still be allowed test-only tools like the OTP bypass.
const appEnv = readOptional("APP_ENV") || (nodeEnv === "production" ? "production" : "development");

export const env = {
  nodeEnv,
  appEnv,
  // Extra browser origins allowed to call the API (comma-separated), on
  // top of FRONTEND_BASE_URL and the built-in list in server.ts — e.g. a
  // staging Vercel URL.
  extraAllowedOrigins: readOptional("ALLOWED_ORIGINS")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
  port: Number(readOptional("PORT") || 4000),
  mongodbUri: readRequired("MONGODB_URI"),
  mongodbDbName: readOptional("MONGODB_DB_NAME") || "meera_sakhrani",
  // Online-masterclass registrations live in their own database (shown as
  // a separate "folder" in MongoDB Atlas). Users, OTP challenges and the
  // payments ledger stay shared in the main database — one login works for
  // every class, and every ICICI transaction is looked up in one place.
  mongodbOnlineDbName: readOptional("MONGODB_ONLINE_DB_NAME") || "online_masterclass",
  authJwtSecret: readOptional("AUTH_JWT_SECRET"),
  authCookieName: readOptional("AUTH_COOKIE_NAME") || "ms_session",
  // Developer OTP bypass (see auth.service requestOtp): no SMS is sent and
  // the code is handed straight back to the login popup. Needs BOTH
  // OTP_DEV_MODE=true AND a non-live deployment (local, or APP_ENV=staging)
  // — either one alone keeps it off, so it can never switch on for real
  // customers by a single stray variable.
  otpDevMode:
    (readOptional("OTP_DEV_MODE") || "").toLowerCase() === "true" &&
    (nodeEnv !== "production" || appEnv === "staging"),
  smtpHost: readOptional("SMTP_HOST"),
  smtpPort: Number(readOptional("SMTP_PORT") || 587),
  smtpUser: readOptional("SMTP_USER"),
  smtpPass: readOptional("SMTP_PASS"),
  smtpFrom: readOptional("SMTP_FROM") || "Meera Sakhrani <no-reply@meerasakhrani.in>",
  resendApiKey: readOptional("RESEND_API_KEY"),
  resendFrom: readOptional("RESEND_FROM") || "Meera Sakhrani <no-reply@meerasakhrani.in>",
  msg91AuthKey: readOptional("MSG91_AUTH_KEY"),
  msg91OtpTemplateId: readOptional("MSG91_OTP_TEMPLATE_ID"),
  msg91Sender: readOptional("MSG91_SENDER") || "MEERAS",
  // OTP Widget's tokenAuth — deliberately NOT a VITE_ variable. It's
  // served to the frontend at runtime via /api/auth/widget/config instead
  // of being baked into the built JS bundle at compile time.
  msg91WidgetTokenAuth: readOptional("MSG91_WIDGET_TOKEN_AUTH"),

  // ICICI Orange PG (Direct Integration)
  frontendBaseUrl: readOptional("FRONTEND_BASE_URL") || "http://localhost:5173",
  iciciMerchantId: readOptional("ICICI_MERCHANT_ID"),
  iciciAggregatorId: readOptional("ICICI_AGGREGATOR_ID"),
  iciciSecretKey: readOptional("ICICI_SECRET_KEY"),
  iciciInitiateSaleUrl:
    readOptional("ICICI_INITIATE_SALE_URL") ||
    "https://pgpayuat.icicibank.com/tsp/pg/api/v2/initiateSale",
  iciciCommandUrl:
    readOptional("ICICI_COMMAND_URL") || "https://pgpayuat.icicibank.com/tsp/pg/api/command",
  iciciReturnUrl:
    readOptional("ICICI_RETURN_URL") || "http://localhost:4000/api/payments/return",
  adminApiKey: readOptional("ADMIN_API_KEY"),
  reconcileIntervalMs: Number(readOptional("RECONCILE_INTERVAL_MS") || 5 * 60 * 1000),
  reconcileStaleAfterMs: Number(readOptional("RECONCILE_STALE_AFTER_MS") || 2 * 60 * 1000),
  // Soft cutoff: past this, the sweep stops actively re-asking ICICI every
  // 5 minutes and marks the payment EXPIRED so the customer isn't left on
  // an indefinite pending page. Raised from the original 10 minutes after
  // a real transaction was still showing "Awaiting user action" at ICICI
  // well past that point — 10 minutes was cutting it off too eagerly.
  // Mirrors the frontend's own pending-page deadline.
  pendingExpiryMs: Number(readOptional("PENDING_EXPIRY_MS") || 15 * 60 * 1000),
  // EXPIRED isn't the end of the story: ICICI can still resolve a
  // transaction after we've stopped actively polling it, and a late ADVICE
  // webhook isn't guaranteed to arrive. The sweep keeps re-checking expired
  // payments (at the normal sweep cadence) for this long afterward, so a
  // late SUCCESS still gets caught and the customer still gets their
  // invoice automatically instead of silently falling through the cracks.
  expiredRecheckWindowMs: Number(readOptional("EXPIRED_RECHECK_WINDOW_MS") || 24 * 60 * 60 * 1000),

  // Google Sheets sync — optional. Left blank, the sheet-write calls just
  // no-op (see lib/sheets.ts), so registrations/payments still work fine
  // without it configured.
  googleSheetsClientEmail: readOptional("GOOGLE_SHEETS_CLIENT_EMAIL"),
  googleSheetsPrivateKey: readOptional("GOOGLE_SHEETS_PRIVATE_KEY"),
  googleSheetId: readOptional("GOOGLE_SHEET_ID"),
  // The tab name changes every cohort (e.g. "September_2026") — configurable
  // rather than hardcoded so a new month doesn't need a code change.
  googleSheetsTabName: readOptional("GOOGLE_SHEETS_TAB_NAME") || "Registrations",
  // Online-masterclass registrations get their own sheet, with columns
  // built for a single one-time payment rather than the offline
  // advance + installment ledger. Defaults to a separate tab inside the
  // same spreadsheet (created automatically on first write); point
  // GOOGLE_SHEETS_ONLINE_SHEET_ID at a different spreadsheet to keep them
  // in a completely separate file instead.
  googleSheetsOnlineSheetId: readOptional("GOOGLE_SHEETS_ONLINE_SHEET_ID") || readOptional("GOOGLE_SHEET_ID"),
  googleSheetsOnlineTabName: readOptional("GOOGLE_SHEETS_ONLINE_TAB_NAME") || "Online_Masterclass",
};
