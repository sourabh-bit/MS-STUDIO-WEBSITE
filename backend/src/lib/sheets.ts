import { JWT } from "google-auth-library";
import { GoogleSpreadsheet, type GoogleSpreadsheetWorksheet } from "google-spreadsheet";

import { env } from "../config/env.js";
import { logger } from "./logger.js";

// Must match the sheet's actual header row (row 1) exactly:
// Timestamp | Name | Phone | Email | City | Course | Variant | PAN | GSTIN
// | BillingName | MerchantTxnNo | AdvanceAmount | AdvancePaymentStatus |
// SecondInstallmentTotal | SecondInstallmentPaid | SecondInstallmentRemaining
// | UpdatedAt
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
  courseName: string;
  variant: string;
  advanceAmount: number;
  pan: string;
  gstin: string;
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
      Phone: row.phone,
      Email: row.email,
      City: row.city,
      Course: row.courseName,
      Variant: row.variant,
      PAN: row.pan,
      GSTIN: row.gstin,
      BillingName: row.name,
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
  courseName: string;
  variant: string;
  pan: string;
  gstin: string;
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
      (existing) => existing.get("Phone") === row.phone && existing.get("Course") === row.courseName,
    );

    if (alreadyExists) {
      return { added: false, reason: "Row already exists for this phone/course." };
    }

    await tab.addRow({
      Timestamp: row.createdAt,
      Name: row.name,
      Phone: row.phone,
      Email: row.email,
      City: row.city,
      Course: row.courseName,
      Variant: row.variant,
      PAN: row.pan,
      GSTIN: row.gstin,
      BillingName: row.name,
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
      (row) => row.get("Phone") === input.mobile && row.get("Course") === input.courseName,
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
      Phone: input.mobile,
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
