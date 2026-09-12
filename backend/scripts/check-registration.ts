// Read-only lookup — finds Registration records matching a phone (last 10
// digits) and/or name, to compare against a Payment record's mobile field.
// Run with: npx tsx scripts/check-registration.ts <search>
import { connectToDatabase } from "../src/db/connect.js";
import { Registration } from "../src/models/Registration.js";

const main = async () => {
  const search = process.argv[2];

  if (!search) {
    console.error("Usage: npx tsx scripts/check-registration.ts <phone-or-name>");
    process.exit(1);
  }

  await connectToDatabase();

  const last10 = search.replace(/\D/g, "").slice(-10);
  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  const registrations = await Registration.find({
    $or: [{ phone: { $regex: last10 || search } }, { name: regex }],
  }).sort({ createdAt: -1 });

  if (registrations.length === 0) {
    console.log("No matching registrations found.");
  }

  for (const reg of registrations) {
    console.log({
      name: reg.name,
      phone: reg.phone,
      email: reg.email,
      courseName: reg.courseName,
      variant: reg.variant,
      createdAt: reg.createdAt,
    });
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
