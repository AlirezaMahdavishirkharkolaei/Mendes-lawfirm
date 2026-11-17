import { Reveal } from "@/components/ui";
import { PageContainer, ReadingContainer, SectionContainer } from "@/components/layout";
import { homepageCopy } from "@/content/homepage-copy";

/**
 * Institutional philosophy statement. A single pull quote in Fraunces,
 * centered in the reading column, generous whitespace above and below
 * — deliberately not a "why choose us" grid of cards/icons. Copy is
 * placeholder — see src/content/homepage-copy.ts.
 */
export function Philosophy() {
  return (
    <SectionContainer className="border-t border-border">
      <PageContainer>
        <ReadingContainer className="text-center">
          <Reveal>
            <p className="text-balance font-display text-h1 tracking-display text-ink">
              {homepageCopy.philosophy.quote}
            </p>
          </Reveal>
        </ReadingContainer>
      </PageContainer>
    </SectionContainer>
  );
}
