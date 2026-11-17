import { practiceAreas } from "@/content/practice-areas";

/**
 * Resolves a practice-area slug (as referenced by Attorney.practiceAreaSlugs
 * or Insight.practiceAreaSlugs) to its display title. Returns undefined if
 * no matching practice area exists in the content layer — callers should
 * skip rendering that reference rather than fabricate a label.
 */
export function getPracticeAreaTitle(slug: string): string | undefined {
  return practiceAreas.find((area) => area.slug === slug)?.title;
}
