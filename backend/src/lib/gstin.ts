// 2-digit state code + 10-char PAN + 1-digit entity number + fixed 'Z' + 1
// alphanumeric checksum. Doesn't verify the checksum itself, just the shape.
const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const isValidGstin = (value: string) => GSTIN_PATTERN.test(value.trim().toUpperCase());
