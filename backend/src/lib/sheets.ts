import { JWT } from "google-auth-library";
import { GoogleSpreadsheet, type GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { parsePhoneNumberFromString } from "libphonenumber-js";

import { env } from "../config/env.js";
import { logger } from "./logger.js";

// Must match the sheet's actual header row (row 1) exactly:
// Timestamp | Name | Phone | Email | City | State | Course | Variant | PAN
// | GSTIN | BillingName | MerchantTxnNo | AdvanceAmount |
// AdvancePaymentStatus | SecondInstallmentTotal | SecondInstallmentPaid |
// SecondInstallmentRemaining | UpdatedAt
//
// One row per registration (keyed by Phone + Course) rather than one row
// per transaction — MerchantTxnNo always references the advance payment.
// The second-installment ledger is three plain numeric columns (Total /
// Paid / Remaining) rather than one crammed status string, so it reads
// clearly and can be summed/filtered/sorted directly in the sheet.

export const SHEET_HEADERS = [
  "Timestamp",
  "Name",
  "Phone",
  "Email",
  "City",
  "State",
  "Course",
  "Variant",
  "PAN",
  "GSTIN",
  "BillingName",
  "MerchantTxnNo",
  "AdvanceAmount",
  "AdvancePaymentStatus",
  "SecondInstallmentTotal",
  "SecondInstallmentPaid",
  "SecondInstallmentRemaining",
  "UpdatedAt",
];

// Registration.phone and Payment.mobile are no longer guaranteed to be the
// same string (Payment.mobile is stripped to a bare 10-digit number for the
// ICICI gateway field, while Registration.phone is the full "+91..." E.164
// value). Comparing the last 10 digits is a stable way to recognise "same
// phone number" across both shapes.
//
// Real incident this guards against: writes here go through the Sheets API
// as USER_ENTERED, which means a plain-digit phone string gets
// auto-detected and stored as a NUMBER cell, not text — Google Sheets can
// then display it in scientific notation (a display/format decision that
// can change over time based on column width), and getRows() reads back
// that FORMATTED value, not the underlying number. A phone written and
// read back as "9.19789996841E+11" loses real digits, not just cosmetic
// formatting — comparing last-10-digits on a truncated scientific-notation
// string silently fails to match a row that's actually correct. Detecting
// and reversing that here means matching stays correct even for any
// pre-existing cell still stored as a number.
const phoneDigits = (value: string) => {
  const trimmed = (value || "").trim();
  const scientific = /^-?\d(?:\.\d+)?e\+?\d+$/i.test(trimmed) ? Number(trimmed) : null;
  const normalised = scientific !== null && Number.isFinite(scientific) ? scientific.toFixed(0) : trimmed;

  return normalised.replace(/\D/g, "");
};

// Payments store the national number only (e.g. "452432614" for
// +61 452 432 614), while sheet rows hold the full number with its country
// code — so two numbers match when one ends with the other. Comparing the
// last 10 digits only lined up for India's 10-digit national numbers and
// left every shorter foreign number on an orphaned row of its own.
const isSamePhone = (left: string, right: string) => {
  const a = phoneDigits(left);
  const b = phoneDigits(right);
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];

  return shorter.length >= 7 && longer.endsWith(shorter);
};

// Forces Sheets to store this as plain text instead of auto-detecting an
// all-digit string as a number — a leading apostrophe is Sheets' own
// documented "treat as text" signal under USER_ENTERED input, and never
// appears in the value itself once read back. This is the actual fix, at
// the point data is written, rather than only working around it on read.
const asPlainText = (value: string) => (value ? `'${value}` : value);

// Every Phone cell is written as the full international number ("+91…",
// "+1…"). Cells already saved as plain numbers lost their "+" (and read
// back as "9198…" or "1571…"), and payments only carry the bare national
// number — both come back here with their country code. A bare 10-digit
// number with no country code is Indian.
export const formatPhoneForSheet = (value: string) => {
  const digits = phoneDigits(value);

  if (!digits) {
    return "";
  }

  // A bare 10-digit number (or 0 + 10 digits) is an Indian mobile — try
  // India first for those, or e.g. "8610795569" would read as a +86
  // (China) number. Anything longer already carries its country code.
  const isBareIndian = digits.length === 10 || (digits.length === 11 && digits.startsWith("0"));
  const candidates = isBareIndian
    ? [parsePhoneNumberFromString(digits, "IN"), parsePhoneNumberFromString(`+${digits}`)]
    : [parsePhoneNumberFromString(`+${digits}`), parsePhoneNumberFromString(digits, "IN")];
  const parsed = candidates.find((candidate) => candidate?.isValid());

  return parsed ? parsed.number : `+${digits}`;
};

