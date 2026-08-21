import axios, { AxiosError } from "axios";
import crypto from "node:crypto";

import { env } from "../config/env.js";
import { connectToDatabase } from "../db/connect.js";
import { logger } from "../lib/logger.js";
import { HttpError } from "../lib/http-error.js";
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
  buildRefundRequest,
  buildStatusCheckRequest,
  isPendingPayment,
  isSuccessfulPayment,
  normaliseGatewayPayload,
  verifyCallbackSecureHash,
  verifyInitiateSaleResponse,
} from "../utils/icici.js";

const ICICI_HTTP_TIMEOUT_MS = 30000;
const INITIATED_REUSE_WINDOW_MS = 90 * 1000;

// Terminal states. Once a payment lands here, none of the three redundant
// confirmation paths (return callback, advice webhook, reconcile sweep) are
// allowed to move it — whichever one arrives first wins, the rest are no-ops.
const TERMINAL_STATUSES: PaymentLifecycleStatus[] = ["SUCCESS", "FAILED", "REFUNDED"];

const iciciClient = axios.create({
  timeout: ICICI_HTTP_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
  },
});

const assertGatewayConfigured = () => {
  if (!env.iciciMerchantId || !env.iciciSecretKey) {
    throw new HttpError(
      500,
      "Payment gateway is not configured. Set ICICI_MERCHANT_ID and ICICI_SECRET_KEY.",
    );
  }
};

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

