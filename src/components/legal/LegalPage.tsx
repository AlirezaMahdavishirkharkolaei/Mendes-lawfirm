import type { LegalDoc } from "@/content/legal";
import type { Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/misc";

export function LegalPage({ doc, locale, email, updatedLabel }: { doc: LegalDoc; locale: Locale; email: string; updatedLabel: string }) {
  const fillEmail = (s: string) => s.replaceAll("{email}", email || "—");
  return (
    <>
      <PageHero title={doc.title} lead={doc.intro} />
      <Container narrow className="pb-24">
        <p className="label mb-12">{updatedLabel}: {formatDate(`${doc.updated}T12:00:00Z`, locale)}</p>
        <div className="space-y-12">
          {doc.sections.map((s, i) => (
            <section key={s.h} className="border-t border-line pt-8">
              <h2 className="flex items-baseline gap-4 font-display text-h3 font-light text-gold-light">
                <span className="font-mono text-ui-sm text-ivory-muted" dir="ltr">{String(i + 1).padStart(2, "0")}</span>
                {s.h}
              </h2>
              <div className="mt-5 space-y-4 leading-relaxed text-ivory/85">
                {s.p.map((p, j) => <p key={j}>{fillEmail(p)}</p>)}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
