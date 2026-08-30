export type PaymentVariant = "online" | "offline";

export type PaymentType = "ADVANCE" | "SECOND_INSTALLMENT";

export type InitiatePaymentRequest = {
  amount: number;
  courseName: string;
  variant: PaymentVariant;
  feeLabel?: string;
  summaryLabel?: string;
  paymentType?: PaymentType;
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

export type AdvancePaymentSummary =
  | { status: "UNPAID" }
  | { status: "PAID"; amount: number; transactionId: string; paidAt: string };

export type SecondInstallmentSummary = {
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  status: "UNPAID" | "PARTIAL" | "PAID";
  minAmount: number;
};

export type PaymentSummaryResponse = {
  advance: AdvancePaymentSummary;
  secondInstallment: SecondInstallmentSummary;
};
