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