const phoneCell = (value: string) => asPlainText(formatPhoneForSheet(value));

// row.save() rewrites every cell in the row, Phone included, so a number
// written as text on the first insert would be re-parsed as a number —
// dropping its leading "+" — on every later status update. Re-mark it as
// text (and restore the "+country code") just before saving.
const keepPhoneAsText = (row: { get: (key: string) => string; set: (key: string, value: string) => void }) => {
  row.set("Phone", phoneCell(row.get("Phone") ?? ""));
};

// Column layout for the online-masterclass sheet. Online is a single
// one-time payment, so there's no advance/installment ledger here — just
// the registration details plus where that one payment stands. The tab is
// created with exactly this header row on first write if it doesn't exist
// yet, so a fresh cohort needs no manual sheet setup.
export const ONLINE_SHEET_HEADERS = [
  "Timestamp",
  "Name",
  "Phone",
  "Email",
  "City",
  "State",
  "Instagram",
  "ExperienceMonths",
  "Course",
  "PAN",
  "GSTIN",
  "BillingName",
  "BillingAddress",
  "Amount",
  "PaymentStatus",
  "MerchantTxnNo",
  "BankTxnID",
  "PaidAt",
  "UpdatedAt",
];

type SheetTarget = {
  sheetId: string;
  tabName: string;
  // Only the online tab is ever auto-created. The offline tab predates
  // this and is renamed by hand each cohort — silently creating a blank
  // one there on a typo'd tab name would hide the misconfiguration.
  createWithHeaders?: string[];
};

const offlineTarget = (): SheetTarget => ({
  sheetId: env.googleSheetId,
  tabName: env.googleSheetsTabName,
});

const onlineTarget = (): SheetTarget => ({
  sheetId: env.googleSheetsOnlineSheetId,
  tabName: env.googleSheetsOnlineTabName,
  createWithHeaders: ONLINE_SHEET_HEADERS,
});

const isConfigured = (target: SheetTarget) =>
  Boolean(env.googleSheetsClientEmail && env.googleSheetsPrivateKey && target.sheetId);

const sheetPromises = new Map<string, Promise<GoogleSpreadsheetWorksheet>>();

