import { z } from "zod";

/**
 * Insight (article) content schema. See attorney.ts for the CMS-portability
 * rationale — the same applies here.
 *
 * `body` holds plain content for now. If the content approach is switched
 * to MDX later, this field is the one that changes shape (e.g. to a
 * compiled MDX source) — the rest of the schema is unaffected.
 */
export const insightSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  body: z.string().min(1),
  publishedAt: z.string().min(1), // ISO date string
  authorSlug: z.string().min(1).optional(),
  practiceAreaSlugs: z.array(z.string().min(1)).default([]),
});

export type Insight = z.infer<typeof insightSchema>;

export const insightsSchema = z.array(insightSchema);
