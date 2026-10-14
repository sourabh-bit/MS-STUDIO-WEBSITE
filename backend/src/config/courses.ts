const readOptional = (key: string) => process.env[key]?.trim() || "";

const readAmount = (key: string, fallback: number) => {
  const parsed = Number(readOptional(key));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// Server-side price list for the first (ADVANCE) payment of each course,
// keyed on courseName — the same key used across Registration and Payment.
// The frontend sends an amount too, but it's display state only: without
// this check, anyone could edit the request and pay ₹1 for a seat. Must
// stay in sync with MASTERCLASS_DETAILS / OFFLINE_MASTERCLASS_DETAILS in
// frontend/src/lib/masterclass.ts; the env overrides exist so a live ₹1
// gateway test doesn't need a code change on this side.
export const COURSE_ADVANCE_FEES: Record<string, number> = {
  // ₹15,000 + 18% GST.
  "Meera Sakhrani Online Masterclass": readAmount("ONLINE_MASTERCLASS_FEE", 17700),
  "Meera Sakhrani Offline Masterclass": readAmount("OFFLINE_MASTERCLASS_ADVANCE", 100000),
};

export const getCourseAdvanceFee = (courseName: string) => COURSE_ADVANCE_FEES[courseName];

// Session details printed in the online masterclass's payment confirmation
// email. Must stay in sync with dateLabel / timeLabel / modeLabel in
// MASTERCLASS_DETAILS (frontend/src/lib/masterclass.ts) — update both
// whenever the next batch is scheduled.
export const ONLINE_CLASS_DETAILS = {
  dateLabel: "4 November 2026",
  timeLabel: "12:00 PM – 5:30 PM IST",
  modeLabel: "Online (Live)",
  joiningNote: "Your link to join the live session will be shared with you before the class begins.",
  supportWhatsApp: "919818793850",
} as const;
