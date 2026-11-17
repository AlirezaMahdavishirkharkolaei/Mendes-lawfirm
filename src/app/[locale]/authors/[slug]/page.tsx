import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageContext } from "@/lib/site";
import { db } from "@/lib/db";
import { listArticles } from "@/lib/data/articles";
import { formatDate } from "@/lib/i18n/format";
import { Container, Badge } from "@/components/ui/misc";
import { initials } from "@/components/sections/cards";

type Params = Promise<{ locale: string; slug: string }>;

async function author(slug: string) {
  const database = await db();
  return database.prepare("SELECT id, name, university, bio, role FROM users WHERE slug = ? AND is_active = 1").bind(slug).first<{ id: string; name: string; university: string | null; bio: string | null; role: string }>();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const a = await author((await params).slug);
  return a ? { title: a.name, description: `${a.name}${a.university ? ` — ${a.university}` : ""} · Mendes Insights` } : {};
}

export default async function AuthorPage({ params }: { params: Params }) {
  const { locale, d, l } = await pageContext(params);
  const a = await author((await params).slug);
  if (!a) notFound();
  const articles = await listArticles({ status: "published", authorId: a.id });
  if (articles.length === 0) notFound();
  return (
    <section className="pb-24 pt-40">
      <Container narrow>
        <div className="flex items-center gap-8">
          <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full border border-gold/50 font-display text-4xl italic text-gold" dir="ltr">{initials(a.name)}</div>
          <div>
            <p className="label">{d.insights.author}</p>
            <h1 className="mt-3 font-display text-h2 font-light">{a.name}</h1>
            {a.university && <p className="mt-2 text-ivory-muted">{a.university}</p>}
            {a.role === "author" && <div className="mt-3"><Badge tone="muted">{d.insights.student}</Badge></div>}
          </div>
        </div>
        {a.bio && <p className="mt-10 leading-relaxed text-ivory/80">{a.bio}</p>}
        <h2 className="label mt-16">{d.insights.articlesBy} {a.name}</h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {articles.map((x) => (
            <li key={x.id} className="group py-7">
              <Link href={l(`/insights/${x.slug}`)} className="block">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ivory-muted">{formatDate(x.published_at, locale)}</p>
                <p className="mt-2 font-display text-2xl font-light group-hover:text-gold-light">{x.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
