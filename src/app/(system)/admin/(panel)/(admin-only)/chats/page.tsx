import { adminLang, adminT } from "@/lib/admin-i18n";
import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { all, db, parseJson } from "@/lib/db";
import { formatDate } from "@/lib/i18n/format";
import { topicLabel } from "@/lib/topics";
import { AdminPage, Table, td } from "@/components/admin/ui";

export default async function Chats() {
  await requireUser(["admin"], "/admin/login");
  const t = await adminT();
  const L = await adminLang();
  const database = await db();
  const rows = await all<{ id: string; locale: string; topics: string; referred_to: string | null; message_count: number; updated_at: string }>(database.prepare("SELECT * FROM chat_sessions ORDER BY updated_at DESC LIMIT 200"));
  return (
    <AdminPage title={t("AI assistant conversations")} lead={t("Anonymous visitor chats, the legal topics the assistant identified and who it referred them to.")}>
      <Table head={["Last activity", "Language", "Topics", "Referred to", "Messages"].map(t)} empty={rows.length ? undefined : "No conversations yet."}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className={td}><Link href={`/admin/chats/${r.id}`} className="text-gold hover:text-gold-light">{formatDate(r.updated_at, L, true)}</Link></td>
            <td className={td}><span className="font-mono uppercase">{r.locale}</span></td>
            <td className={td}>{parseJson<string[]>(r.topics, []).map((t) => topicLabel(t, L)).join(", ") || "—"}</td>
            <td className={td}>{r.referred_to ?? "—"}</td>
            <td className={td}>{r.message_count}</td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
