import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser, isStaff } from "@/lib/auth";
import { db } from "@/lib/db";
import { SystemPanel } from "@/components/system/Panel";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, Input } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { adminLogin } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (isStaff(await currentUser())) redirect("/admin");
  const database = await db();
  const hasAdmin = await database.prepare("SELECT 1 FROM users WHERE role = 'admin' LIMIT 1").first();
  return (
    <SystemPanel title="Admin sign-in" label="Mendes · Control room">
      <ActionForm action={adminLogin}>
        <Field label="E-mail" htmlFor="email"><Input id="email" name="email" type="email" required autoComplete="email" /></Field>
        <Field label="Password" htmlFor="password"><Input id="password" name="password" type="password" required autoComplete="current-password" /></Field>
        <SubmitButton pending="Signing in…">Sign in</SubmitButton>
      </ActionForm>
      {!hasAdmin && <p className="mt-8 text-ui text-ivory-muted">First time here? <Link href="/admin/setup" className="text-gold">Create the first admin account →</Link></p>}
    </SystemPanel>
  );
}
