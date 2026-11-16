import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { PracticeAreasIndex } from "@/components/sections/PracticeAreasIndex";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { PageContainer, SectionContainer } from "@/components/layout";
import { getDictionary, resolveLocale } from "@/i18n/get";
import { href } from "@/i18n/config";
import { alternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return { title: t.practice.title, description: t.practice.lead, alternates: alternates(locale, "practice-areas") };
}

export default async function PracticeAreas({ params }: { params: Promise<{ lang: string }> }) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return (
    <>
      <PageHeader title={t.practice.title} lead={t.practice.lead} crumbs={[{ label: t.nav.home, href: href(locale) }, { label: t.nav.practiceAreas }]} />
      <SectionContainer className="pt-0 md:pt-0 lg:pt-0">
        <PageContainer>
          <PracticeAreasIndex locale={locale} />
        </PageContainer>
      </SectionContainer>
      <ConsultationCTA locale={locale} t={t} />
    </>
  );
}
