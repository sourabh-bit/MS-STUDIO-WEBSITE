import { classModel } from "../db/class-databases.js";
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

export const OnlineRegistration = classModel("online", "Registration", onlineRegistrationSchema, "registrations");
