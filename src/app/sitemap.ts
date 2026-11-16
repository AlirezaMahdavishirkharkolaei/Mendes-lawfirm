import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { firm } from "@/content/firm";
import { practiceAreas } from "@/content/practice-areas";
import { attorneys } from "@/content/attorneys";
import { insights } from "@/content/insights";

export const dynamic = "force-static";

/** Every public page in every language, with hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "about",
    "practice-areas",
    ...practiceAreas.map((a) => `practice-areas/${a.slug}`),
    ...(attorneys.length ? ["team", ...attorneys.map((a) => `team/${a.slug}`)] : []),
    ...(insights.length ? ["insights", ...insights.map((i) => `insights/${i.slug}`)] : []),
    "contact",
    "consultation",
    "privacy",
    "disclaimer",
  ];
  const url = (l: string, p: string) => `${firm.siteUrl}/${l}/${p ? `${p}/` : ""}`;
  return paths.flatMap((p) =>
    locales.map((l) => ({
      url: url(l, p),
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, url(x, p)])) },
    })),
  );
}
