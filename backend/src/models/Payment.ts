import mongoose, { Schema } from "mongoose";

import type { PaymentLifecycleStatus, PaymentLogStage } from "../types/payment.js";

const paymentLogSchema = new Schema(
  {
    stage: {
      type: String,
      enum: [
        "INITIATE_REQUEST",
        "INITIATE_RESPONSE",
        "REUSED_TRANSACTION",
        "NEW_TRANSACTION_CREATED",
        "TRANSACTION_EXPIRED",
        "CALLBACK_RECEIVED",
        "CALLBACK_VERIFIED",
        "CALLBACK_HASH_MISMATCH",
        "STATUS_API_VERIFICATION_STARTED",
        "STATUS_API_VERIFIED_SUCCESS",
        "STATUS_API_VERIFIED_FAILED",
        "STATUS_REQUEST",
        "STATUS_RESPONSE",
        "REDIRECT",
      ] satisfies PaymentLogStage[],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const paymentSchema = new Schema(
  {
    merchantTxnNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    txnID: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    variant: {
      type: String,
      enum: ["online", "offline"],
      required: true,
    },
    feeLabel: {
      type: String,
      default: "",
    },
    summaryLabel: {
      type: String,
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: [
        "CREATED",
        "INITIATED",
        "PENDING",
        "SUCCESS",
        "FAILED",
        "CANCELLED",
        "EXPIRED",
        "HASH_MISMATCH",
        "ERROR",
      ] satisfies PaymentLifecycleStatus[],
      default: "CREATED",
      index: true,
    },
    redirectURI: {
      type: String,
      default: "",
    },
    tranCtx: {
      type: String,
      default: "",
    },
    transactionExpiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    gatewayRequest: {
      type: Schema.Types.Mixed,
      default: null,
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
      default: null,
    },
    transactionLogs: {
      type: [paymentLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ email: 1, mobile: 1, amount: 1, createdAt: -1 });

export type PaymentDocument = mongoose.HydratedDocument<
  mongoose.InferSchemaType<typeof paymentSchema>
>;

export const Payment =
  mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema, "payments");
