import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { locales } from "@/lib/i18n/config";
import { listLaws } from "@/lib/data/laws";
import { listArticles } from "@/lib/data/articles";

export const dynamic = "force-dynamic";

const STATIC = ["", "/about", "/practice", "/team", "/laws", "/insights", "/insights/submit", "/booking", "/contact", "/privacy", "/terms"];

/** Every public page in every language, with hreflang alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await siteUrl();
  const [laws, articles] = await Promise.all([listLaws(), listArticles({ status: "published", limit: 1000 })]);
  const entry = (path: string, lastModified?: string, priority = 0.6): MetadataRoute.Sitemap =>
    locales.map((l) => ({
      url: `${base}/${l}${path}`,
      lastModified: lastModified ? new Date(lastModified) : undefined,
      changeFrequency: "weekly",
      priority,
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, `${base}/${x}${path}`])) },
    }));
  return [
    ...STATIC.flatMap((p) => entry(p, undefined, p === "" ? 1 : p === "/booking" ? 0.9 : 0.7)),
    ...laws.flatMap((law) => entry(`/laws/${law.slug}`, law.updatedAt, 0.8)),
    // Articles live at their own language's URL only.
    ...articles.map((a) => ({ url: `${base}/${a.locale}/insights/${a.slug}`, lastModified: new Date(a.updated_at), changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
