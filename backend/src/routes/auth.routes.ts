import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  logoutHandler,
  meHandler,
  requestOtpHandler,
  verifyOtpHandler,
  verifyWidgetHandler,
  widgetConfigHandler,
} from "../controllers/auth.controller.js";

const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

const widgetConfigLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

export const authRouter = Router();

authRouter.post("/otp/request", otpRequestLimiter, requestOtpHandler);
authRouter.post("/otp/verify", otpVerifyLimiter, verifyOtpHandler);
authRouter.post("/widget/verify", otpVerifyLimiter, verifyWidgetHandler);
authRouter.get("/widget/config", widgetConfigLimiter, widgetConfigHandler);
authRouter.get("/me", meHandler);
authRouter.post("/logout", logoutHandler);
