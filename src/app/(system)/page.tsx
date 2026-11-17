import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale, negotiateLocale } from "@/lib/i18n/config";

/** "/" → the visitor's language (saved choice first, then Accept-Language). */
export default async function Root() {
  const saved = (await cookies()).get("mendes_locale")?.value;
  const locale = isLocale(saved) ? saved : negotiateLocale((await headers()).get("accept-language"));
  redirect(`/${locale}`);
}
