import { adminT } from "@/lib/admin-i18n";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { aiConfig, aiStatus } from "@/lib/ai/provider";
import { optional } from "@/lib/env";
import { AdminPage, Panel } from "@/components/admin/ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { Checkbox, Field, Input, Select } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Badge } from "@/components/ui/misc";
import { saveSettings, testAi, testEmail } from "@/app/(system)/admin/actions";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function Settings() {
  await requireUser(["admin"], "/admin/login");
  const t = await adminT();
  const [s, ai, status] = await Promise.all([getSettings(), aiConfig(), aiStatus()]);
  const days = (s.booking_days || "").split(",");
  const keys = { gemini: "GEMINI_API_KEY", anthropic: "ANTHROPIC_API_KEY", groq: "GROQ_API_KEY", openai: "OPENAI_API_KEY" };
  return (
    <AdminPage title={t("Settings")} lead={t("Who receives what, booking hours, AI and feature switches. Changes apply immediately.")}>
      <ActionForm action={saveSettings} className="space-y-10">
        <Panel title={t("Firm & recipients")}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t("Firm name")} htmlFor="firm_name"><Input id="firm_name" name="firm_name" defaultValue={s.firm_name} /></Field>
            <Field label={t("Managing partner e-mail")} htmlFor="boss_email" hint={t("Receives every meeting request with Approve / Reject buttons.")}><Input id="boss_email" name="boss_email" defaultValue={s.boss_email} /></Field>
            <Field label={t("Your e-mail (platform owner)")} htmlFor="owner_email" hint={t("Receives the monthly outreach report.")}><Input id="owner_email" name="owner_email" defaultValue={s.owner_email} /></Field>
            <Field label={t("Extra report recipients")} htmlFor="report_recipients" hint={t("Comma separated.")}><Input id="report_recipients" name="report_recipients" defaultValue={s.report_recipients} /></Field>
            <Field label={t("Outreach reply-to address")} htmlFor="outreach_reply_to" hint={t("Where prospects' replies go (route it to this Worker to log them automatically).")}><Input id="outreach_reply_to" name="outreach_reply_to" defaultValue={s.outreach_reply_to} /></Field>
            <Field label={t("Office phone")} htmlFor="office_phone"><Input id="office_phone" name="office_phone" defaultValue={s.office_phone} /></Field>
            <Field label={t("Office address")} htmlFor="office_address"><Input id="office_address" name="office_address" defaultValue={s.office_address} /></Field>
            <Field label={t("Public office e-mail")} htmlFor="office_email" hint={t("Shown on the site and used when a team member has no e-mail.")}><Input id="office_email" name="office_email" defaultValue={s.office_email} /></Field>
            <Field label={t("Google Maps link")} htmlFor="office_map_url"><Input id="office_map_url" name="office_map_url" defaultValue={s.office_map_url} /></Field>
            <Field label={t("Sender address")} htmlFor="mail_from" hint={t("Leave empty for onboarding@resend.dev (Resend test mode). Must be on a verified domain otherwise.")}><Input id="mail_from" name="mail_from" defaultValue={s.mail_from} /></Field>
            <Field label={t("Online meeting link")} htmlFor="meeting_link" hint={t("Your fixed Google Meet / Zoom / Teams link — included in confirmations and calendar invites for online meetings.")}><Input id="meeting_link" name="meeting_link" defaultValue={s.meeting_link} placeholder={t("https://meet.google.com/…")} /></Field>
            <Field label={t("Site-wide announcement (optional)")} htmlFor="announcement"><Input id="announcement" name="announcement" defaultValue={s.announcement} /></Field>
          </div>
        </Panel>
        <Panel title={t("Booking hours")}>
          <div className="flex flex-wrap gap-5">{DAYS.map((d, i) => <Checkbox key={d} name="booking_days" value={String(i + 1)} defaultChecked={days.includes(String(i + 1))} label={d} />)}</div>
          <div className="mt-6 grid gap-5 md:grid-cols-5">
            <Field label={t("From")} htmlFor="booking_start"><Input id="booking_start" name="booking_start" type="time" defaultValue={s.booking_start} /></Field>
            <Field label={t("Until")} htmlFor="booking_end"><Input id="booking_end" name="booking_end" type="time" defaultValue={s.booking_end} /></Field>
            <Field label={t("Slot (minutes)")} htmlFor="booking_slot_minutes"><Input id="booking_slot_minutes" name="booking_slot_minutes" type="number" min={15} max={180} defaultValue={s.booking_slot_minutes} /></Field>
            <Field label={t("Days ahead")} htmlFor="booking_horizon_days"><Input id="booking_horizon_days" name="booking_horizon_days" type="number" min={3} max={90} defaultValue={s.booking_horizon_days} /></Field>
            <Field label={t("Time zone")} htmlFor="booking_timezone"><Input id="booking_timezone" name="booking_timezone" defaultValue={s.booking_timezone} /></Field>
          </div>
        </Panel>
        <Panel title={t("AI")}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={t("Provider")} htmlFor="ai_provider">
              <Select id="ai_provider" name="ai_provider" defaultValue={s.ai_provider || ai.provider}>
                <option value="gemini">{t("Google Gemini (free tier)")}</option>
                <option value="anthropic">{t("Anthropic Claude")}</option>
                <option value="groq">{t("Groq (Llama)")}</option>
                <option value="openai">{t("OpenAI")}</option>
              </Select>
            </Field>
            <Field label={t("Model")} htmlFor="ai_model" hint={`Currently: ${ai.model}. Leave empty for the provider default; if it fails, newer Gemini models are tried automatically.`}><Input id="ai_model" name="ai_model" defaultValue={s.ai_model} /></Field>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {Object.entries(keys).map(([p, k]) => <Badge key={p} tone={optional(k) ? "success" : "muted"}>{k} {optional(k) ? "set" : "not set"}</Badge>)}
          </div>
          <p className="mt-4 text-ui-sm text-ivory-muted">{t("API keys are Worker secrets — set them with")} <code className="text-gold">{t("npx cf workers secrets put GEMINI_API_KEY")}</code> {t("(see docs/DEPLOYMENT.md). They are never stored in the database.")}</p>
        </Panel>
        <Panel title={t("Features")}>
          <div className="grid gap-4 md:grid-cols-2">
            <Checkbox name="chatbot_enabled" defaultChecked={s.chatbot_enabled !== "0"} label={t("AI assistant on the public site")} />
            <Checkbox name="laws_autogenerate" defaultChecked={s.laws_autogenerate !== "0"} label={t("Auto-generate missing law explanations")} />
            <Checkbox name="articles_open" defaultChecked={s.articles_open !== "0"} label={t("Accept new article submissions")} />
            <Checkbox name="outreach_autodraft" defaultChecked={s.outreach_autodraft !== "0"} label={t("Daily AI outreach drafting")} />
          </div>
          <div className="mt-6 max-w-xs"><Field label={t("Max outreach e-mails per day")} htmlFor="outreach_daily_limit"><Input id="outreach_daily_limit" name="outreach_daily_limit" type="number" min={1} max={100} defaultValue={s.outreach_daily_limit} /></Field></div>
        </Panel>
        <SubmitButton pending={t("Saving…")} size="lg">{t("Save settings")}</SubmitButton>
      </ActionForm>
      <Panel title={t("AI status")}>
        {status ? (
          <div className="mb-6 space-y-2 text-ui-sm">
            <Badge tone={status.ok ? "success" : "danger"}>{status.ok ? `${t("Working")} — ${status.provider} / ${status.model}` : t("Last call failed")}</Badge>
            <p className="text-ivory-muted">{new Date(status.at).toLocaleString("en-GB", { timeZone: "Asia/Nicosia" })}</p>
            {status.error && <p className="break-words font-mono text-[0.7rem] text-ivory-muted">{status.error}</p>}
          </div>
        ) : (
          <p className="mb-6 text-ui-sm text-ivory-muted">{t("No AI call recorded yet.")}</p>
        )}
        <ActionForm action={testAi}>
          <SubmitButton pending={t("Testing…")} variant="outline">{t("Test AI now")}</SubmitButton>
        </ActionForm>
      </Panel>
      <Panel title={t("E-mail delivery")}>
        <div className="mb-6 flex flex-wrap gap-3">
          <Badge tone={optional("RESEND_API_KEY") ? "success" : "warning"}>RESEND_API_KEY {optional("RESEND_API_KEY") ? "set — sending via Resend" : "not set — sending via Cloudflare Email Service"}</Badge>
        </div>
        <p className="mb-6 text-ui-sm text-ivory-muted">{t("With Resend and no verified domain, the sender must stay")} <code className="text-gold">{t("onboarding@resend.dev")}</code> and Resend only delivers to the e-mail address the Resend account was created with. Verify the firm&apos;s domain in Resend to e-mail clients.</p>
        <ActionForm action={testEmail} className="flex flex-wrap items-end gap-4">
          <Field label={t("Send to")} htmlFor="to"><Input id="to" name="to" type="email" placeholder={t("you@example.com")} /></Field>
          <SubmitButton pending={t("Sending…")} variant="outline">{t("Send test")}</SubmitButton>
        </ActionForm>
      </Panel>
    </AdminPage>
  );
}
