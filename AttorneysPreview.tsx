import Link from "next/link";
import { attorneys } from "@/content/attorneys";
import { getPracticeAreaTitle } from "@/lib/content";
import { Button, Reveal, Tag } from "@/components/ui";
import { PageContainer, SectionContainer } from "@/components/layout";

/**
 * Editorial attorney index — not a "team card" grid. Uses only fields
 * present in the content model: name, position, languages, and
 * practiceAreaSlugs (resolved to a Tag via the shared practice-area
 * lookup). No expertise field is introduced, no photography is
 * required (none exists in the content layer — see Design System's
 * "no photography for v1" allowance). Placeholder attorneys keep their
 * explicit "Demonstration content" marker for as long as
 * attorney.isPlaceholder is true, so they're never presented as real.
 */
export function AttorneysPreview() {
  return (
    <SectionContainer className="border-t border-border">
      <PageContainer className="flex flex-col gap-10">
        <h2 className="font-display text-h2 tracking-heading text-ink">
          Attorneys
        </h2>

        <ul className="flex flex-col divide-y divide-border">
          {attorneys.map((attorney, i) => (
            <Reveal key={attorney.slug} index={i} as="li">
              <Link
                href={`/attorneys/${attorney.slug}`}
                className="group grid gap-3 py-8 md:grid-cols-[1fr_auto] md:items-baseline md:gap-8"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-body text-h3 font-semibold text-ink transition-colors duration-[175ms] ease-editorial group-hover:text-accent">
                    {attorney.name}
                  </span>
                  <span className="font-mono text-ui-sm tracking-mono uppercase text-ink-muted">
                    {attorney.position}
                  </span>
                  {attorney.isPlaceholder && (
                    <span className="font-mono text-ui-sm tracking-mono uppercase text-accent">
                      Demonstration content
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  {attorney.practiceAreaSlugs.map((slug) => {
                    const title = getPracticeAreaTitle(slug);
                    return title ? <Tag key={slug}>{title}</Tag> : null;
                  })}
                  {attorney.languages.length > 0 && (
                    <span className="font-mono text-ui-sm tracking-mono text-ink-muted">
                      {attorney.languages.join(" / ")}
                    </span>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>

        <Button href="/attorneys" variant="secondary" className="self-start">
          View all attorneys
        </Button>
      </PageContainer>
    </SectionContainer>
  );
}
