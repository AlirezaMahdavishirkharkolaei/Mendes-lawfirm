import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { PageContainer, ReadingContainer, SectionContainer } from "@/components/layout";
import { getDictionary, resolveLocale } from "@/i18n/get";
import { href } from "@/i18n/config";
import { firm } from "@/content/firm";
import { alternates } from "@/lib/seo";
import { fill } from "@/lib/navigation";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return { title: t.legal.privacyTitle, alternates: alternates(locale, "privacy"), robots: { index: true, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return (
    <>
      <PageHeader title={t.legal.privacyTitle} crumbs={[{ label: t.nav.home, href: href(locale) }, { label: t.legal.privacyTitle }]} />
      <SectionContainer className="pt-0 md:pt-0 lg:pt-0">
        <PageContainer>
          <ReadingContainer className="flex flex-col gap-6">
            {t.legal.privacy.map((p) => (
              <p key={p} className="font-body text-body text-ink">
                {fill(p, { email: firm.email })}
              </p>
            ))}
          </ReadingContainer>
        </PageContainer>
      </SectionContainer>
    </>
  );
}
