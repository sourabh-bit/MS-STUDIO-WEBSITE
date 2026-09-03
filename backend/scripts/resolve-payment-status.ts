// Asks ICICI for the real, current status of a transaction and applies it —
// the exact same function the "Check Now" button and reconcile sweep use.
// Safe and standard: a read on ICICI's side, and on ours only ever applies
// whatever the bank actually reports (so it can correct a wrongly-EXPIRED
// record back to SUCCESS, and will correctly trigger the invoice email in
// that case — it never fabricates a status).
// Run with: npx tsx scripts/resolve-payment-status.ts <merchantTxnNo>
import { connectToDatabase } from "../src/db/connect.js";
import { checkPaymentStatus } from "../src/services/payment.service.js";

const main = async () => {
  const merchantTxnNo = process.argv[2];

  if (!merchantTxnNo) {
    console.error("Usage: npx tsx scripts/resolve-payment-status.ts <merchantTxnNo>");
    process.exit(1);
  }

  await connectToDatabase();

  const result = await checkPaymentStatus(merchantTxnNo);

  console.log("=== ICICI's current answer, applied ===");
  console.log(result);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
