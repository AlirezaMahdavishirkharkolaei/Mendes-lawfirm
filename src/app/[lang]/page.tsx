import { Hero } from "@/components/sections/Hero";
import { Philosophy } from "@/components/sections/Philosophy";
import { PracticeAreasPreview } from "@/components/sections/PracticeAreasPreview";
import { LanguagesBand } from "@/components/sections/LanguagesBand";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";
import { getDictionary, resolveLocale } from "@/i18n/get";
import { firm } from "@/content/firm";
import { practiceAreas } from "@/content/practice-areas";

/** Homepage: Hero, Philosophy, Practice areas, Languages, Consultation. */
export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const locale = await resolveLocale(params);
  const t = getDictionary(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: firm.legalName,
    url: `${firm.siteUrl}/${locale}/`,
    email: firm.email,
    ...(firm.phone && { telephone: firm.phone }),
    ...(firm.address && {
      address: { "@type": "PostalAddress", streetAddress: firm.address.street, addressLocality: firm.address.city, addressCountry: "CY" },
    }),
    areaServed: "Northern Cyprus",
    availableLanguage: ["English", "Turkish", "Persian"],
    knowsAbout: practiceAreas.map((a) => a.title.en),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero locale={locale} t={t} />
      <Philosophy quote={t.home.philosophy} />
      <PracticeAreasPreview locale={locale} t={t} />
      <LanguagesBand t={t} />
      <ConsultationCTA locale={locale} t={t} />
    </>
  );
}
