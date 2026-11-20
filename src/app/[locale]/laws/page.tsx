import type { Metadata } from "next";
import { pageContext } from "@/lib/site";
import { listLaws } from "@/lib/data/laws";
import { pick } from "@/lib/i18n/config";
import { PageHero } from "@/components/sections/PageHero";
import { LawsBrowser } from "@/components/laws/LawsBrowser";
import { Container, Notice } from "@/components/ui/misc";

// Same for every visitor: served from the edge cache, refreshed in the background.
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { d } = await pageContext(params);
  return { title: d.laws.title, description: d.laws.lead };
}

export default async function Laws({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, d, l } = await pageContext(params);
  const laws = await listLaws();
  return (
    <>
      <PageHero label={d.home.lawsLabel} title={d.laws.title} lead={d.laws.lead} />
      <Container className="pb-24">
        <LawsBrowser
          placeholder={d.laws.searchPlaceholder}
          allLabel={d.common.all}
          laws={laws.map((law) => ({
            slug: law.slug,
            href: l(`/laws/${law.slug}`),
            reference: law.reference,
            title: pick(law.title, locale),
            summary: law.summary[locale],
            category: law.category,
            categoryLabel: d.laws.categories[law.category as keyof typeof d.laws.categories] ?? law.category,
          }))}
        />
        <Notice className="mt-16">{d.laws.disclaimer}</Notice>
      </Container>
    </>
  );
}
