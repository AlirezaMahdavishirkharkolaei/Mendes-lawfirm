import "server-only";
import { all, db, now, uuid } from "@/lib/db";
import { siteUrl } from "@/lib/env";
import { localeMeta, asLocale } from "@/lib/i18n/config";
import { audit, emailList, getSettings } from "@/lib/settings";
import { signPayload } from "@/lib/security/crypto";
import { sendMail } from "@/lib/email/send";
import { esc, nl2br, shell } from "@/lib/email/layout";
import { AiUnavailable, generateJson } from "@/lib/ai/provider";

/**
 * AI business outreach.
 *
 * The AI researches nothing on its own and never sends on its own: it
 * drafts first-contact e-mails and replies for prospects that a person
 * added in Admin → Outreach, and every draft waits for a human to approve
 * it. Each sent e-mail carries an unsubscribe link, unsubscribed or
 * bounced addresses are suppressed permanently, and a daily cap limits
 * volume — keeping the firm's sending domain in good standing and the
 * outreach within GDPR / anti-spam expectations for B2B contact.
 */

export const INTERESTS = ["investment", "construction", "company_formation", "other"] as const;
export const PROSPECT_STATUSES = ["new", "drafted", "contacted", "replied", "meeting", "declined", "unsubscribed"] as const;

export interface Prospect {
  id: string;
  company: string;
  country: string;
  sector: string | null;
  interest: string;
  contact_name: string | null;
  email: string;
  website: string | null;
  language: string;
  source: string | null;
  status: string;
  notes: string | null;
  last_contact_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutreachMessage {
  id: string;
  prospect_id: string;
  direction: "outbound" | "inbound";
  subject: string;
  body: string;
  status: string;
  ai_generated: number;
  approved_by: string | null;
  error: string | null;
  created_at: string;
  sent_at: string | null;
  company?: string;
  email?: string;
}

export async function listProspects(status?: string): Promise<Prospect[]> {
  const database = await db();
  return all<Prospect>(
    status
      ? database.prepare("SELECT * FROM prospects WHERE status = ? ORDER BY updated_at DESC").bind(status)
      : database.prepare("SELECT * FROM prospects ORDER BY updated_at DESC"),
  );
}

export async function getProspect(id: string): Promise<Prospect | null> {
  const database = await db();
  return database.prepare("SELECT * FROM prospects WHERE id = ?").bind(id).first<Prospect>();
}

export async function thread(prospectId: string): Promise<OutreachMessage[]> {
  const database = await db();
  return all<OutreachMessage>(database.prepare("SELECT * FROM outreach_messages WHERE prospect_id = ? ORDER BY created_at").bind(prospectId));
}

export async function pendingDrafts(): Promise<OutreachMessage[]> {
  const database = await db();
  return all<OutreachMessage>(
    database.prepare(
      `SELECT m.*, p.company, p.email FROM outreach_messages m JOIN prospects p ON p.id = m.prospect_id
       WHERE m.status = 'draft' AND m.direction = 'outbound' ORDER BY m.created_at`,
    ),
  );
}

export async function isSuppressed(email: string): Promise<boolean> {
  const database = await db();
  return !!(await database.prepare("SELECT 1 FROM suppressions WHERE email = ?").bind(email.toLowerCase()).first());
}

export async function addProspect(input: Omit<Prospect, "id" | "status" | "last_contact_at" | "created_at" | "updated_at" | "notes"> & { notes?: string | null }, actor: string) {
  const database = await db();
  const id = uuid();
  const stamp = now();
  await database
    .prepare(
      `INSERT INTO prospects (id, company, country, sector, interest, contact_name, email, website, language, source, status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?) ON CONFLICT(email) DO NOTHING`,
    )
    .bind(id, input.company, input.country, input.sector, input.interest, input.contact_name, input.email.toLowerCase(), input.website, asLocale(input.language), input.source, input.notes ?? null, stamp, stamp)
    .run();
  await audit(actor, "prospect.added", "prospect", id, { company: input.company });
  return id;
}

/** Parses CSV: company,country,email,contact_name,sector,interest,language,website,source */
export function parseProspectCsv(csv: string) {
  const rows = csv
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (rows.length && /company/i.test(rows[0])) rows.shift();
  return rows
    .map((line) => {
      const cells = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g)?.map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"').trim()) ?? [];
      const [company, country, email, contact_name, sector, interest, language, website, source] = cells;
      return { company, country, email, contact_name: contact_name || null, sector: sector || null, interest: (INTERESTS as readonly string[]).includes(interest) ? interest : "company_formation", language: language || "en", website: website || null, source: source || "csv import" };
    })
    .filter((r) => r.company && r.country && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email ?? ""));
}

const INTEREST_PITCH: Record<string, string> = {
  investment: "investing capital or acquiring assets in North Cyprus (investment incentives, banking, structuring, due diligence)",
  construction: "construction and real-estate development in North Cyprus (land acquisition, permits, contractor agreements, foreign-ownership rules)",
  company_formation: "establishing a company or regional branch in North Cyprus (incorporation, shareholders and directors, tax registration, residency and work permits for staff)",
  other: "doing business in North Cyprus",
};

