import type { Request } from "express";

export type PaymentLifecycleStatus =
  | "CREATED"
  | "INITIATED"
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED"
  | "HASH_MISMATCH"
  | "ERROR";

export type PaymentLogStage =
  | "INITIATE_REQUEST"
  | "INITIATE_RESPONSE"
  | "REUSED_TRANSACTION"
  | "NEW_TRANSACTION_CREATED"
  | "TRANSACTION_EXPIRED"
  | "CALLBACK_RECEIVED"
  | "CALLBACK_VERIFIED"
  | "CALLBACK_HASH_MISMATCH"
  | "STATUS_API_VERIFICATION_STARTED"
  | "STATUS_API_VERIFIED_SUCCESS"
  | "STATUS_API_VERIFIED_FAILED"
  | "STATUS_REQUEST"
  | "STATUS_RESPONSE"
  | "REDIRECT";

export type InitiatePaymentInput = {
  customerName: string;
  email: string;
  mobile: string;
  amount: number;
  courseName: string;
  variant: "online" | "offline";
  feeLabel: string;
  summaryLabel: string;
};

export type InitiateSaleRequest = {
  merchantId: string;
  aggregatorID?: string;
  merchantTxnNo: string;
  amount: string;
  currencyCode: string;
  payType: "0";
  customerEmailID: string;
  transactionType: "SALE";
  returnURL: string;
  txnDate: string;
  customerMobileNo: string;
  customerName: string;
  addlParam1?: string;
  addlParam2?: string;
  secureHash?: string;
};

export type InitiateSaleResponse = {
  responseCode: string;
  merchantId: string;
  aggregatorID?: string | null;
  merchantTxnNo: string;
  redirectURI: string;
  showOTPCapturePage?: string | null;
  generateOTPURI?: string | null;
  verifyOTPURI?: string | null;
  authorizeURI?: string | null;
  tranCtx: string;
  secureHash?: string;
  [key: string]: unknown;
};

export type StatusCheckRequest = {
  merchantId: string;
  aggregatorID?: string;
  merchantTxnNo: string;
  originalTxnNo: string;
  transactionType: "STATUS";
  secureHash?: string;
};

export type GatewayPayload = Record<string, string>;

export type ParsedCallbackRequest = Request & {
  rawBody?: string;
};
