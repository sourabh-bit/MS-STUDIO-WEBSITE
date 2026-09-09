// One-time cleanup for the sheets.ts phone-matching bug (fixed in
// src/lib/sheets.ts): a payment-status update whose mobile didn't
// exact-match the registration row's Phone column got silently inserted
// as a partial "orphan" row (blank Name/Email, just Phone + Course +
// payment fields) instead of updating the real row in place. This left
// the real registration row stuck on its original (usually UNPAID)
// status even after a successful, invoiced payment.
//
// For every row with a blank Name but a non-blank Phone, finds the real
// registration row for the same person (same last-10-digits of phone +
// same Course), copies the orphan's payment fields onto it, and deletes
// the orphan row.
//
// Dry-run by default — prints what WOULD change with no writes. Pass
// --apply to actually write.
//   npx tsx scripts/cleanup-orphaned-sheet-rows.ts          (dry run)
//   npx tsx scripts/cleanup-orphaned-sheet-rows.ts --apply  (writes)
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

import { env } from "../src/config/env.js";

const APPLY = process.argv.includes("--apply");

const lastTenDigits = (value: string) => (value || "").replace(/\D/g, "").slice(-10);

const PAYMENT_FIELDS = [
  "MerchantTxnNo",
  "AdvanceAmount",
  "AdvancePaymentStatus",
  "SecondInstallmentTotal",
  "SecondInstallmentPaid",
  "SecondInstallmentRemaining",
  "UpdatedAt",
] as const;

const main = async () => {
  if (!env.googleSheetsClientEmail || !env.googleSheetsPrivateKey || !env.googleSheetId) {
    console.error("Google Sheets is not configured (missing client email / private key / sheet id).");
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

  const orphans = rows.filter((row) => !row.get("Name") && row.get("Phone"));
  const named = rows.filter((row) => row.get("Name"));

  console.log(APPLY ? "Running with --apply: changes WILL be written.\n" : "Dry run — no changes will be written (pass --apply to write).\n");
  console.log(`Found ${orphans.length} orphan row(s) out of ${rows.length} total rows.\n`);

  let merged = 0;
  let unmatched = 0;

  for (const orphan of orphans) {
    const orphanPhone = lastTenDigits(orphan.get("Phone"));
    const course = orphan.get("Course");

    const target = named.find(
      (row) => lastTenDigits(row.get("Phone")) === orphanPhone && row.get("Course") === course,
    );

    if (!target) {
      unmatched += 1;
      console.log(`  NO MATCH for orphan row (Phone=${orphan.get("Phone")}, Course=${course}) — leaving as-is for manual review.`);
      continue;
    }

    console.log(`  ${target.get("Name")} (${target.get("Phone")}, ${course}):`);
    for (const field of PAYMENT_FIELDS) {
      const before = target.get(field);
      const after = orphan.get(field);
      if (after !== undefined && after !== "" && after !== before) {
        console.log(`    ${field}: "${before ?? ""}" -> "${after}"`);
      }
    }

    if (APPLY) {
      for (const field of PAYMENT_FIELDS) {
        const after = orphan.get(field);
        if (after !== undefined && after !== "") {
          target.set(field, after);
        }
      }
      await target.save();
      await orphan.delete();
    }

    merged += 1;
  }

  console.log(`\n${APPLY ? "Merged" : "Would merge"} ${merged} row(s); ${unmatched} unmatched (left as-is).`);
  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
