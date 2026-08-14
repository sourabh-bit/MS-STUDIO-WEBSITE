export type PaymentVariant = "online" | "offline";

export type InitiatePaymentRequest = {
  amount: number;
  courseName: string;
  variant: PaymentVariant;
  feeLabel?: string;
  summaryLabel?: string;
};

export type InitiatePaymentResponse = {
  merchantTxnNo: string;
  redirectUrl: string;
  reused?: boolean;
};

export type PaymentStatusResponse = {
  merchantTxnNo: string;
  txnID?: string;
  paymentStatus: string;
  gatewayResponse: Record<string, string>;
};
