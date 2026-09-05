import { z } from "zod";

/**
 * Practice Area content schema. See attorney.ts for the CMS-portability
 * rationale — the same applies here.
 */
export const practiceAreaSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  description: z.string().min(1),
  relatedAttorneySlugs: z.array(z.string().min(1)).default([]),
});

export type PracticeArea = z.infer<typeof practiceAreaSchema>;

export const practiceAreasSchema = z.array(practiceAreaSchema);
