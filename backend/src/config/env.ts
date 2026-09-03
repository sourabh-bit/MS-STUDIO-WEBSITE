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

export const env = {
  nodeEnv: readOptional("NODE_ENV") || "development",
  port: Number(readOptional("PORT") || 4000),
  mongodbUri: readRequired("MONGODB_URI"),
  authJwtSecret: readOptional("AUTH_JWT_SECRET"),
  authCookieName: readOptional("AUTH_COOKIE_NAME") || "ms_session",
  otpDevMode: (readOptional("OTP_DEV_MODE") || "").toLowerCase() === "true",
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
};
