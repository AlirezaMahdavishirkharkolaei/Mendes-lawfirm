import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { PageContainer, ReadingContainer, SectionContainer } from "@/components/layout";
import { getDictionary, resolveLocale } from "@/i18n/get";
import { href, locales, localeMeta } from "@/i18n/config";
import { getInsight, insights } from "@/content/insights";
import { alternates } from "@/lib/seo";

type Params = Promise<{ lang: string; slug: string }>;
export const dynamicParams = false;

export function generateStaticParams() {
  // A static export needs at least one path; "_" renders the 404 page until articles exist.
  const slugs = insights.length ? insights.map((i) => i.slug) : ["_"];
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const i = getInsight((await params).slug);
  if (!i) return { robots: { index: false } };
  return { title: i.title, description: i.summary, alternates: alternates(locale, `insights/${i.slug}`) };
}

export default async function Article({ params }: { params: Params }) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const i = getInsight((await params).slug);
  if (!i) notFound();

  return (
    <article lang={i.lang} dir={localeMeta[i.lang].dir}>
      <PageHeader
        eyebrow={i.publishedAt.replaceAll("-", ".")}
        title={i.title}
        lead={i.summary}
        crumbs={[{ label: t.nav.home, href: href(locale) }, { label: t.insights.title, href: href(locale, "insights") }, { label: i.title }]}
      />
      <SectionContainer className="pt-0 md:pt-0 lg:pt-0">
        <PageContainer>
          <ReadingContainer className="flex flex-col gap-6">
            {i.body.map((p) => (
              <p key={p} className="font-body text-lead text-ink">
                {p}
              </p>
            ))}
          </ReadingContainer>
        </PageContainer>
      </SectionContainer>
    </article>
  );
}
