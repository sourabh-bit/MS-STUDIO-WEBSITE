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
