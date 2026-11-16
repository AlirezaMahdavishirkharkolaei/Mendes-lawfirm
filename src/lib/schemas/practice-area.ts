import { z } from "zod";
import { localizedList, localizedString } from "./localized";

/**
 * Practice Area content schema. CMS-agnostic (see attorney.ts); every
 * human-readable field is localized.
 */
export const practiceAreaSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: localizedString,
  summary: localizedString,
  description: localizedList, // paragraphs
  services: localizedList, // what the firm does in this area
  relatedAttorneySlugs: z.array(z.string().min(1)).default([]),
});

export type PracticeArea = z.infer<typeof practiceAreaSchema>;
export const practiceAreasSchema = z.array(practiceAreaSchema);
