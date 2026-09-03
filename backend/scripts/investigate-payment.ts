// Read-only investigation for a "customer says they were charged but our
// system shows otherwise" report — dumps a payment's full record and
// transaction log history. Makes no changes.
// Run with: npx tsx scripts/investigate-payment.ts <merchantTxnNo>
import { connectToDatabase } from "../src/db/connect.js";
import { Payment } from "../src/models/Payment.js";

const main = async () => {
  const merchantTxnNo = process.argv[2];

  if (!merchantTxnNo) {
    console.error("Usage: npx tsx scripts/investigate-payment.ts <merchantTxnNo>");
    process.exit(1);
  }

  await connectToDatabase();

  const payment = await Payment.findOne({ merchantTxnNo });

  if (!payment) {
    console.log(`No payment found for merchantTxnNo ${merchantTxnNo}.`);
    process.exit(0);
  }

  console.log("=== Payment record ===");
  console.log({
    merchantTxnNo: payment.merchantTxnNo,
    txnID: payment.txnID,
    customerName: payment.customerName,
    email: payment.email,
    mobile: payment.mobile,
    amount: payment.amount,
    courseName: payment.courseName,
    variant: payment.variant,
    paymentType: payment.paymentType,
    paymentStatus: payment.paymentStatus,
    invoiceNo: payment.invoiceNo || "(none)",
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  });

  console.log("\n=== Last gatewayResponse on file ===");
  console.log(payment.gatewayResponse || "(none)");

  console.log("\n=== Transaction log history ===");
  for (const log of payment.transactionLogs || []) {
    console.log(`[${(log as { timestamp: Date }).timestamp?.toISOString?.() || ""}] ${(log as { stage: string }).stage}: ${(log as { message: string }).message}`);
  }

  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
