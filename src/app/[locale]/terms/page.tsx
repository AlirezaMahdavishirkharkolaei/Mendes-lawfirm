import type { Metadata } from "next";
import { pageContext } from "@/lib/site";
import { terms } from "@/content/legal";
import { LegalPage } from "@/components/legal/LegalPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await pageContext(params);
  return { title: terms[locale].title, description: terms[locale].intro.slice(0, 160) };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, d, settings } = await pageContext(params);
  return <LegalPage doc={terms[locale]} locale={locale} email={settings.office_email || settings.boss_email?.split(",")[0]?.trim() || ""} updatedLabel={d.legal.updated} />;
}
