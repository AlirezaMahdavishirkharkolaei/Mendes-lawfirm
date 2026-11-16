import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { PageContainer, SectionContainer } from "@/components/layout";
import { Metadata as Meta, Reveal } from "@/components/ui";
import { getDictionary, resolveLocale } from "@/i18n/get";
import { href } from "@/i18n/config";
import { insights } from "@/content/insights";
import { getPracticeArea } from "@/content/practice-areas";
import { alternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return { title: t.insights.title, description: t.insights.lead, alternates: alternates(locale, "insights"), robots: insights.length ? undefined : { index: false } };
}

/** Articles in the reader's language first, then English ones (labelled). Hidden while there are none. */
export default async function Insights({ params }: { params: Promise<{ lang: string }> }) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const list = [...insights.filter((i) => i.lang === locale), ...(locale === "en" ? [] : insights.filter((i) => i.lang === "en"))];
  if (!list.length) notFound();

  return (
    <>
      <PageHeader title={t.insights.title} lead={t.insights.lead} crumbs={[{ label: t.nav.home, href: href(locale) }, { label: t.insights.title }]} />
      <SectionContainer className="pt-0 md:pt-0 lg:pt-0">
        <PageContainer>
          <ul className="flex flex-col divide-y divide-border border-t border-border">
            {list.map((i, n) => (
              <Reveal key={i.slug} index={n} as="li">
                <Link href={href(locale, `insights/${i.slug}`)} className="group flex flex-col gap-2 py-8">
                  <Meta
                    parts={[
                      i.publishedAt.replaceAll("-", "."),
                      ...i.practiceAreaSlugs.map((s) => getPracticeArea(s)?.title[locale]).filter((x): x is string => Boolean(x)),
                      ...(i.lang !== locale ? [t.insights.inEnglish] : []),
                    ]}
                  />
                  <span lang={i.lang} className="font-body text-h3 font-semibold text-ink transition-colors group-hover:text-accent">
                    {i.title}
                  </span>
                  <span lang={i.lang} className="max-w-2xl font-body text-body text-ink-muted">
                    {i.summary}
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </PageContainer>
      </SectionContainer>
    </>
  );
}
