import { pageContext } from "@/lib/site";
import { peekUserToken } from "@/lib/auth";
import { AuthShell } from "@/components/portal/AuthShell";
import { ResetForm } from "@/components/portal/AuthForms";
import { Notice } from "@/components/ui/misc";
import { resetPassword } from "../actions";

export const metadata = { robots: { index: false } };

export default async function Reset({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ t?: string }> }) {
  const { locale, d } = await pageContext(params);
  const { t } = await searchParams;
  const valid = t ? await peekUserToken(t) : false;
  return (
    <AuthShell title={d.portal.setPasswordTitle}>
      {valid && t ? <ResetForm action={resetPassword} d={d} locale={locale} token={t} /> : <Notice tone="danger">{d.portal.invalidToken}</Notice>}
    </AuthShell>
  );
}
