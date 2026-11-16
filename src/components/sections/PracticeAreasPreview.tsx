import { Button } from "@/components/ui";
import { PageContainer, SectionContainer } from "@/components/layout";
import { PracticeAreasIndex } from "./PracticeAreasIndex";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

export function PracticeAreasPreview({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <SectionContainer className="border-t border-border">
      <PageContainer className="flex flex-col gap-10">
        <h2 id="practice-areas" className="font-display text-h2 tracking-heading text-ink">
          {t.home.practiceTitle}
        </h2>
        <PracticeAreasIndex locale={locale} />
        <Button href={href(locale, "practice-areas")} variant="secondary" className="self-start">
          {t.home.practiceAll}
        </Button>
      </PageContainer>
    </SectionContainer>
  );
}
