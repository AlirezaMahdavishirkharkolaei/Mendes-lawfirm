import type { TopicKey } from "@/lib/topics";

/** The fields routing needs — satisfied by TeamMember. */
export interface Routable {
  slug: string;
  specialties: string[];
  isReferralLead: boolean;
  isActive: boolean;
  sortOrder: number;
}

/**
 * Picks the team member a visitor should be referred to.
 * Rule order: (1) a referral lead covering the first matching topic —
 * this is how contract / trade / international-tax / cybercrime matters
 * reach Alireza; (2) any member covering a topic, best coverage first;
 * (3) the first active member (the managing partner by sort order).
 */
export function routeToMember<T extends Routable>(topics: TopicKey[], team: T[]): T | null {
  const active = team.filter((m) => m.isActive);
  if (active.length === 0) return null;
  for (const topic of topics) {
    const lead = active.find((m) => m.isReferralLead && m.specialties.includes(topic));
    if (lead) return lead;
  }
  const scored = active
    .map((m) => ({ m, score: topics.filter((t) => m.specialties.includes(t)).length }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.m.sortOrder - b.m.sortOrder);
  if (scored[0]) return scored[0].m;
  return topics.length ? active[0] : null;
}

/** Contact card for a member; falls back to the office phone/e-mail when the member has none. */
