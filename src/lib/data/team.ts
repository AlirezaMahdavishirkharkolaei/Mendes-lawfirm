import "server-only";
import { memo } from "@/lib/memo";
import { all, db, parseJson } from "@/lib/db";
import { pick, type Locale } from "@/lib/i18n/config";

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
  const rows = await memo(`team:${includeInactive}`, 60_000, async () => {
    const database = await db();
    return all<TeamMemberRow>(
      database.prepare(`SELECT * FROM team_members ${includeInactive ? "" : "WHERE is_active = 1"} ORDER BY sort_order, name`),
    );
  });
  return rows.map(map);
}

export async function getMember(slug: string): Promise<TeamMember | null> {
  const database = await db();
  const row = await database.prepare("SELECT * FROM team_members WHERE slug = ?").bind(slug).first<TeamMemberRow>();
  return row ? map(row) : null;
}

export { routeToMember } from "@/lib/routing";

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
