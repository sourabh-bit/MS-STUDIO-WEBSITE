// Manual smoke test — renders a sample invoice and actually sends it via
// Resend, to confirm the API key + sender domain work end-to-end. Run with:
//   npx tsx scripts/test-email.ts you@example.com
import { sendInvoiceEmail } from "../src/lib/mailer.js";
import { renderInvoicePdf } from "../src/services/invoice.service.js";

const main = async () => {
  const to = process.argv[2];

  if (!to) {
    console.error("Usage: npx tsx scripts/test-email.ts you@example.com");
    process.exit(1);
  }

  const pdfBuffer = await renderInvoicePdf({
    invoiceNo: "MSB-B2C/TEST",
    invoiceDate: new Date().toISOString(),
    name: "Priya Sharma",
    address: "Flat 402, Green Valley, Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    stateCode: "27",
    gstin: "",
    pan: "",
    items: [
      {
        description: "Advanced Makeup Course (Offline) — Advance Payment",
        hsn: "999293",
        amount: 50000,
      },
    ],
  });

  await sendInvoiceEmail(to, {
    invoiceNo: "MSB-B2C/TEST",
    customerName: "Priya Sharma",
    courseName: "Advanced Makeup Course",
    amount: 59000,
    pdfBuffer,
  });

  console.log("Sent test invoice email to", to);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
