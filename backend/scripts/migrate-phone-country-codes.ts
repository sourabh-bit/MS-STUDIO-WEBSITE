// One-time backfill: existing phone/mobile values predate country-code
// support and are stored as bare digits (implicitly Indian, since the OTP
// widget and SMS sending were both hardcoded to India-only until now).
// Prefixes them with "+91" so they match the new E.164 normalisation in
// otp.ts and returning Indian customers keep matching their existing
// User/Registration/Payment records on login.
//
// Dry-run by default — prints what WOULD change with no writes. Pass
// --apply to actually write.
//   npx tsx scripts/migrate-phone-country-codes.ts          (dry run)
//   npx tsx scripts/migrate-phone-country-codes.ts --apply  (writes)
import { connectToDatabase } from "../src/db/connect.js";
import { Payment } from "../src/models/Payment.js";
import { Registration } from "../src/models/Registration.js";
import { User } from "../src/models/User.js";

const APPLY = process.argv.includes("--apply");
const SAMPLE_SIZE = 5;

type Target = {
  label: string;
  model: typeof User | typeof Registration | typeof Payment;
  field: "phone" | "mobile";
};

const TARGETS: Target[] = [
  { label: "User.phone", model: User, field: "phone" },
  { label: "Registration.phone", model: Registration, field: "phone" },
  { label: "Payment.mobile", model: Payment, field: "mobile" },
];

const migrateTarget = async ({ label, model, field }: Target) => {
  const filter = {
    [field]: { $exists: true, $ne: "", $not: /^\+/ },
  };

  const matches = await model.find(filter).select({ [field]: 1 }).lean();

  console.log(`\n=== ${label}: ${matches.length} record(s) missing a country code ===`);

  if (matches.length === 0) {
    return;
  }

  for (const doc of matches.slice(0, SAMPLE_SIZE)) {
    const before = (doc as Record<string, unknown>)[field] as string;
    console.log(`  ${before}  ->  +91${before}`);
  }

  if (matches.length > SAMPLE_SIZE) {
    console.log(`  ...and ${matches.length - SAMPLE_SIZE} more.`);
  }

  if (!APPLY) {
    return;
  }

  let updated = 0;
  for (const doc of matches) {
    const before = (doc as Record<string, unknown>)[field] as string;
    await model.updateOne({ _id: doc._id }, { $set: { [field]: `+91${before}` } });
    updated += 1;
  }

  console.log(`  Applied: updated ${updated} record(s).`);
};

const main = async () => {
  await connectToDatabase();

  console.log(APPLY ? "Running with --apply: changes WILL be written.\n" : "Dry run — no changes will be written (pass --apply to write).\n");

  for (const target of TARGETS) {
    await migrateTarget(target);
  }

  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
