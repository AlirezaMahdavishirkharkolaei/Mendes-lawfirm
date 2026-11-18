"use client";

import { useActionState, useMemo, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { BookingState } from "@/app/[locale]/booking/actions";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Notice, Seal } from "@/components/ui/misc";

interface Day {
  day: string;
  slots: { start: string; free: boolean }[];
}

export function BookingForm({
  action,
  d,
  locale,
  intl,
  timeZone,
  days,
  topics,
  initialTopic,
  slotMinutes,
  defaults,
}: {
  action: (s: BookingState, f: FormData) => Promise<BookingState>;
  d: Dictionary;
  locale: string;
  intl: string;
  timeZone: string;
  days: Day[];
  topics: { key: string; label: string }[];
  initialTopic?: string;
  slotMinutes: number;
  defaults: { name?: string; email?: string; phone?: string };
}) {
  const [state, formAction] = useActionState(action, {});
  const firstDay = days.find((x) => x.slots.some((s) => s.free))?.day ?? days[0]?.day;
  const [day, setDay] = useState(firstDay);
  const [slot, setSlot] = useState<string | null>(null);
  const [warn, setWarn] = useState(false);

  const fmtDay = useMemo(() => new Intl.DateTimeFormat(intl, { weekday: "short", timeZone: "UTC" }), [intl]);
  const fmtNum = useMemo(() => new Intl.DateTimeFormat(intl, { day: "numeric", timeZone: "UTC" }), [intl]);
  const fmtMon = useMemo(() => new Intl.DateTimeFormat(intl, { month: "short", timeZone: "UTC" }), [intl]);
  const fmtTime = useMemo(() => new Intl.DateTimeFormat(intl, { hour: "2-digit", minute: "2-digit", timeZone }), [intl, timeZone]);
  const fmtFull = useMemo(() => new Intl.DateTimeFormat(intl, { dateStyle: "full", timeStyle: "short", timeZone }), [intl, timeZone]);

  if (state.ok) {
    return (
      <div className="fade-in relative overflow-hidden rounded-[6px] border border-gold/40 bg-gradient-to-br from-gold/[0.12] to-night-2 p-12 text-center">
        <Seal className="mx-auto h-44 w-44" />
        <h2 className="mt-8 font-display text-h2 font-light">{d.booking.successTitle}</h2>
        <p className="mx-auto mt-6 max-w-lg break-words text-ivory/80 [overflow-wrap:anywhere]">{d.booking.successBody.replace("{email}", state.email ?? "")}</p>
      </div>
    );
  }

  const current = days.find((x) => x.day === day);
  const asDate = (s: string) => new Date(`${s}T12:00:00Z`);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!slot) {
          e.preventDefault();
          setWarn(true);
        }
      }}
      className="space-y-14"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="slot" value={slot ?? ""} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      {state.error && <Notice tone="danger">{state.error === "slot" ? d.booking.errorSlot : d.common.error}</Notice>}

      {/* Step 1 */}
      <fieldset className="min-w-0">
        <legend className="flex items-center gap-4">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-gold font-mono text-ui-sm text-gold" dir="ltr">1</span>
          <span className="font-display text-h3 font-light">{d.booking.step1}</span>
        </legend>
        <p className="mt-3 ps-[3.25rem] text-ui-sm text-ivory-muted">{d.booking.timezone} · {d.booking.duration}: {slotMinutes} {d.common.minutes}</p>

        <div className="mt-8 -mx-1 flex gap-3 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]" role="listbox" aria-label={d.booking.step1}>
          {days.map((x) => {
            const free = x.slots.some((s) => s.free);
            const active = x.day === day;
            return (
              <button
                key={x.day}
                type="button"
                role="option"
                aria-selected={active}
                disabled={!free}
                onClick={() => { setDay(x.day); setSlot(null); }}
                className={`flex w-[4.75rem] shrink-0 flex-col items-center rounded-[4px] border px-2 py-4 transition-all duration-300 ${active ? "border-gold bg-gold/15 text-gold-light shadow-[0_10px_30px_-12px_rgba(201,169,106,0.6)]" : "border-line text-ivory/80 hover:border-gold/50"} disabled:cursor-not-allowed disabled:opacity-30`}
              >
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em]">{fmtDay.format(asDate(x.day))}</span>
                <span className="mt-1 font-display text-3xl font-light leading-none">{fmtNum.format(asDate(x.day))}</span>
                <span className="mt-1 text-[0.65rem] text-ivory-muted">{fmtMon.format(asDate(x.day))}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {current?.slots.length ? (
            current.slots.map((s) => (
              <button
                key={s.start}
                type="button"
                disabled={!s.free}
                onClick={() => { setSlot(s.start); setWarn(false); }}
                aria-pressed={slot === s.start}
                className={`rounded-[3px] border py-3 font-mono text-ui transition-all duration-300 ${slot === s.start ? "border-gold bg-gradient-to-br from-gold-light via-gold to-gold-deep text-night" : "border-line text-ivory hover:border-gold hover:text-gold-light"} disabled:cursor-not-allowed disabled:border-transparent disabled:text-ivory-muted/30 disabled:line-through`}
                dir="ltr"
              >
                {fmtTime.format(new Date(s.start))}
              </button>
            ))
          ) : (
            <p className="col-span-full text-ivory-muted">{d.booking.noSlots}</p>
          )}
        </div>
        {slot && <p className="fade-in mt-5 text-ui text-gold-light">{d.booking.selected}: {fmtFull.format(new Date(slot))}</p>}
        {warn && <p className="mt-5 text-ui text-danger">{d.booking.pickFirst}</p>}
      </fieldset>

      {/* Step 2 */}
      <fieldset className="min-w-0">
        <legend className="flex items-center gap-4">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-gold font-mono text-ui-sm text-gold" dir="ltr">2</span>
          <span className="font-display text-h3 font-light">{d.booking.step2}</span>
        </legend>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Field label={d.common.name} htmlFor="b-name"><Input id="b-name" name="name" required minLength={2} maxLength={120} autoComplete="name" defaultValue={defaults.name} /></Field>
          <Field label={d.common.email} htmlFor="b-email"><Input id="b-email" name="email" type="email" required autoComplete="email" defaultValue={defaults.email} dir="ltr" /></Field>
          <Field label={`${d.common.phone} (${d.common.optional})`} htmlFor="b-phone"><Input id="b-phone" name="phone" type="tel" autoComplete="tel" defaultValue={defaults.phone} dir="ltr" /></Field>
          <Field label={`${d.booking.company} (${d.common.optional})`} htmlFor="b-company"><Input id="b-company" name="company" autoComplete="organization" /></Field>
        </div>
      </fieldset>

      {/* Step 3 */}
      <fieldset className="min-w-0">
        <legend className="flex items-center gap-4">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-gold font-mono text-ui-sm text-gold" dir="ltr">3</span>
          <span className="font-display text-h3 font-light">{d.booking.step3}</span>
        </legend>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Field label={d.booking.topic} htmlFor="b-topic">
            <Select id="b-topic" name="topic" required defaultValue={initialTopic && topics.some((t) => t.key === initialTopic) ? initialTopic : topics[0]?.key}>
              {topics.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </Select>
          </Field>
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ivory-muted">{d.booking.mode}</span>
            <div className="grid grid-cols-2 gap-3">
              {(["online", "office"] as const).map((m) => (
                <label key={m} className="cursor-pointer">
                  <input type="radio" name="mode" value={m} defaultChecked={m === "online"} className="peer sr-only" />
                  <span className="block rounded-[3px] border border-line px-4 py-3 text-center text-ui transition-all peer-checked:border-gold peer-checked:bg-gold/10 peer-checked:text-gold-light peer-focus-visible:outline peer-focus-visible:outline-gold">{m === "online" ? d.booking.online : d.booking.office}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <Field label={d.booking.message} hint={d.booking.messageHint} htmlFor="b-msg"><Textarea id="b-msg" name="message" required minLength={10} maxLength={4000} rows={5} /></Field>
          </div>
        </div>
      </fieldset>

      <div className="flex flex-col gap-6 border-t border-line pt-10 md:flex-row md:items-center md:justify-between">
        <Checkbox name="consent" required label={d.booking.consent} />
        <SubmitButton pending={d.common.sending} size="lg">{d.booking.send}</SubmitButton>
      </div>
    </form>
  );
}
