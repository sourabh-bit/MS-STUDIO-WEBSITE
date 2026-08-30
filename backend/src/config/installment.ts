const readOptional = (key: string) => process.env[key]?.trim() || "";

// Keyed on courseName — the same key already used across Registration and
// Payment — so adding a second course later is just another map entry.
export const SECOND_INSTALLMENT_TOTALS: Record<string, number> = {
  "Meera Sakhrani Offline Masterclass": 136000,
};

export const SECOND_INSTALLMENT_MIN_AMOUNT = Number(
  readOptional("SECOND_INSTALLMENT_MIN_AMOUNT") || 10000,
);

export const getSecondInstallmentTotal = (courseName: string) =>
  SECOND_INSTALLMENT_TOTALS[courseName] ?? 0;
