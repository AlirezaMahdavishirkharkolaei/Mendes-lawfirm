import { z } from "zod";

/** A non-empty string in every supported language (en, tr, fa). */
export const localizedString = z.object({
  en: z.string().min(1),
  tr: z.string().min(1),
  fa: z.string().min(1),
});

/** A list in every supported language; the lists must be the same length. */
export const localizedList = z
  .object({ en: z.array(z.string().min(1)), tr: z.array(z.string().min(1)), fa: z.array(z.string().min(1)) })
  .refine((v) => v.en.length === v.tr.length && v.en.length === v.fa.length, {
    message: "every language must have the same number of items",
  });
