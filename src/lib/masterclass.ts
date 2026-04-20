export const MASTERCLASS_DETAILS = {
  courseName: "Meera Sakhrani Masterclass",
  fee: 15000,
  feeLabel: "One-time Masterclass Fee",
  summaryLabel: "Premium hands-on masterclass",
  trustLine: "Secure payment via ICICI Bank",
} as const;

export const OFFLINE_MASTERCLASS_DETAILS = {
  courseName: "Meera Sakhrani Offline Masterclass",
  fee: 100000,
  totalFeeLabel: "Total Course Fee",
  totalFeeRange: "INR 2L to INR 3L",
  feeLabel: "Booking Amount",
  summaryLabel: "Reserve your 7-day intensive seat",
  trustLine: "Secure payment via Axis Bank",
} as const;

export const formatInr = (amount: number) =>
  `\u20B9${new Intl.NumberFormat("en-IN").format(amount)}`;

const getPositiveAmount = (value: string | null) => {
  if (!value) {
    return MASTERCLASS_DETAILS.fee;
  }

  const normalizedValue = value.replace(/[^\d.]/g, "");
  const parsedAmount = Number(normalizedValue);

  return Number.isFinite(parsedAmount) && parsedAmount > 0
    ? parsedAmount
    : MASTERCLASS_DETAILS.fee;
};

const getVariant = (value: string | null) =>
  value === "offline" ? "offline" : "online";

export const getMasterclassPaymentDetails = (params: URLSearchParams) => ({
  variant: getVariant(params.get("variant")),
  courseName: params.get("course")?.trim() || MASTERCLASS_DETAILS.courseName,
  fee: getPositiveAmount(params.get("amount")),
  feeLabel: params.get("feeLabel")?.trim() || MASTERCLASS_DETAILS.feeLabel,
  summaryLabel:
    params.get("summaryLabel")?.trim() || MASTERCLASS_DETAILS.summaryLabel,
  trustLine: params.get("trustLine")?.trim() || MASTERCLASS_DETAILS.trustLine,
  transactionId:
    params.get("txn")?.trim() || params.get("transactionId")?.trim() || "",
  userName: params.get("name")?.trim() || params.get("fullName")?.trim() || "",
});
