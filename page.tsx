import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Philosophy } from "@/components/sections/Philosophy";
import { PracticeAreasPreview } from "@/components/sections/PracticeAreasPreview";
import { AttorneysPreview } from "@/components/sections/AttorneysPreview";
import { InsightsPreview } from "@/components/sections/InsightsPreview";
import { ConsultationCTA } from "@/components/sections/ConsultationCTA";

/**
 * Homepage metadata.
 *
 * The description deliberately does not name specific practice areas —
 * the current practice-area content is placeholder/demonstration data
 * (see src/content/practice-areas.ts), and publishing placeholder
 * service names in real search-engine-facing metadata would risk
 * misrepresenting them as final, live offerings. Replace once real
 * practice-area copy is approved. No statistics, awards, or other
 * factual claims are included, per the placeholder-content policy.
 */
const title = "Mendes | International Law Firm";
const description =
  "Mendes is an international law firm. Request a consultation to discuss your matter.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
  },
};

/**
 * Mendes homepage. Section order per the approved Phase 4 brief: Hero,
 * Philosophy, Practice Areas, Attorneys, Insights, Consultation. Header
 * and Footer are provided by (marketing)/layout.tsx and are not
 * duplicated here.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Philosophy />
      <PracticeAreasPreview />
      <AttorneysPreview />
      <InsightsPreview />
      <ConsultationCTA />
    </>
  );
}
