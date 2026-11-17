import "server-only";
import { all, db, now, uuid } from "@/lib/db";
import { siteUrl } from "@/lib/env";
import { emailList, getSettings, audit } from "@/lib/settings";
import { sendMail } from "@/lib/email/send";
import { esc, nl2br, row, shell, table, toText } from "@/lib/email/layout";
import { AiUnavailable, generate } from "@/lib/ai/provider";

export interface MonthlyStats {
  period: string;
  prospectsAdded: number;
  draftsCreated: number;
  emailsSent: number;
  emailsFailed: number;
  repliesReceived: number;
  meetingsAgreed: number;
  declined: number;
  unsubscribed: number;
  bookingsRequested: number;
  bookingsApproved: number;
  bookingsRejected: number;
  chatSessions: number;
  chatReferrals: number;
  articlesSubmitted: number;
  articlesPublished: number;
  byCountry: { country: string; sent: number; replies: number }[];
  contacted: { company: string; country: string; status: string }[];
}

/** First and last instant (UTC) of the month before `ref`. */
export function previousMonth(ref = new Date()): { start: string; end: string; period: string } {
  const start = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() - 1, 1));
  const end = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1));
  return { start: start.toISOString(), end: end.toISOString(), period: start.toISOString().slice(0, 7) };
}

async function count(sql: string, ...binds: unknown[]): Promise<number> {
  const database = await db();
  const r = await database.prepare(sql).bind(...binds).first<{ n: number }>();
  return r?.n ?? 0;
}

export async function collectStats(start: string, end: string, period: string): Promise<MonthlyStats> {
  const database = await db();
  const range = [start, end] as const;
  const auditCount = (action: string) => count("SELECT COUNT(*) n FROM audit_log WHERE action = ? AND created_at >= ? AND created_at < ?", action, ...range);
  return {
    period,
    prospectsAdded: await count("SELECT COUNT(*) n FROM prospects WHERE created_at >= ? AND created_at < ?", ...range),
    draftsCreated: await count("SELECT COUNT(*) n FROM outreach_messages WHERE direction='outbound' AND created_at >= ? AND created_at < ?", ...range),
    emailsSent: await count("SELECT COUNT(*) n FROM outreach_messages WHERE status='sent' AND sent_at >= ? AND sent_at < ?", ...range),
    emailsFailed: await count("SELECT COUNT(*) n FROM outreach_messages WHERE status='failed' AND created_at >= ? AND created_at < ?", ...range),
    repliesReceived: await count("SELECT COUNT(*) n FROM outreach_messages WHERE direction='inbound' AND created_at >= ? AND created_at < ?", ...range),
    meetingsAgreed: await auditCount("prospect.meeting"),
    declined: await auditCount("prospect.declined"),
    unsubscribed: await count("SELECT COUNT(*) n FROM suppressions WHERE created_at >= ? AND created_at < ?", ...range),
    bookingsRequested: await count("SELECT COUNT(*) n FROM bookings WHERE created_at >= ? AND created_at < ?", ...range),
    bookingsApproved: await count("SELECT COUNT(*) n FROM bookings WHERE status='approved' AND decided_at >= ? AND decided_at < ?", ...range),
    bookingsRejected: await count("SELECT COUNT(*) n FROM bookings WHERE status='rejected' AND decided_at >= ? AND decided_at < ?", ...range),
    chatSessions: await count("SELECT COUNT(*) n FROM chat_sessions WHERE created_at >= ? AND created_at < ?", ...range),
    chatReferrals: await count("SELECT COUNT(*) n FROM chat_sessions WHERE referred_to IS NOT NULL AND created_at >= ? AND created_at < ?", ...range),
    articlesSubmitted: await count("SELECT COUNT(*) n FROM articles WHERE created_at >= ? AND created_at < ?", ...range),
    articlesPublished: await count("SELECT COUNT(*) n FROM articles WHERE published_at >= ? AND published_at < ?", ...range),
    byCountry: await all<{ country: string; sent: number; replies: number }>(
      database
        .prepare(
          `SELECT p.country,
             SUM(CASE WHEN m.status='sent' AND m.sent_at >= ?1 AND m.sent_at < ?2 THEN 1 ELSE 0 END) AS sent,
             SUM(CASE WHEN m.direction='inbound' AND m.created_at >= ?1 AND m.created_at < ?2 THEN 1 ELSE 0 END) AS replies
           FROM prospects p JOIN outreach_messages m ON m.prospect_id = p.id
           GROUP BY p.country HAVING sent > 0 OR replies > 0 ORDER BY sent DESC LIMIT 15`,
        )
        .bind(...range),
    ),
    contacted: await all<{ company: string; country: string; status: string }>(
      database
        .prepare(
          `SELECT DISTINCT p.company, p.country, p.status FROM prospects p JOIN outreach_messages m ON m.prospect_id = p.id
           WHERE (m.sent_at >= ?1 AND m.sent_at < ?2) OR (m.direction='inbound' AND m.created_at >= ?1 AND m.created_at < ?2)
           ORDER BY p.status, p.company LIMIT 60`,
        )
        .bind(...range),
    ),
  };
}

