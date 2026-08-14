import { Router } from "express";
import rateLimit from "express-rate-limit";

import { createRegistrationHandler } from "../controllers/registration.controller.js";

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many submissions. Please try again later." },
});

export const registrationRouter = Router();

registrationRouter.post("/", registrationLimiter, createRegistrationHandler);
