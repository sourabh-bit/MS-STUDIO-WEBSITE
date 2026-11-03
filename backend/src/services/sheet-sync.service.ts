import { connectToDatabase } from "../db/connect.js";
import { logger } from "../lib/logger.js";
import { syncOnlineSheet, type OnlineSheetEntry } from "../lib/sheets.js";
import { OnlineRegistration } from "../models/OnlineRegistration.js";

// Rebuilds every online student's sheet row from the database and hands
// them to lib/sheets.ts, which adds whoever is missing and corrects payment
// columns that disagree. Real incident behind it: a paid online student never
// reached the sheet because both of her live sheet writes failed — the
// sheet is what the team works from, so it must never be allowed to drift.

type RegistrationRecord = {
  createdAt: Date;
  name: string;
  phone: string;
  whatsappNumber?: string;
  email: string;
  city?: string;
  state?: string;
  country?: string;
  instagramHandle?: string;
  experienceMonths?: number | null;
  courseName: string;
  pan?: string;
  gstin?: string;
  billerName?: string;
  address?: string;
  postalCode?: string;
  amount?: number;
  paymentStatus?: string;
  amountPaid?: number;
  merchantTxnNo?: string;
  bankTxnId?: string;
  paidAt?: Date | null;
};

// Same folding the registration form does for the live row: the sheets
// have no Country column, so it goes into State for anyone outside India.
const stateCell = (registration: RegistrationRecord) =>
  !registration.country || registration.country.toLowerCase() === "india"
    ? registration.state || ""
    : [registration.state, registration.country].filter(Boolean).join(", ");

const onlineEntries = async (): Promise<OnlineSheetEntry[]> => {
  const registrations = await OnlineRegistration.find({}).sort({ createdAt: 1 }).lean<RegistrationRecord[]>();

  return registrations.map((registration) => {
    const isPaid = registration.paymentStatus === "PAID";

    return {
      createdAt: registration.createdAt,
      name: registration.name,
      phone: registration.phone,
      whatsappNumber: registration.whatsappNumber,
      email: registration.email,
      city: registration.city || "",
      state: stateCell(registration),
      instagramHandle: registration.instagramHandle,
      experienceMonths: registration.experienceMonths,
      courseName: registration.courseName,
      pan: registration.pan || "",
      gstin: registration.gstin || "",
      billerName: registration.billerName || "",
      billingAddress: [registration.address, registration.postalCode].filter(Boolean).join(", "),
      advanceAmount: isPaid && registration.amountPaid ? registration.amountPaid : registration.amount || 0,
      paymentStatus: registration.paymentStatus || "REGISTERED",
      merchantTxnNo: registration.merchantTxnNo,
      bankTxnId: registration.bankTxnId,
      paidAt: registration.paidAt,
    };
  });
};

export const syncSheetsWithDatabase = async ({ dryRun = false } = {}) => {
  await connectToDatabase();

  const result = await syncOnlineSheet(await onlineEntries(), dryRun);

  if (result && (result.added.length > 0 || result.updated.length > 0)) {
    logger.warn(
      `${dryRun ? "[dry run] Would fix" : "Fixed"} the online sheet: rows it was missing or had out of date.`,
      result,
    );
  }

  return result;
};
