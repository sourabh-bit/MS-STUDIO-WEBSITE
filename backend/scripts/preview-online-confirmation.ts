// Local preview of the online masterclass's payment confirmation — writes
// the email (HTML + plain text) and the GST invoice PDF to a folder instead
// of sending anything. Doesn't touch the database or Resend. Run with:
//   npx tsx scripts/preview-online-confirmation.ts ./preview-out
import fs from "node:fs";
import path from "node:path";

import { getCourseAdvanceFee, ONLINE_CLASS_DETAILS } from "../src/config/courses.js";
import { buildInvoiceEmail } from "../src/lib/mailer.js";
import { renderInvoicePdf } from "../src/services/invoice.service.js";

const COURSE_NAME = "Meera Sakhrani Online Masterclass";
const INVOICE_NO = "MSB-B2C/PREVIEW";

const main = async () => {
  const outDir = path.resolve(process.argv[2] || "preview-out");
  fs.mkdirSync(outDir, { recursive: true });

  const amount = getCourseAdvanceFee(COURSE_NAME);
  const taxable = Math.round((amount / 1.18) * 100) / 100;

  const pdfBuffer = await renderInvoicePdf({
    invoiceNo: INVOICE_NO,
    invoiceDate: new Date().toISOString(),
    name: "Priya Sharma",
    city: "Delhi",
    state: "Delhi",
    stateCode: "07",
    pan: "ABCDE1234F",
    gstRate: 18,
    items: [{ description: `${COURSE_NAME} (Online) — Course Fee`, hsn: "999293", amount: taxable }],
  });

  const email = buildInvoiceEmail({
    invoiceNo: INVOICE_NO,
    customerName: "Priya Sharma",
    courseName: COURSE_NAME,
    amount,
    pdfBuffer,
    classDetails: ONLINE_CLASS_DETAILS,
  });

  fs.writeFileSync(path.join(outDir, "online-confirmation-email.html"), email.html);
  fs.writeFileSync(path.join(outDir, "online-confirmation-email.txt"), `Subject: ${email.subject}\n\n${email.text}`);
  fs.writeFileSync(path.join(outDir, "online-invoice.pdf"), pdfBuffer);

  console.log(`Wrote preview to ${outDir}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
