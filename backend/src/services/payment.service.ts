import axios, { AxiosError } from "axios";
import crypto from "node:crypto";

import { env } from "../config/env.js";
import { connectToDatabase } from "../db/connect.js";
import { logger } from "../lib/logger.js";
import { Payment, type PaymentDocument } from "../models/Payment.js";
import type {
  GatewayPayload,
  InitiatePaymentInput,
  InitiateSaleResponse,
  PaymentLifecycleStatus,
  PaymentLogStage,
} from "../types/payment.js";
import {
  attachSecureHash,
  buildInitiateSaleRequest,
  buildRedirectUrl,
  buildStatusCheckRequest,
  isPendingPayment,
  isSuccessfulPayment,
  normaliseGatewayPayload,
  verifyCallbackSecureHash,
  verifyInitiateSaleResponse,
  verifySecureHash,
} from "../utils/icici.js";

const ICICI_HTTP_TIMEOUT_MS = 30000;
const INITIATED_REUSE_WINDOW_MS = 90 * 1000;

const iciciClient = axios.create({
  timeout: ICICI_HTTP_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const sanitizeForLogs = (payload: Record<string, unknown>) => {
  const clone = { ...payload };

  if ("secureHash" in clone) {
    clone.secureHash = "[REDACTED]";
  }

  return clone;
};

const serializeAxiosErrorData = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "Unable to serialize Axios error response.";
  }
};

