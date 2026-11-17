"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { FormState } from "@/app/[locale]/portal/actions";
import { Field, Input } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Notice } from "@/components/ui/misc";

type Action = (s: FormState, f: FormData) => Promise<FormState>;

function errorText(d: Dictionary, e?: string) {
  if (!e) return null;
  const map: Record<string, string> = { invalid: d.portal.invalidLogin, taken: d.portal.emailTaken, token: d.portal.invalidToken, short: d.portal.newPassword };
  return <Notice tone="danger">{map[e] ?? d.common.error}</Notice>;
}

export function LoginForm({ action, d, locale, next }: { action: Action; d: Dictionary; locale: string; next?: string }) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="next" value={next ?? ""} />
      {errorText(d, state.error)}
      <Field label={d.common.email} htmlFor="email"><Input id="email" name="email" type="email" required autoComplete="email" dir="ltr" /></Field>
      <Field label={d.common.password} htmlFor="password"><Input id="password" name="password" type="password" required autoComplete="current-password" /></Field>
      <div className="flex items-center justify-between gap-4">
        <SubmitButton pending={d.common.loading}>{d.common.login}</SubmitButton>
        <Link href={`/${locale}/portal/forgot`} className="link-grow text-ui-sm text-ivory-muted hover:text-gold-light">{d.portal.forgot}</Link>
      </div>
    </form>
  );
}

export function RegisterForm({ action, d, locale, next, type }: { action: Action; d: Dictionary; locale: string; next?: string; type?: string }) {
  const [state, formAction] = useActionState(action, {});
  const [kind, setKind] = useState(type === "author" ? "author" : "client");
  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="next" value={next ?? ""} />
      {errorText(d, state.error)}
      <fieldset>
        <legend className="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ivory-muted">{d.portal.accountType}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["client", "author"] as const).map((k) => (
            <label key={k} className="cursor-pointer">
              <input type="radio" name="type" value={k} checked={kind === k} onChange={() => setKind(k)} className="peer sr-only" />
              <span className="block rounded-[3px] border border-line px-4 py-3 text-ui transition-all peer-checked:border-gold peer-checked:bg-gold/10 peer-checked:text-gold-light">{k === "client" ? d.portal.asClient : d.portal.asAuthor}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field label={d.common.name} htmlFor="name"><Input id="name" name="name" required minLength={2} autoComplete="name" /></Field>
      <Field label={d.common.email} htmlFor="email"><Input id="email" name="email" type="email" required autoComplete="email" dir="ltr" /></Field>
      {kind === "author" ? (
        <Field label={d.portal.university} htmlFor="university"><Input id="university" name="university" maxLength={160} /></Field>
      ) : (
        <Field label={`${d.common.phone} (${d.common.optional})`} htmlFor="phone"><Input id="phone" name="phone" type="tel" dir="ltr" /></Field>
      )}
      <Field label={d.portal.newPassword} htmlFor="password"><Input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" /></Field>
      <SubmitButton pending={d.common.loading}>{d.common.register}</SubmitButton>
    </form>
  );
}

export function ForgotForm({ action, d, locale }: { action: Action; d: Dictionary; locale: string }) {
  const [state, formAction] = useActionState(action, {});
  if (state.ok) return <Notice tone="success">{d.portal.resetSent}</Notice>;
  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      <Field label={d.common.email} htmlFor="email"><Input id="email" name="email" type="email" required dir="ltr" /></Field>
      <SubmitButton pending={d.common.sending}>{d.common.submit}</SubmitButton>
    </form>
  );
}

export function ResetForm({ action, d, locale, token }: { action: Action; d: Dictionary; locale: string; token: string }) {
  const [state, formAction] = useActionState(action, {});
  if (state.ok)
    return (
      <div className="space-y-6">
        <Notice tone="success">{d.portal.passwordSet}</Notice>
        <Link href={`/${locale}/portal/login`} className="label link-grow inline-block">{d.common.login} →</Link>
      </div>
    );
  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="t" value={token} />
      {errorText(d, state.error)}
      <Field label={d.portal.newPassword} htmlFor="password"><Input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" /></Field>
      <SubmitButton pending={d.common.sending}>{d.common.save}</SubmitButton>
    </form>
  );
}
