import { localeMeta, type Locale } from "./config";

export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

export const FIRM_TZ = "Asia/Famagusta";

export function formatDate(iso: string | null | undefined, locale: Locale, withTime = false, timeZone = FIRM_TZ): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(localeMeta[locale].intl, {
    dateStyle: "long",
    ...(withTime ? { timeStyle: "short" } : {}),
    timeZone,
  }).format(date);
}

export function formatTime(iso: string, locale: Locale, timeZone = FIRM_TZ): string {
  return new Intl.DateTimeFormat(localeMeta[locale].intl, { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date(iso));
}
