import { JWT } from "google-auth-library";
import { GoogleSpreadsheet, type GoogleSpreadsheetWorksheet } from "google-spreadsheet";

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
const lastTenDigits = (value: string) => {
  const trimmed = (value || "").trim();
  const scientific = /^-?\d(?:\.\d+)?e\+?\d+$/i.test(trimmed) ? Number(trimmed) : null;
  const normalised = scientific !== null && Number.isFinite(scientific) ? scientific.toFixed(0) : trimmed;

  return normalised.replace(/\D/g, "").slice(-10);
};

// Forces Sheets to store this as plain text instead of auto-detecting an
// all-digit string as a number — a leading apostrophe is Sheets' own
// documented "treat as text" signal under USER_ENTERED input, and never
// appears in the value itself once read back. This is the actual fix, at
// the point data is written, rather than only working around it on read.
const asPlainText = (value: string) => (value ? `'${value}` : value);

const isConfigured = () =>
  Boolean(env.googleSheetsClientEmail && env.googleSheetsPrivateKey && env.googleSheetId);

let sheetPromise: Promise<GoogleSpreadsheetWorksheet> | null = null;

const loadSheet = async () => {
  const jwt = new JWT({
    email: env.googleSheetsClientEmail,
    key: env.googleSheetsPrivateKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(env.googleSheetId, jwt);
  await doc.loadInfo();

  const tab = doc.sheetsByTitle[env.googleSheetsTabName];

  if (!tab) {
    throw new Error(`Sheet tab "${env.googleSheetsTabName}" not found in spreadsheet ${env.googleSheetId}.`);
  }

  return tab;
};

const getSheet = () => {
  sheetPromise ??= loadSheet().catch((error) => {
    // Let the next call retry from scratch instead of caching a rejected
    // promise forever (e.g. the sheet wasn't shared with the service
    // account yet at boot time).
    sheetPromise = null;
    throw error;
  });

  return sheetPromise;
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
}) => {
  if (!isConfigured()) {
    return;
  }

  try {
    const tab = await getSheet();
    await tab.addRow({
      Timestamp: new Date().toISOString(),
      Name: row.name,
      Phone: asPlainText(row.phone),
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
  if (!isConfigured()) {
    return { added: false, reason: "Google Sheets is not configured." };
  }

  try {
    const tab = await getSheet();
    const rows = await tab.getRows();
    const alreadyExists = rows.some(
      (existing) =>
        lastTenDigits(existing.get("Phone") ?? "") === lastTenDigits(row.phone) &&
        existing.get("Course") === row.courseName,
    );

    if (alreadyExists) {
      return { added: false, reason: "Row already exists for this phone/course." };
    }

    await tab.addRow({
      Timestamp: row.createdAt,
      Name: row.name,
      Phone: asPlainText(row.phone),
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
  advanceMerchantTxnNo?: string;
  advanceAmount?: number;
  advanceStatusText: string;
  secondInstallmentTotal: number;
  secondInstallmentPaid: number;
  secondInstallmentRemaining: number;
}) => {
  if (!isConfigured()) {
    return;
  }

  try {
    const tab = await getSheet();
    const rows = await tab.getRows();
    const match = rows.find(
      (row) =>
        lastTenDigits(row.get("Phone") ?? "") === lastTenDigits(input.mobile) &&
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
      await match.save();
      return;
    }

    // No registration row found for this phone/course (edge case — a
    // payment update arrived before/without a matching registration row).
    // Add a partial row rather than silently dropping the update.
    await tab.addRow({
      Timestamp: updatedAt,
      Phone: asPlainText(input.mobile),
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
