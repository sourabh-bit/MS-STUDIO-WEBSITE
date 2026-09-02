// One-off lookup — searches the Payment collection for customer names
// matching any of the given words (case-insensitive, any order).
// Run with: npx tsx scripts/find-customer.ts Revati Pawar
import { connectToDatabase } from "../src/db/connect.js";
import { Payment } from "../src/models/Payment.js";

const main = async () => {
  const words = process.argv.slice(2);

  if (words.length === 0) {
    console.error("Usage: npx tsx scripts/find-customer.ts <word1> [word2] ...");
    process.exit(1);
  }

  await connectToDatabase();

  const regexes = words.map((word) => new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));

  const payments = await Payment.find({
    $or: regexes.map((regex) => ({ customerName: regex })),
  })
    .sort({ createdAt: -1 })
    .limit(20);

  if (payments.length === 0) {
    console.log("No matches found.");
    return;
  }

  for (const payment of payments) {
    console.log({
      customerName: payment.customerName,
      email: payment.email,
      mobile: payment.mobile,
      amount: payment.amount,
      courseName: payment.courseName,
      variant: payment.variant,
      paymentType: payment.paymentType,
      paymentStatus: payment.paymentStatus,
      createdAt: payment.createdAt,
    });
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
