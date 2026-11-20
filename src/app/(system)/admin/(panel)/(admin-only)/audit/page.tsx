import { adminLang, adminT } from "@/lib/admin-i18n";
import { requireUser } from "@/lib/auth";
import { all, db } from "@/lib/db";
import { formatDate } from "@/lib/i18n/format";
import { AdminPage, Table, td } from "@/components/admin/ui";

export default async function Audit() {
  await requireUser(["admin"], "/admin/login");
  const t = await adminT();
  const L = await adminLang();
  const database = await db();
  const rows = await all<{ id: string; actor: string | null; action: string; entity: string | null; entity_id: string | null; details: string | null; created_at: string }>(database.prepare("SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 300"));
  return (
    <AdminPage title={t("Activity log")} lead={t("Every sign-in, decision, upload, publication, outreach e-mail and setting change.")}>
      <Table head={["When", "Who", "Action", "Target", "Details"].map(t)}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className={`${td} whitespace-nowrap`}>{formatDate(r.created_at, L, true)}</td>
            <td className={td}>{r.actor ?? "—"}</td>
            <td className={td}><span className="font-mono text-ui-sm text-gold-light">{r.action}</span></td>
            <td className={td}><span className="text-ui-sm text-ivory-muted">{r.entity}{r.entity_id ? ` · ${r.entity_id.slice(0, 8)}` : ""}</span></td>
            <td className={`${td} max-w-md`}><span className="line-clamp-2 break-all font-mono text-[0.65rem] text-ivory-muted">{r.details}</span></td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
