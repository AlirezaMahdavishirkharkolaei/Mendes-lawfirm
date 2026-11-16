import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { PageContainer, SectionContainer } from "@/components/layout";
import { ConsultationForm } from "@/components/forms/ConsultationForm";
import { getDictionary, resolveLocale } from "@/i18n/get";
import { href } from "@/i18n/config";
import { firm } from "@/content/firm";
import { practiceAreas } from "@/content/practice-areas";
import { alternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return { title: t.consultation.title, description: t.consultation.lead, alternates: alternates(locale, "consultation") };
}

export default async function Consultation({ params }: { params: Promise<{ lang: string }> }) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const areas = practiceAreas.map((a) => ({ slug: a.slug, title: a.title[locale], titleEn: a.title.en }));

  return (
    <>
      <PageHeader title={t.consultation.title} lead={t.consultation.lead} crumbs={[{ label: t.nav.home, href: href(locale) }, { label: t.consultation.title }]} />
      <SectionContainer className="pt-0 md:pt-0 lg:pt-0">
        <PageContainer className="max-w-[56rem]">
          <ConsultationForm locale={locale} t={t.consultation} areas={areas} email={firm.email} whatsapp={firm.whatsapp} />
        </PageContainer>
      </SectionContainer>
    </>
  );
}
