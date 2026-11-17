import "server-only";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { getSettings } from "@/lib/settings";

/** Resolves the [locale] route param, 404-ing on unknown values. */
export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

export async function pageContext(params: Promise<{ locale: string }>) {
  const locale = await resolveLocale(params);
  const [d, settings] = await Promise.all([getDictionary(locale), getSettings()]);
  return { locale, d, settings, l: (path: string) => `/${locale}${path}` };
}
