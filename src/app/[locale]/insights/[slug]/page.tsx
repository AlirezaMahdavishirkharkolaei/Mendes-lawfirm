import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { pageContext, resolveLocale } from "@/lib/site";
import { getArticleBySlug, incrementViews } from "@/lib/data/articles";
import { currentUser, isStaff } from "@/lib/auth";
import { siteUrl } from "@/lib/env";
import { formatDate } from "@/lib/i18n/format";
import { localeMeta, asLocale } from "@/lib/i18n/config";
import { renderMarkdown, readingMinutes } from "@/lib/markdown";
import { CopyButton } from "@/components/insights/CopyButton";
import { Badge, Container, Notice } from "@/components/ui/misc";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  await resolveLocale(params);
  const a = await getArticleBySlug((await params).slug);
  if (!a || a.status !== "published") return {};
  return {
    title: a.title,
    description: a.abstract.slice(0, 200),
    authors: [{ name: a.author_name }],
    openGraph: { type: "article", title: a.title, description: a.abstract.slice(0, 200), publishedTime: a.published_at ?? undefined, authors: [a.author_name] },
    other: {
      citation_title: a.title,
      citation_author: a.author_name,
      citation_publication_date: (a.published_at ?? "").slice(0, 10).replace(/-/g, "/"),
      citation_publisher: "Mendes Law & Consultancy",
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { locale, d, l } = await pageContext(params);
  const a = await getArticleBySlug((await params).slug);
  if (!a) notFound();
  const user = await currentUser();
  const preview = a.status !== "published";
  if (preview && !(isStaff(user) || user?.id === a.author_id)) notFound();
  if (!preview) after(() => incrementViews(a.id));

  const url = `${siteUrl()}/${asLocale(a.locale)}/insights/${a.slug}`;
  const year = (a.published_at ?? a.created_at).slice(0, 4);
  const citation = `${a.author_name}, “${a.title}” (${year}) Mendes Insights. Available at: ${url}`;
  const dir = localeMeta[asLocale(a.locale)].dir;

  return (
    <article className="pb-24 pt-40">
      <Container narrow>
        {preview && <Notice className="mb-10">Preview — {d.submit.status[a.status]}</Notice>}
        <Link href={l("/insights")} className="label link-grow inline-flex">← {d.insights.title}</Link>
        <div className="mt-10 flex flex-wrap items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ivory-muted">
          {a.category && <Badge>{a.category}</Badge>}
          {a.author_role === "author" && <Badge tone="muted">{d.insights.student}</Badge>}
          <span>{formatDate(a.published_at ?? a.created_at, locale)}</span>
          <span>· {readingMinutes(a.body)} {d.insights.readTime}</span>
          {!preview && <span>· {a.views} {d.insights.views}</span>}
        </div>
        <h1 className="mt-6 font-display text-h1 font-light" dir={dir}>{a.title}</h1>
        <p className="mt-8 flex items-center gap-3 text-ui">
          <span className="text-ivory-muted">{d.insights.by}</span>
          {a.author_slug ? <Link href={l(`/authors/${a.author_slug}`)} className="link-grow text-gold-light">{a.author_name}</Link> : <span>{a.author_name}</span>}
          {a.author_university && <span className="text-ivory-muted">· {a.author_university}</span>}
        </p>
        <div className="my-12 hairline" />
        <div dir={dir} className="rounded-[4px] border border-line bg-night-2/60 p-8">
          <p className="label mb-4">Abstract</p>
          <p className="font-display text-xl font-light italic leading-relaxed text-ivory/90">{a.abstract}</p>
          {a.keywords.length > 0 && <p className="mt-6 text-ui-sm text-ivory-muted"><span className="text-gold">{d.insights.keywords}:</span> {a.keywords.join(" · ")}</p>}
        </div>
        <div dir={dir} className="prose-luxe mt-14" dangerouslySetInnerHTML={{ __html: renderMarkdown(a.body) }} />
        {a.attachment_key && (
          <a href={`/api/articles/${a.id}/pdf`} className="mt-12 inline-flex items-center gap-3 rounded-[2px] border border-line-strong px-6 py-3.5 text-ui uppercase tracking-[0.14em] hover:border-gold hover:text-gold-light">↓ {d.insights.attachment}</a>
        )}
        {!preview && (
          <section className="mt-20 rounded-[4px] border border-gold/30 bg-gold/[0.05] p-8">
            <div className="flex items-center justify-between gap-4">
              <p className="label">{d.insights.cite}</p>
              <CopyButton text={citation} label={d.insights.copy} done={d.insights.copied} />
            </div>
            <p className="mt-5 font-mono text-ui-sm leading-relaxed text-ivory/80" dir="ltr">{citation}</p>
            <p className="mt-5 text-ui-sm text-ivory-muted">{d.insights.permalink}: <a href={url} className="break-all text-gold" dir="ltr">{url}</a></p>
          </section>
        )}
      </Container>
    </article>
  );
}
