import { adminLang, adminT } from "@/lib/admin-i18n";
import Link from "next/link";
import { all, db } from "@/lib/db";
import { currentUser, requireUser } from "@/lib/auth";
import { casesFor } from "@/lib/data/cases";
import { formatDate } from "@/lib/i18n/format";
import { locales } from "@/lib/i18n/config";
import { TOPIC_KEYS, topicLabel } from "@/lib/topics";
import { AdminPage, Panel, Table, td } from "@/components/admin/ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, Input, Select, Textarea } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Badge } from "@/components/ui/misc";
import { createCaseAdmin } from "@/app/(system)/admin/actions";

export default async function Cases() {
  await requireUser(["admin", "lawyer"], "/admin/login");
  const t = await adminT();
  const L = await adminLang();
  const user = (await currentUser())!;
  const database = await db();
  const [cases, clients, lawyers] = await Promise.all([
    casesFor(user),
    all<{ id: string; name: string; email: string }>(database.prepare("SELECT id, name, email FROM users WHERE role = 'client' AND is_active = 1 ORDER BY name")),
    all<{ id: string; name: string }>(database.prepare("SELECT id, name FROM users WHERE role IN ('lawyer','admin') AND is_active = 1 ORDER BY name")),
  ]);
  return (
    <AdminPage title={t("Cases")} lead={t("Open a file for a client. The client sees progress, the timeline and documents in the Client Club; lawyers post updates and upload documents.")}>
      <Table head={["Reference", "Case", "Client", "Lawyer", "Status", "Updated"].map(t)} empty={cases.length ? undefined : "No cases yet."}>
        {cases.map((c) => (
          <tr key={c.id} className="hover:bg-night-3/40">
            <td className={td}><Link href={`/admin/cases/${c.id}`} className="font-mono text-gold">{c.reference}</Link></td>
            <td className={td}><Link href={`/admin/cases/${c.id}`} className="hover:text-gold-light">{c.title}</Link><p className="text-ui-sm text-ivory-muted">{c.practice_area ? topicLabel(c.practice_area, L) : ""}</p></td>
            <td className={td}>{c.client_name}<p className="text-ui-sm text-ivory-muted">{c.client_email}</p></td>
            <td className={td}>{c.lawyer_name ?? "—"}</td>
            <td className={td}><Badge>{t(c.status.replace("_", " "))}</Badge><p className="mt-1 text-ui-sm text-ivory-muted">{c.progress}%</p></td>
            <td className={td}>{formatDate(c.updated_at, L)}</td>
          </tr>
        ))}
      </Table>

      <Panel title={t("Open a new case")}>
        <ActionForm action={createCaseAdmin}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t("Case title")} htmlFor="title"><Input id="title" name="title" required /></Field>
            <Field label={t("Area of law")} htmlFor="practice_area">
              <Select id="practice_area" name="practice_area"><option value="">—</option>{TOPIC_KEYS.map((k) => <option key={k} value={k}>{topicLabel(k, L)}</option>)}</Select>
            </Field>
            <Field label={t("Existing client")} htmlFor="client_id">
              <Select id="client_id" name="client_id"><option value="">{t("— or create a new client below —")}</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.email}</option>)}</Select>
            </Field>
            <Field label={t("Responsible lawyer")} htmlFor="lawyer_id">
              <Select id="lawyer_id" name="lawyer_id" defaultValue={user.role === "lawyer" ? user.id : ""}><option value="">—</option>{lawyers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</Select>
            </Field>
          </div>
          <div className="grid gap-5 rounded-[3px] border border-dashed border-line p-5 md:grid-cols-3">
            <Field label={t("New client name")} htmlFor="client_name"><Input id="client_name" name="client_name" /></Field>
            <Field label={t("New client e-mail")} htmlFor="client_email" hint={t("They'll receive an invitation to set a password.")}><Input id="client_email" name="client_email" type="email" /></Field>
            <Field label={t("Client language")} htmlFor="client_locale"><Select id="client_locale" name="client_locale">{locales.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}</Select></Field>
          </div>
          <Field label={t("Description (visible to client)")} htmlFor="description"><Textarea id="description" name="description" rows={3} /></Field>
          <SubmitButton pending={t("Creating…")}>{t("Open case")}</SubmitButton>
        </ActionForm>
      </Panel>
    </AdminPage>
  );
}
