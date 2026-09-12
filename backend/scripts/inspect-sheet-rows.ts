// Read-only diagnostic — dumps the raw field values (with exact string
// lengths and char codes for Phone/Course) for every sheet row matching a
// name or phone, to catch subtle mismatches (whitespace, encoding) that a
// simple console.log of the string wouldn't reveal.
// Run with: npx tsx scripts/inspect-sheet-rows.ts <search>
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

import { env } from "../src/config/env.js";

const describe = (label: string, value: string | undefined) => {
  const v = value ?? "";
  const codes = [...v].map((c) => c.charCodeAt(0)).join(",");
  console.log(`    ${label}: "${v}" (len=${v.length}, codes=[${codes}])`);
};

const main = async () => {
  const search = process.argv[2];

  if (!search) {
    console.error("Usage: npx tsx scripts/inspect-sheet-rows.ts <search>");
    process.exit(1);
  }

  const jwt = new JWT({
    email: env.googleSheetsClientEmail,
    key: env.googleSheetsPrivateKey.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(env.googleSheetId, jwt);
  await doc.loadInfo();

  const tab = doc.sheetsByTitle[env.googleSheetsTabName];
  if (!tab) {
    console.error(`Sheet tab "${env.googleSheetsTabName}" not found.`);
    process.exit(1);
  }

  const rows = await tab.getRows();
  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const matches = rows.filter(
    (row) => regex.test(row.get("Name") ?? "") || (row.get("Phone") ?? "").includes(search.replace(/\D/g, "")),
  );

  console.log(`Found ${matches.length} row(s) matching "${search}" (out of ${rows.length} total).\n`);

  for (const row of matches) {
    console.log(`Row #${row.rowNumber}:`);
    describe("Name", row.get("Name"));
    describe("Phone", row.get("Phone"));
    describe("Course", row.get("Course"));
    describe("Variant", row.get("Variant"));
    describe("MerchantTxnNo", row.get("MerchantTxnNo"));
    describe("AdvancePaymentStatus", row.get("AdvancePaymentStatus"));
    describe("Timestamp", row.get("Timestamp"));
    describe("UpdatedAt", row.get("UpdatedAt"));
    console.log("");
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
