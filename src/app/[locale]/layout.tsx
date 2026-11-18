import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import { locales, localeMeta } from "@/lib/i18n/config";
import { pageContext } from "@/lib/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Intro, introBootScript } from "@/components/layout/Intro";
import { siteUrl } from "@/lib/env";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, d } = await pageContext(params);
  const base = (await siteUrl());
  return {
    metadataBase: new URL(base),
    title: { default: d.meta.title, template: `%s · Mendes` },
    description: d.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: { title: d.meta.title, description: d.meta.description, type: "website", locale: localeMeta[locale].intl, images: [{ url: "/brand/icon-512.png", width: 512, height: 512 }] },
    icons: { icon: [{ url: "/favicon.ico" }, { url: "/brand/favicon-64.png", type: "image/png", sizes: "64x64" }], apple: "/brand/apple-touch-icon.png" },
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale, d, settings, l } = await pageContext(params);
  const meta = localeMeta[locale];
  const nav = [
    { href: l(""), label: d.nav.home },
    { href: l("/about"), label: d.nav.about },
    { href: l("/practice"), label: d.nav.practice },
    { href: l("/team"), label: d.nav.team },
    { href: l("/laws"), label: d.nav.laws },
    { href: l("/insights"), label: d.nav.insights },
  ];
  return (
    <html lang={meta.htmlLang} dir={meta.dir} className="h-full" suppressHydrationWarning>
      <body className="grain flex min-h-full flex-col antialiased">
        <script dangerouslySetInnerHTML={{ __html: introBootScript }} />
        <Intro tagline={d.home.eyebrow} />
        <a href="#main" className="skip-link">{d.common.readMore} ↓</a>
        {settings.announcement && (
          <div className="relative z-[51] bg-gradient-to-r from-gold-deep via-gold to-gold-deep px-4 py-2 text-center text-ui-sm font-medium text-night">{settings.announcement}</div>
        )}
        <Header locale={locale} items={nav} cta={{ href: l("/booking"), label: d.nav.booking }} portal={{ href: l("/portal"), label: d.nav.portal }} labels={{ menu: d.nav.menu, close: d.nav.close, language: d.nav.language }} />
        <main id="main" className="flex-1">{children}</main>
        <Footer locale={locale} d={d} office={{ address: settings.office_address || "", phone: settings.office_phone || "", email: settings.office_email || settings.boss_email?.split(",")[0]?.trim() || "", mapUrl: settings.office_map_url || "" }} />
        {settings.chatbot_enabled !== "0" && <ChatWidget locale={locale} t={d.chat} bookingHref={l("/booking")} />}
      </body>
    </html>
  );
}
