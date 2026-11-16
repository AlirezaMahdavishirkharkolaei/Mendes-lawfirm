import { Button, Reveal } from "@/components/ui";
import { PageContainer, ReadingContainer, SectionContainer } from "@/components/layout";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

/** Quiet closing conversion section — same surface as the page, no banner. */
export function ConsultationCTA({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <SectionContainer className="border-t border-border">
      <PageContainer>
        <ReadingContainer className="flex flex-col items-start gap-6">
          <Reveal>
            <div className="flex flex-col items-start gap-6">
              <p className="text-balance font-display text-h1 tracking-display text-ink">{t.home.closing}</p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
                <Button href={href(locale, "consultation")} variant="primary">
                  {t.home.ctaPrimary}
                </Button>
                <Button href={href(locale, "contact")} variant="secondary">
                  {t.home.closingSecondary}
                </Button>
              </div>
            </div>
          </Reveal>
        </ReadingContainer>
      </PageContainer>
    </SectionContainer>
  );
}
