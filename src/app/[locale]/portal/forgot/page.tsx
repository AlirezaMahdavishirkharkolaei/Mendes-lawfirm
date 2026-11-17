import { pageContext } from "@/lib/site";
import { AuthShell } from "@/components/portal/AuthShell";
import { ForgotForm } from "@/components/portal/AuthForms";
import { requestReset } from "../actions";

export const metadata = { robots: { index: false } };

export default async function Forgot({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, d } = await pageContext(params);
  return (
    <AuthShell title={d.portal.resetTitle}>
      <ForgotForm action={requestReset} d={d} locale={locale} />
    </AuthShell>
  );
}
