// One-time cleanup: some production Payment documents grew to ~2MB each
// because their transactionLogs array was never capped (every reconcile
// sweep / status poll on a stuck non-terminal payment appended another
// full gateway request/response payload, forever). The appendLog fix in
// payment.service.ts now caps this going forward — this script trims the
// *existing* oversized documents down to the same limit, keeping only the
// most recent entries (nothing else on the documents is touched).
//
// Safe to re-run: once an array is at or under the limit, $slice is a
// no-op for it.
//
// Run from the backend/ directory with MONGODB_URI pointed at production:
//
//   npx tsx scripts/trim-transaction-logs.ts

import { connectToDatabase } from "../src/db/connect.js";

const MAX_TRANSACTION_LOG_ENTRIES = 50;

const run = async () => {
  const connection = await connectToDatabase();
  const db = connection.db;

  if (!db) {
    throw new Error("No database handle from connectToDatabase().");
  }

  const sizeAgg = async () => {
    const result = await db
      .collection("payments")
      .aggregate([{ $group: { _id: null, totalSize: { $sum: { $bsonSize: "$$ROOT" } }, count: { $sum: 1 } } }])
      .toArray();
    return result[0] || { totalSize: 0, count: 0 };
  };

  const before = await sizeAgg();
  console.log(`Before: ${before.count} payment document(s), ${(before.totalSize / 1024 / 1024).toFixed(2)} MB total.`);

  const result = await db.collection("payments").updateMany({}, [
    { $set: { transactionLogs: { $slice: ["$transactionLogs", -MAX_TRANSACTION_LOG_ENTRIES] } } },
  ]);

  console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}.`);

  const after = await sizeAgg();
  console.log(`After: ${after.count} payment document(s), ${(after.totalSize / 1024 / 1024).toFixed(2)} MB total.`);

  process.exit(0);
};

run().catch((error) => {
  console.error("Trim failed:", error);
  process.exit(1);
});
