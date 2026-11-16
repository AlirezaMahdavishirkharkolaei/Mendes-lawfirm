import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { PracticeAreasIndex } from "@/components/sections/PracticeAreasIndex";
import { PageContainer, SectionContainer } from "@/components/layout";
import { Button, Reveal } from "@/components/ui";
import { getDictionary, resolveLocale } from "@/i18n/get";
import { href, locales } from "@/i18n/config";
import { getPracticeArea, practiceAreas } from "@/content/practice-areas";
import { alternates } from "@/lib/seo";

type Params = Promise<{ lang: string; slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((lang) => practiceAreas.map((a) => ({ lang, slug: a.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const area = getPracticeArea((await params).slug);
  if (!area) return {};
  return { title: area.title[locale], description: area.summary[locale], alternates: alternates(locale, `practice-areas/${area.slug}`) };
}

export default async function PracticeAreaPage({ params }: { params: Params }) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const area = getPracticeArea((await params).slug);
  if (!area) notFound();

  return (
    <>
      <PageHeader
        title={area.title[locale]}
        lead={area.summary[locale]}
        crumbs={[
          { label: t.nav.home, href: href(locale) },
          { label: t.nav.practiceAreas, href: href(locale, "practice-areas") },
          { label: area.title[locale] },
        ]}
      />
      <SectionContainer className="pt-0 md:pt-0 lg:pt-0">
        <PageContainer className="grid gap-12 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-7">
            {area.description[locale].map((p) => (
              <p key={p} className="font-body text-lead text-ink">
                {p}
              </p>
            ))}
          </div>
          <Reveal className="lg:col-span-5">
            <div className="flex flex-col gap-6 border-t border-border pt-6 lg:border-t-0 lg:border-s lg:ps-10 lg:pt-0">
              <h2 className="font-mono text-ui-sm uppercase tracking-mono text-ink-muted">{t.practice.whatWeDo}</h2>
              <ul className="flex flex-col gap-4">
                {area.services[locale].map((s) => (
                  <li key={s} className="flex gap-3 font-body text-body text-ink">
                    <span aria-hidden="true" className="font-mono text-accent">
                      §
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
              <Button href={`${href(locale, "consultation")}?area=${area.slug}`} variant="primary" className="mt-4 self-start">
                {t.practice.discuss}
              </Button>
            </div>
          </Reveal>
        </PageContainer>
      </SectionContainer>
      <SectionContainer className="border-t border-border">
        <PageContainer className="flex flex-col gap-10">
          <h2 className="font-display text-h2 tracking-heading text-ink">{t.practice.related}</h2>
          <PracticeAreasIndex locale={locale} exclude={area.slug} />
        </PageContainer>
      </SectionContainer>
    </>
  );
}
