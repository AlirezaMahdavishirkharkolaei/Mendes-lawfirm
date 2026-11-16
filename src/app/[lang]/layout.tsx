import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/fraunces";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource-variable/vazirmatn";
import "../globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/ui";
import { locales, localeMeta } from "@/i18n/config";
import { getDictionary, resolveLocale } from "@/i18n/get";
import { consultationCta, primaryNav } from "@/lib/navigation";
import { firm } from "@/content/firm";
import { alternates } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(`${firm.siteUrl}/`),
    title: { default: t.meta.siteTitle, template: `%s | Mendes` },
    description: t.meta.siteDescription,
    alternates: alternates(locale, ""),
    openGraph: {
      type: "website",
      siteName: firm.legalName,
      title: t.meta.siteTitle,
      description: t.meta.siteDescription,
      locale: { en: "en_GB", tr: "tr_TR", fa: "fa_IR" }[locale],
    },
  };
}

/**
 * Root layout for every language. Header and Footer live here, once, so
 * every page gets them; this is also where the single #main-content
 * landmark lives, which the SkipLink targets.
 */
export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const meta = localeMeta[locale];

  return (
    <html lang={meta.htmlLang} dir={meta.dir} className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-surface font-body text-ink">
        <SkipLink targetId="main-content" label={t.skip} />
        <Header
          locale={locale}
          items={primaryNav(locale, t)}
          cta={consultationCta(locale, t)}
          labels={{ menu: t.nav.menu, close: t.nav.close, primary: t.nav.primary, language: t.nav.language }}
        />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} t={t} />
      </body>
    </html>
  );
}
