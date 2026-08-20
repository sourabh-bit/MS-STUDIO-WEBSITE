import crypto from "node:crypto";

import type {
  GatewayPayload,
  InitiateSaleRequest,
  InitiateSaleResponse,
  RefundRequest,
  StatusCheckRequest,
} from "../types/payment.js";

const isSecureHashKey = (key: string) => key.trim().toLowerCase() === "securehash";

// The bank's reference HMAC implementation reads the message with
// `msg.getBytes("ASCII")`. A non-ASCII character (accented name, curly quote,
// emoji) in any field produces a different hash on their side than on ours,
// and the failure comes back with no useful error — so every value that goes
// into the hash (and the request itself) is normalised to ASCII first.
export const toAsciiSafe = (value: unknown) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x00-\x7F]/g, "")
    .trim();

const comparePayloadKeys = (left: string, right: string) => {
  const leftLower = left.toLowerCase();
  const rightLower = right.toLowerCase();

  if (leftLower < rightLower) {
    return -1;
  }

  if (leftLower > rightLower) {
    return 1;
  }

  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
};

const sortPayloadEntries = (payload: Record<string, unknown>) =>
  Object.entries(payload)
    .filter(([key]) => !isSecureHashKey(key))
    .sort(([left], [right]) => comparePayloadKeys(left, right));

// Hash Calculation (V1): concatenate parameter values (skipping null/empty),
// in ascending order of parameter name. Note 1 in the spec appendix is
// explicit that every parameter present in a request/response participates
// in the hash — including ones outside the published spec — so this sorts
// and joins whatever keys are actually on the payload rather than a
// hardcoded field list.
export const buildHashPlainText = (payload: Record<string, unknown>) =>
  sortPayloadEntries(payload)
    .map(([, value]) => (value === null || value === undefined ? "" : String(value)))
    .join("");

export const createSecureHash = (payload: Record<string, unknown>, secretKey: string) =>
  crypto.createHmac("sha256", secretKey).update(buildHashPlainText(payload), "utf8").digest("hex");

export const attachSecureHash = <T extends Record<string, unknown>>(
  payload: T,
  secretKey: string,
) => ({
  ...payload,
  secureHash: createSecureHash(payload, secretKey),
});

const findSecureHashValue = (payload: Record<string, unknown>) => {
  const entry = Object.entries(payload).find(([key]) => isSecureHashKey(key));
  return String(entry?.[1] ?? "").trim().toLowerCase();
};

const timingSafeHexEqual = (received: string, expected: string) => {
  if (!received) {
    return false;
  }

  const receivedBuffer = Buffer.from(received, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
};

export const verifySecureHash = (payload: Record<string, unknown>, secretKey: string) => {
  const receivedHash = findSecureHashValue(payload);
  const expectedHash = createSecureHash(payload, secretKey).toLowerCase();

  return timingSafeHexEqual(receivedHash, expectedHash);
};

export type CallbackHashVerification = {
  isValid: boolean;
  payloadKeys: string[];
  sortedKeys: string[];
  verificationString: string;
  generatedHash: string;
  receivedHash: string;
};

// Same V1 logic as verifySecureHash, but returns the intermediate values too
// so a mismatch can be logged with enough detail to diagnose (which key
// order was used, what string was actually hashed) instead of just "invalid".
export const verifyCallbackSecureHash = (
  payload: Record<string, unknown>,
  secretKey: string,
): CallbackHashVerification => {
  const receivedHash = findSecureHashValue(payload);
  const sortedKeys = sortPayloadEntries(payload).map(([key]) => key);
  const verificationString = buildHashPlainText(payload);
  const generatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(verificationString, "utf8")
    .digest("hex")
    .toLowerCase();

  return {
    isValid: timingSafeHexEqual(receivedHash, generatedHash),
    payloadKeys: Object.keys(payload),
    sortedKeys,
    verificationString,
    generatedHash,
    receivedHash,
  };
};

// ICICI expects txnDate in IST. Render's Node build produced the same
// digits as UTC when this used Intl.DateTimeFormat({ timeZone:
// "Asia/Kolkata" }) — minimal Node builds often ship without full ICU
// timezone-database support, so that call can silently fall back to UTC
// instead of throwing. This avoids the timezone database entirely: shift
// the raw epoch milliseconds by the fixed +5:30 offset (India has no DST,
// so this is always correct) and read it back with the UTC getters, which
// need no ICU data at all.
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

export const formatTxnDate = (date = new Date()) => {
  const istDate = new Date(date.getTime() + IST_OFFSET_MS);
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    istDate.getUTCFullYear(),
    pad(istDate.getUTCMonth() + 1),
    pad(istDate.getUTCDate()),
    pad(istDate.getUTCHours()),
    pad(istDate.getUTCMinutes()),
    pad(istDate.getUTCSeconds()),
  ].join("");
};

