import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { PageContainer, ReadingContainer, SectionContainer } from "@/components/layout";
import { Divider, Reveal } from "@/components/ui";
import { getDictionary, resolveLocale } from "@/i18n/get";
import { href } from "@/i18n/config";
import { alternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return { title: t.about.title, description: t.about.lead, alternates: alternates(locale, "about") };
}

export default async function About({ params }: { params: Promise<{ lang: string }> }) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return (
    <>
      <PageHeader title={t.about.title} lead={t.about.lead} crumbs={[{ label: t.nav.home, href: href(locale) }, { label: t.nav.about }]} />
      <SectionContainer className="pt-0 md:pt-0 lg:pt-0">
        <PageContainer>
          <ReadingContainer className="flex flex-col gap-6">
            {t.about.body.map((p) => (
              <p key={p} className="font-body text-lead text-ink">
                {p}
              </p>
            ))}
          </ReadingContainer>
        </PageContainer>
      </SectionContainer>
      <SectionContainer className="border-t border-border">
        <PageContainer className="flex flex-col gap-10">
          <h2 className="font-display text-h2 tracking-heading text-ink">{t.about.principlesTitle}</h2>
          <ul className="grid gap-10 md:grid-cols-3">
            {t.about.principles.map((pr, i) => (
              <Reveal key={pr.title} index={i} as="li">
                <Divider index={String(i + 1).padStart(2, "0")} className="mb-5" />
                <h3 className="mb-3 font-body text-h3 font-semibold text-ink">{pr.title}</h3>
                <p className="font-body text-body text-ink-muted">{pr.text}</p>
              </Reveal>
            ))}
          </ul>
        </PageContainer>
      </SectionContainer>
      <ConsultationCTA locale={locale} t={t} />
    </>
  );
}
