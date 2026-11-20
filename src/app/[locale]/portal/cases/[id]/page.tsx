import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageContext } from "@/lib/site";
import { requireUser, isStaff } from "@/lib/auth";
import { canAccessCase, caseDocuments, caseEvents, getCase, CASE_STATUSES } from "@/lib/data/cases";
import { formatDate } from "@/lib/i18n/format";
import { topicLabel } from "@/lib/topics";
import { eventTitle } from "@/lib/case-events";
import { Badge, Card, Container } from "@/components/ui/misc";
import { StaffUpdateForm, UploadForm } from "@/components/portal/CaseForms";
import { postCaseUpdate, uploadDocument } from "../../actions";

export const metadata: Metadata = { robots: { index: false } };
export const dynamic = "force-dynamic";

function size(n: number) {
  return n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`;
}

export default async function CasePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, d, l } = await pageContext(params);
  const { id } = await params;
  const user = await requireUser(undefined, l(`/portal/login?next=${encodeURIComponent(l(`/portal/cases/${id}`))}`));
  const c = await getCase(id);
  if (!c || !canAccessCase(user, c)) notFound();
  const staff = isStaff(user);
  const [events, docs] = await Promise.all([caseEvents(c.id, staff), caseDocuments(c.id)]);

  return (
    <section className="pb-24 pt-36">
      <Container>
        <Link href={l("/portal")} className="label link-grow inline-flex">← {d.portal.title}</Link>
        <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-mono text-ui text-gold" dir="ltr">{c.reference}</p>
            <h1 className="mt-3 max-w-3xl font-display text-h1 font-light">{c.title}</h1>
            {c.practice_area && <p className="mt-3 text-ivory-muted">{topicLabel(c.practice_area, locale)}</p>}
          </div>
          <Badge tone={c.status === "awaiting_client" ? "warning" : "gold"}>{d.portal.statuses[c.status]}</Badge>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-[4px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            [d.portal.progress, `${c.progress}%`],
            [d.portal.nextStep, c.next_step || "—"],
            [d.portal.nextDate, c.next_date ? formatDate(`${c.next_date}T09:00:00Z`, locale) : "—"],
            [d.portal.lawyer, c.lawyer_name || "—"],
          ].map(([k, v]) => (
            <div key={k} className="bg-night-2 p-6">
              <p className="label">{k}</p>
              <p className="mt-3 text-lead text-ivory">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-night-3"><div className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-light" style={{ width: `${c.progress}%` }} /></div>
        {c.description && <p className="mt-10 max-w-3xl leading-relaxed text-ivory/80">{c.description}</p>}

        <div className="mt-16 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="font-display text-h3 font-light">{d.portal.timeline}</h2>
            {events.length === 0 ? (
              <p className="mt-6 text-ivory-muted">{d.portal.noEvents}</p>
            ) : (
              <ol className="relative mt-8 space-y-8 border-s border-line ps-8">
                {events.map((e) => (
                  <li key={e.id} className="relative">
                    <span aria-hidden className={`absolute -start-[2.33rem] top-1.5 h-3 w-3 rounded-full border-2 ${e.is_internal ? "border-ivory-muted bg-night" : "border-gold bg-night shadow-[0_0_12px_rgba(201,169,106,0.7)]"}`} />
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ivory-muted">{formatDate(e.created_at, locale, true)}{e.author_name ? ` · ${e.author_name}` : ""}</p>
                    <p className="mt-2 text-lead text-ivory" dir="auto">{eventTitle(e.title, d)} {e.is_internal ? <Badge tone="muted">internal</Badge> : null}</p>
                    {e.body && <p className="mt-2 whitespace-pre-wrap text-ui leading-relaxed text-ivory/75">{e.body}</p>}
                  </li>
                ))}
              </ol>
            )}
            {staff && (
              <Card className="mt-12 p-8">
                <p className="label mb-6">Staff · post update</p>
                <StaffUpdateForm action={postCaseUpdate} d={d} locale={locale} caseId={c.id} statuses={CASE_STATUSES.map((s) => ({ key: s, label: d.portal.statuses[s] }))} current={{ status: c.status, progress: c.progress }} />
              </Card>
            )}
          </div>
          <div className="lg:col-span-5">
            <h2 className="font-display text-h3 font-light">{d.portal.documents}</h2>
            {docs.length === 0 ? (
              <p className="mt-6 text-ivory-muted">{d.portal.noDocuments}</p>
            ) : (
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {docs.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-ui text-ivory" dir="auto">{doc.filename}</p>
                      <p className="text-ui-sm text-ivory-muted">{formatDate(doc.created_at, locale)} · {size(doc.size_bytes)}{doc.uploader_name ? ` · ${d.portal.uploadedBy} ${doc.uploader_name}` : ""}</p>
                      {doc.note && <p className="text-ui-sm text-ivory/60">{doc.note}</p>}
                    </div>
                    <a href={`/api/documents/${doc.id}`} className="shrink-0 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-gold hover:text-gold-light">{d.common.download}</a>
                  </li>
                ))}
              </ul>
            )}
            <Card className="mt-8 p-8">
              <UploadForm action={uploadDocument} d={d} locale={locale} caseId={c.id} />
              <p className="mt-6 text-ui-sm text-ivory-muted">🔒 {d.portal.security}</p>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  );
}
