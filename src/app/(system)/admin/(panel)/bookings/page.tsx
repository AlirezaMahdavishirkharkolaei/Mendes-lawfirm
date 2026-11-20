import { adminLang, adminT } from "@/lib/admin-i18n";
import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { listBookings } from "@/lib/data/bookings";
import { formatDate } from "@/lib/i18n/format";
import { topicLabel } from "@/lib/topics";
import { AdminPage, Table, td, small } from "@/components/admin/ui";
import { Badge } from "@/components/ui/misc";
import { cancelBooking, decideBookingAdmin } from "@/app/(system)/admin/actions";

const STATUSES = ["pending", "approved", "rejected", "cancelled"];

export default async function Bookings({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireUser(["admin", "lawyer"], "/admin/login");
  const t = await adminT();
  const L = await adminLang();
  const { status } = await searchParams;
  const rows = await listBookings({ status: STATUSES.includes(status ?? "") ? status : undefined });
  const tone = { pending: "warning", approved: "success", rejected: "danger", cancelled: "muted" } as const;
  return (
    <AdminPage title={t("Meeting requests")} lead={t("Approve or reject a requested time. The client is e-mailed automatically in their language; rejected clients get a link to choose another time.")}>
      <div className="flex flex-wrap gap-2">
        {[undefined, ...STATUSES].map((s) => (
          <Link key={s ?? "all"} href={s ? `/admin/bookings?status=${s}` : "/admin/bookings"} className={`${small} ${status === s ? "border-gold text-gold-light" : ""}`}>{t(s ?? "all")}</Link>
        ))}
      </div>
      <Table head={["When", "Client", "Matter", "Status", "Decision"].map(t)} empty={rows.length ? undefined : "No requests."}>
        {rows.map((b) => (
          <tr key={b.id}>
            <td className={td}>
              <p className="text-ivory">{formatDate(b.slot_start, L, true)}</p>
              <p className="text-ui-sm text-ivory-muted">{b.duration_min} {t("min")} · {t(b.meeting_mode)}</p>
            </td>
            <td className={td}>
              <p>{b.name}</p>
              <p className="text-ui-sm text-ivory-muted"><a href={`mailto:${b.email}`} className="hover:text-gold">{b.email}</a>{b.phone ? ` · ${b.phone}` : ""}</p>
              {b.company && <p className="text-ui-sm text-ivory-muted">{b.company}</p>}
              <p className="font-mono text-[0.6rem] uppercase text-ivory-muted">{b.locale}</p>
            </td>
            <td className={`${td} max-w-sm`}>
              <p className="text-gold-light">{topicLabel(b.topic, L)}</p>
              <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-ui-sm text-ivory/75">{b.message}</p>
            </td>
            <td className={td}><Badge tone={tone[b.status]}>{t(b.status)}</Badge>{b.decided_by && <p className="mt-2 text-[0.65rem] text-ivory-muted">{b.decided_by}</p>}</td>
            <td className={td}>
              {b.status === "pending" ? (
                <form action={decideBookingAdmin} className="flex min-w-56 flex-col gap-2">
                  <input type="hidden" name="id" value={b.id} />
                  <input name="note" placeholder={t("Message to client (optional)")} className="rounded-[2px] border border-line bg-night-3 px-3 py-2 text-ui-sm" />
                  <div className="flex gap-2">
                    <button name="decision" value="approve" className="rounded-[2px] bg-gold px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-night">{t("Approve")}</button>
                    <button name="decision" value="reject" className="rounded-[2px] border border-danger/60 px-3 py-2 text-[0.65rem] uppercase tracking-[0.12em] text-danger">{t("Reject")}</button>
                  </div>
                </form>
              ) : b.status === "approved" ? (
                <form action={cancelBooking}><input type="hidden" name="id" value={b.id} /><button className={small}>{t("Mark cancelled")}</button></form>
              ) : (
                b.decision_note && <p className="text-ui-sm text-ivory-muted">“{b.decision_note}”</p>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
