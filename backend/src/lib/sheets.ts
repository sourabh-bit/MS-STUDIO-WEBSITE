import { JWT } from "google-auth-library";
import { GoogleSpreadsheet, type GoogleSpreadsheetRow, type GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { parsePhoneNumberFromString } from "libphonenumber-js";

import { env } from "../config/env.js";
import { logger } from "./logger.js";
import { isTestPhone } from "./test-phones.js";

// Must match the sheet's actual header row (row 1) exactly:
// Timestamp | Name | Phone | WhatsApp | Email | City | State | Course | Variant | PAN
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
  "WhatsApp",
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

  // "+91-9986624699" — country code, a dash, then the number.
  return parsed ? `+${parsed.countryCallingCode}-${parsed.nationalNumber}` : `+${digits}`;
};

const phoneCell = (value: string) => asPlainText(formatPhoneForSheet(value));

// Dates in the sheet read like "16 Oct 2026, 7:03 AM", in Indian time —
// not the raw "2026-10-16T01:33:19.674Z". Written as text so Sheets
// doesn't re-format it by its own locale.
// Fixed three-letter months — en-GB writes September as "Sept".
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const IST_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  // h12 = 12, 1, 2 … 11. (en-GB's default 12-hour cycle is 0–11, which
  // printed "0:47 PM" for 12:47 PM.)
  hourCycle: "h12",
});

export const formatSheetDate = (value: Date | string = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "";
  }

  const parts = Object.fromEntries(IST_FORMAT.formatToParts(date).map((part) => [part.type, part.value]));
  const month = MONTHS[Number(parts.month) - 1];
  return `${Number(parts.day)} ${month} ${parts.year}, ${Number(parts.hour)}:${parts.minute} ${String(parts.dayPeriod).toUpperCase()}`;
};

const dateCell = (value?: Date | string) => asPlainText(formatSheetDate(value));

// row.save() rewrites every cell in the row from its displayed text, as if
// typed in. Without a leading apostrophe, Sheets turns "+1-2015517116" into
// the formula 1−2015517116 and "18 Oct 2026, 1:09 PM" into a date number.
// Re-mark the phone and date cells as text just before saving.
const PHONE_COLUMNS = ["Phone", "WhatsApp"];
const DATE_COLUMNS = ["Timestamp", "UpdatedAt", "PaidAt"];

const keepTextCells = (row: {
  get: (key: string) => string;
  set: (key: string, value: string) => void;
  toObject: () => Record<string, unknown>;
}) => {
  const columns = Object.keys(row.toObject());

  for (const column of PHONE_COLUMNS.filter((name) => columns.includes(name))) {
    const value = row.get(column) ?? "";
    if (value) {
      row.set(column, phoneCell(value));
    }
  }

  for (const column of DATE_COLUMNS.filter((name) => columns.includes(name))) {
    const value = row.get(column) ?? "";
    if (value) {
      row.set(column, asPlainText(value));
    }
  }
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
  "WhatsApp",
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

// The worksheet is cached, but its header row is re-read on every use: rows
// are laid out by header position, so a column added or moved in the sheet
// (e.g. WhatsApp after Phone) would otherwise shift every value written by
// an already-running server into the wrong column.
const getSheet = async (target: SheetTarget) => {
  const tab = await getCachedSheet(target);
  await tab.loadHeaderRow();
  return tab;
};

const getCachedSheet = (target: SheetTarget) => {
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

// Real incident: a student paid, yet both her registration row and her
// payment update failed to reach the sheet — each call logged one error and
// gave up, and nobody noticed. Every write now retries with backoff, and
// writes to one spreadsheet run one at a time, so a live update and the
// periodic sync (see services/sheet-sync.service.ts) never read the rows,
// both decide one is missing and both add it.
const SHEET_RETRY_DELAYS_MS = [2000, 5000, 15000, 30000];

const sheetQueues = new Map<string, Promise<unknown>>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const runSheetTask = <T>(target: SheetTarget, label: string, task: () => Promise<T>): Promise<T> => {
  const run = async () => {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await task();
      } catch (error) {
        // A stale cached worksheet (tab renamed, auth expired) would fail
        // every retry the same way — load it fresh next time.
        sheetPromises.delete(`${target.sheetId}::${target.tabName}`);

        if (attempt >= SHEET_RETRY_DELAYS_MS.length) {
          throw error;
        }

        logger.warn(`${label} failed — retrying.`, {
          attempt: attempt + 1,
          message: error instanceof Error ? error.message : "unknown error",
        });
        await sleep(SHEET_RETRY_DELAYS_MS[attempt]);
      }
    }
  };

  const previous = sheetQueues.get(target.sheetId) ?? Promise.resolve();
  const result = previous.then(run, run);
  sheetQueues.set(target.sheetId, result.catch(() => undefined));
  return result;
};

