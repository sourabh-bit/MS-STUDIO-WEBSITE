// Manual smoke test — renders one sample invoice PDF to disk without
// touching the database or sending an email. Run with:
//   npx tsx scripts/test-invoice.ts
//
// The amount here is what the customer actually paid — GST-inclusive, per
// the checkout page's own Price + GST(18%) = Advance breakdown. The
// taxable line therefore has to be backed out of it (amount / 1.18), not
// the amount itself, or the invoice would overstate the charge by another
// 18% on top of what was really collected.
import fs from "node:fs/promises";
import path from "node:path";

import { renderInvoicePdf } from "../src/services/invoice.service.js";

const GST_RATE = 18;
const amountPaid = 100000;
const taxableAmount = amountPaid / (1 + GST_RATE / 100);

const main = async () => {
  const pdf = await renderInvoicePdf({
    invoiceNo: "MSB-B2C/TEST",
    invoiceDate: new Date().toISOString(),
    name: "Priya Sharma",
    address: "Flat 402, Green Valley, Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    stateCode: "27",
    gstin: "",
    pan: "",
    gstRate: GST_RATE,
    items: [
      {
        description: "Advanced Makeup Course (Offline) — Advance Payment",
        hsn: "999293",
        amount: taxableAmount,
      },
    ],
  });

  const outPath = path.resolve("scripts", "test-invoice-output.pdf");
  await fs.writeFile(outPath, pdf);
  console.log("Wrote", outPath, `(${pdf.length} bytes)`);
  console.log(`Amount paid: ${amountPaid}, taxable backed out: ${taxableAmount.toFixed(2)}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
