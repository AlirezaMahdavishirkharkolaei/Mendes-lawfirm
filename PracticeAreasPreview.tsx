import Link from "next/link";
import { practiceAreas } from "@/content/practice-areas";
import { Button, Divider, Reveal } from "@/components/ui";
import { PageContainer, SectionContainer } from "@/components/layout";

/**
 * Editorial index of practice areas — not a card grid. Renders exactly
 * what src/content/practice-areas.ts contains; no additional practice
 * areas are invented here. Each row is a single accessible link (title
 * + summary both inside the anchor) rather than several nested
 * interactive elements. No focus-visible override — the global 2px
 * accent outline (globals.css) applies as-is, wrapping the full row.
 */
export function PracticeAreasPreview() {
  return (
    <SectionContainer className="border-t border-border">
      <PageContainer className="flex flex-col gap-10">
        <h2
          id="practice-areas"
          className="font-display text-h2 tracking-heading text-ink"
        >
          Practice areas
        </h2>

        <ul className="flex flex-col">
          {practiceAreas.map((area, i) => (
            <Reveal key={area.slug} index={i} as="li">
              <Divider index={String(i + 1).padStart(2, "0")} className="mb-6" />
              <Link
                href={`/practice-areas/${area.slug}`}
                className="group grid gap-2 pb-10 md:grid-cols-[1fr_auto] md:items-baseline md:gap-8"
              >
                <span className="font-display text-h3 tracking-heading text-ink transition-colors duration-[175ms] ease-editorial group-hover:text-accent">
                  {area.title}
                </span>
                <span className="font-body text-body text-ink-muted md:max-w-sm md:text-right">
                  {area.summary}
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>

        <Button href="/practice-areas" variant="secondary" className="self-start">
          View all practice areas
        </Button>
      </PageContainer>
    </SectionContainer>
  );
}
