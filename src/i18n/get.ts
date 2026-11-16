import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { tr } from "./dictionaries/tr";
import { fa } from "./dictionaries/fa";

const dictionaries: Record<Locale, Dictionary> = { en, tr, fa };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Narrows the `lang` route param, or renders the 404 page for unknown languages. */
export async function resolveLocale(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return lang;
}
