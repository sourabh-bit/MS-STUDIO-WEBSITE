// Checks the online Google Sheet against the database — the same sweep the
// live server runs every 10 minutes (see services/sheet-sync.service.ts).
// Dry run by default: lists the rows it would add or correct, changes
// nothing. Pass --apply to write them.
// Run with: npx tsx scripts/sync-sheets.ts [--apply]
import { syncSheetsWithDatabase } from "../src/services/sheet-sync.service.js";

const main = async () => {
  const dryRun = !process.argv.includes("--apply");
  const result = await syncSheetsWithDatabase({ dryRun });

  console.log(dryRun ? "\nDRY RUN — nothing was changed. Pass --apply to write.\n" : "\nApplied.\n");

  if (!result) {
    console.log("The online sheet is not configured.");
    return;
  }

  console.log(`Online sheet: ${result.added.length} to add, ${result.updated.length} to correct`);
  result.added.forEach((student) => console.log(`  + ${student}`));
  result.updated.forEach((student) => console.log(`  ~ ${student}`));
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
