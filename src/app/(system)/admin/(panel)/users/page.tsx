import { all, db } from "@/lib/db";
import { currentUser, requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/i18n/format";
import { locales } from "@/lib/i18n/config";
import { AdminPage, Panel, Table, td, small } from "@/components/admin/ui";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, Input, Select } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createUserAdmin, resendInvite, updateUserAdmin } from "@/app/(system)/admin/actions";

export default async function Users({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  await requireUser(["admin", "lawyer"], "/admin/login");
  const me = (await currentUser())!;
  const { role } = await searchParams;
  const database = await db();
  const users = await all<{ id: string; name: string; email: string; role: string; locale: string; is_active: number; created_at: string; last_login_at: string | null; university: string | null }>(
    role ? database.prepare("SELECT * FROM users WHERE role = ? ORDER BY created_at DESC").bind(role) : database.prepare("SELECT * FROM users ORDER BY created_at DESC LIMIT 500"),
  );
  const admin = me.role === "admin";
  return (
    <AdminPage title="Users" lead="Clients, lawyers, admins and student authors. New accounts receive an e-mail to set their own password — you never handle anyone's password.">
      <div className="flex flex-wrap gap-2">
        {["", "client", "lawyer", "admin", "author"].map((r) => <a key={r} href={r ? `/admin/users?role=${r}` : "/admin/users"} className={`${small} ${role === r || (!role && !r) ? "border-gold text-gold-light" : ""}`}>{r || "all"}</a>)}
      </div>
      <Table head={["Name", "Role", "Joined", "Last sign-in", ""]}>
        {users.map((u) => (
          <tr key={u.id}>
            <td className={td}>{u.name}<p className="text-ui-sm text-ivory-muted">{u.email}{u.university ? ` · ${u.university}` : ""}</p></td>
            <td className={td}>
              {admin ? (
                <form action={updateUserAdmin} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={u.id} />
                  <select name="role" defaultValue={u.role} className="rounded-[2px] border border-line bg-night-3 px-2 py-1.5 text-ui-sm">
                    {["client", "lawyer", "admin", "author"].map((r) => <option key={r}>{r}</option>)}
                  </select>
                  <label className="flex items-center gap-1 text-ui-sm"><input type="checkbox" name="is_active" defaultChecked={!!u.is_active} className="accent-[#c9a96a]" />active</label>
                  <button className={small}>Save</button>
                </form>
              ) : (
                u.role
              )}
            </td>
            <td className={td}>{formatDate(u.created_at, "en")}</td>
            <td className={td}>{u.last_login_at ? formatDate(u.last_login_at, "en", true) : <span className="text-ivory-muted">never</span>}</td>
            <td className={td}>{!u.last_login_at && <form action={resendInvite}><input type="hidden" name="id" value={u.id} /><button className={small}>Resend invite</button></form>}</td>
          </tr>
        ))}
      </Table>
      <Panel title="Invite a user">
        <ActionForm action={createUserAdmin} className="grid gap-5 md:grid-cols-5 md:items-end">
          <Field label="Name" htmlFor="name"><Input id="name" name="name" required /></Field>
          <Field label="E-mail" htmlFor="email"><Input id="email" name="email" type="email" required /></Field>
          <Field label="Role" htmlFor="role"><Select id="role" name="role" defaultValue="client">{(admin ? ["client", "lawyer", "admin", "author"] : ["client"]).map((r) => <option key={r}>{r}</option>)}</Select></Field>
          <Field label="Language" htmlFor="locale"><Select id="locale" name="locale">{locales.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}</Select></Field>
          <SubmitButton pending="Inviting…">Invite</SubmitButton>
        </ActionForm>
      </Panel>
    </AdminPage>
  );
}
