import express, { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  initiatePaymentHandler,
  paymentAdviceHandler,
  paymentReturnHandler,
  paymentStatusHandler,
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

export const paymentRouter = Router();

paymentRouter.post("/initiate", requireAuth, initiateLimiter, jsonBody, initiatePaymentHandler);
paymentRouter.post("/return", rawGatewayBody, paymentReturnHandler);
paymentRouter.post("/advice", rawGatewayBody, paymentAdviceHandler);
paymentRouter.get("/status/:merchantTxnNo", requireAuth, paymentStatusHandler);
paymentRouter.get("/status", requireAuth, paymentStatusHandler);
paymentRouter.post("/:merchantTxnNo/refund", requireAdmin, jsonBody, refundPaymentHandler);
