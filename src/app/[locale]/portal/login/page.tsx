import Link from "next/link";
import { redirect } from "next/navigation";
import { pageContext } from "@/lib/site";
import { currentUser } from "@/lib/auth";
import { AuthShell } from "@/components/portal/AuthShell";
import { LoginForm } from "@/components/portal/AuthForms";
import { Notice } from "@/components/ui/misc";
import { login } from "../actions";

export const metadata = { robots: { index: false } };

export default async function Login({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ next?: string; denied?: string }> }) {
  const { locale, d, l } = await pageContext(params);
  const sp = await searchParams;
  if ((await currentUser()) && !sp.denied) redirect(sp.next?.startsWith("/") ? sp.next : l("/portal"));
  return (
    <AuthShell title={d.portal.loginTitle} lead={d.portal.lead} footer={<>{d.portal.noAccount} <Link href={l(`/portal/register${sp.next ? `?next=${encodeURIComponent(sp.next)}` : ""}`)} className="link-grow text-gold">{d.common.register}</Link></>}>
      {sp.denied && <Notice tone="danger" className="mb-6">{d.portal.denied}</Notice>}
      <LoginForm action={login} d={d} locale={locale} next={sp.next} />
    </AuthShell>
  );
}
