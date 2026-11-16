import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { PageContainer, SectionContainer } from "@/components/layout";
import { getDictionary, resolveLocale } from "@/i18n/get";
import { href, locales } from "@/i18n/config";
import { attorneys, getAttorney } from "@/content/attorneys";
import { getPracticeArea } from "@/content/practice-areas";
import { alternates } from "@/lib/seo";

type Params = Promise<{ lang: string; slug: string }>;
export const dynamicParams = false;

export function generateStaticParams() {
  // A static export needs at least one path; "_" renders the 404 page until profiles exist.
  const slugs = attorneys.length ? attorneys.map((a) => a.slug) : ["_"];
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const a = getAttorney((await params).slug);
  if (!a) return { robots: { index: false } };
  return { title: a.name, description: a.position[locale], alternates: alternates(locale, `team/${a.slug}`) };
}

export default async function Profile({ params }: { params: Params }) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);
  const a = getAttorney((await params).slug);
  if (!a) notFound();

  const facts: [string, string[]][] = [
    [t.team.bar, a.barAdmission ? [a.barAdmission] : []],
    [t.team.education, a.education],
    [t.team.languages, a.languages],
    [t.team.areas, a.practiceAreaSlugs.map((s) => getPracticeArea(s)?.title[locale]).filter((x): x is string => Boolean(x))],
    [t.team.publications, a.publications],
  ];

  return (
    <>
      <PageHeader
        eyebrow={a.position[locale]}
        title={`${a.honorific ? `${a.honorific} ` : ""}${a.name}`}
        crumbs={[{ label: t.nav.home, href: href(locale) }, { label: t.team.title, href: href(locale, "team") }, { label: a.name }]}
      />
      <SectionContainer className="pt-0 md:pt-0 lg:pt-0">
        <PageContainer className="grid gap-12 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-7">
            {a.biography[locale].map((p) => (
              <p key={p} className="font-body text-lead text-ink">
                {p}
              </p>
            ))}
          </div>
          <dl className="flex flex-col gap-6 lg:col-span-5">
            {facts
              .filter(([, v]) => v.length)
              .map(([k, v]) => (
                <div key={k} className="border-t border-border pt-4">
                  <dt className="mb-2 font-mono text-ui-sm uppercase tracking-mono text-ink-muted">{k}</dt>
                  {v.map((x) => (
                    <dd key={x} className="font-body text-body text-ink">
                      {x}
                    </dd>
                  ))}
                </div>
              ))}
          </dl>
        </PageContainer>
      </SectionContainer>
    </>
  );
}
