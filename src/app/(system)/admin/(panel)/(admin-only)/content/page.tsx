import { requireUser } from "@/lib/auth";
import { db, all } from "@/lib/db";
import { EDITABLE_KEYS, getPath, staticDictionary } from "@/lib/i18n";
import { isLocale, locales, localeMeta, type Locale } from "@/lib/i18n/config";
import { AdminPage, Panel, small } from "@/components/admin/ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, Textarea } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { saveContent } from "@/app/(system)/admin/actions";

export default async function Content({ searchParams }: { searchParams: Promise<{ l?: string }> }) {
  await requireUser(["admin"], "/admin/login");
  const sp = await searchParams;
  const locale: Locale = isLocale(sp.l) ? sp.l : "en";
  const database = await db();
  const overrides = Object.fromEntries((await all<{ key: string; value: string }>(database.prepare("SELECT key, value FROM content_overrides WHERE locale = ?").bind(locale))).map((r) => [r.key, r.value]));
  const base = staticDictionary(locale);
  return (
    <AdminPage title="Site content" lead="Edit the main marketing copy per language. Leave a field empty to use the built-in text (shown as placeholder).">
      <div className="flex flex-wrap gap-2">{locales.map((l) => <a key={l} href={`?l=${l}`} className={`${small} ${l === locale ? "border-gold text-gold-light" : ""}`}>{localeMeta[l].label}</a>)}</div>
      <Panel>
        <ActionForm action={saveContent}>
          <input type="hidden" name="locale" value={locale} />
          {EDITABLE_KEYS.map((key) => (
            <Field key={key} label={key} htmlFor={key}>
              <Textarea id={key} name={key} rows={key.includes("p1") || key.includes("p2") || key.includes("disclaimer") ? 4 : 2} dir={localeMeta[locale].dir} defaultValue={overrides[key] ?? ""} placeholder={getPath(base, key)} />
            </Field>
          ))}
          <SubmitButton pending="Saving…">Save {localeMeta[locale].label}</SubmitButton>
        </ActionForm>
      </Panel>
    </AdminPage>
  );
}
