import { requireUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { listLaws } from "@/lib/data/laws";
import { isLocale, locales, localeMeta, type Locale } from "@/lib/i18n/config";
import { AdminPage, Panel, small } from "@/components/admin/ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ButtonLink } from "@/components/ui/Button";
import { generateLaw, saveLaw } from "@/app/(system)/admin/actions";

const CATEGORIES = ["contracts", "companies", "property", "civil", "procedure", "criminal", "digital", "tax", "investment", "immigration", "employment", "family"];

export default async function LawEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ l?: string }> }) {
  await requireUser(["admin", "lawyer"], "/admin/login");
  const { id } = await params;
  const sp = await searchParams;
  const law = (await listLaws(true)).find((x) => x.id === id);
  if (!law) notFound();
  const locale: Locale = isLocale(sp.l) ? sp.l : "en";
  const dir = localeMeta[locale].dir;
  return (
    <AdminPage title={law.title.en ?? law.slug} lead={law.reference} actions={<ButtonLink href={`/${locale}/laws/${law.slug}`} variant="outline" size="sm">View on site ↗</ButtonLink>}>
      <div className="flex flex-wrap gap-2">
        {locales.map((l) => <a key={l} href={`?l=${l}`} className={`${small} ${l === locale ? "border-gold text-gold-light" : ""}`}>{localeMeta[l].label} {law.review[l] === "reviewed" ? "✓" : law.body[l] ? "·" : "∅"}</a>)}
      </div>
      <Panel title="AI generation">
        <ActionForm action={generateLaw} className="flex flex-wrap items-end gap-5">
          <input type="hidden" name="slug" value={law.slug} />
          <Field label="Language" htmlFor="gen-locale">
            <Select id="gen-locale" name="locale" defaultValue={locale}>
              {locales.map((l) => <option key={l} value={l}>{localeMeta[l].label}</option>)}
              <option value="all">All languages</option>
            </Select>
          </Field>
          <Checkbox name="force" label="Overwrite even if reviewed" />
          <SubmitButton pending="Generating (≈20s per language)…" variant="outline">Generate with AI</SubmitButton>
        </ActionForm>
      </Panel>
      <Panel title={`Edit — ${localeMeta[locale].label}`}>
        <ActionForm action={saveLaw}>
          <input type="hidden" name="id" value={law.id} />
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-5 md:grid-cols-4">
            <Field label="Reference" htmlFor="reference"><Input id="reference" name="reference" defaultValue={law.reference} /></Field>
            <Field label="Category" htmlFor="category"><Select id="category" name="category" defaultValue={law.category}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Official source URL" htmlFor="source_url"><Input id="source_url" name="source_url" defaultValue={law.sourceUrl ?? ""} /></Field>
            <Field label="Sort" htmlFor="sort_order"><Input id="sort_order" name="sort_order" type="number" defaultValue={law.sortOrder} /></Field>
          </div>
          <Field label="Title" htmlFor="title"><Input id="title" name="title" dir={dir} defaultValue={law.title[locale] ?? ""} /></Field>
          <Field label="Summary (2–3 sentences)" htmlFor="summary"><Textarea id="summary" name="summary" dir={dir} rows={3} defaultValue={law.summary[locale] ?? ""} /></Field>
          <Field label="Explanation (Markdown)" htmlFor="body"><Textarea id="body" name="body" dir={dir} rows={22} className="font-mono text-ui-sm" defaultValue={law.body[locale] ?? ""} /></Field>
          <div className="flex flex-wrap gap-8">
            <Checkbox name="reviewed" defaultChecked={law.review[locale] === "reviewed"} label={`Reviewed by a lawyer (${localeMeta[locale].label})`} />
            <Checkbox name="published" defaultChecked={law.status === "published"} label="Published" />
          </div>
          <SubmitButton pending="Saving…">Save</SubmitButton>
        </ActionForm>
      </Panel>
    </AdminPage>
  );
}
