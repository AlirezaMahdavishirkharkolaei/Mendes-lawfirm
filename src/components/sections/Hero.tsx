import { Button, Reveal, SectionLabel } from "@/components/ui";
import { PageContainer, SectionContainer } from "@/components/layout";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

/**
 * Homepage hero. Asymmetric 7/5 composition: text in the left 7 of 12
 * columns, deliberate whitespace in the right 5. No statistics block —
 * no figures are shown that the firm has not provided.
 */
export function Hero({ locale, t }: { locale: Locale; t: Dictionary }) {
  return (
    <SectionContainer className="pt-8 md:pt-12">
      <PageContainer>
        <Reveal>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-7">
              <SectionLabel as="p">{t.home.eyebrow}</SectionLabel>
              <h1 className="text-balance font-display text-display tracking-display text-ink">{t.home.headline}</h1>
              <p className="max-w-xl font-body text-lead text-ink-muted">{t.home.lead}</p>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
                <Button href={href(locale, "consultation")} variant="primary">
                  {t.home.ctaPrimary}
                </Button>
                <Button href={href(locale, "practice-areas")} variant="secondary">
                  {t.home.ctaSecondary}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </PageContainer>
    </SectionContainer>
  );
}