async function draftFor(prospect: Prospect, history: OutreachMessage[]): Promise<{ subject: string; body: string } | null> {
  const settings = await getSettings();
  const firm = settings.firm_name || "Mendes Law & Consultancy";
  const language = localeMeta[asLocale(prospect.language)].label;
  const booking = `${siteUrl()}/${asLocale(prospect.language)}/booking?topic=${prospect.interest === "construction" ? "construction" : prospect.interest === "investment" ? "investment" : "company_formation"}`;
  const isReply = history.some((m) => m.direction === "inbound");

  const system = `You write business-development e-mails for ${firm}, a law and consultancy firm in Kyrenia (Girne), North Cyprus (TRNC).
Write in ${language}. Tone: senior, warm, concise, credible — a partner writing personally, not marketing copy.

Goal: persuade the recipient to book a free 30-minute introductory online meeting with the firm.
Context to use: the recipient's company is interested in ${INTEREST_PITCH[prospect.interest] ?? INTEREST_PITCH.other}. North Cyprus topics you may mention in general terms: company formation, investment incentives, free-zone options, property acquisition rules for foreigners, residence and work permits, tax registration, contract drafting and cross-border trade.

Honesty rules (strict):
- Never invent facts about the firm (clients, cases, years, awards, team size, prices) or about the recipient.
- Never state specific tax rates, fees, deadlines or guarantees.
- No pressure tactics, no false urgency, no exaggerated claims.
- ${isReply ? "This is a reply: answer what they asked or said, stay helpful, and if they declined, thank them politely and do not push." : "This is a first contact: explain briefly why you are writing, offer one or two concrete ways the firm can help, and propose the meeting."}
- Include this booking link once: ${booking}
- 90–170 words. Plain text, no Markdown. Sign off as "${firm} team". Do NOT add an unsubscribe line (it is added automatically).

Return ONLY JSON: {"subject": string, "body": string}.`;

  const recipient = `Recipient: ${prospect.contact_name || "(name unknown)"} at ${prospect.company} (${prospect.country})${prospect.sector ? `, sector: ${prospect.sector}` : ""}${prospect.website ? `, website: ${prospect.website}` : ""}${prospect.notes ? `. Internal notes: ${prospect.notes}` : ""}.`;
  const conversation = history.map((m) => `${m.direction === "inbound" ? "THEM" : "US"} — ${m.subject}\n${m.body}`).join("\n\n---\n\n");

  try {
    const out = await generateJson<{ subject?: string; body?: string }>({
      system,
      messages: [{ role: "user", content: conversation ? `${recipient}\n\nConversation so far:\n${conversation}\n\nWrite our next message.` : recipient }],
      maxTokens: 900,
      temperature: 0.6,
    });
    if (!out.subject || !out.body) return null;
    return { subject: out.subject.trim().slice(0, 200), body: out.body.trim().slice(0, 5000) };
  } catch (error) {
    if (!(error instanceof AiUnavailable)) console.error("outreach draft failed", error);
    return null;
  }
}

export async function createDraft(prospectId: string, actor = "ai"): Promise<boolean> {
  const prospect = await getProspect(prospectId);
  if (!prospect || ["unsubscribed", "declined", "meeting"].includes(prospect.status)) return false;
  if (await isSuppressed(prospect.email)) return false;
  const history = await thread(prospectId);
  if (history.some((m) => m.status === "draft")) return false;
  const draft = await draftFor(prospect, history);
  if (!draft) return false;
  const database = await db();
  await database.batch([
    database
      .prepare("INSERT INTO outreach_messages (id, prospect_id, direction, subject, body, status, ai_generated, created_at) VALUES (?, ?, 'outbound', ?, ?, 'draft', 1, ?)")
      .bind(uuid(), prospectId, draft.subject, draft.body, now()),
    database.prepare("UPDATE prospects SET status = CASE WHEN status = 'new' THEN 'drafted' ELSE status END, updated_at = ? WHERE id = ?").bind(now(), prospectId),
  ]);
  await audit(actor, "outreach.drafted", "prospect", prospectId);
  return true;
}

