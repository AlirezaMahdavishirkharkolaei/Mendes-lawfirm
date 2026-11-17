import type { Metadata } from "next";
import Link from "next/link";
import { pageContext } from "@/lib/site";
import { requireUser, isStaff } from "@/lib/auth";
import { casesFor } from "@/lib/data/cases";
import { listBookings } from "@/lib/data/bookings";
import { formatDate } from "@/lib/i18n/format";
import { topicLabel } from "@/lib/topics";
import { Badge, Container, Card } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { logout } from "./actions";

export const metadata: Metadata = { robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Portal({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, d, l } = await pageContext(params);
  const user = await requireUser(undefined, l("/portal/login"));
  const [cases, bookings] = await Promise.all([casesFor(user), listBookings({ email: user.email, limit: 20 })]);
  const bTone = { pending: "warning", approved: "success", rejected: "danger", cancelled: "muted" } as const;

  return (
    <section className="pb-24 pt-36">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label">{d.portal.title}</p>
            <h1 className="mt-4 font-display text-h1 font-light">{d.portal.welcome}, <span className="gold-text">{user.name.split(" ")[0]}</span></h1>
          </div>
          <div className="flex flex-wrap gap-3">
            {isStaff(user) && <ButtonLink href="/admin" variant="outline" size="sm">Admin</ButtonLink>}
            {user.role === "author" && <ButtonLink href={l("/insights/submit")} variant="outline" size="sm">{d.submit.mine}</ButtonLink>}
            <form action={logout}>
              <input type="hidden" name="locale" value={locale} />
              <button className="rounded-[2px] border border-line px-4 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ivory-muted hover:border-gold hover:text-gold-light">{d.common.logout}</button>
            </form>
          </div>
        </div>

        <h2 className="label mt-16">{d.portal.myCases}</h2>
        {cases.length === 0 ? (
          <Card className="mt-6 p-10 text-ivory-muted">{d.portal.noCases}</Card>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {cases.map((c, i) => (
              <Reveal key={c.id} index={i % 2}>
                <Link href={l(`/portal/cases/${c.id}`)} className="group block rounded-[4px] border border-line bg-night-2/70 p-8 transition-all duration-500 hover:-translate-y-1 hover:border-gold/50">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[0.68rem] tracking-[0.12em] text-gold" dir="ltr">{c.reference}</span>
                    <Badge tone={c.status === "closed" || c.status === "settled" ? "muted" : c.status === "awaiting_client" ? "warning" : "gold"}>{d.portal.statuses[c.status]}</Badge>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-light group-hover:text-gold-light">{c.title}</h3>
                  <div className="mt-6">
                    <div className="flex justify-between text-ui-sm text-ivory-muted"><span>{d.portal.progress}</span><span dir="ltr">{c.progress}%</span></div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-night-3"><div className="h-full rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-light transition-all duration-1000" style={{ width: `${c.progress}%` }} /></div>
                  </div>
                  {c.next_step && <p className="mt-5 text-ui text-ivory/75"><span className="text-ivory-muted">{d.portal.nextStep}:</span> {c.next_step}</p>}
                  {c.lawyer_name && <p className="mt-2 text-ui-sm text-ivory-muted">{d.portal.lawyer}: {c.lawyer_name}</p>}
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        <h2 className="label mt-16">{d.portal.myBookings}</h2>
        {bookings.length === 0 ? (
          <p className="mt-6 text-ivory-muted">{d.portal.noBookings}</p>
        ) : (
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {bookings.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                <div>
                  <p className="text-ivory">{formatDate(b.slot_start, locale, true)}</p>
                  <p className="text-ui-sm text-ivory-muted">{topicLabel(b.topic, locale)} · {b.meeting_mode === "office" ? d.booking.office : d.booking.online}</p>
                </div>
                <Badge tone={bTone[b.status]}>{d.portal.bookingStatus[b.status]}</Badge>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-10"><ButtonLink href={l("/booking")} arrow>{d.nav.booking}</ButtonLink></div>
      </Container>
    </section>
  );
}
