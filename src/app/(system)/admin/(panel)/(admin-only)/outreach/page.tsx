import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { all, db } from "@/lib/db";
import { listProspects, pendingDrafts, PROSPECT_STATUSES, INTERESTS } from "@/lib/data/outreach";
import { aiConfig } from "@/lib/ai/provider";
import { formatDate } from "@/lib/i18n/format";
import { locales } from "@/lib/i18n/config";
import { AdminPage, Panel, Stat, Table, td, small } from "@/components/admin/ui";
import { ActionButton, ActionForm } from "@/components/admin/ActionForm";
import { Field, Input, Select, Textarea } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Badge, Notice } from "@/components/ui/misc";
import { addProspectAdmin, discardDraftAdmin, draftProspect, importProspects, runDailyNow, sendDraft, sendReportNow } from "@/app/(system)/admin/actions";

export default async function Outreach({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireUser(["admin"], "/admin/login");
  const { status } = await searchParams;
  const database = await db();
  const [prospects, drafts, ai, reports, counts] = await Promise.all([
    listProspects(status),
    pendingDrafts(),
    aiConfig(),
    all<{ period: string; sent_to: string | null; created_at: string }>(database.prepare("SELECT period, sent_to, created_at FROM reports ORDER BY period DESC LIMIT 12")),
    all<{ status: string; n: number }>(database.prepare("SELECT status, COUNT(*) n FROM prospects GROUP BY status")),
  ]);
  const c = Object.fromEntries(counts.map((r) => [r.status, r.n]));
  const tone: Record<string, "gold" | "muted" | "success" | "danger" | "warning"> = { new: "muted", drafted: "warning", contacted: "gold", replied: "success", meeting: "success", declined: "danger", unsubscribed: "danger" };

  return (
    <AdminPage
      title="AI business outreach"
      lead="Companies abroad interested in investment, construction or company formation in North Cyprus. The AI writes personalised first e-mails and replies in the prospect’s language, aiming for an online meeting; nothing is sent until you approve it. A report goes to the partners on the 1st of every month."
      actions={<><ActionButton action={runDailyNow}>Draft now</ActionButton><ActionButton action={sendReportNow}>Send last month’s report</ActionButton></>}
    >
      {!ai.configured && <Notice tone="danger">No AI provider key configured — drafts can’t be written yet (Settings → AI).</Notice>}
      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {(["new", "drafted", "contacted", "replied", "meeting", "declined"] as const).map((s) => <Stat key={s} label={s} value={c[s] ?? 0} />)}
      </div>

      <Panel title={`Drafts awaiting approval (${drafts.length})`}>
        {drafts.length === 0 ? (
          <p className="text-ivory-muted">No drafts waiting. New prospects are drafted daily at 07:00 UTC, or press “Draft now”.</p>
        ) : (
          <div className="space-y-8">
            {drafts.map((m) => (
              <div key={m.id} className="rounded-[4px] border border-line p-5">
                <p className="text-ui text-ivory"><Link href={`/admin/outreach/${m.prospect_id}`} className="hover:text-gold-light">{m.company}</Link> · <span className="text-ivory-muted">{m.email}</span></p>
                <ActionForm action={sendDraft} className="mt-4 space-y-3">
                  <input type="hidden" name="id" value={m.id} />
                  <Input name="subject" defaultValue={m.subject} />
                  <Textarea name="body" rows={9} defaultValue={m.body} className="text-ui" />
                  <div className="flex flex-wrap items-center gap-3">
                    <SubmitButton pending="Sending…" size="sm">Approve &amp; send</SubmitButton>
                    <span className="text-ui-sm text-ivory-muted">An unsubscribe link is added automatically.</span>
                  </div>
                </ActionForm>
                <form action={discardDraftAdmin} className="mt-3"><input type="hidden" name="id" value={m.id} /><button className="text-ui-sm text-danger hover:underline">Discard draft</button></form>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="flex flex-wrap gap-2">
        {[undefined, ...PROSPECT_STATUSES].map((s) => <Link key={s ?? "all"} href={s ? `/admin/outreach?status=${s}` : "/admin/outreach"} className={`${small} ${status === s ? "border-gold text-gold-light" : ""}`}>{s ?? "all"}</Link>)}
      </div>
      <Table head={["Company", "Country / interest", "Contact", "Status", ""]} empty={prospects.length ? undefined : "No prospects yet — add one below or import a CSV."}>
        {prospects.map((p) => (
          <tr key={p.id}>
            <td className={td}><Link href={`/admin/outreach/${p.id}`} className="text-ivory hover:text-gold-light">{p.company}</Link><p className="text-ui-sm text-ivory-muted">{p.sector}</p></td>
            <td className={td}>{p.country}<p className="text-ui-sm text-ivory-muted">{p.interest.replace("_", " ")} · {p.language.toUpperCase()}</p></td>
            <td className={td}>{p.contact_name}<p className="text-ui-sm text-ivory-muted">{p.email}</p></td>
            <td className={td}><Badge tone={tone[p.status]}>{p.status}</Badge>{p.last_contact_at && <p className="mt-1 text-[0.65rem] text-ivory-muted">{formatDate(p.last_contact_at, "en")}</p>}</td>
            <td className={td}>{["new", "replied", "contacted"].includes(p.status) && <form action={draftProspect}><input type="hidden" name="id" value={p.id} /><button className={small}>AI draft</button></form>}</td>
          </tr>
        ))}
      </Table>

      <div className="grid gap-10 xl:grid-cols-2">
        <Panel title="Add a prospect">
          <ActionForm action={addProspectAdmin}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Company" htmlFor="company"><Input id="company" name="company" required /></Field>
              <Field label="Country" htmlFor="country"><Input id="country" name="country" required /></Field>
              <Field label="Business e-mail" htmlFor="p-email" hint="Use a published company address (info@, partnerships@…)."><Input id="p-email" name="email" type="email" required /></Field>
              <Field label="Contact name" htmlFor="contact_name"><Input id="contact_name" name="contact_name" /></Field>
              <Field label="Sector" htmlFor="sector"><Input id="sector" name="sector" /></Field>
              <Field label="Interest" htmlFor="interest"><Select id="interest" name="interest">{INTERESTS.map((i) => <option key={i} value={i}>{i.replace("_", " ")}</option>)}</Select></Field>
              <Field label="Write to them in" htmlFor="language"><Select id="language" name="language">{locales.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}</Select></Field>
              <Field label="Website" htmlFor="website"><Input id="website" name="website" /></Field>
            </div>
            <Field label="Where you found them / notes for the AI" htmlFor="notes"><Textarea id="notes" name="notes" rows={2} /></Field>
            <SubmitButton pending="Adding…">Add prospect</SubmitButton>
          </ActionForm>
        </Panel>
        <Panel title="Import CSV">
          <ActionForm action={importProspects}>
            <p className="text-ui-sm text-ivory-muted">Columns: <code className="text-gold">company,country,email,contact_name,sector,interest,language,website,source</code> — interest is one of investment / construction / company_formation / other.</p>
            <Textarea name="csv" rows={9} className="font-mono text-ui-sm" placeholder="Acme Build GmbH,Germany,info@acme-build.de,Jana Weber,Construction,construction,en,https://acme-build.de,trade fair 2026" />
            <SubmitButton pending="Importing…" variant="outline">Import</SubmitButton>
          </ActionForm>
        </Panel>
      </div>

      <Panel title="Monthly reports">
        {reports.length === 0 ? <p className="text-ivory-muted">The first report will be sent on the 1st of next month.</p> : (
          <ul className="divide-y divide-line">{reports.map((r) => <li key={r.period} className="flex justify-between py-3 text-ui"><span className="font-mono">{r.period}</span><span className="text-ivory-muted">{r.sent_to || "not e-mailed"} · {formatDate(r.created_at, "en")}</span></li>)}</ul>
        )}
      </Panel>
    </AdminPage>
  );
}
