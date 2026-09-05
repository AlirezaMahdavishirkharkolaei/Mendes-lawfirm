import { Button, Reveal } from "@/components/ui";
import { PageContainer, ReadingContainer, SectionContainer } from "@/components/layout";
import { homepageCopy } from "@/content/homepage-copy";

/**
 * Quiet closing conversion section. Same surface as the rest of the
 * page — no gradient, no colored banner, no heavy decoration.
 * Distinguished only by generous whitespace and being the page's final
 * content section before the footer. Copy is placeholder — see
 * src/content/homepage-copy.ts.
 */
export function ConsultationCTA() {
  return (
    <SectionContainer className="border-t border-border">
      <PageContainer>
        <ReadingContainer className="flex flex-col items-start gap-6">
          <Reveal>
            <div className="flex flex-col items-start gap-6">
              <p className="text-balance font-display text-h1 tracking-display text-ink">
                {homepageCopy.consultation.proposition}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
                <Button href="/consultation" variant="primary">
                  Request a consultation
                </Button>
                <Button href="/contact" variant="secondary">
                  Or get in touch
                </Button>
              </div>
            </div>
          </Reveal>
        </ReadingContainer>
      </PageContainer>
    </SectionContainer>
  );
}
