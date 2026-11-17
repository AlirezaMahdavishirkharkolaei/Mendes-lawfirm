"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { Field, Input, Select, Textarea, Checkbox } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Notice } from "@/components/ui/misc";
import type { SubmitState } from "@/app/[locale]/insights/submit/actions";

export function SubmitForm({ action, d, locale, categories, languages }: { action: (s: SubmitState, f: FormData) => Promise<SubmitState>; d: Dictionary; locale: string; categories: { key: string; label: string }[]; languages: { key: string; label: string }[] }) {
  const [state, formAction] = useActionState(action, {});
  if (state.ok) return <Notice tone="success">{d.submit.success}</Notice>;
  return (
    <form action={formAction} className="space-y-8">
      {state.error && <Notice tone="danger">{d.common.error} {state.error !== "auth" && <span className="font-mono text-ui-sm opacity-70">({state.error})</span>}</Notice>}
      <Field label={d.submit.fieldTitle} htmlFor="title"><Input id="title" name="title" required minLength={8} maxLength={220} /></Field>
      <Field label={d.submit.fieldAbstract} hint={d.submit.fieldAbstractHint} htmlFor="abstract"><Textarea id="abstract" name="abstract" required minLength={200} maxLength={2500} rows={5} /></Field>
      <Field label={d.submit.fieldBody} hint={d.submit.fieldBodyHint} htmlFor="body"><Textarea id="body" name="body" required minLength={3000} rows={22} className="font-mono text-ui" /></Field>
      <div className="grid gap-8 md:grid-cols-3">
        <Field label={d.submit.fieldCategory} htmlFor="category">
          <Select id="category" name="category" defaultValue="">
            <option value="">—</option>
            {categories.map((c) => <option key={c.key} value={c.label}>{c.label}</option>)}
          </Select>
        </Field>
        <Field label={d.submit.fieldLanguage} htmlFor="language">
          <Select id="language" name="language" defaultValue={locale}>
            {languages.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
          </Select>
        </Field>
        <Field label={d.submit.fieldKeywords} hint={d.submit.fieldKeywordsHint} htmlFor="keywords"><Input id="keywords" name="keywords" maxLength={300} /></Field>
      </div>
      <Field label={`${d.submit.fieldAttachment} (${d.common.optional})`} htmlFor="attachment"><Input id="attachment" name="attachment" type="file" accept="application/pdf" className="file:me-4 file:rounded-[2px] file:border-0 file:bg-gold/20 file:px-4 file:py-2 file:text-gold-light" /></Field>
      <Checkbox name="originality" required label={d.submit.originality} />
      <SubmitButton pending={d.common.sending} size="lg">{d.common.submit}</SubmitButton>
    </form>
  );
}
