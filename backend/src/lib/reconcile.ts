import { env } from "../config/env.js";
import { reconcilePendingPayments } from "../services/payment.service.js";
import { syncSheetsWithDatabase } from "../services/sheet-sync.service.js";
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

// The same safety net for the online Google Sheet: any registration or payment
// whose live sheet write failed is put right on the next sweep. Runs once
// shortly after boot too, so a deploy fixes anything missed while it was down.
export const startSheetSyncScheduler = () => {
  if (!env.sheetSyncIntervalMs) {
    logger.info("Sheet sync scheduler is off (SHEET_SYNC_INTERVAL_MS).");
    return;
  }

  const run = async () => {
    try {
      await syncSheetsWithDatabase();
    } catch (error) {
      logger.error("Sheet sync sweep failed.", {
        message: error instanceof Error ? error.message : "unknown error",
      });
    }
  };

  setTimeout(run, 30 * 1000);
  setInterval(run, env.sheetSyncIntervalMs);
  logger.info("Sheet sync scheduler started.", { intervalMs: env.sheetSyncIntervalMs });
};
