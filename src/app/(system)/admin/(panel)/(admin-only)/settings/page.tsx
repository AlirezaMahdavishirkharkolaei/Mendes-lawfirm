import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { aiConfig } from "@/lib/ai/provider";
import { optional } from "@/lib/env";
import { AdminPage, Panel } from "@/components/admin/ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { Checkbox, Field, Input, Select } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Badge } from "@/components/ui/misc";
import { saveSettings, testEmail } from "@/app/(system)/admin/actions";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function Settings() {
  await requireUser(["admin"], "/admin/login");
  const [s, ai] = await Promise.all([getSettings(), aiConfig()]);
  const days = (s.booking_days || "").split(",");
  const keys = { gemini: "GEMINI_API_KEY", anthropic: "ANTHROPIC_API_KEY", groq: "GROQ_API_KEY", openai: "OPENAI_API_KEY" };
  return (
    <AdminPage title="Settings" lead="Who receives what, booking hours, AI and feature switches. Changes apply immediately.">
      <ActionForm action={saveSettings} className="space-y-10">
        <Panel title="Firm & recipients">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Firm name" htmlFor="firm_name"><Input id="firm_name" name="firm_name" defaultValue={s.firm_name} /></Field>
            <Field label="Managing partner e-mail" htmlFor="boss_email" hint="Receives every meeting request with Approve / Reject buttons."><Input id="boss_email" name="boss_email" defaultValue={s.boss_email} /></Field>
            <Field label="Your e-mail (platform owner)" htmlFor="owner_email" hint="Receives the monthly outreach report."><Input id="owner_email" name="owner_email" defaultValue={s.owner_email} /></Field>
            <Field label="Extra report recipients" htmlFor="report_recipients" hint="Comma separated."><Input id="report_recipients" name="report_recipients" defaultValue={s.report_recipients} /></Field>
            <Field label="Outreach reply-to address" htmlFor="outreach_reply_to" hint="Where prospects' replies go (route it to this Worker to log them automatically)."><Input id="outreach_reply_to" name="outreach_reply_to" defaultValue={s.outreach_reply_to} /></Field>
            <Field label="Office phone" htmlFor="office_phone"><Input id="office_phone" name="office_phone" defaultValue={s.office_phone} /></Field>
            <Field label="Office address" htmlFor="office_address"><Input id="office_address" name="office_address" defaultValue={s.office_address} /></Field>
            <Field label="Site-wide announcement (optional)" htmlFor="announcement"><Input id="announcement" name="announcement" defaultValue={s.announcement} /></Field>
          </div>
        </Panel>
        <Panel title="Booking hours">
          <div className="flex flex-wrap gap-5">{DAYS.map((d, i) => <Checkbox key={d} name="booking_days" value={String(i + 1)} defaultChecked={days.includes(String(i + 1))} label={d} />)}</div>
          <div className="mt-6 grid gap-5 md:grid-cols-5">
            <Field label="From" htmlFor="booking_start"><Input id="booking_start" name="booking_start" type="time" defaultValue={s.booking_start} /></Field>
            <Field label="Until" htmlFor="booking_end"><Input id="booking_end" name="booking_end" type="time" defaultValue={s.booking_end} /></Field>
            <Field label="Slot (minutes)" htmlFor="booking_slot_minutes"><Input id="booking_slot_minutes" name="booking_slot_minutes" type="number" min={15} max={180} defaultValue={s.booking_slot_minutes} /></Field>
            <Field label="Days ahead" htmlFor="booking_horizon_days"><Input id="booking_horizon_days" name="booking_horizon_days" type="number" min={3} max={90} defaultValue={s.booking_horizon_days} /></Field>
            <Field label="Time zone" htmlFor="booking_timezone"><Input id="booking_timezone" name="booking_timezone" defaultValue={s.booking_timezone} /></Field>
          </div>
        </Panel>
        <Panel title="AI">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Provider" htmlFor="ai_provider">
              <Select id="ai_provider" name="ai_provider" defaultValue={s.ai_provider || ai.provider}>
                <option value="gemini">Google Gemini (free tier)</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="groq">Groq (Llama)</option>
                <option value="openai">OpenAI</option>
              </Select>
            </Field>
            <Field label="Model" htmlFor="ai_model" hint={`Currently: ${ai.model}. Leave empty for the provider default.`}><Input id="ai_model" name="ai_model" defaultValue={s.ai_model} /></Field>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {Object.entries(keys).map(([p, k]) => <Badge key={p} tone={optional(k) ? "success" : "muted"}>{k} {optional(k) ? "set" : "not set"}</Badge>)}
          </div>
          <p className="mt-4 text-ui-sm text-ivory-muted">API keys are Worker secrets — set them with <code className="text-gold">npx cf workers secrets put GEMINI_API_KEY</code> (see docs/DEPLOYMENT.md). They are never stored in the database.</p>
        </Panel>
        <Panel title="Features">
          <div className="grid gap-4 md:grid-cols-2">
            <Checkbox name="chatbot_enabled" defaultChecked={s.chatbot_enabled !== "0"} label="AI assistant on the public site" />
            <Checkbox name="laws_autogenerate" defaultChecked={s.laws_autogenerate !== "0"} label="Auto-generate missing law explanations" />
            <Checkbox name="articles_open" defaultChecked={s.articles_open !== "0"} label="Accept new article submissions" />
            <Checkbox name="outreach_autodraft" defaultChecked={s.outreach_autodraft !== "0"} label="Daily AI outreach drafting" />
          </div>
          <div className="mt-6 max-w-xs"><Field label="Max outreach e-mails per day" htmlFor="outreach_daily_limit"><Input id="outreach_daily_limit" name="outreach_daily_limit" type="number" min={1} max={100} defaultValue={s.outreach_daily_limit} /></Field></div>
        </Panel>
        <SubmitButton pending="Saving…" size="lg">Save settings</SubmitButton>
      </ActionForm>
      <Panel title="Test e-mail">
        <ActionForm action={testEmail} className="flex flex-wrap items-end gap-4">
          <Field label="Send to" htmlFor="to"><Input id="to" name="to" type="email" placeholder="you@example.com" /></Field>
          <SubmitButton pending="Sending…" variant="outline">Send test</SubmitButton>
        </ActionForm>
      </Panel>
    </AdminPage>
  );
}