const loadSheet = async (target: SheetTarget) => {
  const jwt = new JWT({
    email: env.googleSheetsClientEmail,
    key: env.googleSheetsPrivateKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(target.sheetId, jwt);
  await doc.loadInfo();

  const tab = doc.sheetsByTitle[target.tabName];

  if (tab) {
    return tab;
  }

  if (target.createWithHeaders) {
    logger.info("Creating missing Google Sheets tab.", { tabName: target.tabName });
    return doc.addSheet({
      title: target.tabName,
      headerValues: target.createWithHeaders,
      gridProperties: {
        rowCount: 1000,
        columnCount: target.createWithHeaders.length,
        frozenRowCount: 1,
      },
    });
  }

  throw new Error(`Sheet tab "${target.tabName}" not found in spreadsheet ${target.sheetId}.`);
};

const getSheet = (target: SheetTarget) => {
  const key = `${target.sheetId}::${target.tabName}`;
  let promise = sheetPromises.get(key);

  if (!promise) {
    promise = loadSheet(target).catch((error) => {
      // Let the next call retry from scratch instead of caching a rejected
      // promise forever (e.g. the sheet wasn't shared with the service
      // account yet at boot time).
      sheetPromises.delete(key);
      throw error;
    });
    sheetPromises.set(key, promise);
  }

  return promise;
};

// Never lets a Sheets outage or misconfiguration break registration/payment
// processing — every call here is best-effort and swallows its own errors.
export const appendRegistrationRow = async (row: {
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  courseName: string;
  variant: string;
  advanceAmount: number;
  pan: string;
  gstin: string;
  // Who the GST invoice should actually be billed to — falls back to the
  // registrant's own name when no GST invoice was requested.
  billerName: string;
  secondInstallmentTotal: number;
  // Only written to the online sheet, which has columns for them.
  instagramHandle?: string;
  experienceMonths?: number | null;
  billingAddress?: string;
}) => {
  if (row.variant === "online") {
    await appendOnlineRegistrationRow(row);
    return;
  }

  const target = offlineTarget();

  if (!isConfigured(target)) {
    return;
  }

  try {
    const tab = await getSheet(target);
    await tab.addRow({
      Timestamp: new Date().toISOString(),
      Name: row.name,
      Phone: phoneCell(row.phone),
      Email: row.email,
      City: row.city,
      State: row.state,
      Course: row.courseName,
      Variant: row.variant,
      PAN: row.pan,
      GSTIN: row.gstin,
      BillingName: row.billerName || row.name,
      MerchantTxnNo: "",
      AdvanceAmount: row.advanceAmount,
      AdvancePaymentStatus: "UNPAID",
      SecondInstallmentTotal: row.secondInstallmentTotal,
      SecondInstallmentPaid: 0,
      SecondInstallmentRemaining: row.secondInstallmentTotal,
      UpdatedAt: "",
    });
  } catch (error) {
    logger.error("Failed to append registration row to Google Sheets.", {
      message: error instanceof Error ? error.message : "unknown error",
    });
  }
};

// One-time backfill/resync helper (see scripts/backfill-sheet.ts and
// scripts/resync-sheet.ts) — inserts a fully-populated row for a
// pre-existing registration, computed with whatever status it already has.
export const upsertFullRegistrationRow = async (row: {
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  state?: string;
  courseName: string;
  variant: string;
  pan: string;
  gstin: string;
  billerName?: string;
  advanceMerchantTxnNo: string;
  advanceAmount: number;
  advanceStatusText: string;
  secondInstallmentTotal: number;
  secondInstallmentPaid: number;
  secondInstallmentRemaining: number;
}): Promise<{ added: boolean; reason?: string }> => {
  const target = offlineTarget();

  if (!isConfigured(target)) {
    return { added: false, reason: "Google Sheets is not configured." };
  }

  try {
    const tab = await getSheet(target);
    const rows = await tab.getRows();
    const alreadyExists = rows.some(
      (existing) =>
        isSamePhone(existing.get("Phone") ?? "", row.phone) &&
        existing.get("Course") === row.courseName,
    );

    if (alreadyExists) {
      return { added: false, reason: "Row already exists for this phone/course." };
    }

    await tab.addRow({
      Timestamp: row.createdAt,
      Name: row.name,
      Phone: phoneCell(row.phone),
      Email: row.email,
      City: row.city,
      State: row.state || "",
      Course: row.courseName,
      Variant: row.variant,
      PAN: row.pan,
      GSTIN: row.gstin,
      BillingName: row.billerName || row.name,
      MerchantTxnNo: row.advanceMerchantTxnNo,
      AdvanceAmount: row.advanceAmount,
      AdvancePaymentStatus: row.advanceStatusText,
      SecondInstallmentTotal: row.secondInstallmentTotal,
      SecondInstallmentPaid: row.secondInstallmentPaid,
      SecondInstallmentRemaining: row.secondInstallmentRemaining,
      UpdatedAt: new Date().toISOString(),
    });

    return { added: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    logger.error("Failed to backfill registration row to Google Sheets.", { message });
    return { added: false, reason: message };
  }
};

export const upsertPaymentStatusRow = async (input: {
  mobile: string;
  courseName: string;
  variant: "online" | "offline";
  // This transaction's own status and bank reference — only the online
  // sheet records them directly; the offline sheet keeps its ledger form.
  paymentStatus: string;
  txnID?: string;
  advanceMerchantTxnNo?: string;
  advanceAmount?: number;
  advanceStatusText: string;
  secondInstallmentTotal: number;
  secondInstallmentPaid: number;
  secondInstallmentRemaining: number;
}) => {
  if (input.variant === "online") {
    await upsertOnlinePaymentRow(input);
    return;
  }

  const target = offlineTarget();

  if (!isConfigured(target)) {
    return;
  }

  try {
    const tab = await getSheet(target);
    const rows = await tab.getRows();
    const match = rows.find(
      (row) =>
        isSamePhone(row.get("Phone") ?? "", input.mobile) &&
        row.get("Course") === input.courseName,
    );

    const updatedAt = new Date().toISOString();

    if (match) {
      if (input.advanceMerchantTxnNo) {
        match.set("MerchantTxnNo", input.advanceMerchantTxnNo);
      }
      if (input.advanceAmount !== undefined) {
        match.set("AdvanceAmount", input.advanceAmount);
      }
      match.set("AdvancePaymentStatus", input.advanceStatusText);
      match.set("SecondInstallmentTotal", input.secondInstallmentTotal);
      match.set("SecondInstallmentPaid", input.secondInstallmentPaid);
      match.set("SecondInstallmentRemaining", input.secondInstallmentRemaining);
      match.set("UpdatedAt", updatedAt);
      keepPhoneAsText(match);
      await match.save();
      return;
    }

    // No registration row found for this phone/course (edge case — a
    // payment update arrived before/without a matching registration row).
    // Add a partial row rather than silently dropping the update.
    await tab.addRow({
      Timestamp: updatedAt,
      Phone: phoneCell(input.mobile),
      Course: input.courseName,
      MerchantTxnNo: input.advanceMerchantTxnNo || "",
      AdvanceAmount: input.advanceAmount ?? "",
      AdvancePaymentStatus: input.advanceStatusText,
      SecondInstallmentTotal: input.secondInstallmentTotal,
      SecondInstallmentPaid: input.secondInstallmentPaid,
      SecondInstallmentRemaining: input.secondInstallmentRemaining,
      UpdatedAt: updatedAt,
    });
  } catch (error) {
    logger.error("Failed to update payment status in Google Sheets.", {
      message: error instanceof Error ? error.message : "unknown error",
    });
  }
};

const appendOnlineRegistrationRow = async (row: {
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  courseName: string;
  advanceAmount: number;
  pan: string;
  gstin: string;
  billerName: string;
  instagramHandle?: string;
  experienceMonths?: number | null;
  billingAddress?: string;
}) => {
  const target = onlineTarget();

  if (!isConfigured(target)) {
    return;
  }

  try {
    const tab = await getSheet(target);
    await tab.addRow({
      Timestamp: new Date().toISOString(),
      Name: row.name,
      Phone: phoneCell(row.phone),
      Email: row.email,
      City: row.city,
      State: row.state,
      Instagram: row.instagramHandle || "",
      ExperienceMonths: row.experienceMonths ?? "",
      Course: row.courseName,
      PAN: row.pan,
      GSTIN: row.gstin,
      BillingName: row.billerName || row.name,
      BillingAddress: row.billingAddress || "",
      Amount: row.advanceAmount,
      PaymentStatus: "REGISTERED",
      MerchantTxnNo: "",
      BankTxnID: "",
      PaidAt: "",
      UpdatedAt: "",
    });
  } catch (error) {
    logger.error("Failed to append online registration row to Google Sheets.", {
      message: error instanceof Error ? error.message : "unknown error",
    });
  }
};

const upsertOnlinePaymentRow = async (input: {
  mobile: string;
  courseName: string;
  paymentStatus: string;
  txnID?: string;
  advanceMerchantTxnNo?: string;
  advanceAmount?: number;
  advanceStatusText: string;
}) => {
  const target = onlineTarget();

  if (!isConfigured(target)) {
    return;
  }

  try {
    const tab = await getSheet(target);
    const rows = await tab.getRows();
    const match = rows.find(
      (row) =>
        isSamePhone(row.get("Phone") ?? "", input.mobile) &&
        row.get("Course") === input.courseName,
    );

    const now = new Date().toISOString();
    const isPaid = input.advanceStatusText === "PAID";
    const isThisAttemptTheSuccess = input.paymentStatus === "SUCCESS";
    const alreadyPaid = match?.get("PaymentStatus") === "PAID";

    // A later abandoned/failed retry must never overwrite the row of the
    // attempt that actually paid — once a row says PAID, only the paying
    // transaction itself may touch it again.
    if (alreadyPaid && !isThisAttemptTheSuccess) {
      return;
    }

    const fields: Record<string, string | number> = {
      PaymentStatus: isPaid ? "PAID" : input.paymentStatus,
      UpdatedAt: now,
    };

    if (input.advanceMerchantTxnNo) {
      fields.MerchantTxnNo = input.advanceMerchantTxnNo;
      fields.BankTxnID = input.txnID || "";
    }

    if (input.advanceAmount !== undefined) {
      fields.Amount = input.advanceAmount;
    }

    if (isThisAttemptTheSuccess) {
      fields.PaidAt = now;
    }

    if (match) {
      match.assign(fields);
      keepPhoneAsText(match);
      await match.save();
      return;
    }

    // Payment arrived without a registration row (shouldn't happen — the
    // registration form is required first). Keep the update rather than
    // dropping it, so nothing paid is ever missing from the sheet.
    await tab.addRow({
      Timestamp: now,
      Phone: phoneCell(input.mobile),
      Course: input.courseName,
      ...fields,
    });
  } catch (error) {
    logger.error("Failed to update online payment status in Google Sheets.", {
      message: error instanceof Error ? error.message : "unknown error",
    });
  }
};
