import axios, { AxiosError } from "axios";
import crypto from "node:crypto";

import { env } from "../config/env.js";
import { getSecondInstallmentTotal, SECOND_INSTALLMENT_MIN_AMOUNT } from "../config/installment.js";
import { connectToDatabase } from "../db/connect.js";
import { getStateCode } from "../lib/indian-states.js";
import { logger } from "../lib/logger.js";
import { HttpError } from "../lib/http-error.js";
import { sendInvoiceEmail } from "../lib/mailer.js";
import { upsertPaymentStatusRow } from "../lib/sheets.js";
import { nextInvoiceNumber, renderInvoicePdf } from "./invoice.service.js";
import { Payment, type PaymentDocument } from "../models/Payment.js";
import { Registration } from "../models/Registration.js";
import type {
  GatewayPayload,
  InitiatePaymentInput,
  InitiateSaleResponse,
  PaymentLifecycleStatus,
  PaymentLogStage,
  PaymentSummary,
  PaymentType,
} from "../types/payment.js";
import {
  attachSecureHash,
  buildInitiateSaleRequest,
  buildRedirectUrl,
  buildRefundRequest,
  buildStatusCheckRequest,
  isFailedPayment,
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

// SAC (Services Accounting Code) for commercial training/coaching services
// under GST — what every course-fee invoice line is billed under.
const COURSE_SAC_CODE = "999293";

// Every amount actually charged at checkout is GST-inclusive (see the
// baseTotal = Math.round(total / 1.18) calculation in
// MasterclassCheckout.tsx, used to display the Price/GST breakdown for the
// exact same figure the customer pays). The invoice must reflect that: the
// taxable value is backed out of what was paid, not added on top of it —
// otherwise the invoice's Net Amount would overstate the real charge by
// another 18%.
const COURSE_GST_RATE = 18;
const taxableAmountFromInclusive = (amountPaid: number) => amountPaid / (1 + COURSE_GST_RATE / 100);

// Fallback state code used only if a payment's buyer has no Registration
// record on file, or its state name doesn't match the lookup table (should
// be rare — every checkout requires registering first). Mirrors the
// template's own seller state (Delhi), the safest default for a
// predominantly India-wide but Delhi-anchored customer base.
const FALLBACK_STATE_CODE = "07";

// Matches ADVANCE payments created either after paymentType existed, or
// before it did (those documents have no paymentType field at all). The
// startup backfill (see backfillPaymentTypes) sets the field on every
// pre-existing document, but this stays as cheap defense in depth.
const ADVANCE_TYPE_FILTER = { $or: [{ paymentType: "ADVANCE" }, { paymentType: { $exists: false } }] };

// One-time, idempotent backfill for documents created before paymentType
// existed — run once at server startup. Safe to call on every boot: once
// every document has the field, the match returns nothing and this is a
// no-op.
export const backfillPaymentTypes = async () => {
  await connectToDatabase();

  const result = await Payment.updateMany(
    { paymentType: { $exists: false } },
    { $set: { paymentType: "ADVANCE" } },
  );

  if (result.modifiedCount > 0) {
    logger.info("Backfilled paymentType on legacy payment records.", {
      modifiedCount: result.modifiedCount,
    });
  }
};

export const getPaymentSummary = async (
  mobile: string,
  courseName: string,
  variant: "online" | "offline",
): Promise<PaymentSummary> => {
  await connectToDatabase();

  const advancePayment = await Payment.findOne({
    mobile,
    courseName,
    variant,
    paymentStatus: "SUCCESS",
    ...ADVANCE_TYPE_FILTER,
  }).sort({ createdAt: -1 });

  const totalAmount = getSecondInstallmentTotal(courseName);

  if (!advancePayment) {
    return {
      advance: { status: "UNPAID" },
      secondInstallment: {
        totalAmount,
        amountPaid: 0,
        remainingAmount: totalAmount,
        status: "UNPAID",
        minAmount: SECOND_INSTALLMENT_MIN_AMOUNT,
      },
    };
  }

  const successfulInstallments = await Payment.find({
    mobile,
    courseName,
    variant,
    paymentType: "SECOND_INSTALLMENT",
    paymentStatus: "SUCCESS",
  });

  const amountPaid = successfulInstallments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = Math.max(0, totalAmount - amountPaid);
  const status: PaymentSummary["secondInstallment"]["status"] =
    amountPaid >= totalAmount && totalAmount > 0 ? "PAID" : amountPaid > 0 ? "PARTIAL" : "UNPAID";

  return {
    advance: {
      status: "PAID",
      amount: advancePayment.amount,
      transactionId: advancePayment.txnID || advancePayment.merchantTxnNo,
      paidAt: (advancePayment.updatedAt as Date).toISOString(),
    },
    secondInstallment: {
      totalAmount,
      amountPaid,
      remainingAmount,
      status,
      minAmount: SECOND_INSTALLMENT_MIN_AMOUNT,
    },
  };
};

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

  if (isFailedPayment(payload)) {
    return "FAILED";
  }

  // Covers both recognized-pending codes and any ambiguous/unrecognized
  // response ICICI hasn't finalized yet (see isFailedPayment for why this
  // must not default to FAILED). A genuinely abandoned transaction still
  // resolves to EXPIRED via the transaction-expiry/reconcile path.
  return "PENDING";
};

