// Read-only — lists every Payment document for a given mobile number, to
// spot multiple attempts (e.g. an earlier stale one before the "real" one).
// Run with: npx tsx scripts/list-payments-by-mobile.ts <mobile>
import { connectToDatabase } from "../src/db/connect.js";
import { Payment } from "../src/models/Payment.js";

const main = async () => {
  const mobile = process.argv[2];

  if (!mobile) {
    console.error("Usage: npx tsx scripts/list-payments-by-mobile.ts <mobile>");
    process.exit(1);
  }

  await connectToDatabase();

  const payments = await Payment.find({ mobile }).sort({ createdAt: 1 });

  console.log(`Found ${payments.length} payment(s) for mobile ${mobile}.\n`);

  for (const payment of payments) {
    console.log({
      merchantTxnNo: payment.merchantTxnNo,
      paymentStatus: payment.paymentStatus,
      paymentType: payment.paymentType,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    });
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
