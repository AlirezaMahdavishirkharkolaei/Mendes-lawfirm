import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { Wordmark } from "./Wordmark";
import { Container } from "@/components/ui/misc";

export function Footer({ locale, d, office }: { locale: string; d: Dictionary; office: { address: string; phone: string; email: string; mapUrl?: string } }) {
  const l = (p: string) => `/${locale}${p}`;
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-line bg-night-2">
      <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[22vw] font-light uppercase leading-none tracking-[0.1em] text-white/[0.025]" dir="ltr">
        Mendes
      </div>
      <Container className="relative grid gap-14 py-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <Wordmark locale={locale} />
          <p className="mt-6 max-w-sm text-ui leading-relaxed text-ivory-muted">{d.footer.tagline}</p>
          <p className="mt-8 max-w-md text-ui-sm leading-relaxed text-ivory-muted/70">{d.footer.disclaimer}</p>
        </div>
        <div className="md:col-span-2">
          <p className="label mb-5">{d.footer.explore}</p>
          <ul className="space-y-3 text-ui text-ivory/80">
            {[["/about", d.nav.about], ["/practice", d.nav.practice], ["/team", d.nav.team], ["/laws", d.nav.laws], ["/insights", d.nav.insights]].map(([p, t]) => (
              <li key={p}><Link className="link-grow hover:text-gold-light" href={l(p)}>{t}</Link></li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="label mb-5">{d.footer.clients}</p>
          <ul className="space-y-3 text-ui text-ivory/80">
            {[["/booking", d.nav.booking], ["/portal", d.nav.portal], ["/insights/submit", d.insights.submitCta], ["/contact", d.nav.contact]].map(([p, t]) => (
              <li key={p}><Link className="link-grow hover:text-gold-light" href={l(p)}>{t}</Link></li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="label mb-5">{d.footer.office}</p>
          <address className="space-y-3 text-ui not-italic text-ivory/80">
            <p>{office.address}</p>
            {office.mapUrl && <p><a className="link-grow text-gold hover:text-gold-light" href={office.mapUrl} target="_blank" rel="noopener noreferrer">Google Maps ↗</a></p>}
            {office.phone && <p><a className="link-grow hover:text-gold-light" href={`tel:${office.phone.replace(/\s/g, "")}`} dir="ltr">{office.phone}</a></p>}
            {office.email && <p><a className="link-grow hover:text-gold-light" href={`mailto:${office.email}`}>{office.email}</a></p>}
          </address>
        </div>
      </Container>
      <div className="hairline" />
      <Container className="flex flex-col items-center justify-between gap-3 py-7 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ivory-muted/70 sm:flex-row">
        <span>© {year} Mendes Law &amp; Consultancy. {d.footer.rights}</span>
        <span className="flex flex-wrap items-center justify-center gap-5">
          <Link href={l("/privacy")} className="link-grow hover:text-gold-light">{d.legal.privacy}</Link>
          <Link href={l("/terms")} className="link-grow hover:text-gold-light">{d.legal.terms}</Link>
          <span dir="ltr">Kyrenia · North Cyprus</span>
        </span>
      </Container>
    </footer>
  );
}
