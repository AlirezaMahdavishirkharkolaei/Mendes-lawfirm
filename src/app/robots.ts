import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await siteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/*/portal", "/booking/decision", "/unsubscribe", "/*/booking/manage"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
