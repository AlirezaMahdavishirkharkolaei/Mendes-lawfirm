import { adminLang, adminT } from "@/lib/admin-i18n";
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
  const t = await adminT();
  const L = await adminLang();
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
    !settings.boss_email && t("Managing partner e-mail (receives booking requests)"),
    !settings.owner_email && !settings.report_recipients && t("Monthly report recipients"),
    !ai.configured && `${t("AI provider key")} (${ai.provider}) — ${t("the chatbot is using its offline keyword mode")}`,
  ].filter(Boolean);

  return (
    <AdminPage title={`${t("Good day")}, ${user.name.split(" ")[0]}`} lead={t("Everything happening on the platform, at a glance.")}>
      {missing.length > 0 && user.role === "admin" && (
        <Notice>
          <strong>{t("Finish setup:")}</strong> {missing.join(" · ")}. <Link href="/admin/settings" className="underline">{t("Open settings →")}</Link>
        </Notice>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Bookings awaiting decision")} value={s?.pending ?? 0} />
        <Stat label={t("Upcoming approved meetings")} value={s?.upcoming ?? 0} />
        <Stat label={t("Open cases")} value={s?.open_cases ?? 0} hint={`${s?.clients ?? 0} ${t("client accounts")}`} />
        <Stat label={t("Articles to review")} value={s?.articles ?? 0} />
        <Stat label={t("AI chats (30 days)")} value={s?.chats ?? 0} />
        <Stat label={t("Outreach prospects")} value={s?.prospects ?? 0} hint={`${s?.drafts ?? 0} ${t("drafts awaiting approval")}`} />
        <Stat label={t("AI provider")} value={<span className="text-3xl">{ai.provider}</span>} hint={ai.configured ? `${ai.model} · ${t("connected")}` : t("no API key — offline mode")} />
      </div>
      <Panel title={t("Requests awaiting your decision")}>
        {pending.length === 0 ? (
          <p className="text-ivory-muted">{t("Nothing pending. 🎉")}</p>
        ) : (
          <ul className="divide-y divide-line">
            {pending.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-ivory">{b.name} · <span className="text-gold-light">{formatDate(b.slot_start, L, true)}</span></p>
                  <p className="text-ui-sm text-ivory-muted">{topicLabel(b.topic, L)} · {b.meeting_mode} · {b.email}</p>
                </div>
                <Link href="/admin/bookings" className={small}>{t("Decide")}</Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AdminPage>
  );
}
