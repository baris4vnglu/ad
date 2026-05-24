export const locales = ["tr", "en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "tr";

export const localeNames: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  ar: "العربية",
};

export const rtlLocales: Locale[] = ["ar"];

export function isRTL(locale: Locale) {
  return rtlLocales.includes(locale);
}
