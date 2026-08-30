import express, { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  initiatePaymentHandler,
  paymentAdviceHandler,
  paymentReturnHandler,
  paymentStatusHandler,
  paymentSummaryHandler,
  refundPaymentHandler,
} from "../controllers/payment.controller.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { requireAuth } from "../middleware/require-auth.js";

const initiateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many payment attempts. Please try again later." },
});

// This router is mounted before the app-level express.json()/urlencoded()
// parsers (see server.ts) so it owns body parsing for every payment route —
// that's what makes the raw-body capture below reliable.
const jsonBody = express.json();

// Raw body capture for the two bank-initiated endpoints: they may arrive as
// application/x-www-form-urlencoded or application/json depending on
// payment mode, and guessing wrong with express.json()/urlencoded() alone
// silently drops the payload instead of erroring.
const rawGatewayBody = express.raw({ type: "*/*", limit: "1mb" });

// Bank-initiated only: the browser's redirect back from ICICI's hosted
// payment page, and their server-to-server advice webhook. Neither is a
// same-origin call from our own frontend, so this router is mounted in
// server.ts *before* the global CORS middleware — otherwise our own CORS
// policy (built for our frontend's origin, not ICICI's) rejects the
// return redirect outright before it ever reaches paymentReturnHandler.
export const paymentCallbackRouter = Router();

paymentCallbackRouter.post("/return", rawGatewayBody, paymentReturnHandler);
paymentCallbackRouter.post("/advice", rawGatewayBody, paymentAdviceHandler);

export const paymentRouter = Router();

paymentRouter.post("/initiate", requireAuth, initiateLimiter, jsonBody, initiatePaymentHandler);
paymentRouter.get("/status/:merchantTxnNo", requireAuth, paymentStatusHandler);
paymentRouter.get("/status", requireAuth, paymentStatusHandler);
paymentRouter.get("/summary", requireAuth, paymentSummaryHandler);
paymentRouter.post("/:merchantTxnNo/refund", requireAdmin, jsonBody, refundPaymentHandler);
