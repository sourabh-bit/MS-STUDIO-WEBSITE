// 5 letters + 4 digits + 1 letter, per the Income Tax Department's PAN format.
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const isValidPan = (value: string) => PAN_PATTERN.test(value.trim().toUpperCase());
