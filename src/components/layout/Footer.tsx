import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { PageContainer } from "./Container";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { footerLegalLinks, primaryNav } from "@/lib/navigation";
import { practiceAreas } from "@/content/practice-areas";
import { firm, telHref } from "@/content/firm";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

const linkClass = "font-body text-ui text-ink-dark/85 hover:text-accent-on-dark";
const headClass = "font-mono text-ui-sm tracking-mono uppercase text-accent-on-dark";

/** Global footer. Contact lines appear only for details the firm has provided (src/content/firm.ts). */
export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-dark text-ink-dark">
      <PageContainer className="flex flex-col gap-16 py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="flex flex-col gap-4 md:col-span-2">
            <Wordmark locale={locale} onDark />
            <p className="max-w-sm font-body text-ui text-ink-dark/70">{firm.tagline[locale]}</p>
          </div>

          <div className="flex flex-col gap-3">
            <span className={headClass}>{t.footer.navigation}</span>
            <ul className="flex flex-col gap-2">
              {[...primaryNav(locale, t), { label: t.nav.consultation, href: href(locale, "consultation") }].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <span className={headClass}>{t.footer.practice}</span>
            <ul className="flex flex-col gap-2">
              {practiceAreas.map((area) => (
                <li key={area.slug}>
                  <Link href={href(locale, `practice-areas/${area.slug}`)} className={linkClass}>
                    {area.title[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="border-ink-dark/15" />

        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <span className={headClass}>{t.footer.contact}</span>
            {firm.address && (
              <p className="font-body text-ui text-ink-dark/70">
                {firm.address.street}, {firm.address.city}, {firm.address.country[locale]}
              </p>
            )}
            {firm.phone && (
              <a href={telHref(firm.phone)} className={linkClass} dir="ltr">
                {firm.phone}
              </a>
            )}
            <a href={`mailto:${firm.email}`} className={linkClass}>
              {firm.email}
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <span className={headClass}>{t.footer.legal}</span>
            <ul className="flex flex-col gap-2">
              {footerLegalLinks(locale, t).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <LanguageSwitcher current={locale} label={t.nav.language} onDark />
        </div>

        <p className="font-mono text-ui-sm tracking-mono text-ink-dark/50">
          © {year} {firm.legalName}. {t.footer.rights} {t.footer.note}
        </p>
      </PageContainer>
    </footer>
  );
}
