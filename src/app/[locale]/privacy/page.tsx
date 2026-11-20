import type { Metadata } from "next";
import { pageContext } from "@/lib/site";
import { privacy } from "@/content/legal";
import { LegalPage } from "@/components/legal/LegalPage";

// Same for every visitor: served from the edge cache, refreshed in the background.
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await pageContext(params);
  return { title: privacy[locale].title, description: privacy[locale].intro.slice(0, 160) };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, d, settings } = await pageContext(params);
  return <LegalPage doc={privacy[locale]} locale={locale} email={settings.office_email || settings.boss_email?.split(",")[0]?.trim() || ""} updatedLabel={d.legal.updated} />;
}
