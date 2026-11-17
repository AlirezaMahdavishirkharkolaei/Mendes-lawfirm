import Link from "next/link";
import { notFound } from "next/navigation";
import { all, db } from "@/lib/db";
import { currentUser, requireUser } from "@/lib/auth";
import { canAccessCase, caseDocuments, caseEvents, getCase, CASE_STATUSES } from "@/lib/data/cases";
import { formatDate } from "@/lib/i18n/format";
import { TOPIC_KEYS, topicLabel } from "@/lib/topics";
import { AdminPage, Panel } from "@/components/admin/ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/misc";
import { updateCaseAdmin } from "@/app/(system)/admin/actions";

export default async function CaseAdmin({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["admin", "lawyer"], "/admin/login");
  const user = (await currentUser())!;
  const c = await getCase((await params).id);
  if (!c || !canAccessCase(user, c)) notFound();
  const database = await db();
  const [events, docs, lawyers] = await Promise.all([
    caseEvents(c.id, true),
    caseDocuments(c.id),
    all<{ id: string; name: string }>(database.prepare("SELECT id, name FROM users WHERE role IN ('lawyer','admin') AND is_active = 1 ORDER BY name")),
  ]);
  return (
    <AdminPage
      title={c.title}
      lead={`${c.reference} · ${c.client_name} (${c.client_email})`}
      actions={<ButtonLink href={`/en/portal/cases/${c.id}`} variant="outline" size="sm">Timeline & documents →</ButtonLink>}
    >
      <div className="grid gap-10 xl:grid-cols-5">
        <Panel title="Case details" className="xl:col-span-3">
          <ActionForm action={updateCaseAdmin}>
            <input type="hidden" name="id" value={c.id} />
            <Field label="Title" htmlFor="title"><Input id="title" name="title" defaultValue={c.title} required /></Field>
            <Field label="Description (visible to client)" htmlFor="description"><Textarea id="description" name="description" defaultValue={c.description ?? ""} rows={3} /></Field>
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Status" htmlFor="status"><Select id="status" name="status" defaultValue={c.status}>{CASE_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</Select></Field>
              <Field label="Progress %" htmlFor="progress"><Input id="progress" name="progress" type="number" min={0} max={100} defaultValue={c.progress} /></Field>
              <Field label="Next date" htmlFor="next_date"><Input id="next_date" name="next_date" type="date" defaultValue={c.next_date ?? ""} /></Field>
            </div>
            <Field label="Next step (visible to client)" htmlFor="next_step"><Input id="next_step" name="next_step" defaultValue={c.next_step ?? ""} /></Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Lawyer" htmlFor="lawyer_id"><Select id="lawyer_id" name="lawyer_id" defaultValue={c.lawyer_id ?? ""}><option value="">—</option>{lawyers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</Select></Field>
              <Field label="Area of law" htmlFor="practice_area"><Select id="practice_area" name="practice_area" defaultValue={c.practice_area ?? ""}><option value="">—</option>{TOPIC_KEYS.map((k) => <option key={k} value={k}>{topicLabel(k, "en")}</option>)}</Select></Field>
            </div>
            <div className="rounded-[3px] border border-dashed border-line p-4">
              <Checkbox name="notify" label="Add this change to the client's timeline and e-mail them" />
              <div className="mt-3"><Input name="event_title" placeholder="Timeline entry, e.g. ‘Application filed with the Land Registry’" /></div>
            </div>
            <SubmitButton pending="Saving…">Save</SubmitButton>
          </ActionForm>
        </Panel>
        <div className="space-y-10 xl:col-span-2">
          <Panel title={`Timeline (${events.length})`}>
            <ol className="space-y-4">
              {events.slice(0, 12).map((e) => (
                <li key={e.id} className="border-s border-gold/40 ps-4">
                  <p className="text-ui text-ivory">{e.title} {e.is_internal ? <Badge tone="muted">internal</Badge> : null}</p>
                  <p className="text-[0.65rem] text-ivory-muted">{formatDate(e.created_at, "en", true)} · {e.author_name ?? "system"}</p>
                </li>
              ))}
            </ol>
          </Panel>
          <Panel title={`Documents (${docs.length})`}>
            <ul className="space-y-3">
              {docs.map((d) => (
                <li key={d.id} className="flex justify-between gap-3 text-ui"><span className="truncate">{d.filename}</span><a href={`/api/documents/${d.id}`} className="shrink-0 text-gold">Download</a></li>
              ))}
            </ul>
            <Link href={`/en/portal/cases/${c.id}`} className="mt-5 inline-block text-ui-sm text-gold">Upload / post update →</Link>
          </Panel>
        </div>
      </div>
    </AdminPage>
  );
}
