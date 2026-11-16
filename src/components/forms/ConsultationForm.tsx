"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import {
  consultationBody,
  consultationErrors,
  mailtoHref,
  type ConsultationRequestInput,
} from "@/lib/schemas/consultation-request";
import { fill } from "@/lib/navigation";
import { waHref } from "@/content/firm";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

interface Props {
  locale: Locale;
  t: Dictionary["consultation"];
  areas: { slug: string; title: string; titleEn: string }[];
  email: string;
  whatsapp?: string;
}

const selectClass =
  "border-0 border-b border-border bg-transparent px-0 py-2 font-body text-body text-ink focus-visible:border-b-2 focus-visible:border-accent focus-visible:outline-none";
const labelClass = "font-mono text-ui-sm uppercase tracking-mono text-ink-muted";

/**
 * Consultation request. Validates in the browser, then hands the message
 * to the visitor's own email app (or WhatsApp). Nothing is stored.
 */
export function ConsultationForm({ locale, t, areas, email, whatsapp }: Props) {
  const areaRef = useRef<HTMLSelectElement>(null);
  // "?area=real-estate" (from a practice-area page) preselects that area. Read after
  // hydration so the static HTML stays the same for every visitor.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("area");
    if (wanted && areaRef.current && areas.some((a) => a.slug === wanted)) areaRef.current.value = wanted;
  }, [areas]);
  const [errors, setErrors] = useState<Partial<Record<keyof ConsultationRequestInput, true>>>({});
  const [sent, setSent] = useState(false);

  function collect(form: HTMLFormElement) {
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const found = consultationErrors(data);
    setErrors(found ?? {});
    if (found) {
      const first = Object.keys(found)[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return null;
    }
    const d = data as unknown as ConsultationRequestInput;
    const area = areas.find((a) => a.slug === d.practiceAreaSlug);
    return { d, body: consultationBody(d, area?.titleEn), subject: `${t.subject}${area ? ` — ${area.titleEn}` : ""} (${d.fullName.trim()})` };
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const r = collect(e.currentTarget);
    if (!r) return;
    window.location.href = mailtoHref(email, r.subject, r.body);
    setSent(true);
  }

  function onWhatsapp(e: React.MouseEvent<HTMLButtonElement>) {
    const form = e.currentTarget.form;
    if (!form || !whatsapp) return;
    const r = collect(form);
    if (!r) return;
    window.open(waHref(whatsapp, `${r.subject}\n\n${r.body}`), "_blank", "noopener");
  }

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 border-t border-border pt-8">
        <h2 className="font-display text-h2 tracking-heading text-ink">{t.sentTitle}</h2>
        <p className="max-w-xl font-body text-body text-ink-muted">{fill(t.sentText, { email })}</p>
        <Button variant="secondary" type="button" onClick={() => setSent(false)}>
          {t.edit}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
      <div className="grid gap-8 md:grid-cols-2">
        <Input name="fullName" label={t.fullName} autoComplete="name" maxLength={200} error={errors.fullName && t.errors.fullName} />
        <Input name="email" type="email" label={t.email} autoComplete="email" dir="ltr" error={errors.email && t.errors.email} />
        <Input name="phone" type="tel" label={t.phone} autoComplete="tel" maxLength={30} dir="ltr" error={errors.phone && t.errors.phone} />
        <div className="flex flex-col gap-2">
          <label htmlFor="practiceAreaSlug" className={labelClass}>
            {t.area}
          </label>
          <select ref={areaRef} id="practiceAreaSlug" name="practiceAreaSlug" defaultValue="" className={selectClass}>
            <option value="">{t.areaNone}</option>
            {areas.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="preferredLanguage" className={labelClass}>
            {t.language}
          </label>
          <select id="preferredLanguage" name="preferredLanguage" defaultValue={locale} className={selectClass}>
            <option value="en">English</option>
            <option value="tr">Türkçe</option>
            <option value="fa">فارسی</option>
          </select>
        </div>
      </div>
      <Textarea name="message" label={t.message} rows={6} maxLength={4000} error={errors.message && t.errors.message} />
      <p className="-mt-4 font-body text-ui text-ink-muted">{t.messageHint}</p>
      {/* Honeypot: hidden from people, filled in by some bots. */}
      <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label>
          Website <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
        <Button type="submit">{t.submit}</Button>
        {whatsapp && (
          <Button type="button" variant="secondary" onClick={onWhatsapp}>
            {t.viaWhatsapp}
          </Button>
        )}
      </div>
      <p className="max-w-2xl font-body text-ui text-ink-muted">{fill(t.privacyNote, { email })}</p>
      <p className="font-mono text-ui-sm tracking-mono text-ink-muted">{t.noRelationship}</p>
    </form>
  );
}
