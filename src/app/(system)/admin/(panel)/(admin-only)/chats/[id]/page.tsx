import { adminLang, adminT } from "@/lib/admin-i18n";
import { requireUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { all, db } from "@/lib/db";
import { formatDate } from "@/lib/i18n/format";
import { AdminPage, Panel } from "@/components/admin/ui";
import { deleteChat } from "@/app/(system)/admin/actions";

export default async function ChatTranscript({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["admin"], "/admin/login");
  const t = await adminT();
  const L = await adminLang();
  const { id } = await params;
  const database = await db();
  const session = await database.prepare("SELECT * FROM chat_sessions WHERE id = ?").bind(id).first<{ id: string; created_at: string }>();
  if (!session) notFound();
  const msgs = await all<{ role: string; content: string; created_at: string }>(database.prepare("SELECT role, content, created_at FROM chat_messages WHERE session_id = ? ORDER BY created_at").bind(id));
  return (
    <AdminPage title={t("Conversation")} lead={formatDate(session.created_at, L, true)} actions={<form action={deleteChat}><input type="hidden" name="id" value={id} /><button className="text-ui-sm text-danger hover:underline">{t("Delete transcript")}</button></form>}>
      <Panel>
        <ol className="space-y-4">
          {msgs.map((m, i) => (
            <li key={i} className={`max-w-3xl rounded-[4px] p-4 ${m.role === "user" ? "ms-auto bg-gold/10" : "border border-line"}`}>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ivory-muted">{m.role} · {formatDate(m.created_at, L, true)}</p>
              <p className="mt-2 whitespace-pre-wrap text-ui" dir="auto">{m.content}</p>
            </li>
          ))}
        </ol>
      </Panel>
    </AdminPage>
  );
}
