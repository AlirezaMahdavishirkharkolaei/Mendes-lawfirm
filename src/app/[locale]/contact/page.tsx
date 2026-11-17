import type { Metadata } from "next";
import { pageContext } from "@/lib/site";
import { PageHero } from "@/components/sections/PageHero";
import { AskButton } from "@/components/sections/AskButton";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/misc";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { d } = await pageContext(params);
  return { title: d.nav.contact };
}

export default async function Contact({ params }: { params: Promise<{ locale: string }> }) {
  const { d, settings, l } = await pageContext(params);
  const email = settings.boss_email?.split(",")[0]?.trim();
  return (
    <>
      <PageHero label={d.nav.contact} title={d.home.ctaTitle} lead={d.home.ctaSub}>
        <div className="flex flex-wrap gap-4">
          <ButtonLink href={l("/booking")} arrow>{d.nav.booking}</ButtonLink>
          <AskButton label={d.home.ctaSecondary} />
        </div>
      </PageHero>
      <Container className="grid gap-px overflow-hidden rounded-[4px] border border-line bg-line pb-0 md:grid-cols-3">
        {[
          [d.footer.office, settings.office_address],
          [d.common.phone, settings.office_phone],
          [d.common.email, email],
        ].map(([label, value], i) => (
          <Reveal key={label} index={i} className="bg-night p-10">
            <p className="label">{label}</p>
            <p className="mt-5 font-display text-2xl font-light" dir={i > 0 ? "ltr" : undefined}>{value || "—"}</p>
          </Reveal>
        ))}
      </Container>
    </>
  );
}
