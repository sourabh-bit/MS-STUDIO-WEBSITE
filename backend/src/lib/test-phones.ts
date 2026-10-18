// Mobile numbers the team uses to run the real enrolment + payment flow
// over and over. For these numbers nothing is written to the Google Sheets,
// they're never treated as already registered or enrolled (so the form and
// payment run every time), and invoices get a TEST- number instead of using
// up the real MSB-B2C series.
//
// Set TEST_PHONE_NUMBERS (comma-separated, any format) to change the list;
// "none" turns it off.
const DEFAULT_TEST_PHONE_NUMBERS = "8920135102,9584337006";

const digitsOf = (value: string) => (value || "").replace(/\D/g, "");

const testNumbers = () => {
  const raw = process.env.TEST_PHONE_NUMBERS?.trim() || DEFAULT_TEST_PHONE_NUMBERS;

  if (raw.toLowerCase() === "none") {
    return [];
  }

  return raw
    .split(",")
    .map(digitsOf)
    .filter((digits) => digits.length >= 7);
};

// Numbers arrive in several shapes ("+919584337006", "9584337006",
// "+91-9584337006"), so match when one ends with the other.
export const isTestPhone = (value: string | null | undefined) => {
  const digits = digitsOf(value ?? "");

  if (digits.length < 7) {
    return false;
  }

  return testNumbers().some((test) => digits.endsWith(test) || test.endsWith(digits));
};
