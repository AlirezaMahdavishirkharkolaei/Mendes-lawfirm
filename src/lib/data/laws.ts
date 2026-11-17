import "server-only";
import { all, db, now, parseJson } from "@/lib/db";
import { localeMeta, locales, pick, type Locale } from "@/lib/i18n/config";
import { AiUnavailable, generateJson } from "@/lib/ai/provider";

export interface LawRow {
  id: string;
  slug: string;
  reference: string;
  category: string;
  title: string;
  summary: string;
  body: string;
  review: string;
  source_url: string | null;
  status: string;
  sort_order: number;
  updated_at: string;
}

export interface Law {
  id: string;
  slug: string;
  reference: string;
  category: string;
  title: Record<string, string>;
  summary: Record<string, string>;
  body: Record<string, string>;
  review: Record<string, "ai" | "reviewed">;
  sourceUrl: string | null;
  status: string;
  sortOrder: number;
  updatedAt: string;
}

function map(r: LawRow): Law {
  return {
    id: r.id,
    slug: r.slug,
    reference: r.reference,
    category: r.category,
    title: parseJson(r.title, {}),
    summary: parseJson(r.summary, {}),
    body: parseJson(r.body, {}),
    review: parseJson(r.review, {}),
    sourceUrl: r.source_url,
    status: r.status,
    sortOrder: r.sort_order,
    updatedAt: r.updated_at,
  };
}

export async function listLaws(includeDrafts = false): Promise<Law[]> {
  const database = await db();
  const rows = await all<LawRow>(
    database.prepare(`SELECT * FROM laws ${includeDrafts ? "" : "WHERE status = 'published'"} ORDER BY sort_order, slug`),
  );
  return rows.map(map);
}

export async function getLaw(slug: string): Promise<Law | null> {
  const database = await db();
  const row = await database.prepare("SELECT * FROM laws WHERE slug = ?").bind(slug).first<LawRow>();
  return row ? map(row) : null;
}

export async function saveLawLocale(
  id: string,
  locale: Locale,
  fields: { title?: string; summary?: string; body?: string; review?: "ai" | "reviewed" },
): Promise<void> {
  const database = await db();
  const row = await database.prepare("SELECT * FROM laws WHERE id = ?").bind(id).first<LawRow>();
  if (!row) return;
  const law = map(row);
  if (fields.title !== undefined) law.title[locale] = fields.title;
  if (fields.summary !== undefined) law.summary[locale] = fields.summary;
  if (fields.body !== undefined) law.body[locale] = fields.body;
  if (fields.review !== undefined) law.review[locale] = fields.review;
  await database
    .prepare("UPDATE laws SET title = ?, summary = ?, body = ?, review = ?, updated_at = ? WHERE id = ?")
    .bind(JSON.stringify(law.title), JSON.stringify(law.summary), JSON.stringify(law.body), JSON.stringify(law.review), now(), id)
    .run();
}

/**
 * Generates a plain-language explanation of a law in one language and
 * stores it marked as "ai" (unreviewed). Reviewed text is never
 * overwritten unless `force` is set.
 */
export async function generateLawExplanation(law: Law, locale: Locale, force = false): Promise<boolean> {
  if (!force && law.body[locale] && law.review[locale] === "reviewed") return false;
  const title = pick(law.title, "en");
  const system = `You write plain-language legal explainers for the public website of a law firm in North Cyprus (TRNC).
Audience: non-lawyers — foreign investors, residents, students. Write in ${localeMeta[locale].label} only.

Accuracy rules (critical):
- Explain the law as it applies in the Turkish Republic of Northern Cyprus. Many TRNC statutes are the colonial-era "Cap." laws, amended locally; say so where relevant.
- Do NOT invent section/article numbers, penalties, fees, percentages, thresholds or deadlines. If a number matters but you are not certain it is current, describe it qualitatively and tell the reader to confirm the current figure.
- Prefer "generally", "usually", "in most cases" over absolute statements. Never present this as legal advice.
- No marketing language.

Return ONLY JSON: {"title": string (the law's name in ${localeMeta[locale].label}), "summary": string (2–3 sentences), "body": string (Markdown with these H2 sections, translated: What this law covers; Who it affects; Key points; Common pitfalls; When to speak to a lawyer. Use short paragraphs and bullet lists. 450–750 words.)}`;
  try {
    const out = await generateJson<{ title?: string; summary?: string; body?: string }>({
      system,
      messages: [{ role: "user", content: `Law: ${title} (${law.reference}). Category: ${law.category}.` }],
      maxTokens: 2200,
      temperature: 0.2,
    });
    if (!out.body || !out.summary) return false;
    await saveLawLocale(law.id, locale, {
      title: law.title[locale] || out.title || title,
      summary: out.summary.trim(),
      body: out.body.trim(),
      review: "ai",
    });
    return true;
  } catch (error) {
    if (!(error instanceof AiUnavailable)) console.error("law generation failed", law.slug, locale, error);
    return false;
  }
}

/** Fills in missing explanations, a few at a time (used by cron and admin). */
export async function generateMissingLaws(limit = 4): Promise<number> {
  const laws = await listLaws(true);
  let done = 0;
  for (const law of laws) {
    for (const locale of locales) {
      if (done >= limit) return done;
      if (law.body[locale]) continue;
      if (await generateLawExplanation(law, locale)) done++;
      else return done; // stop early if the provider is failing
    }
  }
  return done;
}
