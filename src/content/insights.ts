import { insightsSchema, type Insight } from "@/lib/schemas/insight";

/**
 * Articles. While this list is empty, the Insights section and its menu
 * entry are hidden. Add an article with its language (`lang`), date and
 * paragraphs; it is then listed on the Insights page.
 */
const rawInsights: Insight[] = [];

export const insights: Insight[] = insightsSchema.parse(rawInsights).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export function getInsight(slug: string): Insight | undefined {
  return insights.find((i) => i.slug === slug);
}