const createMerchantTxnNo = () =>
  `MS${Date.now()}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

const buildTransactionExpiry = () =>
  new Date(Date.now() + INITIATED_REUSE_WINDOW_MS);

const resolvePaymentStatus = (payload: GatewayPayload): PaymentLifecycleStatus => {
  if (isSuccessfulPayment(payload)) {
    return "SUCCESS";
  }

  if (isPendingPayment(payload)) {
    return "PENDING";
  }

  return "FAILED";
};

const fetchVerifiedGatewayStatus = async (
  payment: PaymentDocument,
  stage: "STATUS_REQUEST" | "STATUS_API_VERIFICATION_STARTED",
) => {
  const statusRequest = buildStatusCheckRequest({
    merchantId: env.iciciMerchantId,
    aggregatorID: env.iciciAggregatorId,
    merchantTxnNo: payment.merchantTxnNo,
    originalTxnNo: payment.merchantTxnNo,
  });

  const signedRequest = attachSecureHash(statusRequest, env.iciciSecretKey);

  await appendLog(
    payment.merchantTxnNo,
    stage,
    stage === "STATUS_REQUEST"
      ? "Status check request created."
      : "Status API verification started after callback hash mismatch.",
    sanitizeForLogs(signedRequest),
  );

  const response = await iciciClient.post<Record<string, unknown>>(
    env.iciciStatusUrl,
    signedRequest,
  );

  const payload = normaliseGatewayPayload(response.data);

  await appendLog(
    payment.merchantTxnNo,
    "STATUS_RESPONSE",
    "Status check response received.",
    sanitizeForLogs(payload),
  );

  if (!verifySecureHash(payload, env.iciciSecretKey)) {
    payment.paymentStatus = "HASH_MISMATCH";
    payment.gatewayResponse = payload;
    payment.transactionExpiresAt = null;
    await payment.save();

    throw new Error("ICICI status response hash verification failed.");
  }

  const resolvedStatus = resolvePaymentStatus(payload);

  payment.paymentStatus = resolvedStatus;
  payment.txnID = payload.txnID || payment.txnID;
  payment.gatewayResponse = payload;
  payment.transactionExpiresAt = null;
  await payment.save();

  return {
    paymentStatus: resolvedStatus,
    payload,
    txnID: payment.txnID,
  };
};

const appendLog = async (
  merchantTxnNo: string,
  stage: PaymentLogStage,
  message: string,
  payload?: unknown,
) => {
  await Payment.updateOne(
    { merchantTxnNo },
    {
      $push: {
        transactionLogs: {
          stage,
          message,
          payload,
          timestamp: new Date(),
        },
      },
    },
  );
};

const buildFrontendRedirect = (
  pathname: "/success" | "/failure",
  payment: Pick<
    PaymentDocument,
    | "merchantTxnNo"
    | "txnID"
    | "customerName"
    | "amount"
    | "courseName"
    | "variant"
    | "feeLabel"
    | "summaryLabel"
  >,
  statusMessage?: string,
) => {
  const redirectUrl = new URL(pathname, env.frontendBaseUrl);

  redirectUrl.searchParams.set("merchantTxnNo", payment.merchantTxnNo);
  redirectUrl.searchParams.set("txn", payment.txnID || payment.merchantTxnNo);
  redirectUrl.searchParams.set("name", payment.customerName);
  redirectUrl.searchParams.set("amount", payment.amount.toFixed(2));
  redirectUrl.searchParams.set("course", payment.courseName);
  redirectUrl.searchParams.set("variant", payment.variant);

  if (payment.feeLabel) {
    redirectUrl.searchParams.set("feeLabel", payment.feeLabel);
  }

  if (payment.summaryLabel) {
    redirectUrl.searchParams.set("summaryLabel", payment.summaryLabel);
  }

  if (statusMessage) {
    redirectUrl.searchParams.set("message", statusMessage);
  }

  return redirectUrl.toString();
};

const expireStaleInitiatedTransactions = async (input: InitiatePaymentInput) => {
  const now = new Date();
  const staleInitiatedPayments = await Payment.find({
    email: input.email.toLowerCase(),
    mobile: input.mobile,
    amount: input.amount,
    courseName: input.courseName,
    paymentStatus: "INITIATED",
    redirectURI: { $ne: "" },
    tranCtx: { $ne: "" },
    $or: [
      { transactionExpiresAt: { $lte: now } },
      { transactionExpiresAt: null },
      { transactionExpiresAt: { $exists: false } },
    ],
  }).sort({ createdAt: -1 });

  for (const payment of staleInitiatedPayments) {
    payment.paymentStatus = "EXPIRED";
    payment.transactionExpiresAt = now;
    await payment.save();

    await appendLog(
      payment.merchantTxnNo,
      "TRANSACTION_EXPIRED",
      "Marked stale initiated transaction as expired before creating a new one.",
      {
        expiredAt: now.toISOString(),
        previousStatus: "INITIATED",
      },
    );
  }
};

const findReusableTransaction = async (input: InitiatePaymentInput) => {
  const now = new Date();

  return Payment.findOne({
    email: input.email.toLowerCase(),
    mobile: input.mobile,
    amount: input.amount,
    courseName: input.courseName,
    paymentStatus: "INITIATED",
    redirectURI: { $ne: "" },
    tranCtx: { $ne: "" },
    transactionExpiresAt: { $gt: now },
  }).sort({ createdAt: -1 });
};

const createPaymentRecord = async (input: InitiatePaymentInput) =>
  Payment.create({
    merchantTxnNo: createMerchantTxnNo(),
    customerName: input.customerName,
    email: input.email.toLowerCase(),
    mobile: input.mobile,
    amount: input.amount,
    courseName: input.courseName,
    variant: input.variant,
    feeLabel: input.feeLabel,
    summaryLabel: input.summaryLabel,
    paymentStatus: "CREATED",
    transactionExpiresAt: null,
  });

export const initiatePayment = async (input: InitiatePaymentInput) => {
  await connectToDatabase();

  await expireStaleInitiatedTransactions(input);

  const existingPayment = await findReusableTransaction(input);

  if (existingPayment) {
    const redirectUrl = buildRedirectUrl(
      existingPayment.redirectURI,
      existingPayment.tranCtx,
    );

    await appendLog(
      existingPayment.merchantTxnNo,
      "REUSED_TRANSACTION",
      "Reused a still-valid initiated transaction within the short timeout window.",
      {
        redirectUrl,
        expiresAt: existingPayment.transactionExpiresAt?.toISOString() || null,
      },
    );

    return {
      merchantTxnNo: existingPayment.merchantTxnNo,
      redirectUrl,
      reused: true,
    };
  }

  const payment = await createPaymentRecord(input);

  await appendLog(
    payment.merchantTxnNo,
    "NEW_TRANSACTION_CREATED",
    "Created a fresh payment transaction.",
    {
      reason: "No reusable initiated transaction found within the timeout window.",
    },
  );

  const initiateRequest = buildInitiateSaleRequest({
    merchantId: env.iciciMerchantId,
    aggregatorID: env.iciciAggregatorId,
    merchantTxnNo: payment.merchantTxnNo,
    amount: input.amount,
    customerEmailID: input.email.toLowerCase(),
    returnURL: env.iciciReturnUrl,
    customerMobileNo: input.mobile,
    customerName: input.customerName,
  });

  const signedRequest = attachSecureHash(initiateRequest, env.iciciSecretKey);

  await Payment.updateOne(
    { merchantTxnNo: payment.merchantTxnNo },
    { gatewayRequest: signedRequest },
  );

  await appendLog(
    payment.merchantTxnNo,
    "INITIATE_REQUEST",
    "Initiate sale request created.",
    sanitizeForLogs(signedRequest),
  );

  logger.info("Sending initiateSale request to ICICI.", {
    merchantTxnNo: payment.merchantTxnNo,
  });

  try {
    const response = await iciciClient.post<InitiateSaleResponse>(
      env.iciciInitiateSaleUrl,
      signedRequest,
    );

    await appendLog(
      payment.merchantTxnNo,
      "INITIATE_RESPONSE",
      "Initiate sale response received.",
      sanitizeForLogs(response.data as Record<string, unknown>),
    );

    if (!verifyInitiateSaleResponse(response.data, env.iciciSecretKey)) {
      await Payment.updateOne(
        { merchantTxnNo: payment.merchantTxnNo },
        {
          paymentStatus: "HASH_MISMATCH",
          gatewayResponse: response.data,
        },
      );

      throw new Error("ICICI initiateSale response hash verification failed.");
    }

    if (response.data.responseCode !== "R1000") {
      await Payment.updateOne(
        { merchantTxnNo: payment.merchantTxnNo },
        {
          paymentStatus: "FAILED",
          gatewayResponse: response.data,
        },
      );

      throw new Error(
        `ICICI initiateSale failed with responseCode ${response.data.responseCode}.`,
      );
    }

    const redirectUrl = buildRedirectUrl(
      response.data.redirectURI,
      response.data.tranCtx,
    );

    await Payment.updateOne(
      { merchantTxnNo: payment.merchantTxnNo },
      {
        paymentStatus: "INITIATED",
        redirectURI: response.data.redirectURI,
        tranCtx: response.data.tranCtx,
        transactionExpiresAt: buildTransactionExpiry(),
        gatewayResponse: response.data,
      },
    );

    await appendLog(
      payment.merchantTxnNo,
      "REDIRECT",
      "Redirect URL generated for hosted payment page.",
      { redirectUrl },
    );

    return {
      merchantTxnNo: payment.merchantTxnNo,
      redirectUrl,
      reused: false,
    };
  } catch (error) {
    const message =
      error instanceof AxiosError
        ? serializeAxiosErrorData(error.response?.data) || error.message
        : error instanceof Error
          ? error.message
          : "Unknown ICICI initiateSale error.";

    await Payment.updateOne(
      { merchantTxnNo: payment.merchantTxnNo },
      {
        paymentStatus: "ERROR",
        transactionExpiresAt: null,
      },
    );

    logger.error("Failed to initiate ICICI payment.", {
      merchantTxnNo: payment.merchantTxnNo,
      message,
    });

    throw error;
  }
};

export const processPaymentCallback = async (
  rawPayload: Record<string, unknown>,
) => {
  await connectToDatabase();

  const payload = normaliseGatewayPayload(rawPayload);
  const merchantTxnNo = payload.merchantTxnNo;

  if (!merchantTxnNo) {
    throw new Error("Callback payload is missing merchantTxnNo.");
  }

  const payment = await Payment.findOne({ merchantTxnNo });

  if (!payment) {
    throw new Error(`Payment not found for merchantTxnNo ${merchantTxnNo}.`);
  }

  await appendLog(
    merchantTxnNo,
    "CALLBACK_RECEIVED",
    "ICICI callback payload received.",
    sanitizeForLogs(payload),
  );

  const callbackHashVerification = verifyCallbackSecureHash(
    payload,
    env.iciciSecretKey,
  );
  const isHashValid = callbackHashVerification.isValid;

  logger.info("DEBUG ICICI callback secureHash verification.", {
    merchantTxnNo,
    payloadKeys: callbackHashVerification.payloadKeys,
    sortedCallbackKeys: callbackHashVerification.sortedKeys,
    verificationString: callbackHashVerification.verificationString,
    generatedHash: callbackHashVerification.generatedHash,
    receivedSecureHash: callbackHashVerification.receivedHash,
  });

  let nextStatus: PaymentLifecycleStatus;
  let statusMessage = payload.txnRespDescription || payload.respDescription || "";

  if (isHashValid) {
    nextStatus = resolvePaymentStatus(payload);

    payment.paymentStatus = nextStatus;
    payment.txnID = payload.txnID || payment.txnID;
    payment.gatewayResponse = payload;
    payment.transactionExpiresAt = null;

    await payment.save();

    await appendLog(
      merchantTxnNo,
      "CALLBACK_VERIFIED",
      "Callback secureHash verified successfully.",
      {
        paymentStatus: nextStatus,
        txnID: payment.txnID,
      },
    );
  } else {
    await appendLog(
      merchantTxnNo,
      "CALLBACK_HASH_MISMATCH",
      "Callback secureHash verification failed. Starting authoritative status API verification.",
      {
        txnID: payload.txnID || payment.txnID || "",
        callbackResponseCode: payload.responseCode || payload.respCode || "",
        callbackDescription:
          payload.txnRespDescription || payload.respDescription || "",
      },
    );

    const verifiedStatus = await fetchVerifiedGatewayStatus(
      payment,
      "STATUS_API_VERIFICATION_STARTED",
    );

    nextStatus = verifiedStatus.paymentStatus;
    statusMessage =
      verifiedStatus.payload.txnRespDescription ||
      verifiedStatus.payload.respDescription ||
      statusMessage;

    await appendLog(
      merchantTxnNo,
      nextStatus === "SUCCESS"
        ? "STATUS_API_VERIFIED_SUCCESS"
        : "STATUS_API_VERIFIED_FAILED",
      nextStatus === "SUCCESS"
        ? "Status API verified the transaction as successful after callback hash mismatch."
        : "Status API verified the transaction as non-successful after callback hash mismatch.",
      {
        paymentStatus: nextStatus,
        txnID: verifiedStatus.txnID,
        gatewayResponse: sanitizeForLogs(verifiedStatus.payload),
      },
    );
  }

  const targetPath = nextStatus === "SUCCESS" ? "/success" : "/failure";

  return {
    redirectUrl: buildFrontendRedirect(targetPath, payment, statusMessage),
    paymentStatus: nextStatus,
  };
};

export const checkPaymentStatus = async (merchantTxnNo: string) => {
  await connectToDatabase();

  const payment = await Payment.findOne({ merchantTxnNo });

  if (!payment) {
    throw new Error(`Payment not found for merchantTxnNo ${merchantTxnNo}.`);
  }

  if (
    payment.paymentStatus === "INITIATED" &&
    payment.transactionExpiresAt &&
    payment.transactionExpiresAt <= new Date()
  ) {
    payment.paymentStatus = "EXPIRED";
    await payment.save();

    await appendLog(
      merchantTxnNo,
      "TRANSACTION_EXPIRED",
      "Marked initiated transaction as expired during status check.",
      {
        expiredAt: new Date().toISOString(),
      },
    );
  }

  const verifiedStatus = await fetchVerifiedGatewayStatus(payment, "STATUS_REQUEST");

  return {
    merchantTxnNo: payment.merchantTxnNo,
    txnID: verifiedStatus.txnID,
    paymentStatus: verifiedStatus.paymentStatus,
    gatewayResponse: verifiedStatus.payload,
  };
};
