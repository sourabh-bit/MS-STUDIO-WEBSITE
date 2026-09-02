// Manual preview — sends the current invoice email design (with a
// due-balance block, so you see the full layout) to whatever address you
// give it. Doesn't touch the database. Run with:
//   npx tsx scripts/preview-invoice-email.ts you@example.com
import { sendInvoiceEmail } from "../src/lib/mailer.js";
import { renderInvoicePdf } from "../src/services/invoice.service.js";

const main = async () => {
  const to = process.argv[2];

  if (!to) {
    console.error("Usage: npx tsx scripts/preview-invoice-email.ts you@example.com");
    process.exit(1);
  }

  const pdfBuffer = await renderInvoicePdf({
    invoiceNo: "MSB-B2C/PREVIEW",
    invoiceDate: new Date().toISOString(),
    name: "Priya Sharma",
    city: "Delhi",
    state: "Delhi",
    stateCode: "07",
    gstRate: 18,
    items: [{ description: "Offline Masterclass — Advance Payment", hsn: "999293", amount: 84745.76 }],
  });

  await sendInvoiceEmail(to, {
    invoiceNo: "MSB-B2C/PREVIEW",
    customerName: "Priya Sharma",
    courseName: "Meera Sakhrani Offline Masterclass",
    amount: 100000,
    pdfBuffer,
    remainingAmount: 136000,
    payRemainingUrl: "https://meerasakhrani.in/classes/checkout?variant=offline&course=Meera+Sakhrani+Offline+Masterclass&installment=second",
  });

  console.log(`Sent invoice email preview to ${to}.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
