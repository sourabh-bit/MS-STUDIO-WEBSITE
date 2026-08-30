// One-time cleanup: these mobile numbers are known test data (not real
// students) whose payments got stuck in PENDING during development. Since
// PENDING is non-terminal, the reconcile sweep re-checks them forever —
// every 5 minutes — which keeps recreating bare fallback rows in the
// Google Sheet (no matching registration row exists for them anymore).
//
// Marking them EXPIRED (an existing, real terminal status the app already
// uses for abandoned transactions) stops reconcile from ever touching them
// again. Nothing else about these documents is changed.
//
// Run from the backend/ directory with MONGODB_URI pointed at production:
//
//   npx tsx scripts/expire-test-payments.ts

import { connectToDatabase } from "../src/db/connect.js";
import { Payment } from "../src/models/Payment.js";

const TEST_MOBILES = ["9584337006", "8796363118", "8799770640", "9928069664", "8920135102"];

const run = async () => {
  await connectToDatabase();

  const stuck = await Payment.find({
    mobile: { $in: TEST_MOBILES },
    paymentStatus: { $in: ["INITIATED", "PENDING"] },
  });

  console.log(`Found ${stuck.length} stuck payment(s) for these test numbers.\n`);

  for (const payment of stuck) {
    console.log(`- ${payment.mobile} / ${payment.merchantTxnNo} — was ${payment.paymentStatus}`);
  }

  const result = await Payment.updateMany(
    {
      mobile: { $in: TEST_MOBILES },
      paymentStatus: { $in: ["INITIATED", "PENDING"] },
    },
    {
      $set: { paymentStatus: "EXPIRED", transactionExpiresAt: new Date() },
    },
  );

  console.log(`\nMarked ${result.modifiedCount} payment(s) as EXPIRED. Reconcile will no longer touch them.`);
  process.exit(0);
};

run().catch((error) => {
  console.error("Failed:", error);
  process.exit(1);
});
