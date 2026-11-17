"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { FormState } from "@/app/[locale]/portal/actions";
import { Field, Input, Select, Textarea, Checkbox } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Notice } from "@/components/ui/misc";

type Action = (s: FormState, f: FormData) => Promise<FormState>;

export function UploadForm({ action, d, locale, caseId }: { action: Action; d: Dictionary; locale: string; caseId: string }) {
  const [state, formAction] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  const err = state.error === "size" ? d.portal.fileTooLarge : state.error === "type" ? d.portal.fileType : state.error ? d.common.error : null;
  return (
    <form ref={ref} action={formAction} className="space-y-5">
      <input type="hidden" name="caseId" value={caseId} />
      <input type="hidden" name="locale" value={locale} />
      {state.ok && <Notice tone="success">{d.portal.uploaded}</Notice>}
      {err && <Notice tone="danger">{err}</Notice>}
      <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[4px] border border-dashed border-line-strong bg-night-3/40 px-6 py-10 text-center transition-colors hover:border-gold hover:bg-gold/5">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gold transition-transform duration-500 group-hover:-translate-y-1" aria-hidden><path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4" /></svg>
        <span className="text-ui text-ivory">{d.portal.uploadTitle}</span>
        <span className="text-ui-sm text-ivory-muted">{d.portal.uploadHint}</span>
        <input type="file" name="file" required className="mt-2 max-w-full text-ui-sm text-ivory-muted file:me-3 file:rounded-[2px] file:border-0 file:bg-gold/20 file:px-3 file:py-1.5 file:text-gold-light" />
      </label>
      <Field label={d.portal.note} htmlFor="note"><Input id="note" name="note" maxLength={500} /></Field>
      <SubmitButton pending={d.common.sending}>{d.common.upload}</SubmitButton>
    </form>
  );
}

export function StaffUpdateForm({ action, d, locale, caseId, statuses, current }: { action: Action; d: Dictionary; locale: string; caseId: string; statuses: { key: string; label: string }[]; current: { status: string; progress: number } }) {
  const [state, formAction] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={formAction} className="space-y-5">
      <input type="hidden" name="caseId" value={caseId} />
      <input type="hidden" name="locale" value={locale} />
      {state.ok && <Notice tone="success">✓</Notice>}
      {state.error && <Notice tone="danger">{d.common.error}</Notice>}
      <Field label="Update title" htmlFor="u-title"><Input id="u-title" name="title" required maxLength={200} /></Field>
      <Field label="Details" htmlFor="u-body"><Textarea id="u-body" name="body" rows={3} /></Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={d.portal.status} htmlFor="u-status">
          <Select id="u-status" name="status" defaultValue={current.status}>
            {statuses.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </Select>
        </Field>
        <Field label={`${d.portal.progress} %`} htmlFor="u-progress"><Input id="u-progress" name="progress" type="number" min={0} max={100} defaultValue={current.progress} /></Field>
        <Field label={d.portal.nextDate} htmlFor="u-date"><Input id="u-date" name="next_date" type="date" /></Field>
      </div>
      <Field label={d.portal.nextStep} htmlFor="u-next"><Input id="u-next" name="next_step" maxLength={300} /></Field>
      <Checkbox name="internal" label="Internal note (hidden from client)" />
      <SubmitButton pending={d.common.sending} variant="outline">{d.common.save}</SubmitButton>
    </form>
  );
}
