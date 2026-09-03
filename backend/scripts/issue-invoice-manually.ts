// Manually (and properly, awaited to completion) issues the invoice for a
// payment already confirmed SUCCESS — for exactly the situation where the
// normal fire-and-forget trigger never got to finish (e.g. a status was
// corrected by a short-lived script that exited too soon). Refuses to run
// unless the payment is genuinely SUCCESS and doesn't already have an
// invoice, so it can't double-send or invoice something unpaid.
// Run with: npx tsx scripts/issue-invoice-manually.ts <merchantTxnNo>
import { connectToDatabase } from "../src/db/connect.js";
import { Payment } from "../src/models/Payment.js";
import { getPaymentSummary, issueInvoiceForPayment } from "../src/services/payment.service.js";

const main = async () => {
  const merchantTxnNo = process.argv[2];

  if (!merchantTxnNo) {
    console.error("Usage: npx tsx scripts/issue-invoice-manually.ts <merchantTxnNo>");
    process.exit(1);
  }

  await connectToDatabase();

  const payment = await Payment.findOne({ merchantTxnNo });

  if (!payment) {
    console.error(`No payment found for ${merchantTxnNo}.`);
    process.exit(1);
  }

  if (payment.paymentStatus !== "SUCCESS") {
    console.error(`Refusing — paymentStatus is ${payment.paymentStatus}, not SUCCESS.`);
    process.exit(1);
  }

  if (payment.invoiceNo) {
    console.log(`Already has an invoice (${payment.invoiceNo}) — nothing to do.`);
    process.exit(0);
  }

  const ledger = await getPaymentSummary(payment.mobile, payment.courseName, payment.variant as "online" | "offline");

  console.log(`Issuing invoice for ${merchantTxnNo} (${payment.customerName}, ₹${payment.amount})...`);

  await issueInvoiceForPayment(payment, ledger);

  const after = await Payment.findOne({ merchantTxnNo });
  console.log(`Done. invoiceNo: ${after?.invoiceNo}, invoiceSentAt: ${after?.invoiceSentAt}`);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
