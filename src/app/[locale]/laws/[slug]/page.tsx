import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { resolveLocale, pageContext } from "@/lib/site";
import { generateLawExplanation, getLaw, listLaws } from "@/lib/data/laws";
import { aiConfig } from "@/lib/ai/provider";
import { pick } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { renderMarkdown } from "@/lib/markdown";
import { AskButton } from "@/components/sections/AskButton";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Notice } from "@/components/ui/misc";
import { Reveal } from "@/components/ui/Reveal";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const law = await getLaw((await params).slug);
  if (!law) return {};
  return { title: pick(law.title, locale), description: law.summary[locale] || undefined };
}

export default async function LawPage({ params }: { params: Params }) {
  const { locale, d, settings, l } = await pageContext(params);
  const law = await getLaw((await params).slug);
  if (!law || law.status !== "published") notFound();

  const body = law.body[locale];
  if (!body && settings.laws_autogenerate !== "0" && (await aiConfig()).configured) {
    // Generate in the background; the next visitor gets the explanation.
    after(() => generateLawExplanation(law, locale).then(() => undefined));
  }
  const reviewed = law.review[locale] === "reviewed";
  const title = pick(law.title, locale);
  const others = (await listLaws()).filter((x) => x.category === law.category && x.slug !== law.slug).slice(0, 4);

  return (
    <article className="pb-24 pt-40">
      <Container className="grid gap-16 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <div className="sticky top-28 space-y-8">
            <Link href={l("/laws")} className="label link-grow inline-flex">← {d.laws.title}</Link>
            <div className="rounded-[4px] border border-line bg-night-2/70 p-7">
              <p className="label">{d.laws.reference}</p>
              <p className="mt-3 font-mono text-ui text-gold-light" dir="ltr">{law.reference}</p>
              <p className="mt-6 text-ui-sm text-ivory-muted">{d.laws.categories[law.category as keyof typeof d.laws.categories] ?? law.category}</p>
              {law.updatedAt && <p className="mt-2 text-ui-sm text-ivory-muted/70">{formatDate(law.updatedAt, locale)}</p>}
              {law.sourceUrl && <a href={law.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-grow mt-6 inline-block text-ui text-gold">{d.laws.official} ↗</a>}
            </div>
            <div className="space-y-3">
              <AskButton label={d.laws.askAbout} prefill={`${title} (${law.reference}): `} className="w-full justify-center" />
              <ButtonLink href={l("/booking")} className="w-full" arrow>{d.nav.booking}</ButtonLink>
            </div>
            {others.length > 0 && (
              <ul className="space-y-3 border-t border-line pt-6">
                {others.map((o) => (
                  <li key={o.slug}><Link href={l(`/laws/${o.slug}`)} className="link-grow text-ui text-ivory/75 hover:text-gold-light">{pick(o.title, locale)}</Link></li>
                ))}
              </ul>
            )}
          </div>
        </aside>
        <div className="lg:col-span-8">
          <p className="label">{law.reference}</p>
          <h1 className="mt-5 font-display text-h1 font-light">{title}</h1>
          {law.summary[locale] && <p className="mt-8 text-lead text-ivory/80">{law.summary[locale]}</p>}
          <div className="my-10 hairline" />
          {body ? (
            <>
              <Notice tone={reviewed ? "success" : "gold"}>{reviewed ? d.laws.reviewedNotice : d.laws.aiNotice}</Notice>
              <Reveal>
                <div className="prose-luxe mt-10" dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }} />
              </Reveal>
            </>
          ) : (
            <Notice>{d.laws.pending}</Notice>
          )}
          <p className="mt-16 border-t border-line pt-8 text-ui-sm text-ivory-muted">{d.laws.disclaimer}</p>
        </div>
      </Container>
    </article>
  );
}
