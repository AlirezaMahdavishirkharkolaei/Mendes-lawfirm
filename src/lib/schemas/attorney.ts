import { z } from "zod";
import { localizedList, localizedString } from "./localized";

/**
 * Team member schema. CMS-agnostic: when a CMS is introduced, map its
 * model onto this shape instead of reshaping the schema around the CMS.
 *
 * Only facts supplied and approved by the firm belong here — nothing is
 * inferred or invented (see docs/PROJECT.md, content policy).
 */
export const attorneySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  /** e.g. "Av." — shown before the name. */
  honorific: z.string().optional(),
  position: localizedString,
  biography: localizedList, // paragraphs
  education: z.array(z.string().min(1)).default([]),
  barAdmission: z.string().optional(),
  practiceAreaSlugs: z.array(z.string().min(1)).default([]),
  languages: z.array(z.string().min(1)).default([]),
  publications: z.array(z.string().min(1)).default([]),
  profileImage: z.string().min(1).optional(),
});

export type Attorney = z.infer<typeof attorneySchema>;
export const attorneysSchema = z.array(attorneySchema);
