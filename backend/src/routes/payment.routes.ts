import { Router } from "express";

import {
  initiatePaymentHandler,
  paymentCallbackHandler,
  paymentStatusHandler,
} from "../controllers/payment.controller.js";

export const paymentRouter = Router();

paymentRouter.post("/initiate", initiatePaymentHandler);
paymentRouter.post("/callback", paymentCallbackHandler);
paymentRouter.get("/status/:merchantTxnNo", paymentStatusHandler);
paymentRouter.get("/status", paymentStatusHandler);
