import { z } from "zod";

/**
 * Insight (article) schema. Articles are written in one language;
 * `lang` says which, and the Insights pages only list articles in the
 * reader's language plus English ones marked as such.
 */
export const insightSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  lang: z.enum(["en", "tr", "fa"]),
  title: z.string().min(1),
  summary: z.string().min(1),
  body: z.array(z.string().min(1)).min(1), // paragraphs
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  authorSlug: z.string().min(1).optional(),
  practiceAreaSlugs: z.array(z.string().min(1)).default([]),
});

export type Insight = z.infer<typeof insightSchema>;
export const insightsSchema = z.array(insightSchema);
