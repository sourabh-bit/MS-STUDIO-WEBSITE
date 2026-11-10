import { Router } from "express";
import rateLimit from "express-rate-limit";

import { registerInterestHandler } from "../controllers/interest.controller.js";

// Public (no login), so kept on a tighter limit than the registration form.
const interestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many submissions. Please try again later." },
});

export const interestRouter = Router();

interestRouter.post("/", interestLimiter, registerInterestHandler);
