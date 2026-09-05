import { z } from "zod";

/**
 * Attorney content schema.
 *
 * This shape is intentionally CMS-agnostic: every field is a primitive or
 * array of primitives, with no dependency on how the data is sourced today
 * (local TS objects) vs. how it may be sourced later (a headless CMS). When
 * a CMS is introduced, its content model should be mapped onto this schema
 * rather than the schema being reshaped around the CMS.
 */
export const attorneySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  position: z.string().min(1),
  biography: z.string().min(1),
  education: z.array(z.string().min(1)).default([]),
  practiceAreaSlugs: z.array(z.string().min(1)).default([]),
  languages: z.array(z.string().min(1)).default([]),
  publications: z.array(z.string().min(1)).default([]),
  profileImage: z.string().min(1).optional(),
  /**
   * All attorney data at this phase is placeholder/demonstration content.
   * This flag exists so the UI layer can render a visible "demonstration
   * content" indicator and so this is never mistaken for real attorney
   * information later.
   */
  isPlaceholder: z.boolean().default(true),
});

export type Attorney = z.infer<typeof attorneySchema>;

export const attorneysSchema = z.array(attorneySchema);
