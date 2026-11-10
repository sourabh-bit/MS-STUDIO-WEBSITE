// Checks the online Google Sheet and both "Register Interest" tabs against
// the database — the same sweep the live server runs every 10 minutes (see
// services/sheet-sync.service.ts).
// Dry run by default: lists the rows it would add or correct, changes
// nothing. Pass --apply to write them.
// Run with: npx tsx scripts/sync-sheets.ts [--apply]
import { syncSheetsWithDatabase } from "../src/services/sheet-sync.service.js";

const main = async () => {
  const dryRun = !process.argv.includes("--apply");
  const { online, interests } = await syncSheetsWithDatabase({ dryRun });

  console.log(dryRun ? "\nDRY RUN — nothing was changed. Pass --apply to write.\n" : "\nApplied.\n");

  const sheets = { "Online sheet": online, "Online interest": interests.online, "Offline interest": interests.offline };

  for (const [label, result] of Object.entries(sheets)) {
    if (!result) {
      console.log(`${label}: not configured or failed (see the log above).`);
      continue;
    }

    console.log(`${label}: ${result.added.length} to add, ${result.updated.length} to correct`);
    result.added.forEach((student) => console.log(`  + ${student}`));
    result.updated.forEach((student) => console.log(`  ~ ${student}`));
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