export const formatAmount = (amount: number) => amount.toFixed(2);

export const buildRedirectUrl = (redirectURI: string, tranCtx: string) => {
  const url = new URL(redirectURI);
  url.searchParams.set("tranCtx", tranCtx);
  return url.toString();
};

export const normaliseGatewayPayload = (payload: Record<string, unknown>): GatewayPayload =>
  Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, String(value ?? "")]),
  );

// txnStatus is authoritative when present (status-check responses always
// carry it: SUC / REJ / ERR / REQ). responseCode on that same endpoint only
// says whether the *enquiry* succeeded, not whether the payment did — so it
// must never be read as a stand-in for txnStatus. The responseCode/
// txnResponseCode checks below only matter for endpoints (initiate, return)
// that don't send txnStatus at all.
export const isSuccessfulPayment = (payload: GatewayPayload) => {
  const txnStatus = (payload.txnStatus || "").toUpperCase();

  if (txnStatus) {
    return txnStatus === "SUC" || txnStatus === "SUCCESS";
  }

  return (
    ["000", "0000"].includes(payload.txnResponseCode || "") ||
    ["000", "0000"].includes(payload.responseCode || "") ||
    ["000", "0000"].includes(payload.respCode || "")
  );
};

export const isPendingPayment = (payload: GatewayPayload) => {
  const txnStatus = (payload.txnStatus || "").toUpperCase();

  if (txnStatus) {
    return txnStatus === "PEN" || txnStatus === "PENDING" || txnStatus === "REQ";
  }

  return (
    ["R1000"].includes(payload.responseCode || "") ||
    ["R1000"].includes(payload.respCode || "")
  );
};

export const buildInitiateSaleRequest = (
  input: Omit<
    InitiateSaleRequest,
    "amount" | "currencyCode" | "payType" | "transactionType" | "txnDate" | "customerName"
  > & { amount: number; customerName: string },
): InitiateSaleRequest => {
  const request: InitiateSaleRequest = {
    merchantId: input.merchantId,
    merchantTxnNo: input.merchantTxnNo,
    amount: formatAmount(input.amount),
    currencyCode: "356",
    payType: "0",
    customerEmailID: input.customerEmailID,
    transactionType: "SALE",
    returnURL: input.returnURL,
    txnDate: formatTxnDate(),
    customerMobileNo: input.customerMobileNo,
    customerName: toAsciiSafe(input.customerName),
    addlParam1: input.addlParam1 ?? "0",
    addlParam2: input.addlParam2 ?? "111",
  };

  // Confirmed directly with ICICI's integration team: for this merchant
  // (configured with an aggregator), aggregatorID participates in both the
  // request and the secureHash calculation. Still conditional on
  // input.aggregatorID being set, in case this code ever serves a
  // non-aggregator merchant config where it should be omitted entirely.
  if (input.aggregatorID) {
    request.aggregatorID = input.aggregatorID;
  }

  return request;
};

export const buildStatusCheckRequest = (
  input: Omit<StatusCheckRequest, "transactionType">,
): StatusCheckRequest => {
  const request: StatusCheckRequest = {
    merchantId: input.merchantId,
    merchantTxnNo: input.merchantTxnNo,
    originalTxnNo: input.originalTxnNo,
    transactionType: "STATUS",
  };

  if (input.aggregatorID) {
    request.aggregatorID = input.aggregatorID;
  }

  return request;
};

export const buildRefundRequest = (
  input: Omit<RefundRequest, "transactionType" | "amount"> & { amount: number },
): RefundRequest => {
  const request: RefundRequest = {
    merchantId: input.merchantId,
    merchantTxnNo: input.merchantTxnNo,
    originalTxnNo: input.originalTxnNo,
    amount: formatAmount(input.amount),
    transactionType: "REFUND",
  };

  if (input.aggregatorID) {
    request.aggregatorID = input.aggregatorID;
  }

  if (input.addlParam1) {
    request.addlParam1 = input.addlParam1;
  }

  return request;
};

export const verifyInitiateSaleResponse = (payload: InitiateSaleResponse, secretKey: string) =>
  verifySecureHash(payload as Record<string, unknown>, secretKey);
