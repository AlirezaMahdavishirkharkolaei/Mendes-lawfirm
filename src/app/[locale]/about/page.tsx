import type { Metadata } from "next";
import { pageContext } from "@/lib/site";
import { PageHero } from "@/components/sections/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Container, Seal } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/Button";

// Same for every visitor: served from the edge cache, refreshed in the background.
export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { d } = await pageContext(params);
  return { title: d.about.title, description: d.about.lead };
}

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { d, l } = await pageContext(params);
  return (
    <>
      <PageHero label={d.nav.about} title={d.about.title} lead={d.about.lead} />
      <Container className="grid gap-16 pb-24 lg:grid-cols-12">
        <div className="space-y-8 text-lead leading-relaxed text-ivory/85 lg:col-span-7">
          <Reveal><p>{d.about.p1}</p></Reveal>
          <Reveal index={1}><p>{d.about.p2}</p></Reveal>
          <Reveal index={2}><ButtonLink href={l("/booking")} arrow>{d.home.ctaPrimary}</ButtonLink></Reveal>
        </div>
        <Reveal className="lg:col-span-5" effect="scale">
          <Seal className="mx-auto h-80 w-80 opacity-90" />
        </Reveal>
      </Container>
      <section className="bg-paper py-28 text-ink">
        <Container>
          <h2 className="font-display text-h2 font-light">{d.about.valuesTitle}</h2>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {d.about.values.map((v, i) => (
              <Reveal key={v.title} index={i}>
                <p className="font-mono text-[0.7rem] text-gold-deep" dir="ltr">0{i + 1}</p>
                <h3 className="mt-4 font-display text-3xl font-light">{v.title}</h3>
                <div className="my-6 h-px w-16 bg-gold-deep" />
                <p className="leading-relaxed text-ink-muted">{v.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
