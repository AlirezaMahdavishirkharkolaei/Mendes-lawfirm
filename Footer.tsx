import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { PageContainer } from "./Container";
import { primaryNav, footerLegalLinks } from "@/lib/navigation";
import { practiceAreas } from "@/content/practice-areas";

/**
 * Global site footer. Contact details here are explicitly labeled as
 * placeholders and use non-real-looking values — this is a structural
 * placeholder, not a stand-in that could be mistaken for a real filing.
 * Practice area links reuse the existing placeholder content (see
 * src/content/practice-areas.ts) rather than inventing new services.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-dark text-ink-dark">
      <PageContainer className="flex flex-col gap-16 py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="flex flex-col gap-4 md:col-span-2">
            <Wordmark onDark />
            <p className="max-w-sm font-body text-ui text-ink-dark/70">
              A premium, technology-oriented law firm. Structural
              placeholder positioning statement — not final copy.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-ui-sm tracking-mono uppercase text-accent-on-dark">
              Navigation
            </span>
            <ul className="flex flex-col gap-2">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-body text-ui text-ink-dark/85 hover:text-accent-on-dark"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-ui-sm tracking-mono uppercase text-accent-on-dark">
              Practice areas
            </span>
            <ul className="flex flex-col gap-2">
              {practiceAreas.map((area) => (
                <li key={area.slug}>
                  <Link
                    href={`/practice-areas/${area.slug}`}
                    className="font-body text-ui text-ink-dark/85 hover:text-accent-on-dark"
                  >
                    {area.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="border-ink-dark/15" />

        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-ui-sm tracking-mono uppercase text-accent-on-dark">
              Contact — placeholder
            </span>
            <p className="font-body text-ui text-ink-dark/70">
              Placeholder address, City, Country
            </p>
            <p className="font-body text-ui text-ink-dark/70">
              +00 000 000 0000 (placeholder)
            </p>
            <p className="font-body text-ui text-ink-dark/70">
              contact@example.com (placeholder)
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-mono text-ui-sm tracking-mono uppercase text-accent-on-dark">
              Legal
            </span>
            <ul className="flex flex-col gap-2">
              {footerLegalLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-body text-ui text-ink-dark/85 hover:text-accent-on-dark"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="font-mono text-ui-sm tracking-mono text-ink-dark/50">
          © {year} Mendes. All rights reserved. Placeholder content — not a
          real law firm filing.
        </p>
      </PageContainer>
    </footer>
  );
}
