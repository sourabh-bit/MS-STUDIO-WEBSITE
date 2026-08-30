// One-time backfill: pushes existing (pre-Sheets-integration) registrations
// for the offline masterclass into the Google Sheet, computing each
// student's real advance/second-installment status from the database —
// exactly the same way the live app does, via getPaymentSummary.
//
// Safe to re-run: upsertFullRegistrationRow skips any row that already
// exists (matched by Phone + Course), so nothing gets duplicated.
//
// Run from the backend/ directory with whatever MONGODB_URI is currently
// set in .env — point it at production for the real backfill, then switch
// it back afterward:
//
//   npx tsx scripts/backfill-sheet.ts

import { connectToDatabase } from "../src/db/connect.js";
import { upsertFullRegistrationRow } from "../src/lib/sheets.js";
import { Payment } from "../src/models/Payment.js";
import { Registration } from "../src/models/Registration.js";
import { getPaymentSummary } from "../src/services/payment.service.js";

const COURSE_NAME = "Meera Sakhrani Offline Masterclass";

const ADVANCE_TYPE_FILTER = { $or: [{ paymentType: "ADVANCE" }, { paymentType: { $exists: false } }] };

const run = async () => {
  await connectToDatabase();

  const registrations = await Registration.find({ courseName: COURSE_NAME }).sort({ createdAt: 1 });

  console.log(`Found ${registrations.length} existing registration(s) for "${COURSE_NAME}".\n`);

  let added = 0;
  let skipped = 0;

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

    const advanceStatusText = summary.advance.status === "PAID" ? "PAID" : "UNPAID";

    const remainingStatusText =
      summary.advance.status !== "PAID"
        ? "LOCKED"
        : summary.secondInstallment.status === "PAID"
          ? "PAID"
          : summary.secondInstallment.status === "PARTIAL"
            ? `PARTIAL (₹${summary.secondInstallment.amountPaid.toLocaleString("en-IN")} / ₹${summary.secondInstallment.totalAmount.toLocaleString("en-IN")})`
            : "UNPAID";

    const result = await upsertFullRegistrationRow({
      createdAt: (registration.createdAt as Date).toISOString(),
      name: registration.name,
      phone: registration.phone,
      email: registration.email,
      city: registration.city || "",
      courseName: COURSE_NAME,
      variant,
      amount: registration.amount,
      pan: registration.pan,
      gstin: registration.gstin || "",
      advanceMerchantTxnNo: advancePayment ? advancePayment.txnID || advancePayment.merchantTxnNo : "",
      advanceStatusText,
      remainingStatusText,
    });

    if (result.added) {
      added += 1;
      console.log(`✓ Added ${registration.phone} (${registration.name}) — advance: ${advanceStatusText}, remaining: ${remainingStatusText}`);
    } else {
      skipped += 1;
      console.log(`- Skipped ${registration.phone} (${registration.name}) — ${result.reason}`);
    }
  }

  console.log(`\nDone. Added ${added}, skipped ${skipped}.`);
  process.exit(0);
};

run().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
