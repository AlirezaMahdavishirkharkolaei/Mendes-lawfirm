import { Reveal } from "@/components/ui";
import { PageContainer, SectionContainer } from "@/components/layout";
import type { Dictionary } from "@/i18n/dictionaries/en";

/** The firm works in three languages; said once, plainly. */
export function LanguagesBand({ t }: { t: Dictionary }) {
  return (
    <SectionContainer className="border-t border-border bg-surface-alt">
      <PageContainer>
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12">
            <h2 className="font-display text-h2 tracking-heading text-ink lg:col-span-5">{t.home.languagesTitle}</h2>
            <div className="flex flex-col gap-6 lg:col-span-7">
              <p className="font-body text-lead text-ink-muted">{t.home.languagesText}</p>
              <p className="font-mono text-ui tracking-mono text-accent" dir="ltr">
                English · Türkçe · فارسی
              </p>
            </div>
          </div>
        </Reveal>
      </PageContainer>
    </SectionContainer>
  );
}
