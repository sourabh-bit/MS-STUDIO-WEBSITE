import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";

export type Country = {
  iso2: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
};

// Regional-indicator trick: each ISO 3166-1 alpha-2 letter maps to a Unicode
// regional-indicator symbol; two of them together render as that country's
// flag emoji, with zero flag image assets needed.
const flagForIso2 = (iso2: string) =>
  String.fromCodePoint(...[...iso2.toUpperCase()].map((char) => 127397 + char.charCodeAt(0)));

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export const COUNTRIES: Country[] = getCountries()
  .map((iso2) => ({
    iso2,
    name: regionNames.of(iso2) || iso2,
    dialCode: getCountryCallingCode(iso2),
    flag: flagForIso2(iso2),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const DEFAULT_COUNTRY: CountryCode = "IN";

export const findCountry = (iso2: string) =>
  COUNTRIES.find((country) => country.iso2 === iso2);

// Registration form's country picker: India first (the default), then
// where most international students come from, then everyone else.
// PAN, Indian state and GSTIN are only asked for in India.
export const INDIA = findCountry("IN")?.name ?? "India";

const POPULAR_ISO2: CountryCode[] = ["IN", "US", "CA", "GB", "BD", "NP", "AE", "AU", "LK", "SG"];

const POPULAR_COUNTRIES = POPULAR_ISO2.map(findCountry).filter((country): country is Country =>
  Boolean(country),
);

export const COUNTRY_GROUPS = [
  { label: "Popular", countries: POPULAR_COUNTRIES },
  {
    label: "All countries",
    countries: COUNTRIES.filter((country) => !POPULAR_ISO2.includes(country.iso2)),
  },
];
