import { db } from "@/lib/db";
import { optional } from "@/lib/env";
import { Notice } from "@/components/ui/misc";
import { SystemPanel } from "@/components/system/Panel";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, Input } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { setupAdmin } from "../actions";

export const dynamic = "force-dynamic";

export default async function Setup() {
  const database = await db();
  const hasAdmin = !!(await database.prepare("SELECT 1 FROM users WHERE role = 'admin' LIMIT 1").first());
  return (
    <SystemPanel title={hasAdmin ? "Reset admin access" : "First-run setup"} label="Mendes · Create admin">
      <p className="mb-8 text-ui text-ivory-muted">Enter the <code className="text-gold">ADMIN_SETUP_TOKEN</code> secret configured for this deployment. {hasAdmin ? " An admin already exists: enter that admin's e-mail and a new password to reset it." : " This creates the first admin account."}</p>
      {!optional("ADMIN_SETUP_TOKEN") && (
        <Notice tone="danger" className="mb-8">
          ADMIN_SETUP_TOKEN is not set yet. In the Cloudflare dashboard open Workers &amp; Pages → mendes → Settings → Variables and Secrets, add a secret named ADMIN_SETUP_TOKEN, then reload this page.
        </Notice>
      )}
      <ActionForm action={setupAdmin}>
        <Field label="Setup token" htmlFor="token"><Input id="token" name="token" type="text" required autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false} /></Field>
        <Field label="Full name" htmlFor="name"><Input id="name" name="name" required /></Field>
        <Field label="E-mail" htmlFor="email"><Input id="email" name="email" type="email" required /></Field>
        <Field label="Password (min. 12 characters)" htmlFor="password"><Input id="password" name="password" type="password" required minLength={12} /></Field>
        <SubmitButton pending="Creating…">Create admin</SubmitButton>
      </ActionForm>
    </SystemPanel>
  );
}
