import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n/config";

/** canonical + hreflang links for a page; `path` without the language, e.g. "practice-areas/real-estate". */
export function alternates(locale: Locale, path: string): Metadata["alternates"] {
  const clean = path.replace(/^\/+|\/+$/g, "");
  const url = (l: string) => (clean ? `${l}/${clean}/` : `${l}/`);
  return {
    canonical: url(locale),
    languages: { ...Object.fromEntries(locales.map((l) => [l, url(l)])), "x-default": url("en") },
  };
}
