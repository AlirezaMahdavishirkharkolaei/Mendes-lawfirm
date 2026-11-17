import Link from "next/link";
import { db } from "@/lib/db";
import { currentUser, requireUser } from "@/lib/auth";
import { aiConfig } from "@/lib/ai/provider";
import { getSettings } from "@/lib/settings";
import { listBookings } from "@/lib/data/bookings";
import { formatDate } from "@/lib/i18n/format";
import { topicLabel } from "@/lib/topics";
import { AdminPage, Panel, Stat, small } from "@/components/admin/ui";
import { Notice } from "@/components/ui/misc";

export default async function Dashboard() {
  await requireUser(["admin", "lawyer"], "/admin/login");
  const user = (await currentUser())!;
  const database = await db();
  const s = await database
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM bookings WHERE status='pending') pending,
        (SELECT COUNT(*) FROM bookings WHERE status='approved' AND slot_start >= datetime('now')) upcoming,
        (SELECT COUNT(*) FROM cases WHERE status NOT IN ('closed','settled')) open_cases,
        (SELECT COUNT(*) FROM users WHERE role='client') clients,
        (SELECT COUNT(*) FROM articles WHERE status='submitted') articles,
        (SELECT COUNT(*) FROM chat_sessions WHERE created_at >= datetime('now','-30 days')) chats,
        (SELECT COUNT(*) FROM prospects) prospects,
        (SELECT COUNT(*) FROM outreach_messages WHERE status='draft') drafts`,
    )
    .first<Record<string, number>>();
  const [pending, settings, ai] = await Promise.all([listBookings({ status: "pending", limit: 6 }), getSettings(), aiConfig()]);
  const missing = [
    !settings.boss_email && "Managing partner e-mail (receives booking requests)",
    !settings.owner_email && !settings.report_recipients && "Monthly report recipients",
    !ai.configured && `AI provider key (${ai.provider}) — the chatbot is using its offline keyword mode`,
  ].filter(Boolean);

  return (
    <AdminPage title={`Good day, ${user.name.split(" ")[0]}`} lead="Everything happening on the platform, at a glance.">
      {missing.length > 0 && user.role === "admin" && (
        <Notice>
          <strong>Finish setup:</strong> {missing.join(" · ")}. <Link href="/admin/settings" className="underline">Open settings →</Link>
        </Notice>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Bookings awaiting decision" value={s?.pending ?? 0} />
        <Stat label="Upcoming approved meetings" value={s?.upcoming ?? 0} />
        <Stat label="Open cases" value={s?.open_cases ?? 0} hint={`${s?.clients ?? 0} client accounts`} />
        <Stat label="Articles to review" value={s?.articles ?? 0} />
        <Stat label="AI chats (30 days)" value={s?.chats ?? 0} />
        <Stat label="Outreach prospects" value={s?.prospects ?? 0} hint={`${s?.drafts ?? 0} drafts awaiting approval`} />
        <Stat label="AI provider" value={<span className="text-3xl">{ai.provider}</span>} hint={ai.configured ? `${ai.model} · connected` : "no API key — offline mode"} />
      </div>
      <Panel title="Requests awaiting your decision">
        {pending.length === 0 ? (
          <p className="text-ivory-muted">Nothing pending. 🎉</p>
        ) : (
          <ul className="divide-y divide-line">
            {pending.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-ivory">{b.name} · <span className="text-gold-light">{formatDate(b.slot_start, "en", true)}</span></p>
                  <p className="text-ui-sm text-ivory-muted">{topicLabel(b.topic, "en")} · {b.meeting_mode} · {b.email}</p>
                </div>
                <Link href="/admin/bookings" className={small}>Decide</Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AdminPage>
  );
}