const findRow = (rows: GoogleSpreadsheetRow[], phone: string, courseName: string) =>
  rows.find((row) => isSamePhone(row.get("Phone") ?? "", phone) && row.get("Course") === courseName);

// Never lets a Sheets outage or misconfiguration break registration/payment
// processing — every call here is best-effort and swallows its own errors.
export const appendRegistrationRow = async (row: {
  name: string;
  phone: string;
  whatsappNumber?: string;
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
  // Team test numbers never reach the sheets (see lib/test-phones.ts).
  if (isTestPhone(row.phone)) {
    return;
  }

  if (row.variant === "online") {
    await appendOnlineRegistrationRow(row);
    return;
  }

  const target = offlineTarget();

  if (!isConfigured(target)) {
    return;
  }

  try {
    await runSheetTask(target, "Appending registration row", async () => {
      const tab = await getSheet(target);

      // A retry after a timed-out attempt that actually went through must
      // not add the same person twice.
      if (findRow(await tab.getRows(), row.phone, row.courseName)) {
        return;
      }

      await tab.addRow({
        Timestamp: dateCell(),
        Name: row.name,
        Phone: phoneCell(row.phone),
        WhatsApp: phoneCell(row.whatsappNumber || row.phone),
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
  whatsappNumber?: string;
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
  if (isTestPhone(row.phone)) {
    return { added: false, reason: "Test phone number — not written to the sheet." };
  }

  const target = offlineTarget();

  if (!isConfigured(target)) {
    return { added: false, reason: "Google Sheets is not configured." };
  }

  try {
    return await runSheetTask(target, "Backfilling registration row", async () => {
      const tab = await getSheet(target);

      if (findRow(await tab.getRows(), row.phone, row.courseName)) {
        return { added: false, reason: "Row already exists for this phone/course." };
      }

      await tab.addRow({
        Timestamp: dateCell(row.createdAt),
        Name: row.name,
        Phone: phoneCell(row.phone),
        WhatsApp: phoneCell(row.whatsappNumber || row.phone),
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
        UpdatedAt: dateCell(),
      });

      return { added: true };
    });
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
  if (isTestPhone(input.mobile)) {
    return;
  }

  if (input.variant === "online") {
    await upsertOnlinePaymentRow(input);
    return;
  }

  const target = offlineTarget();

  if (!isConfigured(target)) {
    return;
  }

  try {
    await runSheetTask(target, "Updating payment status row", async () => {
      const tab = await getSheet(target);
      const match = findRow(await tab.getRows(), input.mobile, input.courseName);

      const updatedAt = dateCell();

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
        keepTextCells(match);
        await match.save();
        return;
      }

      // No registration row found for this phone/course (edge case — a
      // payment update arrived before/without a matching registration row).
      // Add a partial row rather than silently dropping the update; the
      // periodic sync fills in the rest of the details.
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
    });
  } catch (error) {
    logger.error("Failed to update payment status in Google Sheets.", {
      message: error instanceof Error ? error.message : "unknown error",
    });
  }
};

// One online student as the sheet shows them — what a live registration
// writes and what the periodic sync rebuilds from the database.
export type OnlineSheetEntry = {
  createdAt: Date | string;
  name: string;
  phone: string;
  whatsappNumber?: string;
  email: string;
  city: string;
  state: string;
  instagramHandle?: string;
  experienceMonths?: number | null;
  courseName: string;
  pan: string;
  gstin: string;
  billerName: string;
  billingAddress?: string;
  advanceAmount: number;
  paymentStatus: string;
  merchantTxnNo?: string;
  bankTxnId?: string;
  paidAt?: Date | string | null;
};

const onlineRowValues = (entry: OnlineSheetEntry) => ({
  Timestamp: dateCell(entry.createdAt),
  Name: entry.name,
  Phone: phoneCell(entry.phone),
  WhatsApp: phoneCell(entry.whatsappNumber || entry.phone),
  Email: entry.email,
  City: entry.city,
  State: entry.state,
  Instagram: entry.instagramHandle || "",
  ExperienceMonths: entry.experienceMonths ?? "",
  Course: entry.courseName,
  PAN: entry.pan,
  GSTIN: entry.gstin,
  BillingName: entry.billerName || entry.name,
  BillingAddress: entry.billingAddress || "",
  Amount: entry.advanceAmount,
  PaymentStatus: entry.paymentStatus,
  MerchantTxnNo: entry.merchantTxnNo || "",
  BankTxnID: entry.bankTxnId || "",
  PaidAt: entry.paidAt ? dateCell(entry.paidAt) : "",
  UpdatedAt: entry.paymentStatus === "REGISTERED" ? "" : dateCell(),
});

const appendOnlineRegistrationRow = async (row: {
  name: string;
  phone: string;
  whatsappNumber?: string;
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
    await runSheetTask(target, "Appending online registration row", async () => {
      const tab = await getSheet(target);

      // A retry after a timed-out attempt that actually went through must
      // not add the same person twice.
      if (findRow(await tab.getRows(), row.phone, row.courseName)) {
        return;
      }

      await tab.addRow(onlineRowValues({ ...row, createdAt: new Date(), paymentStatus: "REGISTERED" }));
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
    await runSheetTask(target, "Updating online payment status row", async () => {
      const tab = await getSheet(target);
      const match = findRow(await tab.getRows(), input.mobile, input.courseName);

      const now = dateCell();
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
        keepTextCells(match);
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
    });
  } catch (error) {
    logger.error("Failed to update online payment status in Google Sheets.", {
      message: error instanceof Error ? error.message : "unknown error",
    });
  }
};

// ---------------------------------------------------------------------------
// Periodic sync (online sheet — the class currently running): the database
// is the source of truth, the sheet a copy the team works from.
// services/sheet-sync.service.ts hands every student to syncOnlineSheet,
// which adds whoever is missing and corrects where their payment
// stands — so a write that failed, or a row deleted by mistake, is back
// within one sweep. Rows are never deleted, and only the payment columns
// (plus the details of a half-filled row) are ever overwritten, so the
// team's own notes and edits stay put.

export type SheetSyncResult = { added: string[]; updated: string[] };

// Reads formatSheetDate's own "3 Nov 2026, 2:49 PM" (Indian time) back.
const parseSheetDate = (value: string) => {
  const match = /^(\d{1,2}) ([A-Za-z]{3}) (\d{4}), (\d{1,2}):(\d{2}) (AM|PM)$/i.exec(value.trim().replace(/^'/, ""));
  const month = match ? MONTHS.findIndex((name) => name.toLowerCase() === match[2].toLowerCase()) : -1;

  if (!match || month < 0) {
    return null;
  }

  const hour = (Number(match[4]) % 12) + (match[6].toUpperCase() === "PM" ? 12 : 0);
  return Date.UTC(Number(match[3]), month, Number(match[1]), hour, Number(match[5])) - 330 * 60 * 1000;
};

// Each cohort gets a fresh (or renamed) tab, while the database keeps every
// past student — so only those who registered since the tab's first row
// belong on it. A day's slack still catches the cohort's own first row
// going missing. An empty tab is left alone: there is nothing yet to say
// which cohort it is for.
const COHORT_SLACK_MS = 24 * 60 * 60 * 1000;

const cohortStart = (rows: GoogleSpreadsheetRow[]) => {
  const times = rows
    .map((row) => parseSheetDate(row.get("Timestamp") ?? ""))
    .filter((time): time is number => time !== null);

  return times.length > 0 ? Math.min(...times) - COHORT_SLACK_MS : null;
};

const studentLabel = (name: string, phone: string) => `${name || "(no name)"} ${formatPhoneForSheet(phone)}`;

const numberOf = (value: unknown) => Number(String(value ?? "").replace(/[^\d.]/g, "") || 0);

const pick = (values: Record<string, string | number>, columns: string[]) =>
  Object.fromEntries(columns.map((column) => [column, values[column]]));

type SheetValues = Record<string, string | number>;

const syncTab = async <T extends { createdAt: Date | string; name: string; phone: string; courseName: string }>(
  target: SheetTarget,
  label: string,
  entries: T[],
  newRow: (entry: T) => SheetValues,
  changesFor: (row: GoogleSpreadsheetRow, entry: T) => SheetValues,
  dryRun: boolean,
): Promise<SheetSyncResult | null> => {
  if (!isConfigured(target)) {
    return null;
  }

  return runSheetTask(target, `Syncing ${label}`, async () => {
    const tab = await getSheet(target);
    const rows = await tab.getRows();
    const since = cohortStart(rows);
    const result: SheetSyncResult = { added: [], updated: [] };

    if (since === null) {
      logger.warn(`Skipped syncing ${label} — the tab has no rows yet to tell which cohort it is for.`, {
        tabName: target.tabName,
      });
      return result;
    }

    for (const entry of entries) {
      if (isTestPhone(entry.phone) || new Date(entry.createdAt).getTime() < since) {
        continue;
      }

      const row = findRow(rows, entry.phone, entry.courseName);

      if (!row) {
        result.added.push(studentLabel(entry.name, entry.phone));

        if (!dryRun) {
          rows.push(await tab.addRow(newRow(entry)));
        }
        continue;
      }

      const changes = changesFor(row, entry);

      if (Object.keys(changes).length === 0) {
        continue;
      }

      result.updated.push(`${studentLabel(entry.name, entry.phone)}: ${Object.keys(changes).join(", ")}`);

      if (!dryRun) {
        row.assign({ ...changes, UpdatedAt: dateCell() });
        keepTextCells(row);
        await row.save();
      }
    }

    return result;
  });
};

const ONLINE_DETAIL_COLUMNS = [
  "Timestamp", "Name", "WhatsApp", "Email", "City", "State", "Instagram",
  "ExperienceMonths", "PAN", "GSTIN", "BillingName", "BillingAddress",
];

export const syncOnlineSheet = (entries: OnlineSheetEntry[], dryRun = false) =>
  syncTab(onlineTarget(), "the online sheet", entries, onlineRowValues, (row, entry) => {
    // A row with no name was added by a payment update that found no
    // registration row — fill in who it is.
    const changes: SheetValues = row.get("Name") ? {} : pick(onlineRowValues(entry), ONLINE_DETAIL_COLUMNS);

    if ((row.get("PaymentStatus") ?? "") !== entry.paymentStatus) {
      changes.PaymentStatus = entry.paymentStatus;
    }

    if (entry.merchantTxnNo && (row.get("MerchantTxnNo") ?? "") !== entry.merchantTxnNo) {
      changes.MerchantTxnNo = entry.merchantTxnNo;
    }

    if (entry.paymentStatus === "PAID") {
      if (entry.bankTxnId && (row.get("BankTxnID") ?? "") !== entry.bankTxnId) {
        changes.BankTxnID = entry.bankTxnId;
      }

      if (entry.paidAt && !row.get("PaidAt")) {
        changes.PaidAt = dateCell(entry.paidAt);
      }

      if (numberOf(row.get("Amount")) !== entry.advanceAmount) {
        changes.Amount = entry.advanceAmount;
      }
    }

    return changes;
  }, dryRun);
