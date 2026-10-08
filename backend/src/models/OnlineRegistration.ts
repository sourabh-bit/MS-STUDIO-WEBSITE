import mongoose, { Schema } from "mongoose";

import { env } from "../config/env.js";
import { registrationSchema } from "./Registration.js";

export const ONLINE_ENROLMENT_STATUSES = [
  "REGISTERED",
  "CREATED",
  "INITIATED",
  "PENDING",
  "PAID",
  "FAILED",
  "CANCELLED",
  "EXPIRED",
  "HASH_MISMATCH",
  "ERROR",
  "REFUNDED",
] as const;

// Same registration form fields as the offline course, plus where this
// student's (single, one-time) payment stands — kept in sync from
// payment.service whenever a payment for them changes, so this collection
// alone answers "who registered and who has actually paid".
const onlineRegistrationSchema = registrationSchema.clone();

onlineRegistrationSchema.add({
  paymentStatus: {
    type: String,
    enum: ONLINE_ENROLMENT_STATUSES,
    default: "REGISTERED",
    index: true,
  },
  amountPaid: { type: Number, default: 0 },
  merchantTxnNo: { type: String, default: "", trim: true },
  bankTxnId: { type: String, default: "", trim: true },
  paidAt: { type: Date, default: null },
  invoiceNo: { type: String, default: "", trim: true },
});

// One registration per person per course — also the backstop if two
// submissions race each other past the service-level duplicate check.
onlineRegistrationSchema.index({ phone: 1, courseName: 1 }, { unique: true });

// A separate database on the same cluster connection (no second login or
// connection pool). useCache returns the same handle on every import.
const onlineDb = mongoose.connection.useDb(env.mongodbOnlineDbName, { useCache: true });

export const OnlineRegistration =
  onlineDb.models.Registration || onlineDb.model("Registration", onlineRegistrationSchema, "registrations");
