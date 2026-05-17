import crypto from "node:crypto";

import type {
  GatewayPayload,
  InitiateSaleRequest,
  InitiateSaleResponse,
  StatusCheckRequest,
} from "../types/payment.js";

const isSecureHashKey = (key: string) => key.trim().toLowerCase() === "securehash";

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

const compareCallbackKeys = (left: string, right: string) => {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
};

const sortCallbackPayloadEntries = (payload: Record<string, unknown>) =>
  Object.entries(payload)
    .filter(([key]) => !isSecureHashKey(key))
    .sort(([left], [right]) => compareCallbackKeys(left, right));

const normaliseCallbackValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

export const buildHashPlainText = (payload: Record<string, unknown>) =>
  sortPayloadEntries(payload)
    .map(([, value]) => String(value ?? ""))
    .join("");

export const buildCallbackHashPlainText = (payload: Record<string, unknown>) =>
  sortCallbackPayloadEntries(payload)
    .map(([, value]) => normaliseCallbackValue(value))
    .join("");

export const createSecureHash = (
  payload: Record<string, unknown>,
  secretKey: string,
) =>
  crypto
    .createHmac("sha256", secretKey)
    .update(buildHashPlainText(payload), "utf8")
    .digest("hex");

export const attachSecureHash = <T extends Record<string, unknown>>(
  payload: T,
  secretKey: string,
) => ({
  ...payload,
  secureHash: createSecureHash(payload, secretKey),
});

export const verifySecureHash = (
  payload: Record<string, unknown>,
  secretKey: string,
) => {
  const secureHashEntry = Object.entries(payload).find(([key]) => isSecureHashKey(key));
  const receivedHash = String(secureHashEntry?.[1] ?? "")
    .trim()
    .toLowerCase();

  if (!receivedHash) {
    return false;
  }

  const expectedHash = createSecureHash(payload, secretKey).toLowerCase();
  const receivedBuffer = Buffer.from(receivedHash, "utf8");
  const expectedBuffer = Buffer.from(expectedHash, "utf8");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
};

export const verifyCallbackSecureHash = (
  payload: Record<string, unknown>,
  secretKey: string,
) => {
  const secureHashEntry = Object.entries(payload).find(([key]) => isSecureHashKey(key));
  const receivedHash = String(secureHashEntry?.[1] ?? "")
    .trim()
    .toLowerCase();
  const sortedKeys = sortCallbackPayloadEntries(payload).map(([key]) => key);
  const verificationString = buildCallbackHashPlainText(payload);
  const generatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(verificationString, "utf8")
    .digest("hex")
    .toLowerCase();
  const payloadKeys = Object.keys(payload);

  if (!receivedHash) {
    return {
      isValid: false,
      payloadKeys,
      sortedKeys,
      verificationString,
      generatedHash,
      receivedHash,
    };
  }

  const receivedBuffer = Buffer.from(receivedHash, "utf8");
  const expectedBuffer = Buffer.from(generatedHash, "utf8");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return {
      isValid: false,
      payloadKeys,
      sortedKeys,
      verificationString,
      generatedHash,
      receivedHash,
    };
  }

  return {
    isValid: crypto.timingSafeEqual(receivedBuffer, expectedBuffer),
    payloadKeys,
    sortedKeys,
    verificationString,
    generatedHash,
    receivedHash,
  };
};

export const formatTxnDate = (date = new Date()) => {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
};

export const formatAmount = (amount: number) => amount.toFixed(2);

export const buildRedirectUrl = (redirectURI: string, tranCtx: string) => {
  const url = new URL(redirectURI);
  url.searchParams.set("tranCtx", tranCtx);
  return url.toString();
};

export const normaliseGatewayPayload = (
  payload: Record<string, unknown>,
): GatewayPayload =>
  Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, String(value ?? "")]),
  );

export const isSuccessfulPayment = (payload: GatewayPayload) =>
  ["SUC", "SUCCESS"].includes((payload.txnStatus || "").toUpperCase()) ||
  ["000", "0000"].includes(payload.txnResponseCode || "") ||
  ["000", "0000"].includes(payload.responseCode || "") ||
  ["000", "0000"].includes(payload.respCode || "");

export const isPendingPayment = (payload: GatewayPayload) =>
  ["PEN", "PENDING", "R1000"].includes((payload.txnStatus || "").toUpperCase()) ||
  ["R1000"].includes(payload.responseCode || "") ||
  ["R1000"].includes(payload.respCode || "");

export const buildInitiateSaleRequest = (
  input: Omit<
    InitiateSaleRequest,
    "amount" | "currencyCode" | "payType" | "transactionType" | "txnDate"
  > & { amount: number },
): InitiateSaleRequest => ({
  merchantId: input.merchantId,
  aggregatorID: input.aggregatorID,
  merchantTxnNo: input.merchantTxnNo,
  amount: formatAmount(input.amount),
  currencyCode: "356",
  payType: "0",
  customerEmailID: input.customerEmailID,
  transactionType: "SALE",
  returnURL: input.returnURL,
  txnDate: formatTxnDate(),
  customerMobileNo: input.customerMobileNo,
  customerName: input.customerName,
  addlParam1: input.addlParam1 ?? "000",
  addlParam2: input.addlParam2 ?? "111",
});

export const buildStatusCheckRequest = (
  input: Omit<StatusCheckRequest, "transactionType">,
): StatusCheckRequest => ({
  merchantId: input.merchantId,
  aggregatorID: input.aggregatorID,
  merchantTxnNo: input.merchantTxnNo,
  originalTxnNo: input.originalTxnNo,
  transactionType: "STATUS",
});

export const verifyInitiateSaleResponse = (
  payload: InitiateSaleResponse,
  secretKey: string,
) => verifySecureHash(payload as Record<string, unknown>, secretKey);
