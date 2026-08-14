import { env } from "../config/env.js";
import { reconcilePendingPayments } from "../services/payment.service.js";
import { logger } from "./logger.js";

// The safety net: if the browser return never arrives (tab closed
// mid-payment) and the advice webhook isn't registered with the bank yet
// (or was missed), this is what still catches the payment — just on a
// delay instead of instantly.
export const startReconciliationScheduler = () => {
  if (!env.iciciMerchantId || !env.iciciSecretKey) {
    logger.warn("Skipping payment reconciliation scheduler — ICICI is not configured.");
    return;
  }

  const run = async () => {
    try {
      await reconcilePendingPayments();
    } catch (error) {
      logger.error("Payment reconciliation sweep failed.", {
        message: error instanceof Error ? error.message : "unknown error",
      });
    }
  };

  setInterval(run, env.reconcileIntervalMs);
  logger.info("Payment reconciliation scheduler started.", {
    intervalMs: env.reconcileIntervalMs,
    staleAfterMs: env.reconcileStaleAfterMs,
  });
};
