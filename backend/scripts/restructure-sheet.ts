// One-time migration: rebuilds the sheet with the new, clearer column
// structure (separate AdvanceAmount / AdvancePaymentStatus /
// SecondInstallmentTotal / SecondInstallmentPaid / SecondInstallmentRemaining
// columns instead of one crammed status string), and repopulates every
// existing registration with fresh, accurate values computed live from the
// database — not by trying to parse the old text.
//
// This clears all existing rows first, so it's a full rebuild, not an
// incremental update. Safe to re-run.
//
// Run from the backend/ directory with MONGODB_URI pointed at production:
//
//   npx tsx scripts/restructure-sheet.ts

import { connectToDatabase } from "../src/db/connect.js";
import { env } from "../src/config/env.js";
import { SHEET_HEADERS } from "../src/lib/sheets.js";
import { Payment } from "../src/models/Payment.js";
import { Registration } from "../src/models/Registration.js";
import { getPaymentSummary } from "../src/services/payment.service.js";
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

const COURSE_NAME = "Meera Sakhrani Offline Masterclass";

const ADVANCE_TYPE_FILTER = { $or: [{ paymentType: "ADVANCE" }, { paymentType: { $exists: false } }] };

const run = async () => {
  await connectToDatabase();

  const jwt = new JWT({
    email: env.googleSheetsClientEmail,
    key: env.googleSheetsPrivateKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const doc = new GoogleSpreadsheet(env.googleSheetId, jwt);
  await doc.loadInfo();
  const tab = doc.sheetsByTitle[env.googleSheetsTabName];

  if (!tab) {
    throw new Error(`Sheet tab "${env.googleSheetsTabName}" not found.`);
  }

  const registrations = await Registration.find({ courseName: COURSE_NAME }).sort({ createdAt: 1 });
  console.log(`Found ${registrations.length} registration(s). Rebuilding sheet...\n`);

  const rowsToWrite = [];

  for (const registration of registrations) {
    const variant = registration.variant === "online" ? "online" : "offline";
    const summary = await getPaymentSummary(registration.phone, COURSE_NAME, variant);

    const advancePayment =
      summary.advance.status === "PAID"
        ? await Payment.findOne({
            mobile: registration.phone,
            courseName: COURSE_NAME,
            variant,
            paymentStatus: "SUCCESS",
            ...ADVANCE_TYPE_FILTER,
          })
        : null;

    rowsToWrite.push({
      Timestamp: (registration.createdAt as Date).toISOString(),
      Name: registration.name,
      Phone: registration.phone,
      Email: registration.email,
      City: registration.city || "",
      State: registration.state || "",
      Course: COURSE_NAME,
      Variant: variant,
      PAN: registration.pan,
      GSTIN: registration.gstin || "",
      BillingName: registration.billerName || registration.name,
      MerchantTxnNo: advancePayment ? advancePayment.txnID || advancePayment.merchantTxnNo : "",
      AdvanceAmount: summary.advance.status === "PAID" ? summary.advance.amount : registration.amount,
      AdvancePaymentStatus: summary.advance.status === "PAID" ? "PAID" : "UNPAID",
      SecondInstallmentTotal: summary.secondInstallment.totalAmount,
      SecondInstallmentPaid: summary.secondInstallment.amountPaid,
      SecondInstallmentRemaining: summary.secondInstallment.remainingAmount,
      UpdatedAt: new Date().toISOString(),
    });

    console.log(
      `- ${registration.phone} (${registration.name}) — advance ${summary.advance.status}, second installment ${summary.secondInstallment.amountPaid}/${summary.secondInstallment.totalAmount}`,
    );
  }

  await tab.clear();
  await tab.setHeaderRow(SHEET_HEADERS);
  if (rowsToWrite.length > 0) {
    await tab.addRows(rowsToWrite);
  }

  console.log(`\nDone. Rebuilt sheet with ${rowsToWrite.length} row(s) and the new column structure.`);
  process.exit(0);
};

run().catch((error) => {
  console.error("Restructure failed:", error);
  process.exit(1);
});
