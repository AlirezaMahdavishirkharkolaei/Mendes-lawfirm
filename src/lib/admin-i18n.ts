import "server-only";
import { cookies } from "next/headers";
import { ADMIN_TR } from "./admin-tr";

export type AdminLang = "en" | "tr";
export const ADMIN_LANG_COOKIE = "mendes_admin_lang";

export async function adminLang(): Promise<AdminLang> {
  return (await cookies()).get(ADMIN_LANG_COOKIE)?.value === "tr" ? "tr" : "en";
}

/**
 * Translator for the admin panel. Strings are written in English in the
 * code and looked up in ADMIN_TR (src/lib/admin-tr.ts) when the admin has
 * chosen Turkish; anything missing falls back to English.
 */
export async function adminT(): Promise<(en: string) => string> {
  const lang = await adminLang();
  return (en: string) => (lang === "tr" ? (ADMIN_TR[en] ?? en) : en);
}
