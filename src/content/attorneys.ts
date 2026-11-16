import { attorneysSchema, type Attorney } from "@/lib/schemas/attorney";

/**
 * The Mendes team. Add a profile only with facts the person has
 * approved (name, position, bar admission, education, languages,
 * biography). While this list is empty, the Team page and its menu
 * entry are hidden.
 */
const rawAttorneys: Attorney[] = [];

export const attorneys: Attorney[] = attorneysSchema.parse(rawAttorneys);

export function getAttorney(slug: string): Attorney | undefined {
  return attorneys.find((a) => a.slug === slug);
}
