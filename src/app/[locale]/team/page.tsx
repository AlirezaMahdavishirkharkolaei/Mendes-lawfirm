import type { Metadata } from "next";
import { pageContext } from "@/lib/site";
import { listTeam } from "@/lib/data/team";
import { pick } from "@/lib/i18n/config";
import { topicLabel } from "@/lib/topics";
import { PageHero } from "@/components/sections/PageHero";
import { initials } from "@/components/sections/cards";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/misc";

// Same for every visitor: served from the edge cache, refreshed in the background.
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { d } = await pageContext(params);
  return { title: d.team.title, description: d.team.lead };
}

export default async function Team({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, d, l } = await pageContext(params);
  const team = await listTeam();
  return (
    <>
      <PageHero label={d.nav.team} title={d.team.title} lead={d.team.lead} />
      <Container className="space-y-6 pb-24">
        {team.map((m, i) => (
          <Reveal key={m.id} index={0}>
            <article id={m.slug} className="group grid scroll-mt-28 gap-10 rounded-[4px] border border-line bg-night-2/60 p-8 transition-colors duration-500 hover:border-gold/40 md:grid-cols-12 md:p-12">
              <div className="md:col-span-4">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-gradient-to-br from-night-3 to-night">
                  {m.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photoUrl} alt={m.name} className="h-full w-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0" />
                  ) : (
                    <div className="grid h-full place-items-center font-display text-9xl font-light italic text-gold/60" dir="ltr">{initials(m.name)}</div>
                  )}
                  <span className="absolute bottom-4 start-4 font-mono text-[0.6rem] text-ivory-muted" dir="ltr">{String(i + 1).padStart(2, "0")} / {String(team.length).padStart(2, "0")}</span>
                </div>
              </div>
              <div className="flex flex-col md:col-span-8">
                <h2 className="font-display text-h2 font-light">{m.name}</h2>
                <p className="mt-3 text-lead text-gold-light">{pick(m.position, locale)}</p>
                <p className="mt-8 max-w-2xl leading-relaxed text-ivory/80">{pick(m.biography, locale)}</p>
                <dl className="mt-10 grid gap-8 sm:grid-cols-2">
                  <div>
                    <dt className="label mb-3">{d.team.specialties}</dt>
                    <dd className="flex flex-wrap gap-2">
                      {m.specialties.map((s) => (
                        <span key={s} className="rounded-full border border-gold/30 bg-gold/[0.06] px-3 py-1 text-ui-sm text-gold-light">{topicLabel(s, locale)}</span>
                      ))}
                    </dd>
                  </div>
                  <div className="space-y-6">
                    {m.languages.length > 0 && (
                      <div><dt className="label mb-2">{d.team.languages}</dt><dd className="text-ui text-ivory/80">{m.languages.join(" · ")}</dd></div>
                    )}
                    {m.education.length > 0 && (
                      <div><dt className="label mb-2">{d.team.education}</dt><dd className="text-ui text-ivory/80">{m.education.join(" · ")}</dd></div>
                    )}
                    {(m.email || m.phone) && (
                      <div>
                        <dt className="label mb-2">{d.team.contact}</dt>
                        <dd className="space-y-1 text-ui">
                          {m.phone && <a href={`tel:${m.phone.replace(/\s/g, "")}`} className="link-grow block w-fit text-ivory/85 hover:text-gold-light" dir="ltr">{m.phone}</a>}
                          {m.email && <a href={`mailto:${m.email}`} className="link-grow block w-fit text-ivory/85 hover:text-gold-light">{m.email}</a>}
                        </dd>
                      </div>
                    )}
                  </div>
                </dl>
                <div className="mt-auto pt-10">
                  <ButtonLink href={`${l("/booking")}?topic=${m.specialties[0] ?? ""}`} variant="outline" arrow>{d.team.book}</ButtonLink>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </Container>
    </>
  );
}
