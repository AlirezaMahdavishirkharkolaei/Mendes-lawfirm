import { Reveal } from "@/components/ui";
import { PageContainer, ReadingContainer, SectionContainer } from "@/components/layout";

/** Institutional philosophy statement: a single pull quote in the reading column. */
export function Philosophy({ quote }: { quote: string }) {
  return (
    <SectionContainer className="border-t border-border">
      <PageContainer>
        <ReadingContainer className="text-center">
          <Reveal>
            <p className="text-balance font-display text-h1 tracking-display text-ink">{quote}</p>
          </Reveal>
        </ReadingContainer>
      </PageContainer>
    </SectionContainer>
  );
}
