import { Button, Reveal, SectionLabel } from "@/components/ui";
import { PageContainer, SectionContainer } from "@/components/layout";
import { homepageCopy } from "@/content/homepage-copy";

/**
 * Homepage hero. Asymmetric 7/5 composition on desktop: text occupies
 * the left 7 of 12 columns; the right 5 columns are deliberate
 * whitespace. Per Phase 4 decision #1, no stat/metadata block is
 * rendered — fabricating placeholder numbers was explicitly ruled out,
 * so the space is used through composition and whitespace instead of
 * invented figures. Copy is placeholder — see
 * src/content/homepage-copy.ts.
 */
export function Hero() {
  return (
    <SectionContainer className="pt-8 md:pt-12">
      <PageContainer>
        <Reveal>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-7">
              <SectionLabel as="p">{homepageCopy.hero.eyebrow}</SectionLabel>
              <h1 className="text-balance font-display text-display tracking-display text-ink">
                {homepageCopy.hero.headline}
              </h1>
              <p className="max-w-xl font-body text-lead text-ink-muted">
                {homepageCopy.hero.proposition}
              </p>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
                <Button href="/consultation" variant="primary">
                  Request a consultation
                </Button>
                <Button href="#practice-areas" variant="secondary">
                  View practice areas
                </Button>
              </div>
            </div>
            {/*
              lg:col-span-5 intentionally left empty. Reserved for future
              art direction (see docs/DESIGN-SYSTEM.md's imagery
              direction and the UX spec's "future enhancements") — not a
              placeholder stat block. The whitespace itself is the
              composition choice here.
            */}
          </div>
        </Reveal>
      </PageContainer>
    </SectionContainer>
  );
}
