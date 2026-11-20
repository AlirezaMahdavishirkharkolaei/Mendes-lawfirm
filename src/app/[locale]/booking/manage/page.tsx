import type { Metadata } from "next";
import { pageContext } from "@/lib/site";
import { bookingFromManageToken } from "@/lib/data/bookings";
import { formatDate } from "@/lib/i18n/format";
import { topicLabel } from "@/lib/topics";
import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/Button";
import { Badge, Container, Notice } from "@/components/ui/misc";
import { cancelMeeting } from "./actions";

export const metadata: Metadata = { robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ManageBooking({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ t?: string; done?: string }> }) {
  const { locale, d } = await pageContext(params);
  const sp = await searchParams;
  const booking = sp.t ? await bookingFromManageToken(sp.t) : null;
  const tone = { pending: "warning", approved: "success", rejected: "danger", cancelled: "muted" } as const;

  return (
    <>
      <PageHero label={d.nav.booking} title={d.manage.title} lead={booking ? d.manage.lead : undefined} />
      <Container narrow className="pb-24">
        {!booking ? (
          <Notice tone="danger">{d.manage.invalid}</Notice>
        ) : (
          <div className="space-y-8 rounded-[6px] border border-line bg-night-2/60 p-8 md:p-10">
            {sp.done && <Notice tone="success">{d.manage.cancelled}</Notice>}
            <dl className="divide-y divide-line border-y border-line">
              {[
                [d.mail.when, formatDate(booking.slot_start, locale, true)],
                [d.mail.mode, booking.meeting_mode === "office" ? d.booking.office : d.booking.online],
                [d.mail.topic, topicLabel(booking.topic, locale)],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-4 py-4">
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ivory-muted">{k}</dt>
                  <dd className="col-span-2 text-ivory">{v}</dd>
                </div>
              ))}
              <div className="grid grid-cols-3 gap-4 py-4">
                <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ivory-muted">{d.manage.status}</dt>
                <dd className="col-span-2"><Badge tone={tone[booking.status]}>{d.portal.bookingStatus[booking.status]}</Badge></dd>
              </div>
            </dl>
            {(booking.status === "pending" || booking.status === "approved") && new Date(booking.slot_start) > new Date() && (
              <div className="flex flex-wrap gap-4">
                <form action={cancelMeeting}>
                  <input type="hidden" name="t" value={sp.t} />
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="then" value="rebook" />
                  <Button arrow>{d.manage.reschedule}</Button>
                </form>
                <form action={cancelMeeting}>
                  <input type="hidden" name="t" value={sp.t} />
                  <input type="hidden" name="locale" value={locale} />
                  <Button variant="danger">{d.manage.confirm}</Button>
                </form>
              </div>
            )}
          </div>
        )}
      </Container>
    </>
  );
}
