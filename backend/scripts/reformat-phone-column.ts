// One-time pass — rewrites every existing Phone cell as forced plain text
// (same apostrophe-prefix fix now used for all new writes in sheets.ts),
// so cells written before today's fix stop being at risk of Google Sheets
// silently reformatting them into scientific notation later.
// Dry-run by default. Pass --apply to actually write.
//   npx tsx scripts/reformat-phone-column.ts          (dry run)
//   npx tsx scripts/reformat-phone-column.ts --apply  (writes)
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

import { env } from "../src/config/env.js";

const APPLY = process.argv.includes("--apply");

const main = async () => {
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
  console.log(APPLY ? "Running with --apply: changes WILL be written.\n" : "Dry run — no changes will be written (pass --apply to write).\n");

  let changed = 0;

  for (const row of rows) {
    const phone = row.get("Phone");

    if (!phone) {
      continue;
    }

    // Re-writing an already-text cell as text again is a harmless no-op —
    // there's no reliable way to tell from the read-back value alone
    // whether a cell is already text or still a number (the apostrophe
    // signal never appears in the value once read back), so this just
    // applies to every row with a Phone value rather than guessing.
    console.log(`  Row #${row.rowNumber} (${row.get("Name") || "(orphan)"}): "${phone}"`);

    if (APPLY) {
      row.set("Phone", `'${phone}`);
      await row.save();
    }

    changed += 1;
  }

  console.log(`\n${APPLY ? "Reformatted" : "Would reformat"} ${changed} row(s) out of ${rows.length} total.`);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
