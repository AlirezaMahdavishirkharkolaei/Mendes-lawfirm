import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SystemPanel } from "@/components/system/Panel";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, Input } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { setupAdmin } from "../actions";

export const dynamic = "force-dynamic";

export default async function Setup() {
  const database = await db();
  if (await database.prepare("SELECT 1 FROM users WHERE role = 'admin' LIMIT 1").first()) redirect("/admin/login");
  return (
    <SystemPanel title="First-run setup" label="Mendes · Create admin">
      <p className="mb-8 text-ui text-ivory-muted">Enter the <code className="text-gold">ADMIN_SETUP_TOKEN</code> secret configured for this deployment. This page disappears once an admin exists.</p>
      <ActionForm action={setupAdmin}>
        <Field label="Setup token" htmlFor="token"><Input id="token" name="token" type="password" required /></Field>
        <Field label="Full name" htmlFor="name"><Input id="name" name="name" required /></Field>
        <Field label="E-mail" htmlFor="email"><Input id="email" name="email" type="email" required /></Field>
        <Field label="Password (min. 12 characters)" htmlFor="password"><Input id="password" name="password" type="password" required minLength={12} /></Field>
        <SubmitButton pending="Creating…">Create admin</SubmitButton>
      </ActionForm>
    </SystemPanel>
  );
}
