import type { Metadata } from "next";
import Link from "next/link";
import { pageContext } from "@/lib/site";
import { currentUser } from "@/lib/auth";
import { listArticles } from "@/lib/data/articles";
import { locales, localeMeta } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { TOPIC_KEYS, topicLabel } from "@/lib/topics";
import { PageHero } from "@/components/sections/PageHero";
import { SubmitForm } from "@/components/insights/SubmitForm";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Container, Notice } from "@/components/ui/misc";
import { submitArticleAction } from "./actions";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { d } = await pageContext(params);
  return { title: d.submit.title, description: d.submit.lead };
}

export default async function SubmitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, d, settings, l } = await pageContext(params);
  const user = await currentUser();
  const mine = user ? await listArticles({ authorId: user.id }) : [];
  const tone = { submitted: "warning", revision: "gold", published: "success", rejected: "danger" } as const;

  return (
    <>
      <PageHero label={d.home.insightsLabel} title={d.submit.title} lead={d.submit.lead} />
      <Container className="grid gap-16 pb-24 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <ul className="space-y-4 border-s border-gold/40 ps-6 text-ui leading-relaxed text-ivory/80">
            {d.submit.rules.map((r) => <li key={r}>{r}</li>)}
          </ul>
          {mine.length > 0 && (
            <div className="mt-12">
              <p className="label mb-4">{d.submit.mine}</p>
              <ul className="space-y-4">
                {mine.map((a) => (
                  <li key={a.id} className="rounded-[3px] border border-line p-4">
                    <Link href={l(`/insights/${a.slug}`)} className="font-display text-lg hover:text-gold-light">{a.title}</Link>
                    <div className="mt-2 flex items-center gap-3 text-ui-sm text-ivory-muted">
                      <Badge tone={tone[a.status]}>{d.submit.status[a.status]}</Badge>
                      {formatDate(a.created_at, locale)}
                    </div>
                    {a.reviewer_note && <p className="mt-3 text-ui-sm text-ivory/70"><span className="text-gold">{d.submit.note}:</span> {a.reviewer_note}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
        <div className="lg:col-span-8">
          {settings.articles_open === "0" ? (
            <Notice>{d.common.error}</Notice>
          ) : user ? (
            <SubmitForm
              action={submitArticleAction}
              d={d}
              locale={locale}
              categories={TOPIC_KEYS.map((k) => ({ key: k, label: topicLabel(k, locale) }))}
              languages={locales.map((k) => ({ key: k, label: localeMeta[k].native }))}
            />
          ) : (
            <div className="rounded-[4px] border border-line bg-night-2/60 p-10">
              <p className="text-lead text-ivory/85">{d.submit.needAccount}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <ButtonLink href={l(`/portal/register?type=author&next=${encodeURIComponent(l("/insights/submit"))}`)} arrow>{d.common.register}</ButtonLink>
                <ButtonLink href={l(`/portal/login?next=${encodeURIComponent(l("/insights/submit"))}`)} variant="outline">{d.common.login}</ButtonLink>
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