// A payment stuck in a non-terminal state gets re-checked forever (every
// reconcile sweep, every pending-page poll) with no natural end — without a
// cap, its transactionLogs array (each entry carrying a full gateway
// request/response payload) grows without bound. Some existing production
// documents reached ~2MB this way. $slice keeps only the most recent
// entries, permanently bounding size regardless of how long a payment
// stays unresolved.
const MAX_TRANSACTION_LOG_ENTRIES = 50;

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
          $each: [{ stage, message, payload, timestamp: new Date() }],
          $slice: -MAX_TRANSACTION_LOG_ENTRIES,
        },
      },
    },
  );
};

// Generates the GST invoice PDF and emails it to the customer, then records
// the invoice number on the payment so it's never issued twice. Called only
// from applyStatus once a payment has genuinely just turned SUCCESS — never
// awaited by the caller, so a slow PDF render/email never delays the
// customer's redirect or the bank's webhook acknowledgement. Any failure is
// caught by the caller and logged; it does not affect the payment record.
const issueInvoiceForPayment = async (payment: PaymentDocument, ledger: PaymentSummary) => {
  if (payment.invoiceNo) {
    return;
  }

  // Buyer/billing details live on the Registration record (collected once,
  // before payment, via the "Tell Us About Yourself" form) rather than on
  // the Payment document itself — Payment only tracks the transaction.
  const registration = await Registration.findOne({
    phone: payment.mobile,
    courseName: payment.courseName,
    variant: payment.variant,
  }).sort({ createdAt: -1 });

  const invoiceNo = await nextInvoiceNumber();

  const paymentTypeLabel =
    payment.paymentType === "SECOND_INSTALLMENT" ? "Second Installment" : "Advance Payment";
  const variantLabel = payment.variant === "offline" ? "Offline" : "Online";

  const buyerName =
    (registration?.hasGstin && registration.billerName) || registration?.name || payment.customerName;
  const buyerState = registration?.state || "";

  const pdfBuffer = await renderInvoicePdf({
    invoiceNo,
    invoiceDate: new Date().toISOString(),
    name: buyerName,
    address: (registration?.hasGstin && registration.address) || "",
    city: registration?.city || "",
    state: buyerState,
    stateCode: (buyerState && getStateCode(buyerState)) || FALLBACK_STATE_CODE,
    gstin: (registration?.hasGstin && registration.gstin) || "",
    pan: registration?.pan || "",
    gstRate: COURSE_GST_RATE,
    items: [
      {
        description: `${payment.courseName} (${variantLabel}) — ${paymentTypeLabel}`,
        hsn: COURSE_SAC_CODE,
        amount: taxableAmountFromInclusive(payment.amount),
      },
    ],
  });

  // A remaining balance under a rupee is rounding noise, not a real due
  // amount — treat the course as fully paid rather than emailing someone
  // a "pay ₹0.37 more" link.
  const remainingAmount = ledger.secondInstallment.remainingAmount;
  const hasRemainingBalance = remainingAmount > 1;

  let payRemainingUrl: string | undefined;

  if (hasRemainingBalance) {
    const params = new URLSearchParams({
      variant: payment.variant,
      course: payment.courseName,
      installment: "second",
    });
    payRemainingUrl = `${env.frontendBaseUrl}/classes/checkout?${params.toString()}`;
  }

  await sendInvoiceEmail(payment.email, {
    invoiceNo,
    customerName: payment.customerName,
    courseName: payment.courseName,
    amount: payment.amount,
    pdfBuffer,
    remainingAmount: hasRemainingBalance ? remainingAmount : undefined,
    payRemainingUrl,
  });

  await Payment.updateOne(
    { _id: payment._id },
    { $set: { invoiceNo, invoiceSentAt: new Date() } },
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

    const updatedPaymentType: PaymentType = updated.paymentType === "SECOND_INSTALLMENT" ? "SECOND_INSTALLMENT" : "ADVANCE";
    const ledger = await getPaymentSummary(updated.mobile, updated.courseName, updated.variant as "online" | "offline");

    const advanceStatusText =
      ledger.advance.status === "PAID" ? "PAID" : updatedPaymentType === "ADVANCE" ? status : "UNPAID";

    await upsertPaymentStatusRow({
      mobile: updated.mobile,
      courseName: updated.courseName,
      advanceMerchantTxnNo: updatedPaymentType === "ADVANCE" ? updated.merchantTxnNo : undefined,
      advanceAmount: ledger.advance.status === "PAID" ? ledger.advance.amount : undefined,
      advanceStatusText,
      secondInstallmentTotal: ledger.secondInstallment.totalAmount,
      secondInstallmentPaid: ledger.secondInstallment.amountPaid,
      secondInstallmentRemaining: ledger.secondInstallment.remainingAmount,
    });

    if (status === "SUCCESS") {
      void issueInvoiceForPayment(updated, ledger).catch((error) => {
        logger.error("Failed to generate/send invoice for a successful payment.", {
          merchantTxnNo: updated.merchantTxnNo,
          message: error instanceof Error ? error.message : "unknown error",
        });
      });
    }

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
    | "paymentType"
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
  redirectUrl.searchParams.set("paymentType", payment.paymentType || "ADVANCE");

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

const expireStaleInitiatedTransactions = async (input: InitiatePaymentInput, paymentType: PaymentType) => {
  const now = new Date();
  const staleInitiatedPayments = await Payment.find({
    email: input.email.toLowerCase(),
    mobile: input.mobile,
    amount: input.amount,
    courseName: input.courseName,
    paymentType,
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

const findReusableTransaction = async (input: InitiatePaymentInput, paymentType: PaymentType) => {
  const now = new Date();

  return Payment.findOne({
    email: input.email.toLowerCase(),
    mobile: input.mobile,
    amount: input.amount,
    courseName: input.courseName,
    paymentType,
    paymentStatus: "INITIATED",
    redirectURI: { $ne: "" },
    tranCtx: { $ne: "" },
    transactionExpiresAt: { $gt: now },
  }).sort({ createdAt: -1 });
};

export const initiatePayment = async (input: InitiatePaymentInput & { userId: string }) => {
  assertGatewayConfigured();
  await connectToDatabase();

  const paymentType: PaymentType = input.paymentType === "SECOND_INSTALLMENT" ? "SECOND_INSTALLMENT" : "ADVANCE";

  // Server-side source of truth, independent of whatever the frontend
  // believes: an advance can never be charged twice, and a second
  // installment can never be charged before the advance clears, nor for
  // more than what's actually still owed. The frontend's own summary call
  // may already have blocked these in the UI, but that's advisory only.
  let requestedAmount = input.amount;

  if (paymentType === "ADVANCE") {
    const existingAdvance = await Payment.findOne({
      mobile: input.mobile,
      courseName: input.courseName,
      variant: input.variant,
      paymentStatus: "SUCCESS",
      ...ADVANCE_TYPE_FILTER,
    });

    if (existingAdvance) {
      throw new HttpError(409, "Advance payment has already been completed.");
    }
  } else {
    const advancePayment = await Payment.findOne({
      mobile: input.mobile,
      courseName: input.courseName,
      variant: input.variant,
      paymentStatus: "SUCCESS",
      ...ADVANCE_TYPE_FILTER,
    });

    if (!advancePayment) {
      throw new HttpError(400, "Please complete your advance payment first.");
    }

    const totalAmount = getSecondInstallmentTotal(input.courseName);
    const successfulInstallments = await Payment.find({
      mobile: input.mobile,
      courseName: input.courseName,
      variant: input.variant,
      paymentType: "SECOND_INSTALLMENT",
      paymentStatus: "SUCCESS",
    });
    const amountPaid = successfulInstallments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingAmount = Math.max(0, totalAmount - amountPaid);

    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      throw new HttpError(400, "Amount must be a valid positive number.");
    }

    if (requestedAmount < SECOND_INSTALLMENT_MIN_AMOUNT) {
      throw new HttpError(400, `Minimum payment is ₹${SECOND_INSTALLMENT_MIN_AMOUNT.toLocaleString("en-IN")}.`);
    }

    if (requestedAmount > remainingAmount) {
      throw new HttpError(400, `Amount cannot exceed the remaining balance of ₹${remainingAmount.toLocaleString("en-IN")}.`);
    }
  }

  await expireStaleInitiatedTransactions(input, paymentType);

  const existingPayment = await findReusableTransaction(input, paymentType);

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
    amount: requestedAmount,
    courseName: input.courseName,
    variant: input.variant,
    feeLabel: input.feeLabel,
    summaryLabel: input.summaryLabel,
    paymentType,
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
//
// A payment ICICI itself still can't resolve (genuinely abandoned by the
// customer) would otherwise be re-checked here forever — every sweep,
// indefinitely — with the customer's own pending page stuck watching a
// spinner the whole time. Past PENDING_EXPIRY_MS this forces it to EXPIRED
// instead of re-asking ICICI again. That's still safe to reverse later: a
// late ADVICE webhook confirming SUCCESS overwrites EXPIRED just fine,
// since EXPIRED isn't a terminal status — this sweep just stops being the
// one holding the door open.
export const reconcilePendingPayments = async () => {
  await connectToDatabase();

  const staleBefore = new Date(Date.now() - env.reconcileStaleAfterMs);
  const expireBefore = new Date(Date.now() - env.pendingExpiryMs);

  const stalePayments = await Payment.find({
    paymentStatus: { $in: ["INITIATED", "PENDING"] },
    createdAt: { $lte: staleBefore },
  })
    .sort({ createdAt: 1 })
    .limit(50);

  let checked = 0;
  let resolved = 0;
  let expired = 0;

  for (const payment of stalePayments) {
    checked += 1;

    try {
      const isPastExpiryWindow = (payment.createdAt as Date) <= expireBefore;
      let currentStatus = payment.paymentStatus;

      // Skip asking a gateway that's had ten-plus minutes and still
      // hasn't resolved it — go straight to expiring instead of paying
      // for (and waiting on) another status call that's unlikely to
      // suddenly return something new.
      if (!isPastExpiryWindow) {
        const result = await fetchVerifiedGatewayStatus(payment.merchantTxnNo, "RECONCILE_CHECK", "reconcile-sweep");
        currentStatus = result.paymentStatus as typeof currentStatus;

        if (currentStatus !== payment.paymentStatus) {
          resolved += 1;
        }
      }

      if (isPastExpiryWindow && !TERMINAL_STATUSES.includes(currentStatus)) {
        const expiredPayment = await applyStatus(
          payment.merchantTxnNo,
          "EXPIRED",
          {},
          "TRANSACTION_EXPIRED",
          "reconcile-timeout",
        );

        if (expiredPayment) {
          expired += 1;
        }
      }
    } catch (error) {
      logger.error("Reconcile sweep failed to verify a payment.", {
        merchantTxnNo: payment.merchantTxnNo,
        message: error instanceof Error ? error.message : "unknown error",
      });
    }
  }

  if (checked > 0) {
    logger.info("Reconcile sweep completed.", { checked, resolved, expired });
  }

  return { checked, resolved, expired };
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
