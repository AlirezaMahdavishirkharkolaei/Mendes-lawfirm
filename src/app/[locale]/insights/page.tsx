import type { Metadata } from "next";
import { pageContext } from "@/lib/site";
import { listArticles } from "@/lib/data/articles";
import { formatDate } from "@/lib/i18n/format";
import { plainExcerpt, readingMinutes } from "@/lib/markdown";
import { PageHero } from "@/components/sections/PageHero";
import { ArticleCard } from "@/components/sections/cards";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/misc";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { d } = await pageContext(params);
  return { title: d.insights.title, description: d.insights.lead };
}

export default async function Insights({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, d, l } = await pageContext(params);
  const articles = await listArticles({ status: "published", limit: 60 });
  return (
    <>
      <PageHero label={d.home.insightsLabel} title={d.insights.title} lead={d.insights.lead}>
        <ButtonLink href={l("/insights/submit")} arrow>{d.insights.submitCta}</ButtonLink>
      </PageHero>
      <Container className="pb-24">
        {articles.length === 0 ? (
          <p className="text-lead text-ivory-muted">{d.insights.empty}</p>
        ) : (
          <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <Reveal key={a.id} index={i % 3}>
                <ArticleCard href={l(`/insights/${a.slug}`)} title={a.title} excerpt={plainExcerpt(a.abstract)} author={a.author_name} date={formatDate(a.published_at, locale)} minutes={readingMinutes(a.body)} minutesLabel={d.insights.readTime} student={a.author_role === "author" ? d.insights.student : undefined} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
