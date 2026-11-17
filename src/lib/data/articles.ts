import "server-only";
import { all, db, now, parseJson, uuid } from "@/lib/db";
import { getEnv, siteUrl } from "@/lib/env";
import { slugify } from "@/lib/auth";
import { asLocale } from "@/lib/i18n/config";
import { getSettings, audit } from "@/lib/settings";
import { sendMail } from "@/lib/email/send";
import { articleDecision } from "@/lib/email/templates";
import { randomToken } from "@/lib/security/crypto";

export type ArticleStatus = "submitted" | "revision" | "published" | "rejected";

export interface Article {
  id: string;
  slug: string;
  title: string;
  abstract: string;
  body: string;
  keywords: string[];
  category: string | null;
  locale: string;
  author_id: string;
  author_name: string;
  author_slug: string | null;
  author_university: string | null;
  author_role: string;
  attachment_key: string | null;
  attachment_name: string | null;
  status: ArticleStatus;
  reviewer_note: string | null;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

type Row = Omit<Article, "keywords"> & { keywords: string };

const SELECT = `SELECT a.*, u.name AS author_name, u.slug AS author_slug, u.university AS author_university, u.role AS author_role
  FROM articles a JOIN users u ON u.id = a.author_id`;

const map = (r: Row): Article => ({ ...r, keywords: parseJson(r.keywords, []) });

export async function listArticles(filter: { status?: ArticleStatus; authorId?: string; limit?: number } = {}): Promise<Article[]> {
  const database = await db();
  const where: string[] = [];
  const binds: unknown[] = [];
  if (filter.status) {
    where.push("a.status = ?");
    binds.push(filter.status);
  }
  if (filter.authorId) {
    where.push("a.author_id = ?");
    binds.push(filter.authorId);
  }
  const order = filter.status === "published" ? "a.published_at DESC" : "a.created_at DESC";
  const rows = await all<Row>(
    database.prepare(`${SELECT} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY ${order} LIMIT ?`).bind(...binds, filter.limit ?? 100),
  );
  return rows.map(map);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const database = await db();
  const row = await database.prepare(`${SELECT} WHERE a.slug = ?`).bind(slug).first<Row>();
  return row ? map(row) : null;
}

export async function getArticle(id: string): Promise<Article | null> {
  const database = await db();
  const row = await database.prepare(`${SELECT} WHERE a.id = ?`).bind(id).first<Row>();
  return row ? map(row) : null;
}

export async function incrementViews(id: string): Promise<void> {
  const database = await db();
  await database.prepare("UPDATE articles SET views = views + 1 WHERE id = ?").bind(id).run();
}

async function uniqueSlug(title: string): Promise<string> {
  const database = await db();
  const base = slugify(title);
  const taken = await database.prepare("SELECT 1 FROM articles WHERE slug = ?").bind(base).first();
  return taken ? `${base}-${randomToken(3).toLowerCase().replace(/[^a-z0-9]/g, "")}` : base;
}

export async function submitArticle(input: {
  authorId: string;
  title: string;
  abstract: string;
  body: string;
  keywords: string[];
  category: string | null;
  locale: string;
  attachment?: File | null;
}): Promise<string> {
  const database = await db();
  const id = uuid();
  const slug = await uniqueSlug(input.title);
  let key: string | null = null;
  let name: string | null = null;
  if (input.attachment && input.attachment.size > 0) {
    key = `articles/${id}.pdf`;
    name = input.attachment.name.slice(-140);
    await getEnv().FILES.put(key, input.attachment.stream(), { httpMetadata: { contentType: "application/pdf" } });
  }
  const stamp = now();
  await database
    .prepare(
      `INSERT INTO articles (id, slug, title, abstract, body, keywords, category, locale, author_id, attachment_key, attachment_name, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?)`,
    )
    .bind(id, slug, input.title, input.abstract, input.body, JSON.stringify(input.keywords), input.category, input.locale, input.authorId, key, name, stamp, stamp)
    .run();
  await audit(input.authorId, "article.submitted", "article", id, { title: input.title });
  return id;
}

export async function reviewArticle(id: string, status: ArticleStatus, note: string | null, actor: string): Promise<void> {
  const database = await db();
  const article = await getArticle(id);
  if (!article) return;
  await database
    .prepare(
      `UPDATE articles SET status = ?, reviewer_note = ?, reviewed_by = ?, updated_at = ?,
       published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, ?) ELSE published_at END WHERE id = ?`,
    )
    .bind(status, note, actor, now(), status, now(), id)
    .run();
  await audit(actor, `article.${status}`, "article", id);

  if (status === "submitted") return;
  const author = await database.prepare("SELECT email, locale FROM users WHERE id = ?").bind(article.author_id).first<{ email: string; locale: string }>();
  if (!author) return;
  const locale = asLocale(author.locale);
  const settings = await getSettings();
  const url = `${(await siteUrl())}/${asLocale(article.locale)}/insights/${article.slug}`;
  await sendMail({ to: author.email, ...articleDecision(locale, status, article.title, url, note, settings.firm_name || "Mendes") });
}

export async function updateArticleContent(id: string, fields: { title: string; abstract: string; body: string; keywords: string[]; category: string | null }, actor: string) {
  const database = await db();
  await database
    .prepare("UPDATE articles SET title = ?, abstract = ?, body = ?, keywords = ?, category = ?, updated_at = ? WHERE id = ?")
    .bind(fields.title, fields.abstract, fields.body, JSON.stringify(fields.keywords), fields.category, now(), id)
    .run();
  await audit(actor, "article.edited", "article", id);
}
