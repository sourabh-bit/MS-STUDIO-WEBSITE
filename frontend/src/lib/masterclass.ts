// Online masterclass: ₹15,000 + 18% GST. `fee` is the GST-inclusive
// amount actually charged and must match COURSE_ADVANCE_FEES in
// backend/src/config/courses.ts — the backend rejects any other amount at
// payment time. `baseFee` is the pre-GST price shown on the brochure.
export const MASTERCLASS_DETAILS = {
  courseName: "Meera Sakhrani Online Masterclass",
  baseFee: 15000,
  fee: 17700,
  feeLabel: "One-time Masterclass Fee",
  summaryLabel: "4-hour live online masterclass",
  trustLine: "Secure payment via ICICI Bank",
  // Shown on the brochure — update once the next batch is scheduled.
  dateLabel: "To Be Announced",
  timeLabel: "12:00 PM – 4:00 PM IST",
  modeLabel: "Online (Live)",
} as const;

// Manual on/off switch for new online-masterclass registrations. While
// false, every enrol button opens the "registrations closed" dialog
// instead of the sign-up flow.
export const IS_ONLINE_REGISTRATION_OPEN = true;

// Price before 18% GST, for "₹X + GST" breakdowns. Every course fee is
// charged GST-inclusive, and the invoice backs the tax out the same way.
export const preGstAmount = (inclusiveAmount: number) => Math.round(inclusiveAmount / 1.18);

export const formatInrSymbol = (amount: number) =>
  `₹${new Intl.NumberFormat("en-IN").format(amount)}`;

// Manual on/off switch for new offline-masterclass registrations — flip to
// true once the next batch's dates are finalised. Doesn't affect anyone
// who already registered: they can still pay their second installment as
// normal, this only blocks brand-new sign-ups.
export const IS_OFFLINE_REGISTRATION_OPEN = false;

export const OFFLINE_MASTERCLASS_DETAILS = {
  courseName: "Meera Sakhrani Offline Masterclass",
  fee: 100000,
  totalFeeLabel: "Total Course Fee",
  totalFeeRange: "₹3L +",
  totalFeeGst: "GST",
  feeLabel: "Booking Amount",
  summaryLabel: "Reserve your 7-day intensive seat",
  trustLine: "Secure payment via ICICI Bank",
} as const;

// Display-only fallback shown before the backend summary call resolves —
// the backend (SECOND_INSTALLMENT_TOTALS in payment.service) stays the
// authoritative source once a real summary loads.
export const SECOND_INSTALLMENT_TOTAL = 136000;

export const formatInr = (amount: number) =>
  `INR ${new Intl.NumberFormat("en-IN").format(amount)}`;

const getPositiveAmount = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const normalizedValue = value.replace(/[^\d.]/g, "");
  const parsedAmount = Number(normalizedValue);

  return Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : fallback;
};

const getVariant = (value: string | null): "online" | "offline" =>
  value === "offline" ? "offline" : "online";

export const getMasterclassPaymentDetails = (params: URLSearchParams) => {
  const variant = getVariant(params.get("variant"));

  // A link can arrive without amount/feeLabel/summaryLabel set (e.g. a
  // "pay your remaining balance" email link) — when that happens, fall
  // back to whichever course's own real defaults match its variant,
  // rather than always defaulting to the online masterclass regardless
  // of which course is actually being paid for.
  const defaults = variant === "offline" ? OFFLINE_MASTERCLASS_DETAILS : MASTERCLASS_DETAILS;

  return {
    variant,
    courseName: params.get("course")?.trim() || defaults.courseName,
    fee: getPositiveAmount(params.get("amount"), defaults.fee),
    feeLabel: params.get("feeLabel")?.trim() || defaults.feeLabel,
    summaryLabel: params.get("summaryLabel")?.trim() || defaults.summaryLabel,
    trustLine: params.get("trustLine")?.trim() || defaults.trustLine,
    merchantTxnNo: params.get("merchantTxnNo")?.trim() || "",
    transactionId:
      params.get("txn")?.trim() ||
      params.get("transactionId")?.trim() ||
      params.get("merchantTxnNo")?.trim() ||
      "",
    userName: params.get("name")?.trim() || params.get("fullName")?.trim() || "",
    message: params.get("message")?.trim() || "",
    paymentType: params.get("paymentType")?.trim() === "SECOND_INSTALLMENT" ? "SECOND_INSTALLMENT" : "ADVANCE",
  };
};
