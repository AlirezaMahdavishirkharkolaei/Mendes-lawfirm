import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { listLaws } from "@/lib/data/laws";
import { aiConfig } from "@/lib/ai/provider";
import { locales } from "@/lib/i18n/config";
import { AdminPage, Panel, Table, td } from "@/components/admin/ui";
import { ActionButton, ActionForm } from "@/components/admin/ActionForm";
import { Field, Input, Select } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Badge, Notice } from "@/components/ui/misc";
import { createLaw, generateAllLaws } from "@/app/(system)/admin/actions";

const CATEGORIES = ["contracts", "companies", "property", "civil", "procedure", "criminal", "digital", "tax", "investment", "immigration", "employment", "family"];

export default async function LawsAdmin() {
  await requireUser(["admin", "lawyer"], "/admin/login");
  const [laws, ai] = await Promise.all([listLaws(true), aiConfig()]);
  return (
    <AdminPage title="Cyprus law explainer" lead="Each law gets a plain-language explanation in every site language. The AI drafts them; a lawyer reviews and marks each language ‘reviewed’ — until then the site shows an ‘AI-generated, not yet reviewed’ notice." actions={<ActionButton action={generateAllLaws} variant="gold">Generate missing (10)</ActionButton>}>
      {!ai.configured && <Notice tone="danger">No API key for the AI provider ({ai.provider}). Add one to generate explanations — see docs/DEPLOYMENT.md.</Notice>}
      <Table head={["Law", "Reference", "Languages", "Status"]}>
        {laws.map((l) => (
          <tr key={l.id}>
            <td className={td}><Link href={`/admin/laws/${l.id}`} className="text-ivory hover:text-gold-light">{l.title.en}</Link><p className="text-ui-sm text-ivory-muted">{l.category}</p></td>
            <td className={td}><span className="font-mono text-ui-sm">{l.reference}</span></td>
            <td className={`${td} space-x-1`}>
              {locales.map((loc) => <Badge key={loc} tone={l.review[loc] === "reviewed" ? "success" : l.body[loc] ? "warning" : "muted"}>{loc}</Badge>)}
            </td>
            <td className={td}><Badge tone={l.status === "published" ? "success" : "muted"}>{l.status}</Badge></td>
          </tr>
        ))}
      </Table>
      <p className="text-ui-sm text-ivory-muted"><Badge tone="success">xx</Badge> reviewed · <Badge tone="warning">xx</Badge> AI draft · <Badge tone="muted">xx</Badge> missing</p>
      <Panel title="Add a law">
        <ActionForm action={createLaw} className="grid gap-5 md:grid-cols-4 md:items-end">
          <Field label="English title" htmlFor="title"><Input id="title" name="title" required /></Field>
          <Field label="Reference" htmlFor="reference"><Input id="reference" name="reference" placeholder="Cap. 000 / 00/2020" /></Field>
          <Field label="Category" htmlFor="category"><Select id="category" name="category">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <SubmitButton pending="Adding…">Add</SubmitButton>
        </ActionForm>
      </Panel>
    </AdminPage>
  );
}
