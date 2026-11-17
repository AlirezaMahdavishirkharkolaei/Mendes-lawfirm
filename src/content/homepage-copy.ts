/**
 * Homepage marketing copy — PLACEHOLDER CONTENT, NOT APPROVED.
 *
 * Unlike src/content/attorneys.ts, practice-areas.ts, and insights.ts,
 * this file has no Zod schema and isn't structured "content" in the
 * same sense — it's the hero/philosophy/consultation prose the
 * homepage sections render. It's centralized here (rather than
 * hardcoded in JSX) so it's easy to find, review, and replace as one
 * unit before launch.
 *
 * None of these strings are approved Mendes institutional copy. They
 * are illustrative placeholders demonstrating tone, register, and
 * length for the homepage — proposed per the approved UX spec, not
 * verified facts or firm-approved positioning. Every string here must
 * be replaced or explicitly approved before this site is public.
 */
export const homepageCopy = {
  hero: {
    eyebrow: "§ Mendes",
    headline: "Counsel for decisions that cross borders.",
    proposition:
      "Mendes advises on matters where legal, commercial, and jurisdictional lines intersect. Placeholder positioning copy — pending firm approval.",
  },
  philosophy: {
    quote:
      "We treat every matter as a system, not an event — because the decisions that matter most rarely happen in isolation.",
  },
  consultation: {
    proposition: "Discuss your matter with Mendes.",
  },
} as const;
