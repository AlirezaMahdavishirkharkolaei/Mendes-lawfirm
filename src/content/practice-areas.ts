import {
  practiceAreasSchema,
  type PracticeArea,
} from "@/lib/schemas/practice-area";

/**
 * DEMONSTRATION CONTENT ONLY. Replace with real practice area copy before
 * launch — see attorneys.ts for the same note.
 */
const rawPracticeAreas: PracticeArea[] = [
  {
    slug: "placeholder-practice-area-one",
    title: "Placeholder Practice Area One",
    summary: "One-line placeholder summary for layout testing.",
    description:
      "Longer placeholder description used to test paragraph-length content in the Practice Areas section.",
    relatedAttorneySlugs: ["placeholder-partner-one"],
  },
  {
    slug: "placeholder-practice-area-two",
    title: "Placeholder Practice Area Two",
    summary: "One-line placeholder summary for layout testing.",
    description:
      "Longer placeholder description used to test paragraph-length content in the Practice Areas section.",
    relatedAttorneySlugs: ["placeholder-partner-two"],
  },
];

export const practiceAreas: PracticeArea[] =
  practiceAreasSchema.parse(rawPracticeAreas);
