import type { Metadata } from "next";
import Link from "next/link";
import { pageContext } from "@/lib/site";
import { listTeam } from "@/lib/data/team";
import { TOPIC_KEYS, topicLabel } from "@/lib/topics";
import { PageHero } from "@/components/sections/PageHero";
import { AskButton } from "@/components/sections/AskButton";
import { Reveal } from "@/components/ui/Reveal";
import { Spotlight } from "@/components/ui/Spotlight";
import { Container } from "@/components/ui/misc";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { d } = await pageContext(params);
  return { title: d.practice.title, description: d.practice.lead };
}

export default async function Practice({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, d, l } = await pageContext(params);
  const team = await listTeam();
  return (
    <>
      <PageHero label={d.nav.practice} title={d.practice.title} lead={d.practice.lead}>
        <AskButton label={d.practice.ask} />
      </PageHero>
      <Container className="pb-24">
        <ul className="grid gap-px overflow-hidden rounded-[4px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {TOPIC_KEYS.map((key, i) => {
            const members = team.filter((m) => m.specialties.includes(key));
            const lead = members.find((m) => m.isReferralLead) ?? members[0];
            return (
              <Reveal as="li" key={key} index={i % 3} className="h-full">
                <Spotlight className="group flex h-full flex-col bg-night p-9">
                  <span className="font-mono text-[0.65rem] text-ivory-muted" dir="ltr">§ {String(i + 1).padStart(2, "0")}</span>
                  <h2 className="mt-6 font-display text-[1.9rem] font-light leading-tight transition-colors group-hover:text-gold-light">{topicLabel(key, locale)}</h2>
                  {lead && <p className="mt-3 text-ui text-ivory-muted">{lead.name}</p>}
                  <div className="mt-auto flex flex-wrap gap-5 pt-8 font-mono text-[0.65rem] uppercase tracking-[0.16em]">
                    <Link href={`${l("/booking")}?topic=${key}`} className="link-grow text-gold">{d.practice.book} →</Link>
                    {lead && <Link href={`${l("/team")}#${lead.slug}`} className="link-grow text-ivory-muted hover:text-ivory">{d.nav.team}</Link>}
                  </div>
                </Spotlight>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </>
  );
}
