import "server-only";
import { all, db, parseJson } from "@/lib/db";
import { pick, type Locale } from "@/lib/i18n/config";
import type { TopicKey } from "@/lib/topics";

export interface TeamMemberRow {
  id: string;
  slug: string;
  name: string;
  position: string;
  biography: string;
  specialties: string;
  languages: string;
  education: string;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  user_id: string | null;
  is_referral_lead: number;
  is_active: number;
  sort_order: number;
}

export interface TeamMember {
  id: string;
  slug: string;
  name: string;
  position: Record<string, string>;
  biography: Record<string, string>;
  specialties: string[];
  languages: string[];
  education: string[];
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  userId: string | null;
  isReferralLead: boolean;
  isActive: boolean;
  sortOrder: number;
}

function map(row: TeamMemberRow): TeamMember {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    position: parseJson(row.position, {}),
    biography: parseJson(row.biography, {}),
    specialties: parseJson(row.specialties, []),
    languages: parseJson(row.languages, []),
    education: parseJson(row.education, []),
    email: row.email,
    phone: row.phone,
    photoUrl: row.photo_url,
    userId: row.user_id,
    isReferralLead: !!row.is_referral_lead,
    isActive: !!row.is_active,
    sortOrder: row.sort_order,
  };
}

export async function listTeam(includeInactive = false): Promise<TeamMember[]> {
  const database = await db();
  const rows = await all<TeamMemberRow>(
    database.prepare(
      `SELECT * FROM team_members ${includeInactive ? "" : "WHERE is_active = 1"} ORDER BY sort_order, name`,
    ),
  );
  return rows.map(map);
}

export async function getMember(slug: string): Promise<TeamMember | null> {
  const database = await db();
  const row = await database.prepare("SELECT * FROM team_members WHERE slug = ?").bind(slug).first<TeamMemberRow>();
  return row ? map(row) : null;
}

/**
 * Picks the team member a visitor should be referred to.
 * Rule order: (1) a referral lead covering the first matching topic —
 * this is how contract / trade / international-tax / cybercrime matters
 * reach Alireza; (2) any member covering a topic, best coverage first;
 * (3) the first active member (the managing partner by sort order).
 */
export function routeToMember(topics: TopicKey[], team: TeamMember[]): TeamMember | null {
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
export function publicCard(member: TeamMember, locale: Locale, office?: { phone?: string; email?: string }) {
  return {
    slug: member.slug,
    name: member.name,
    position: pick(member.position, locale),
    email: member.email || office?.email || null,
    phone: member.phone || office?.phone || null,
    photoUrl: member.photoUrl,
  };
}
export type PublicCard = ReturnType<typeof publicCard>;
