import { insightsSchema, type Insight } from "@/lib/schemas/insight";

/**
 * DEMONSTRATION CONTENT ONLY. Replace with real articles before launch —
 * see attorneys.ts for the same note.
 */
const rawInsights: Insight[] = [
  {
    slug: "placeholder-insight-one",
    title: "Placeholder Insight Title",
    summary: "One-line placeholder summary for layout testing.",
    body: "Placeholder article body used to test typography and layout for the Insights section.",
    publishedAt: "2026-01-01",
    practiceAreaSlugs: ["placeholder-practice-area-one"],
  },
];

export const insights: Insight[] = insightsSchema.parse(rawInsights);
