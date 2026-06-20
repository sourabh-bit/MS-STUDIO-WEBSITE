export type PaymentVariant = "online" | "offline";

export type InitiatePaymentRequest = {
  customerName: string;
  email: string;
  mobile: string;
  amount: number;
  courseName: string;
  variant: PaymentVariant;
  feeLabel?: string;
  summaryLabel?: string;
};

export type InitiatePaymentResponse = {
  merchantTxnNo: string;
  redirectUrl?: string;
  reused?: boolean;
  gatewayUrl?: string;
  gatewayFields?: Record<string, string>;
};

export type PaymentStatusResponse = {
  merchantTxnNo: string;
  txnID?: string;
  paymentStatus: string;
  gatewayResponse: Record<string, string>;
};
