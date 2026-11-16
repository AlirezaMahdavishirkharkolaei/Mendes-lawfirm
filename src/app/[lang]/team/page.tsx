import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { PageContainer, SectionContainer } from "@/components/layout";
import { Reveal, Tag } from "@/components/ui";
import { getDictionary, resolveLocale } from "@/i18n/get";
import { href } from "@/i18n/config";
import { attorneys } from "@/content/attorneys";
import { getPracticeArea } from "@/content/practice-areas";
import { alternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  return { title: t.team.title, description: t.team.lead, alternates: alternates(locale, "team"), robots: attorneys.length ? undefined : { index: false } };
}

/** Team index. Hidden from the menu (and 404s) while there are no approved profiles. */
export default async function Team({ params }: { params: Promise<{ lang: string }> }) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  if (!attorneys.length) notFound();

  return (
    <>
      <PageHeader title={t.team.title} lead={t.team.lead} crumbs={[{ label: t.nav.home, href: href(locale) }, { label: t.team.title }]} />
      <SectionContainer className="pt-0 md:pt-0 lg:pt-0">
        <PageContainer>
          <ul className="flex flex-col divide-y divide-border border-t border-border">
            {attorneys.map((a, i) => (
              <Reveal key={a.slug} index={i} as="li">
                <Link href={href(locale, `team/${a.slug}`)} className="group grid gap-3 py-8 md:grid-cols-[1fr_auto] md:items-baseline md:gap-8">
                  <div className="flex flex-col gap-1">
                    <span className="font-body text-h3 font-semibold text-ink transition-colors group-hover:text-accent">
                      {a.honorific ? `${a.honorific} ` : ""}
                      {a.name}
                    </span>
                    <span className="font-mono text-ui-sm uppercase tracking-mono text-ink-muted">{a.position[locale]}</span>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    {a.practiceAreaSlugs.map((s) => {
                      const area = getPracticeArea(s);
                      return area ? <Tag key={s}>{area.title[locale]}</Tag> : null;
                    })}
                    {a.languages.length > 0 && <span className="font-mono text-ui-sm tracking-mono text-ink-muted">{a.languages.join(" / ")}</span>}
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </PageContainer>
      </SectionContainer>
    </>
  );
}