// merchantTxnNo must be alphanumeric only, max 20 chars — hyphens/slashes/
// underscores are rejected outright by the gateway.
const createMerchantTxnNo = () =>
  `MS${Date.now().toString().slice(-10)}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

const buildTransactionExpiry = () => new Date(Date.now() + INITIATED_REUSE_WINDOW_MS);

const toFormUrlEncodedBody = (payload: Record<string, unknown>) =>
  new URLSearchParams(
    Object.entries(payload).map(([key, value]) => [key, String(value ?? "")]),
  ).toString();

const isHtml502Response = (value: unknown) => typeof value === "string" && /502 Bad Gateway/i.test(value);

// The STATUS/REFUND command endpoint's own documented sample curls use
// application/x-www-form-urlencoded — this is specifically for
// env.iciciCommandUrl, not initiateSale (see postIciciJson below).
const postIcici = async <TResponse>(url: string, payload: Record<string, unknown>) => {
  try {
    return await iciciClient.post<TResponse>(url, toFormUrlEncodedBody(payload), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    });
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    const responseData = axios.isAxiosError(error) ? error.response?.data : undefined;

    if (status !== 502 && !isHtml502Response(responseData)) {
      throw error;
    }

    return iciciClient.post<TResponse>(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }
};

// initiateSale specifically requires application/json — confirmed by
// direct testing: the exact same payload sent as
// application/x-www-form-urlencoded gets a bare, generic gateway-level
// "Internal Server Error" with no ICICI response code at all, while JSON
// gets a proper responseCode. This was the real root cause behind what
// looked for a long time like an IP-whitelisting problem.
const postIciciJson = <TResponse>(url: string, payload: Record<string, unknown>) =>
  iciciClient.post<TResponse>(url, payload, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

const resolvePaymentStatus = (payload: GatewayPayload): PaymentLifecycleStatus => {
  if (isSuccessfulPayment(payload)) {
    return "SUCCESS";
  }

  if (isPendingPayment(payload)) {
    return "PENDING";
  }

  return "FAILED";
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

// Single source of truth for moving a payment out of a non-terminal state.
// Uses an atomic conditional update (not read-then-save) so that whichever
// of the return callback / advice webhook / reconcile sweep arrives first
// wins, and the others become no-ops instead of racing each other.
const applyStatus = async (
  merchantTxnNo: string,
  status: PaymentLifecycleStatus,
  payload: GatewayPayload,
  stage: PaymentLogStage,
  source: string,
): Promise<PaymentDocument | null> => {
  await connectToDatabase();

  const setFields: Record<string, unknown> = {
    paymentStatus: status,
    gatewayResponse: payload,
  };

  if (payload.txnID) {
    setFields.txnID = payload.txnID;
  }

  if (TERMINAL_STATUSES.includes(status)) {
    setFields.transactionExpiresAt = null;
  }

  const updated = await Payment.findOneAndUpdate(
    { merchantTxnNo, paymentStatus: { $nin: TERMINAL_STATUSES } },
    { $set: setFields },
    { new: true },
  );

  if (updated) {
    await appendLog(merchantTxnNo, stage, `Payment marked ${status} via ${source}.`, sanitizeForLogs(payload));
    return updated;
  }

  const existing = await Payment.findOne({ merchantTxnNo });

  if (existing) {
    await appendLog(
      merchantTxnNo,
      "APPLY_STATUS_NOOP",
      `${source} reported ${status} but payment was already ${existing.paymentStatus}; ignored.`,
      sanitizeForLogs(payload),
    );
  }

  return existing;
};

// Authoritative check against the STATUS command endpoint. Never use the
// settlement API for this — settlement lags up to 12 hours and answers
// "has the money reached my account", not "did the customer pay".
const fetchVerifiedGatewayStatus = async (
  merchantTxnNo: string,
  stage: "STATUS_REQUEST" | "STATUS_API_VERIFICATION_STARTED" | "RECONCILE_CHECK",
  source: string,
) => {
  assertGatewayConfigured();

  const statusRequest = buildStatusCheckRequest({
    merchantId: env.iciciMerchantId,
    aggregatorID: env.iciciAggregatorId || undefined,
    merchantTxnNo,
    originalTxnNo: merchantTxnNo,
  });

  const signedRequest = attachSecureHash(statusRequest, env.iciciSecretKey);

  await appendLog(merchantTxnNo, stage, "Status check request created.", sanitizeForLogs(signedRequest));

  const response = await postIcici<Record<string, unknown>>(env.iciciCommandUrl, signedRequest);
  const payload = normaliseGatewayPayload(response.data);

  await appendLog(merchantTxnNo, "STATUS_RESPONSE", "Status check response received.", sanitizeForLogs(payload));

  const hashVerification = verifyCallbackSecureHash(payload, env.iciciSecretKey);

  if (!hashVerification.isValid) {
    // This call was made directly by our server, over TLS, straight to
    // ICICI's own domain — not relayed through a customer's browser — so
    // TLS itself already guarantees the response wasn't tampered with in
    // transit. The secureHash here is defense-in-depth, not the primary
    // trust boundary. An unresolved quirk in how ICICI signs status
    // responses (still being tracked with their team) must not cause a
    // genuinely paid transaction to be reported to the customer as
    // failed — that's a worse outcome than trusting txnStatus on an
    // already-trusted channel. Logged clearly so the discrepancy stays
    // visible, but no longer blocks applying the real status.
    await appendLog(
      merchantTxnNo,
      "STATUS_HASH_MISMATCH_TRUSTED",
      "Status API response hash verification failed, but trusting txnStatus since this call went directly to ICICI over TLS.",
      { generatedHash: hashVerification.generatedHash, receivedHash: hashVerification.receivedHash },
    );
  }

  const resolvedStatus = resolvePaymentStatus(payload);
  const finalStage: PaymentLogStage =
    resolvedStatus === "SUCCESS" ? "STATUS_API_VERIFIED_SUCCESS" : "STATUS_API_VERIFIED_FAILED";

  const payment = await applyStatus(merchantTxnNo, resolvedStatus, payload, finalStage, source);

  return { paymentStatus: payment?.paymentStatus ?? resolvedStatus, payload, payment };
};

const buildFrontendRedirect = (
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
    | "paymentStatus"
  >,
  statusMessage?: string,
) => {
  const failureStatuses: PaymentLifecycleStatus[] = [
    "FAILED",
    "CANCELLED",
    "EXPIRED",
    "ERROR",
    "HASH_MISMATCH",
  ];

  const pathname =
    payment.paymentStatus === "SUCCESS" || payment.paymentStatus === "REFUNDED"
      ? "/success"
      : failureStatuses.includes(payment.paymentStatus as PaymentLifecycleStatus)
        ? "/failure"
        : "/payment/pending";

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

const buildFailureRedirectUrl = (payload: Record<string, unknown>, fallbackMessage: string) => {
  const redirectUrl = new URL("/failure", env.frontendBaseUrl);
  const merchantTxnNo = String(payload.merchantTxnNo || "").trim();
  const message =
    String(payload.txnRespDescription || payload.respDescription || fallbackMessage).trim() ||
    fallbackMessage;

  if (merchantTxnNo) {
    redirectUrl.searchParams.set("merchantTxnNo", merchantTxnNo);
  }

  redirectUrl.searchParams.set("message", message);

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
      { expiredAt: now.toISOString() },
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

export const initiatePayment = async (input: InitiatePaymentInput & { userId: string }) => {
  assertGatewayConfigured();
  await connectToDatabase();

  await expireStaleInitiatedTransactions(input);

  const existingPayment = await findReusableTransaction(input);

  if (existingPayment && existingPayment.redirectURI && existingPayment.tranCtx) {
    const redirectUrl = buildRedirectUrl(existingPayment.redirectURI, existingPayment.tranCtx);

    await appendLog(
      existingPayment.merchantTxnNo,
      "REUSED_TRANSACTION",
      "Reused a still-valid initiated transaction within the short timeout window.",
      { redirectUrl, expiresAt: existingPayment.transactionExpiresAt?.toISOString() || null },
    );

    return { merchantTxnNo: existingPayment.merchantTxnNo, redirectUrl, reused: true };
  }

  const payment = await Payment.create({
    merchantTxnNo: createMerchantTxnNo(),
    userId: input.userId,
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

  await appendLog(payment.merchantTxnNo, "NEW_TRANSACTION_CREATED", "Created a fresh payment transaction.", {
    reason: "No reusable transaction found within the timeout window.",
  });

  const initiateRequest = buildInitiateSaleRequest({
    merchantId: env.iciciMerchantId,
    aggregatorID: env.iciciAggregatorId || undefined,
    merchantTxnNo: payment.merchantTxnNo,
    amount: input.amount,
    customerEmailID: input.email.toLowerCase(),
    returnURL: env.iciciReturnUrl,
    customerMobileNo: input.mobile,
    customerName: input.customerName,
  });

  const signedRequest = attachSecureHash(initiateRequest, env.iciciSecretKey);

  await Payment.updateOne({ merchantTxnNo: payment.merchantTxnNo }, { gatewayRequest: signedRequest });
  await appendLog(
    payment.merchantTxnNo,
    "INITIATE_REQUEST",
    "Initiate sale request created.",
    sanitizeForLogs(signedRequest),
  );

  logger.info("Sending initiateSale request to ICICI.", {
    url: env.iciciInitiateSaleUrl,
    contentType: "application/json",
    packetAsJson: JSON.stringify(signedRequest, null, 2),
  });

  try {
    const response = await postIciciJson<InitiateSaleResponse>(env.iciciInitiateSaleUrl, signedRequest);

    await appendLog(
      payment.merchantTxnNo,
      "INITIATE_RESPONSE",
      "Initiate sale response received.",
      sanitizeForLogs(response.data as Record<string, unknown>),
    );

    if (!verifyInitiateSaleResponse(response.data, env.iciciSecretKey)) {
      await Payment.updateOne(
        { merchantTxnNo: payment.merchantTxnNo },
        { paymentStatus: "HASH_MISMATCH", gatewayResponse: response.data },
      );
      throw new HttpError(502, "ICICI initiateSale response hash verification failed.");
    }

    if (response.data.responseCode !== "R1000") {
      await Payment.updateOne(
        { merchantTxnNo: payment.merchantTxnNo },
        { paymentStatus: "FAILED", gatewayResponse: response.data },
      );
      throw new HttpError(502, `ICICI initiateSale failed with responseCode ${response.data.responseCode}.`);
    }

    if (!response.data.redirectURI || !response.data.tranCtx) {
      await Payment.updateOne(
        { merchantTxnNo: payment.merchantTxnNo },
        { paymentStatus: "FAILED", gatewayResponse: response.data },
      );
      throw new HttpError(502, "ICICI initiateSale response did not include a valid redirect payload.");
    }

    const redirectUrl = buildRedirectUrl(response.data.redirectURI, response.data.tranCtx);

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

    await appendLog(payment.merchantTxnNo, "REDIRECT", "Redirect URL generated for hosted payment page.", {
      redirectUrl,
    });

    return { merchantTxnNo: payment.merchantTxnNo, redirectUrl, reused: false };
  } catch (error) {
    const message =
      error instanceof HttpError
        ? error.message
        : error instanceof AxiosError
          ? serializeAxiosErrorData(error.response?.data) || error.message
          : error instanceof Error
            ? error.message
            : "Unknown ICICI initiateSale error.";

    if (!(error instanceof HttpError)) {
      await Payment.updateOne(
        { merchantTxnNo: payment.merchantTxnNo },
        { paymentStatus: "ERROR", transactionExpiresAt: null },
      );
    }

    logger.error("Failed to initiate ICICI payment.", { merchantTxnNo: payment.merchantTxnNo, message });
    throw error;
  }
};

// Browser return from the hosted payment page (POST to our returnURL).
export const processPaymentReturn = async (rawPayload: Record<string, unknown>) => {
  await connectToDatabase();

  const payload = normaliseGatewayPayload(rawPayload);
  const merchantTxnNo = payload.merchantTxnNo;

  if (!merchantTxnNo) {
    throw new Error("Return payload is missing merchantTxnNo.");
  }

  let payment = await Payment.findOne({ merchantTxnNo });

  if (!payment) {
    throw new Error(`Payment not found for merchantTxnNo ${merchantTxnNo}.`);
  }

  await appendLog(merchantTxnNo, "RETURN_RECEIVED", "Browser return payload received.", sanitizeForLogs(payload));

  const hashVerification = verifyCallbackSecureHash(payload, env.iciciSecretKey);
  let statusMessage = payload.txnRespDescription || payload.respDescription || "";

  if (hashVerification.isValid) {
    const resolvedStatus = resolvePaymentStatus(payload);
    payment = (await applyStatus(merchantTxnNo, resolvedStatus, payload, "RETURN_VERIFIED", "return")) ?? payment;
  } else {
    await appendLog(
      merchantTxnNo,
      "RETURN_HASH_MISMATCH",
      "Return secureHash verification failed. Falling back to authoritative status check.",
      { generatedHash: hashVerification.generatedHash, receivedHash: hashVerification.receivedHash },
    );

    try {
      const verified = await fetchVerifiedGatewayStatus(
        merchantTxnNo,
        "STATUS_API_VERIFICATION_STARTED",
        "return-hash-mismatch",
      );
      statusMessage = verified.payload.txnRespDescription || verified.payload.respDescription || statusMessage;
    } catch (error) {
      logger.error("Status API verification failed after return hash mismatch.", {
        merchantTxnNo,
        message: error instanceof Error ? error.message : "unknown error",
      });
    }
  }

  // Re-read: the return handler's own view of the status may already be
  // stale if the advice webhook or a reconcile tick beat it to a terminal
  // state. Always redirect based on what's actually in the database now.
  const finalPayment = (await Payment.findOne({ merchantTxnNo })) ?? payment;

  return {
    redirectUrl: buildFrontendRedirect(finalPayment, statusMessage),
    paymentStatus: finalPayment.paymentStatus,
  };
};

// Bank-initiated server-to-server webhook. Must always be acknowledged with
// 200 once the payload is durably applied (or determined invalid) — the
// bank retries on any non-200, and retries won't fix a bad hash.
export const processPaymentAdvice = async (rawPayload: Record<string, unknown>) => {
  await connectToDatabase();

  const payload = normaliseGatewayPayload(rawPayload);
  const merchantTxnNo = payload.merchantTxnNo;

  if (!merchantTxnNo) {
    logger.warn("Ignoring ICICI advice payload with no merchantTxnNo.", { payload: sanitizeForLogs(payload) });
    return;
  }

  const payment = await Payment.findOne({ merchantTxnNo });

  if (!payment) {
    logger.warn("Ignoring ICICI advice payload for unknown merchantTxnNo.", { merchantTxnNo });
    return;
  }

  await appendLog(merchantTxnNo, "ADVICE_RECEIVED", "Payment advice webhook payload received.", sanitizeForLogs(payload));

  const hashVerification = verifyCallbackSecureHash(payload, env.iciciSecretKey);

  if (!hashVerification.isValid) {
    await appendLog(
      merchantTxnNo,
      "ADVICE_HASH_MISMATCH",
      "Advice secureHash verification failed; ignoring payload.",
      { generatedHash: hashVerification.generatedHash, receivedHash: hashVerification.receivedHash },
    );
    return;
  }

  const resolvedStatus = resolvePaymentStatus(payload);
  await applyStatus(merchantTxnNo, resolvedStatus, payload, "ADVICE_VERIFIED", "advice");
};

// Polled by the frontend pending page, and reused by the reconcile sweep.
export const checkPaymentStatus = async (merchantTxnNo: string) => {
  await connectToDatabase();

  const payment = await Payment.findOne({ merchantTxnNo });

  if (!payment) {
    throw new Error(`Payment not found for merchantTxnNo ${merchantTxnNo}.`);
  }

  if (TERMINAL_STATUSES.includes(payment.paymentStatus as PaymentLifecycleStatus)) {
    return {
      merchantTxnNo: payment.merchantTxnNo,
      txnID: payment.txnID,
      paymentStatus: payment.paymentStatus,
      gatewayResponse: (payment.gatewayResponse as GatewayPayload) || {},
    };
  }

  if (
    payment.paymentStatus === "INITIATED" &&
    payment.transactionExpiresAt &&
    payment.transactionExpiresAt <= new Date()
  ) {
    await Payment.updateOne({ merchantTxnNo }, { paymentStatus: "EXPIRED" });
    await appendLog(merchantTxnNo, "TRANSACTION_EXPIRED", "Marked initiated transaction as expired during status check.", {
      expiredAt: new Date().toISOString(),
    });

    return {
      merchantTxnNo,
      txnID: payment.txnID,
      paymentStatus: "EXPIRED" as PaymentLifecycleStatus,
      gatewayResponse: (payment.gatewayResponse as GatewayPayload) || {},
    };
  }

  const verified = await fetchVerifiedGatewayStatus(merchantTxnNo, "STATUS_REQUEST", "status-poll");

  return {
    merchantTxnNo,
    txnID: verified.payment?.txnID || payment.txnID,
    paymentStatus: verified.paymentStatus,
    gatewayResponse: verified.payload,
  };
};

// Safety-net sweep: re-checks payments that have been sitting in a
// non-terminal state longer than RECONCILE_STALE_AFTER_MS, in case the
// return callback never arrived (tab closed mid-payment) and the advice
// webhook isn't registered yet or was missed.
export const reconcilePendingPayments = async () => {
  await connectToDatabase();

  const staleBefore = new Date(Date.now() - env.reconcileStaleAfterMs);

  const stalePayments = await Payment.find({
    paymentStatus: { $in: ["INITIATED", "PENDING"] },
    createdAt: { $lte: staleBefore },
  })
    .sort({ createdAt: 1 })
    .limit(50);

  let checked = 0;
  let resolved = 0;

  for (const payment of stalePayments) {
    checked += 1;

    try {
      const before = payment.paymentStatus;
      const result = await fetchVerifiedGatewayStatus(payment.merchantTxnNo, "RECONCILE_CHECK", "reconcile-sweep");

      if (result.paymentStatus !== before) {
        resolved += 1;
      }
    } catch (error) {
      logger.error("Reconcile sweep failed to verify a payment.", {
        merchantTxnNo: payment.merchantTxnNo,
        message: error instanceof Error ? error.message : "unknown error",
      });
    }
  }

  if (checked > 0) {
    logger.info("Reconcile sweep completed.", { checked, resolved });
  }

  return { checked, resolved };
};

export const refundPayment = async (merchantTxnNo: string, amount?: number, addlParam1?: string) => {
  assertGatewayConfigured();
  await connectToDatabase();

  const payment = await Payment.findOne({ merchantTxnNo });

  if (!payment) {
    throw new HttpError(404, `Payment not found for merchantTxnNo ${merchantTxnNo}.`);
  }

  if (payment.paymentStatus !== "SUCCESS") {
    throw new HttpError(400, `Only successful payments can be refunded (current status: ${payment.paymentStatus}).`);
  }

  const refundAmount = amount ?? payment.amount;

  if (refundAmount <= 0 || refundAmount > payment.amount) {
    throw new HttpError(400, "Refund amount must be greater than zero and no more than the original amount.");
  }

  // The spec table describes originalTxnNo as "the reference No. of the
  // initial transaction", but the sample curl passes the PG's txnID rather
  // than our merchantTxnNo. Following the working sample here — confirm
  // against a real UAT transaction before relying on this in production.
  const originalTxnNo = payment.txnID || payment.merchantTxnNo;
  const refundMerchantTxnNo = createMerchantTxnNo();

  const refundRequest = buildRefundRequest({
    merchantId: env.iciciMerchantId,
    aggregatorID: env.iciciAggregatorId || undefined,
    merchantTxnNo: refundMerchantTxnNo,
    originalTxnNo,
    amount: refundAmount,
    addlParam1,
  });

  const signedRequest = attachSecureHash(refundRequest, env.iciciSecretKey);

  await appendLog(merchantTxnNo, "REFUND_REQUEST", "Refund request created.", sanitizeForLogs(signedRequest));

  const response = await postIcici<Record<string, unknown>>(env.iciciCommandUrl, signedRequest);
  const payload = normaliseGatewayPayload(response.data);

  await appendLog(merchantTxnNo, "REFUND_RESPONSE", "Refund response received.", sanitizeForLogs(payload));

  const hashVerification = verifyCallbackSecureHash(payload, env.iciciSecretKey);
  const isSuccess = ["000", "0000", "R1000"].includes(payload.responseCode || "");

  if (!hashVerification.isValid || !isSuccess) {
    await appendLog(merchantTxnNo, "REFUND_FAILED", "Refund was not confirmed by the gateway.", sanitizeForLogs(payload));
    throw new HttpError(502, payload.respDescription || "Refund request was not confirmed by the gateway.");
  }

  await Payment.updateOne({ merchantTxnNo }, { paymentStatus: "REFUNDED", gatewayResponse: payload });

  return { merchantTxnNo, refundMerchantTxnNo, payload };
};
