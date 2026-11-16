import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { PageContainer, SectionContainer } from "@/components/layout";
import { Button } from "@/components/ui";
import { getDictionary, resolveLocale } from "@/i18n/get";
import { href } from "@/i18n/config";
import { firm, telHref, waHref } from "@/content/firm";
import { alternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return { title: t.contact.title, description: t.contact.lead, alternates: alternates(locale, "contact") };
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-t border-border py-6 md:grid-cols-[12rem_1fr]">
      <dt className="font-mono text-ui-sm uppercase tracking-mono text-ink-muted">{label}</dt>
      <dd className="font-body text-lead text-ink">{children}</dd>
    </div>
  );
}

export default async function Contact({ params }: { params: Promise<{ lang: string }> }) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const a = firm.address;
  const link = "underline decoration-border underline-offset-4 hover:text-accent hover:decoration-accent";

  return (
    <>
      <PageHeader title={t.contact.title} lead={t.contact.lead} crumbs={[{ label: t.nav.home, href: href(locale) }, { label: t.nav.contact }]} />
      <SectionContainer className="pt-0 md:pt-0 lg:pt-0">
        <PageContainer className="grid gap-12 lg:grid-cols-12">
          <dl className="lg:col-span-7">
            <Row label={t.contact.email}>
              <a className={link} href={`mailto:${firm.email}`}>
                {firm.email}
              </a>
            </Row>
            {firm.phone && (
              <Row label={t.contact.phone}>
                <a className={link} href={telHref(firm.phone)} dir="ltr">
                  {firm.phone}
                </a>
              </Row>
            )}
            {firm.whatsapp && (
              <Row label={t.contact.whatsapp}>
                <a className={link} href={waHref(firm.whatsapp, t.contact.waHello)} target="_blank" rel="noopener noreferrer" dir="ltr">
                  +{firm.whatsapp}
                </a>
              </Row>
            )}
            {a && (
              <Row label={t.contact.address}>
                <address className="not-italic">
                  {a.street}
                  <br />
                  {a.city}, {a.country[locale]}
                </address>
                {a.lat !== undefined && a.lng !== undefined && (
                  <a
                    className={`${link} mt-2 inline-block font-mono text-ui-sm uppercase tracking-mono`}
                    href={`https://www.openstreetmap.org/?mlat=${a.lat}&mlon=${a.lng}#map=17/${a.lat}/${a.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.contact.directions}
                  </a>
                )}
              </Row>
            )}
            {firm.hours && <Row label={t.contact.hours}>{firm.hours[locale]}</Row>}
            {(firm.social.linkedin || firm.social.instagram) && (
              <Row label={t.contact.social}>
                <span className="flex gap-6">
                  {firm.social.linkedin && (
                    <a className={link} href={firm.social.linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  )}
                  {firm.social.instagram && (
                    <a className={link} href={firm.social.instagram} target="_blank" rel="noopener noreferrer">
                      Instagram
                    </a>
                  )}
                </span>
              </Row>
            )}
          </dl>
          <div className="flex flex-col gap-6 lg:col-span-5">
            {a?.lat !== undefined && a?.lng !== undefined && (
              <iframe
                title={t.contact.mapTitle}
                className="aspect-[4/3] w-full border border-border"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${a.lng - 0.004},${a.lat - 0.0025},${a.lng + 0.004},${a.lat + 0.0025}&layer=mapnik&marker=${a.lat},${a.lng}`}
              />
            )}
            <div className="flex flex-col items-start gap-4 border-t border-border pt-6">
              <p className="font-display text-h2 tracking-heading text-ink">{t.home.closing}</p>
              <Button href={href(locale, "consultation")}>{t.nav.consultation}</Button>
            </div>
          </div>
        </PageContainer>
      </SectionContainer>
    </>
  );
}
