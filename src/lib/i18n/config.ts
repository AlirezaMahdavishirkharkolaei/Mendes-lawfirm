export const locales = ["en", "tr", "fa", "ru", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeMeta: Record<
  Locale,
  { label: string; native: string; dir: "ltr" | "rtl"; htmlLang: string; intl: string }
> = {
  en: { label: "English", native: "English", dir: "ltr", htmlLang: "en", intl: "en-GB" },
  tr: { label: "Turkish", native: "Türkçe", dir: "ltr", htmlLang: "tr", intl: "tr-TR" },
  fa: { label: "Persian", native: "فارسی", dir: "rtl", htmlLang: "fa", intl: "fa-IR" },
  ru: { label: "Russian", native: "Русский", dir: "ltr", htmlLang: "ru", intl: "ru-RU" },
  ar: { label: "Arabic", native: "العربية", dir: "rtl", htmlLang: "ar", intl: "ar" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export function asLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale;
}

/** Picks the best locale from an Accept-Language header. */
export function negotiateLocale(header: string | null): Locale {
  if (!header) return defaultLocale;
  const wanted = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase().slice(0, 2), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of wanted) if (isLocale(tag)) return tag;
  return defaultLocale;
}

/** Reads a value from a per-locale JSON map, falling back to English. */
export function pick(map: Partial<Record<string, string>> | undefined, locale: Locale): string {
  if (!map) return "";
  return map[locale] || map.en || Object.values(map).find(Boolean) || "";
}
