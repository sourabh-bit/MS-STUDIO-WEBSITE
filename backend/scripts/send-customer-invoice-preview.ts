// One-off preview — looks up a real customer's ADVANCE payment in the
// database and sends the invoice, built from their actual stored data, to
// a test inbox (not the customer). Does not touch the invoice-number
// counter or mark the payment as invoiced — this is a preview only, the
// real send happens automatically via applyStatus() in payment.service.ts.
// Run with:
//   npx tsx scripts/send-customer-invoice-preview.ts "<customer name>" <test-email>
import { connectToDatabase } from "../src/db/connect.js";
import { sendInvoiceEmail } from "../src/lib/mailer.js";
import { Payment } from "../src/models/Payment.js";
import { renderInvoicePdf } from "../src/services/invoice.service.js";

const main = async () => {
  const [customerName, testEmail] = process.argv.slice(2);

  if (!customerName || !testEmail) {
    console.error('Usage: npx tsx scripts/send-customer-invoice-preview.ts "<customer name>" <test-email>');
    process.exit(1);
  }

  await connectToDatabase();

  const payment = await Payment.findOne({
    customerName: new RegExp(customerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
    paymentType: "ADVANCE",
  }).sort({ createdAt: -1 });

  if (!payment) {
    console.error(`No ADVANCE payment found for a customer matching "${customerName}".`);
    process.exit(1);
  }

  console.log("Found payment:", {
    merchantTxnNo: payment.merchantTxnNo,
    customerName: payment.customerName,
    email: payment.email,
    mobile: payment.mobile,
    amount: payment.amount,
    courseName: payment.courseName,
    variant: payment.variant,
    paymentStatus: payment.paymentStatus,
    address: payment.address,
    city: payment.city,
    state: payment.state,
    stateCode: payment.stateCode,
    gstin: payment.gstin,
    pan: payment.pan,
    invoiceNo: payment.invoiceNo || "(not yet issued)",
    createdAt: payment.createdAt,
  });

  const variantLabel = payment.variant === "offline" ? "Offline" : "Online";
  const invoiceNo = payment.invoiceNo || "MSB-B2C/PREVIEW";

  const pdfBuffer = await renderInvoicePdf({
    invoiceNo,
    invoiceDate: (payment.createdAt as Date).toISOString(),
    name: payment.customerName,
    address: payment.address || "",
    city: payment.city || "",
    state: payment.state || "",
    stateCode: payment.stateCode || "07",
    gstin: payment.gstin || "",
    pan: payment.pan || "",
    items: [
      {
        description: `${payment.courseName} (${variantLabel}) — Advance Payment`,
        hsn: "999293",
        amount: payment.amount,
      },
    ],
  });

  await sendInvoiceEmail(testEmail, {
    invoiceNo,
    customerName: payment.customerName,
    courseName: payment.courseName,
    amount: payment.amount,
    pdfBuffer,
  });

  console.log(`Sent preview invoice (${invoiceNo}) to ${testEmail}.`);
  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
