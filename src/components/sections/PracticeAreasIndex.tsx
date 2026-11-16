import Link from "next/link";
import { practiceAreas } from "@/content/practice-areas";
import { Divider, Reveal } from "@/components/ui";
import { href, type Locale } from "@/i18n/config";

/**
 * Editorial index of practice areas — not a card grid. Each row is a
 * single accessible link. Used on the homepage and the Practice areas page.
 */
export function PracticeAreasIndex({ locale, exclude }: { locale: Locale; exclude?: string }) {
  const areas = practiceAreas.filter((a) => a.slug !== exclude);
  return (
    <ul className="flex flex-col">
      {areas.map((area, i) => (
        <Reveal key={area.slug} index={i} as="li">
          <Divider index={String(i + 1).padStart(2, "0")} className="mb-6" />
          <Link
            href={href(locale, `practice-areas/${area.slug}`)}
            className="group grid gap-2 pb-10 md:grid-cols-[1fr_auto] md:items-baseline md:gap-8"
          >
            <span className="font-display text-h3 tracking-heading text-ink transition-colors duration-[175ms] ease-editorial group-hover:text-accent">
              {area.title[locale]}
            </span>
            <span className="font-body text-body text-ink-muted md:max-w-sm md:text-end">{area.summary[locale]}</span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
