/**
 * Supported languages. English is the default and the reference for
 * every dictionary (see dictionaries/en.ts). Persian is right-to-left.
 */
export const locales = ["en", "tr", "fa"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeMeta: Record<Locale, { label: string; name: string; dir: "ltr" | "rtl"; htmlLang: string }> = {
  en: { label: "EN", name: "English", dir: "ltr", htmlLang: "en" },
  tr: { label: "TR", name: "Türkçe", dir: "ltr", htmlLang: "tr" },
  fa: { label: "فا", name: "فارسی", dir: "rtl", htmlLang: "fa" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** A string in every supported language. */
export type Localized = Record<Locale, string>;

/** "/practice-areas" → "/tr/practice-areas". Paths always end with a slash (static hosting). */
export function href(locale: Locale, path = "/"): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `/${locale}/${clean}/` : `/${locale}/`;
}
