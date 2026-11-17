import { attorneysSchema, type Attorney } from "@/lib/schemas/attorney";

/**
 * DEMONSTRATION CONTENT ONLY.
 *
 * These are placeholder attorney profiles used to build and test the
 * Attorneys section during the foundation phase. None of these are real
 * people, real credentials, or real professional claims. This file must be
 * replaced with real attorney data (or a real CMS-backed source) before
 * the site goes live.
 */
const rawAttorneys: Attorney[] = [
  {
    slug: "placeholder-partner-one",
    name: "Placeholder Partner One",
    position: "Founding Partner",
    biography:
      "Demonstration biography text for layout and content-length testing purposes only. Not a real person.",
    education: ["Demonstration Law Degree — Placeholder University"],
    practiceAreaSlugs: ["placeholder-practice-area-one"],
    languages: ["English"],
    publications: [],
    isPlaceholder: true,
  },
  {
    slug: "placeholder-partner-two",
    name: "Placeholder Partner Two",
    position: "Senior Associate",
    biography:
      "Demonstration biography text for layout and content-length testing purposes only. Not a real person.",
    education: ["Demonstration LL.M. — Placeholder University"],
    practiceAreaSlugs: ["placeholder-practice-area-two"],
    languages: ["English", "Turkish"],
    publications: [],
    isPlaceholder: true,
  },
];

export const attorneys: Attorney[] = attorneysSchema.parse(rawAttorneys);
