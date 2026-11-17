import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { listTeam } from "@/lib/data/team";
import { topicLabel } from "@/lib/topics";
import { AdminPage, Table, td } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/misc";

export default async function TeamAdmin() {
  await requireUser(["admin"], "/admin/login");
  const team = await listTeam(true);
  return (
    <AdminPage title="Team" lead="Profiles shown on the Team page and used by the AI assistant to refer visitors. A ‘referral lead’ receives every chatbot referral for their specialties." actions={<ButtonLink href="/admin/team/new" size="sm">Add member</ButtonLink>}>
      <Table head={["Name", "Specialties", "Contact", "Flags"]}>
        {team.map((m) => (
          <tr key={m.id}>
            <td className={td}><Link href={`/admin/team/${m.id}`} className="text-ivory hover:text-gold-light">{m.name}</Link><p className="text-ui-sm text-ivory-muted">{m.position.en}</p></td>
            <td className={td}><p className="max-w-md text-ui-sm text-ivory/75">{m.specialties.map((s) => topicLabel(s, "en")).join(", ")}</p></td>
            <td className={td}><p className="text-ui-sm">{m.email ?? <span className="text-warning">no e-mail</span>}</p><p className="text-ui-sm">{m.phone ?? <span className="text-warning">no phone</span>}</p></td>
            <td className={`${td} space-x-2`}>{m.isReferralLead && <Badge>lead</Badge>}{!m.isActive && <Badge tone="muted">hidden</Badge>}</td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