async function narrative(stats: MonthlyStats, firm: string): Promise<string> {
  try {
    return (
      await generate({
        system: `You write a short monthly business-development report for the partners of ${firm}, a law firm in North Cyprus. Use only the numbers provided — never invent figures, companies or outcomes. 120–220 words, plain text, three short paragraphs: what happened, what worked or didn't, and 2–3 concrete suggestions for next month.`,
        messages: [{ role: "user", content: JSON.stringify(stats) }],
        maxTokens: 600,
        temperature: 0.3,
      })
    ).trim();
  } catch (error) {
    if (!(error instanceof AiUnavailable)) console.error("report narrative failed", error);
    return `In ${stats.period}, ${stats.emailsSent} outreach e-mails were sent to companies, ${stats.repliesReceived} replies were received and ${stats.meetingsAgreed} meetings were agreed. ${stats.bookingsRequested} meeting requests came through the website (${stats.bookingsApproved} approved), and the AI assistant held ${stats.chatSessions} conversations, referring ${stats.chatReferrals} visitors to a specialist.`;
  }
}

export async function buildAndSendMonthlyReport(ref = new Date(), force = false): Promise<{ period: string; sentTo: string[]; skipped?: boolean }> {
  const { start, end, period } = previousMonth(ref);
  const database = await db();
  const existing = await database.prepare("SELECT sent_to FROM reports WHERE period = ?").bind(period).first<{ sent_to: string | null }>();
  if (existing && !force) return { period, sentTo: [], skipped: true };

  const settings = await getSettings();
  const firm = settings.firm_name || "Mendes";
  const recipients = Array.from(new Set([...emailList(settings.report_recipients), ...emailList(settings.boss_email), ...emailList(settings.owner_email)]));
  const stats = await collectStats(start, end, period);
  const summary = await narrative(stats, firm);

  const monthName = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(start));
  const html = shell({
    title: `Monthly outreach report — ${monthName}`,
    firm,
    preheader: `${stats.emailsSent} e-mails sent · ${stats.repliesReceived} replies · ${stats.meetingsAgreed} meetings`,
    body: `<p>${nl2br(summary)}</p>
<h2 style="font:400 18px Georgia,serif;margin:28px 0 4px">AI outreach to companies</h2>
${table([
  row("Prospects added", String(stats.prospectsAdded)),
  row("Drafts written by AI", String(stats.draftsCreated)),
  row("E-mails sent (approved)", String(stats.emailsSent)),
  row("Failed sends", String(stats.emailsFailed)),
  row("Replies received", String(stats.repliesReceived)),
  row("Meetings agreed", String(stats.meetingsAgreed)),
  row("Declined", String(stats.declined)),
  row("Unsubscribed", String(stats.unsubscribed)),
])}
${stats.byCountry.length ? `<h2 style="font:400 18px Georgia,serif;margin:28px 0 4px">By country</h2>${table(stats.byCountry.map((c) => row(c.country, `${c.sent} sent · ${c.replies} replies`)))}` : ""}
${stats.contacted.length ? `<h2 style="font:400 18px Georgia,serif;margin:28px 0 4px">Companies in conversation</h2>${table(stats.contacted.map((c) => row(`${c.company}`, `${esc(c.country)} · ${esc(c.status)}`)))}` : ""}
<h2 style="font:400 18px Georgia,serif;margin:28px 0 4px">Website</h2>
${table([
  row("Meeting requests", `${stats.bookingsRequested} (approved ${stats.bookingsApproved}, declined ${stats.bookingsRejected})`),
  row("AI assistant conversations", `${stats.chatSessions} (referred to a specialist: ${stats.chatReferrals})`),
  row("Student articles", `${stats.articlesSubmitted} submitted · ${stats.articlesPublished} published`),
])}
<p style="margin-top:24px"><a href="${esc(siteUrl())}/admin/outreach" style="color:#8a6d3b">Open the outreach dashboard</a></p>`,
  });

  if (recipients.length) {
    await sendMail({ to: recipients, subject: `${firm} — monthly outreach report, ${monthName}`, html, text: toText(html) });
  } else {
    console.warn("monthly report generated but no recipients configured (Admin → Settings)");
  }
  await database
    .prepare("INSERT INTO reports (id, period, body, stats, sent_to, created_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(period) DO UPDATE SET body = excluded.body, stats = excluded.stats, sent_to = excluded.sent_to, created_at = excluded.created_at")
    .bind(uuid(), period, summary, JSON.stringify(stats), recipients.join(", "), now())
    .run();
  await audit("cron", "report.sent", "report", period, { recipients });
  return { period, sentTo: recipients };
}
