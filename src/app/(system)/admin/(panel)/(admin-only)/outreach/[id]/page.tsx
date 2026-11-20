import { adminLang, adminT } from "@/lib/admin-i18n";
import { requireUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { getProspect, thread } from "@/lib/data/outreach";
import { formatDate } from "@/lib/i18n/format";
import { AdminPage, Panel } from "@/components/admin/ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, Input, Select, Textarea } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Badge } from "@/components/ui/misc";
import { draftProspect, logInboundReply, updateProspectStatus } from "@/app/(system)/admin/actions";

export default async function ProspectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["admin"], "/admin/login");
  const t = await adminT();
  const L = await adminLang();
  const p = await getProspect((await params).id);
  if (!p) notFound();
  const messages = await thread(p.id);
  return (
    <AdminPage title={p.company} lead={`${p.country} · ${p.interest.replace("_", " ")} · ${p.email}${p.website ? ` · ${p.website}` : ""}`}>
      <div className="grid gap-10 xl:grid-cols-3">
        <Panel title={t("Conversation")} className="xl:col-span-2">
          {messages.length === 0 ? <p className="text-ivory-muted">{t("No messages yet.")}</p> : (
            <ol className="space-y-6">
              {messages.map((m) => (
                <li key={m.id} className={`rounded-[4px] border p-5 ${m.direction === "inbound" ? "border-success/40 bg-success/5" : "border-line"}`}>
                  <div className="flex flex-wrap items-center gap-3 text-ui-sm text-ivory-muted">
                    <Badge tone={m.direction === "inbound" ? "success" : m.status === "sent" ? "gold" : m.status === "draft" ? "warning" : "muted"}>{m.direction === "inbound" ? "their reply" : m.status}</Badge>
                    {formatDate(m.sent_at ?? m.created_at, L, true)}
                    {m.ai_generated ? <span>· AI-written{m.approved_by ? `, approved by ${m.approved_by}` : ""}</span> : null}
                  </div>
                  <p className="mt-3 text-ivory">{m.subject}</p>
                  <p className="mt-2 whitespace-pre-wrap text-ui leading-relaxed text-ivory/80">{m.body}</p>
                  {m.error && <p className="mt-2 text-ui-sm text-danger">{m.error}</p>}
                </li>
              ))}
            </ol>
          )}
          <form action={draftProspect} className="mt-6"><input type="hidden" name="id" value={p.id} /><button className="rounded-[2px] border border-gold/50 px-4 py-2 text-[0.65rem] uppercase tracking-[0.12em] text-gold hover:bg-gold/10">{t("✦ Ask AI for the next message")}</button></form>
        </Panel>
        <div className="space-y-10">
          <Panel title={t("Status")}>
            <form action={updateProspectStatus} className="space-y-4">
              <input type="hidden" name="id" value={p.id} />
              <Select name="status" defaultValue={p.status}>{["new", "drafted", "contacted", "replied", "meeting", "declined"].map((s) => <option key={s}>{s}</option>)}</Select>
              <Textarea name="notes" rows={3} defaultValue={p.notes ?? ""} placeholder={t("Internal notes (also given to the AI)")} />
              <button className="rounded-[2px] bg-gold-fill px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-on-gold">{t("Update")}</button>
            </form>
            <p className="mt-4 text-ui-sm text-ivory-muted">{t("Mark “meeting” when they book — it counts in the monthly report.")}</p>
          </Panel>
          <Panel title={t("Log a reply they sent")}>
            <ActionForm action={logInboundReply}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="email" value={p.email} />
              <Field label={t("Subject")} htmlFor="subject"><Input id="subject" name="subject" /></Field>
              <Field label={t("Their message")} htmlFor="body"><Textarea id="body" name="body" rows={6} required /></Field>
              <SubmitButton pending={t("Saving…")} variant="outline">Log &amp; draft answer</SubmitButton>
            </ActionForm>
            <p className="mt-4 text-ui-sm text-ivory-muted">{t("With Email Routing enabled, replies are logged automatically.")}</p>
          </Panel>
        </div>
      </div>
    </AdminPage>
  );
}