async function sentToday(): Promise<number> {
  const database = await db();
  const row = await database
    .prepare("SELECT COUNT(*) AS n FROM outreach_messages WHERE status = 'sent' AND sent_at >= ?")
    .bind(new Date(Date.now() - 86400_000).toISOString())
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function approveAndSend(messageId: string, actor: string, edits?: { subject: string; body: string }): Promise<{ ok: boolean; error?: string }> {
  const database = await db();
  const message = await database.prepare("SELECT * FROM outreach_messages WHERE id = ?").bind(messageId).first<OutreachMessage>();
  if (!message || message.status !== "draft") return { ok: false, error: "Draft not found or already handled" };
  const prospect = await getProspect(message.prospect_id);
  if (!prospect) return { ok: false, error: "Prospect missing" };
  if (await isSuppressed(prospect.email)) return { ok: false, error: "Recipient has unsubscribed" };

  const settings = await getSettings();
  const limit = Number(settings.outreach_daily_limit) || 10;
  if ((await sentToday()) >= limit) return { ok: false, error: `Daily limit of ${limit} reached` };

  const subject = edits?.subject?.trim() || message.subject;
  const body = edits?.body?.trim() || message.body;
  const token = await signPayload({ e: prospect.email, p: "unsub" }, 3650 * 86400);
  const unsub = `${siteUrl()}/unsubscribe?t=${encodeURIComponent(token)}`;
  const firm = settings.firm_name || "Mendes";
  const replyTo = emailList(settings.outreach_reply_to || settings.boss_email)[0];
  const html = shell({
    locale: asLocale(prospect.language),
    title: subject,
    firm,
    body: `<p>${nl2br(body)}</p><p style="margin-top:28px;color:#8a8170;font-size:12px">If you'd prefer not to hear from us again, <a href="${esc(unsub)}" style="color:#8a8170">unsubscribe here</a>.</p>`,
  });
  const result = await sendMail({
    to: prospect.email,
    subject,
    html,
    text: `${body}\n\n—\nUnsubscribe: ${unsub}`,
    replyTo,
    headers: {
      "List-Unsubscribe": `<${siteUrl()}/api/unsubscribe?t=${encodeURIComponent(token)}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  await database.batch([
    database
      .prepare("UPDATE outreach_messages SET subject = ?, body = ?, status = ?, approved_by = ?, error = ?, sent_at = ? WHERE id = ?")
      .bind(subject, body, result.ok ? "sent" : "failed", actor, result.error ?? null, result.ok ? now() : null, messageId),
    ...(result.ok
      ? [database.prepare("UPDATE prospects SET status = CASE WHEN status IN ('new','drafted') THEN 'contacted' ELSE status END, last_contact_at = ?, updated_at = ? WHERE id = ?").bind(now(), now(), prospect.id)]
      : []),
  ]);
  await audit(actor, result.ok ? "outreach.sent" : "outreach.failed", "prospect", prospect.id, { messageId, error: result.error });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function discardDraft(messageId: string, actor: string) {
  const database = await db();
  await database.prepare("UPDATE outreach_messages SET status = 'discarded', approved_by = ? WHERE id = ? AND status = 'draft'").bind(actor, messageId).run();
}

export async function suppress(email: string, reason: string) {
  const database = await db();
  await database.batch([
    database.prepare("INSERT OR IGNORE INTO suppressions (email, reason, created_at) VALUES (?, ?, ?)").bind(email.toLowerCase(), reason, now()),
    database.prepare("UPDATE prospects SET status = 'unsubscribed', updated_at = ? WHERE email = ?").bind(now(), email.toLowerCase()),
    database.prepare("UPDATE outreach_messages SET status = 'discarded' WHERE status = 'draft' AND prospect_id IN (SELECT id FROM prospects WHERE email = ?)").bind(email.toLowerCase()),
  ]);
  await audit("system", "outreach.suppressed", "email", email, { reason });
}

/** Records an inbound reply (from Email Routing or pasted by staff) and drafts an answer. */
export async function recordInbound(email: string, subject: string, body: string, actor = "email-routing"): Promise<boolean> {
  const database = await db();
  const prospect = await database.prepare("SELECT * FROM prospects WHERE email = ?").bind(email.toLowerCase()).first<Prospect>();
  if (!prospect) return false;
  await database.batch([
    database
      .prepare("INSERT INTO outreach_messages (id, prospect_id, direction, subject, body, status, created_at) VALUES (?, ?, 'inbound', ?, ?, 'received', ?)")
      .bind(uuid(), prospect.id, subject.slice(0, 300), body.slice(0, 20000), now()),
    database.prepare("UPDATE prospects SET status = CASE WHEN status IN ('new','drafted','contacted') THEN 'replied' ELSE status END, updated_at = ? WHERE id = ?").bind(now(), prospect.id),
  ]);
  await audit(actor, "outreach.reply_received", "prospect", prospect.id);
  if (/\b(unsubscribe|remove me|stop)\b/i.test(body.slice(0, 400))) {
    await suppress(prospect.email, "reply");
    return true;
  }
  await createDraft(prospect.id);
  return true;
}

/** Daily job: draft first-contact e-mails and replies, within the daily cap. */
export async function dailyAutodraft(): Promise<number> {
  const settings = await getSettings();
  if (settings.outreach_autodraft === "0") return 0;
  const limit = Number(settings.outreach_daily_limit) || 10;
  const database = await db();
  const candidates = await all<{ id: string }>(
    database
      .prepare(
        `SELECT p.id FROM prospects p WHERE p.status IN ('new','replied')
         AND NOT EXISTS (SELECT 1 FROM outreach_messages m WHERE m.prospect_id = p.id AND m.status = 'draft')
         ORDER BY p.status = 'replied' DESC, p.created_at LIMIT ?`,
      )
      .bind(limit),
  );
  let made = 0;
  for (const c of candidates) if (await createDraft(c.id)) made++;
  return made;
}
