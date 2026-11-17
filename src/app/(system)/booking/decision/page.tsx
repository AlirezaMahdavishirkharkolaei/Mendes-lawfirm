import Link from "next/link";
import { verifyPayload } from "@/lib/security/crypto";
import { getBooking } from "@/lib/data/bookings";
import { formatDate } from "@/lib/i18n/format";
import { topicLabel } from "@/lib/topics";
import { SystemPanel } from "@/components/system/Panel";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/fields";
import { Badge, Notice } from "@/components/ui/misc";
import { decideFromEmail } from "./actions";

export const dynamic = "force-dynamic";

export default async function Decision({ searchParams }: { searchParams: Promise<{ t?: string; a?: string; done?: string; invalid?: string }> }) {
  const sp = await searchParams;
  const payload = sp.t ? await verifyPayload<{ b: string; p: string }>(sp.t) : null;
  const booking = payload?.p === "booking" ? await getBooking(payload.b) : null;

  if (!booking || sp.invalid) {
    return (
      <SystemPanel title="Link expired or invalid">
        <p className="text-ivory-muted">This decision link is no longer valid. You can still manage every request in the admin panel.</p>
        <Link href="/admin/bookings" className="label link-grow mt-8 inline-block">Open admin → Bookings</Link>
      </SystemPanel>
    );
  }

  const decided = booking.status !== "pending";
  return (
    <SystemPanel title={decided ? (booking.status === "approved" ? "Meeting approved" : "Meeting declined") : "Meeting request"} label="Managing partner · decision">
      {sp.done && sp.done !== "already" && (
        <Notice tone="success" className="mb-8">Done — {booking.name} has been e-mailed in their language ({booking.locale.toUpperCase()}).</Notice>
      )}
      {sp.done === "already" && <Notice className="mb-8">This request had already been decided.</Notice>}

      <dl className="divide-y divide-line border-y border-line text-ui">
        {[
          ["Requested time", `${formatDate(booking.slot_start, "en", true)} · ${booking.duration_min} min`],
          ["Type", booking.meeting_mode === "office" ? "At the office" : "Online"],
          ["Client", booking.name],
          ["E-mail", booking.email],
          ["Phone", booking.phone || "—"],
          ["Company", booking.company || "—"],
          ["Area of law", topicLabel(booking.topic, "en")],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-3 gap-4 py-3">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ivory-muted">{k}</dt>
            <dd className="col-span-2 break-words text-ivory">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 whitespace-pre-wrap rounded-[3px] bg-night-3/60 p-4 text-ui leading-relaxed text-ivory/85">{booking.message}</p>

      {decided ? (
        <div className="mt-8 flex items-center gap-3">
          <Badge tone={booking.status === "approved" ? "success" : "danger"}>{booking.status}</Badge>
          {booking.decision_note && <span className="text-ui-sm text-ivory-muted">“{booking.decision_note}”</span>}
        </div>
      ) : (
        <form action={decideFromEmail} className="mt-8 space-y-5">
          <input type="hidden" name="t" value={sp.t} />
          <label className="block">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ivory-muted">Message to the client (optional)</span>
            <Textarea name="note" rows={3} className="mt-2" placeholder={sp.a === "reject" ? "e.g. I'm in court that morning — any afternoon this week works." : "e.g. I'll send the video link the day before."} />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button name="decision" value="approve" className={sp.a === "reject" ? "opacity-70" : ""}>✓ Approve</Button>
            <Button name="decision" value="reject" variant="danger" className={sp.a === "approve" ? "opacity-70" : ""}>✕ Reject — ask for another time</Button>
          </div>
        </form>
      )}
    </SystemPanel>
  );
}
