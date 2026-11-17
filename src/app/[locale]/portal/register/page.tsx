import Link from "next/link";
import { pageContext } from "@/lib/site";
import { AuthShell } from "@/components/portal/AuthShell";
import { RegisterForm } from "@/components/portal/AuthForms";
import { register } from "../actions";

export const metadata = { robots: { index: false } };

export default async function Register({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ next?: string; type?: string }> }) {
  const { locale, d, l } = await pageContext(params);
  const sp = await searchParams;
  return (
    <AuthShell title={d.portal.registerTitle} footer={<>{d.portal.haveAccount} <Link href={l(`/portal/login${sp.next ? `?next=${encodeURIComponent(sp.next)}` : ""}`)} className="link-grow text-gold">{d.common.login}</Link></>}>
      <RegisterForm action={register} d={d} locale={locale} next={sp.next} type={sp.type} />
    </AuthShell>
  );
}
