import "server-only";
import type { Locale } from "@/lib/i18n/config";
import { staticDictionary } from "@/lib/i18n";
import { fill, formatDate } from "@/lib/i18n/format";
import { topicLabel } from "@/lib/topics";
import { button, esc, nl2br, row, shell, table, toText } from "./layout";
import type { Mail } from "./send";

export interface BookingLike {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  topic: string;
  message: string;
  slot_start: string;
  duration_min: number;
  meeting_mode: string;
  locale: string;
  decision_note?: string | null;
}

function mail(subject: string, html: string, extra: Partial<Mail> = {}): Omit<Mail, "to"> {
  return { subject, html, text: toText(html), ...extra };
}

/** E-mail to the managing partner with Approve / Reject buttons. */
export function bookingRequestToBoss(
  b: BookingLike,
  links: { approve: string; reject: string; admin: string },
  firm: string,
) {
  const when = formatDate(b.slot_start, "en", true);
  const body = `
<p>A new consultation request has arrived through the website. The client is waiting for your decision.</p>
${table([
  row("Requested time", `<strong>${esc(when)}</strong> (${b.duration_min} min, North Cyprus time)`),
  row("Meeting type", b.meeting_mode === "office" ? "At the office" : "Online (video call)"),
  row("Client", esc(b.name)),
  row("E-mail", `<a href="mailto:${esc(b.email)}">${esc(b.email)}</a>`),
  row("Phone", esc(b.phone || "—")),
  row("Company", esc(b.company || "—")),
  row("Area of law", esc(topicLabel(b.topic, "en"))),
  row("Client language", esc(b.locale.toUpperCase())),
  row("Message", nl2br(b.message)),
])}
<p style="margin:26px 0 8px">${button(links.approve, "✓ Approve this time", "gold")}${button(links.reject, "✕ Reject — ask for another time", "dark")}</p>
<p style="color:#8a8170;font-size:13px">Each button opens a confirmation page, so a link preview can never decide a request by accident. When you confirm, the client is e-mailed automatically in their own language. You can also manage all requests in the <a href="${esc(links.admin)}" style="color:#8a6d3b">admin panel</a>.</p>`;
  return mail(`New meeting request — ${b.name} · ${when}`, shell({ title: "New meeting request", preheader: `${b.name} · ${when}`, body, firm }), {
    replyTo: b.email,
  });
}

function clientDetails(b: BookingLike, locale: Locale) {
  const d = staticDictionary(locale);
  return table([
    row(d.mail.when, `<strong>${esc(formatDate(b.slot_start, locale, true))}</strong> · ${b.duration_min} ${d.common.minutes}`),
    row(d.mail.mode, b.meeting_mode === "office" ? d.booking.office : d.booking.online),
    row(d.mail.topic, esc(topicLabel(b.topic, locale))),
  ]);
}

export function bookingReceived(b: BookingLike, locale: Locale, firm: string) {
  const d = staticDictionary(locale);
  const body = `<p>${esc(fill(d.mail.receivedBody, { name: b.name }))}</p>${clientDetails(b, locale)}`;
  return mail(d.mail.receivedSubject, shell({ locale, title: d.mail.receivedTitle, body, firm }));
}

export function bookingDecision(b: BookingLike, locale: Locale, approved: boolean, rebookUrl: string, firm: string) {
  const d = staticDictionary(locale);
  const note = b.decision_note ? `<p style="margin-top:18px"><strong>${esc(d.mail.note)}:</strong><br>${nl2br(b.decision_note)}</p>` : "";
  const body = approved
    ? `<p>${esc(fill(d.mail.approvedBody, { name: b.name }))}</p>${clientDetails(b, locale)}${note}`
    : `<p>${esc(fill(d.mail.rejectedBody, { name: b.name }))}</p>${clientDetails(b, locale)}${note}<p style="margin-top:24px">${button(rebookUrl, d.mail.chooseAnother)}</p>`;
  return mail(
    approved ? d.mail.approvedSubject : d.mail.rejectedSubject,
    shell({ locale, title: approved ? d.mail.approvedTitle : d.mail.rejectedTitle, body, firm }),
  );
}

export function accountLink(locale: Locale, kind: "invite" | "reset", url: string, firm: string) {
  const d = staticDictionary(locale);
  const invite = kind === "invite";
  const body = `<p>${esc(invite ? d.mail.inviteBody : d.mail.resetBody)}</p><p style="margin-top:22px">${button(url, invite ? d.mail.inviteCta : d.mail.resetCta)}</p>`;
  return mail(invite ? d.mail.inviteSubject : d.mail.resetSubject, shell({ locale, title: invite ? d.mail.inviteSubject : d.mail.resetSubject, body, firm }));
}

export function caseUpdate(locale: Locale, reference: string, title: string, url: string, firm: string) {
  const d = staticDictionary(locale);
  const subject = fill(d.mail.caseUpdateSubject, { ref: reference });
  const body = `<p>${esc(d.mail.caseUpdateBody)}</p><p style="font:400 18px/1.4 Georgia,serif;margin:18px 0">${esc(title)}</p><p>${button(url, d.mail.caseCta)}</p>`;
  return mail(subject, shell({ locale, title: subject, body, firm }));
}

export function articleDecision(locale: Locale, status: "published" | "revision" | "rejected", title: string, url: string, note: string | null, firm: string) {
  const d = staticDictionary(locale);
  const subject = fill(d.mail.articleSubject, { title });
  const lead = status === "published" ? d.mail.articlePublished : status === "revision" ? d.mail.articleRevision : d.mail.articleRejected;
  const body = `<p>${esc(lead)}</p>${status === "published" ? `<p><a href="${esc(url)}" style="color:#8a6d3b;font-weight:600">${esc(url)}</a></p>` : ""}${note ? `<blockquote style="margin:18px 0;padding:12px 18px;border-inline-start:3px solid #c9a96a;background:#faf7f1">${nl2br(note)}</blockquote>` : ""}`;
  return mail(subject, shell({ locale, title: subject, body, firm }));
}
