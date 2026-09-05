import Link from "next/link";
import { insights } from "@/content/insights";
import { getPracticeAreaTitle } from "@/lib/content";
import { Button, Metadata, Reveal } from "@/components/ui";
import { PageContainer, SectionContainer } from "@/components/layout";

/**
 * Formats an ISO date string ("2026-01-01") as a citation-style date
 * ("2026.01.01"), consistent with the mono/docket metadata language
 * used elsewhere. This reformats an existing date string — it does not
 * invent or alter the underlying date.
 */
function formatDate(iso: string): string {
  return iso.replaceAll("-", ".");
}

/**
 * Editorial Insights preview. Uses only fields insightSchema actually
 * has (title, summary, publishedAt, practiceAreaSlugs resolved to a
 * category label). Per Phase 4 decision #2, no reading-time metadata
 * is shown — the schema doesn't support it, and it isn't added here
 * just to support this presentation.
 */
export function InsightsPreview() {
  return (
    <SectionContainer className="border-t border-border">
      <PageContainer className="flex flex-col gap-10">
        <h2 className="font-display text-h2 tracking-heading text-ink">
          Insights
        </h2>

        <ul className="flex flex-col divide-y divide-border">
          {insights.map((insight, i) => {
            const categories = insight.practiceAreaSlugs
              .map(getPracticeAreaTitle)
              .filter((title): title is string => Boolean(title));
            const metadataParts = [formatDate(insight.publishedAt), ...categories];

            return (
              <Reveal key={insight.slug} index={i} as="li">
                <Link
                  href={`/insights/${insight.slug}`}
                  className="group flex flex-col gap-2 py-8"
                >
                  <Metadata parts={metadataParts} />
                  <span className="font-body text-h3 font-semibold text-ink transition-colors duration-[175ms] ease-editorial group-hover:text-accent">
                    {insight.title}
                  </span>
                  <span className="max-w-2xl font-body text-body text-ink-muted">
                    {insight.summary}
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>

        <Button href="/insights" variant="secondary" className="self-start">
          View all insights
        </Button>
      </PageContainer>
    </SectionContainer>
  );
}
