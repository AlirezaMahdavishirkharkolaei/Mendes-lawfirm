import { adminLang, adminT } from "@/lib/admin-i18n";
import { requireUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { listTeam } from "@/lib/data/team";
import { locales, localeMeta } from "@/lib/i18n/config";
import { TOPIC_KEYS, topicLabel } from "@/lib/topics";
import { AdminPage, Panel } from "@/components/admin/ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { TranslateButton } from "@/components/admin/TranslateButton";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { deleteTeamMember, saveTeamMember, translateFields } from "@/app/(system)/admin/actions";

export default async function TeamMemberAdmin({ params }: { params: Promise<{ id: string }> }) {
  await requireUser(["admin"], "/admin/login");
  const t = await adminT();
  const L = await adminLang();
  const { id } = await params;
  const team = await listTeam(true);
  const m = id === "new" ? null : team.find((x) => x.id === id);
  if (id !== "new" && !m) notFound();
  return (
    <AdminPage title={m ? m.name : "New team member"}>
      <Panel>
        <ActionForm action={saveTeamMember}>
          <input type="hidden" name="id" value={m?.id ?? ""} />
          <div className="grid gap-5 md:grid-cols-3">
            <Field label={t("Full name")} htmlFor="name"><Input id="name" name="name" required defaultValue={m?.name} /></Field>
            <Field label={t("URL slug")} htmlFor="slug"><Input id="slug" name="slug" defaultValue={m?.slug} /></Field>
            <Field label={t("Sort order")} htmlFor="sort_order"><Input id="sort_order" name="sort_order" type="number" defaultValue={m?.sortOrder ?? 100} /></Field>
            <Field label={t("E-mail (shown to visitors)")} htmlFor="email" hint={t("If this matches a lawyer/admin account, it's linked.")}><Input id="email" name="email" type="email" defaultValue={m?.email ?? ""} /></Field>
            <Field label={t("Phone (shown to visitors)")} htmlFor="phone"><Input id="phone" name="phone" defaultValue={m?.phone ?? ""} /></Field>
            <Field label={t("Photo URL")} htmlFor="photo_url"><Input id="photo_url" name="photo_url" defaultValue={m?.photoUrl ?? ""} /></Field>
            <Field label={t("Languages (comma separated)")} htmlFor="languages"><Input id="languages" name="languages" defaultValue={m?.languages.join(", ")} /></Field>
            <Field label={t("Education (comma separated)")} htmlFor="education"><Input id="education" name="education" defaultValue={m?.education.join(", ")} /></Field>
          </div>

          <fieldset className="rounded-[3px] border border-line p-5">
            <legend className="px-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ivory-muted">{t("Specialties — used for AI referrals")}</legend>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TOPIC_KEYS.map((k) => <Checkbox key={k} name="specialties" value={k} defaultChecked={m?.specialties.includes(k)} label={topicLabel(k, L)} />)}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-8">
            <Checkbox name="is_referral_lead" defaultChecked={m?.isReferralLead} label={t("Referral lead — the chatbot always refers these specialties to this person")} />
            <Checkbox name="is_active" defaultChecked={m ? m.isActive : true} label={t("Visible on the site")} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between"><p className="label">{t("Position title")}</p><TranslateButton action={translateFields} prefix="position" /></div>
            <div className="grid gap-4 md:grid-cols-2">
              {locales.map((l) => <Field key={l} label={localeMeta[l].label} htmlFor={`position_${l}`}><Input id={`position_${l}`} name={`position_${l}`} dir={localeMeta[l].dir} defaultValue={m?.position[l] ?? ""} /></Field>)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between"><p className="label">{t("Biography")}</p><TranslateButton action={translateFields} prefix="bio" /></div>
            {locales.map((l) => <Field key={l} label={localeMeta[l].label} htmlFor={`bio_${l}`}><Textarea id={`bio_${l}`} name={`bio_${l}`} rows={4} dir={localeMeta[l].dir} defaultValue={m?.biography[l] ?? ""} /></Field>)}
          </div>
          <SubmitButton pending={t("Saving…")}>{t("Save member")}</SubmitButton>
        </ActionForm>
      </Panel>
      {m && (
        <form action={deleteTeamMember}>
          <input type="hidden" name="id" value={m.id} />
          <button className="text-ui-sm text-danger hover:underline">{t("Delete this member")}</button>
        </form>
      )}
    </AdminPage>
  );
}
