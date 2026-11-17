import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { listArticles, type ArticleStatus } from "@/lib/data/articles";
import { formatDate } from "@/lib/i18n/format";
import { AdminPage, Table, td, small } from "@/components/admin/ui";
import { Badge } from "@/components/ui/misc";

export default async function ArticlesAdmin({ searchParams }: { searchParams: Promise<{ status?: ArticleStatus }> }) {
  await requireUser(["admin", "lawyer"], "/admin/login");
  const { status } = await searchParams;
  const rows = await listArticles({ status, limit: 200 });
  const tone = { submitted: "warning", revision: "gold", published: "success", rejected: "danger" } as const;
  return (
    <AdminPage title="Articles" lead="Student and staff submissions. Publishing gives the author a permanent, citable link and e-mails it to them.">
      <div className="flex flex-wrap gap-2">
        {[undefined, "submitted", "revision", "published", "rejected"].map((s) => <Link key={s ?? "all"} href={s ? `/admin/articles?status=${s}` : "/admin/articles"} className={`${small} ${status === s ? "border-gold text-gold-light" : ""}`}>{s ?? "all"}</Link>)}
      </div>
      <Table head={["Title", "Author", "Language", "Submitted", "Status"]} empty={rows.length ? undefined : "No articles."}>
        {rows.map((a) => (
          <tr key={a.id}>
            <td className={td}><Link href={`/admin/articles/${a.id}`} className="text-ivory hover:text-gold-light">{a.title}</Link></td>
            <td className={td}>{a.author_name}<p className="text-ui-sm text-ivory-muted">{a.author_university ?? a.author_role}</p></td>
            <td className={td}><span className="font-mono uppercase">{a.locale}</span></td>
            <td className={td}>{formatDate(a.created_at, "en")}</td>
            <td className={td}><Badge tone={tone[a.status]}>{a.status}</Badge></td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
