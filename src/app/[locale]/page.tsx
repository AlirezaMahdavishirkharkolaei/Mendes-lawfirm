import Link from "next/link";
import { pageContext } from "@/lib/site";
import { listTeam } from "@/lib/data/team";
import { listLaws } from "@/lib/data/laws";
import { listArticles } from "@/lib/data/articles";
import { pick } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/format";
import { plainExcerpt, readingMinutes } from "@/lib/markdown";
import { TOPIC_KEYS, topicLabel } from "@/lib/topics";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { ArticleCard, LawCard, TeamCard } from "@/components/sections/cards";
import { FeatureIcon } from "@/components/sections/FeatureIcon";
import { Reveal } from "@/components/ui/Reveal";
import { Spotlight } from "@/components/ui/Spotlight";
import { ButtonLink } from "@/components/ui/Button";
import { Container, SectionHeading, Seal } from "@/components/ui/misc";

// Same for every visitor: served from the edge cache, refreshed in the background.
export const revalidate = 120;

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, d, l } = await pageContext(params);
  const [team, laws, articles] = await Promise.all([listTeam(), listLaws(), listArticles({ status: "published", limit: 3 })]);
  const features = (["booking", "ai", "portal", "laws"] as const).map((k) => ({ key: k, ...d.home.features[k] }));
  const featureHref = { booking: l("/booking"), ai: l("/practice"), portal: l("/portal"), laws: l("/laws") };

  return (
    <>
      <Hero
        eyebrow={d.home.eyebrow}
        headline={d.home.headline}
        sub={d.home.sub}
        primary={{ href: l("/booking"), label: d.home.ctaPrimary }}
        secondary={d.home.ctaSecondary}
        scroll={d.home.scroll}
      />

      <Marquee items={TOPIC_KEYS.map((k) => topicLabel(k, locale))} />

      {/* Platform features */}
      <section className="py-32">
        <Container>
          <Reveal>
            <SectionHeading label={d.home.platformLabel} title={d.home.platformTitle} />
          </Reveal>
          <div className="mt-20 grid gap-px overflow-hidden rounded-[4px] border border-line bg-line md:grid-cols-2">
            {features.map((f, i) => (
              <Reveal key={f.key} index={i} className="h-full">
                <Spotlight className="group h-full bg-night">
                  <Link href={featureHref[f.key]} className="flex h-full flex-col gap-6 p-10 lg:p-14">
                    <div className="flex items-center justify-between">
                      <FeatureIcon name={f.key} />
                      <span className="font-mono text-[0.65rem] text-ivory-muted" dir="ltr">0{i + 1}</span>
                    </div>
                    <h3 className="font-display text-h3 font-light text-ivory transition-colors group-hover:text-gold-light">{f.title}</h3>
                    <p className="max-w-md text-ivory-muted">{f.body}</p>
                    <span className="mt-auto inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-gold opacity-0 transition-all duration-500 group-hover:opacity-100">
                      {d.common.learnMore} <span className="rtl:-scale-x-100">→</span>
                    </span>
                  </Link>
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Philosophy — ivory editorial band */}
      <section className="relative overflow-hidden bg-paper py-32 text-ink">
        <Seal className="pointer-events-none absolute -start-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 opacity-[0.12]" />
        <Container narrow className="relative">
          <Reveal effect="clip">
            <blockquote className="font-display text-[clamp(1.9rem,1.3rem+2.4vw,3.4rem)] font-light italic leading-[1.2] text-ink">
              <span className="text-gold-deep">“</span>
              {d.home.philosophyQuote}
              <span className="text-gold-deep">”</span>
            </blockquote>
          </Reveal>
          <p className="mt-10 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-gold-deep">— Mendes</p>
        </Container>
      </section>

      {/* Team */}
      <section className="py-32">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <Reveal>
              <SectionHeading label={d.home.teamLabel} title={d.home.teamTitle} />
            </Reveal>
            <ButtonLink href={l("/team")} variant="outline" arrow>{d.common.viewAll}</ButtonLink>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {team.slice(0, 3).map((m, i) => (
              <Reveal key={m.id} index={i} className="h-full">
                <TeamCard name={m.name} position={pick(m.position, locale)} specialties={m.specialties.map((s) => topicLabel(s, locale))} href={`${l("/team")}#${m.slug}`} photoUrl={m.photoUrl} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Laws */}
      <section className="relative border-y border-line bg-night-2 py-32">
        <div className="aurora pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <Container className="relative">
          <div className="flex flex-wrap items-end justify-between gap-8">
            <Reveal>
              <SectionHeading label={d.home.lawsLabel} title={d.home.lawsTitle} sub={d.home.lawsSub} />
            </Reveal>
            <ButtonLink href={l("/laws")} variant="outline" arrow>{d.common.viewAll}</ButtonLink>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {laws.slice(0, 6).map((law, i) => (
              <Reveal key={law.id} index={i % 3} className="h-full">
                <LawCard
                  index={i}
                  href={l(`/laws/${law.slug}`)}
                  reference={law.reference}
                  title={pick(law.title, locale)}
                  summary={law.summary[locale]}
                  category={d.laws.categories[law.category as keyof typeof d.laws.categories] ?? law.category}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Insights + students */}
      <section className="py-32">
        <Container>
          <div className="grid gap-20 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Reveal>
                <SectionHeading label={d.home.insightsLabel} title={d.home.insightsTitle} sub={d.home.insightsSub} />
              </Reveal>
              <div className="mt-14 grid gap-10 md:grid-cols-2">
                {articles.length === 0 && <p className="text-ivory-muted">{d.insights.empty}</p>}
                {articles.map((a, i) => (
                  <Reveal key={a.id} index={i}>
                    <ArticleCard
                      href={l(`/insights/${a.slug}`)}
                      title={a.title}
                      excerpt={plainExcerpt(a.abstract)}
                      author={a.author_name}
                      date={formatDate(a.published_at, locale)}
                      minutes={readingMinutes(a.body)}
                      minutesLabel={d.insights.readTime}
                      student={a.author_role === "author" ? d.insights.student : undefined}
                    />
                  </Reveal>
                ))}
              </div>
            </div>
            <Reveal className="lg:col-span-4" effect="scale">
              <div className="sticky top-28 overflow-hidden rounded-[4px] border border-gold/40 bg-gradient-to-br from-gold/[0.14] via-night-2 to-night p-10">
                <Seal className="absolute -end-16 -top-16 h-56 w-56 opacity-30" />
                <p className="label relative">LL.B · LL.M · PhD</p>
                <h3 className="relative mt-6 font-display text-[2.1rem] font-light leading-tight">{d.home.studentsTitle}</h3>
                <p className="relative mt-5 text-ivory-muted">{d.home.studentsSub}</p>
                <ButtonLink href={l("/insights/submit")} className="relative mt-10" arrow>{d.home.studentsCta}</ButtonLink>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Consultation */}
      <section className="relative isolate overflow-hidden py-36">
        <div className="aurora absolute inset-0 -z-10" aria-hidden />
        <Container narrow className="text-center">
          <Reveal effect="clip">
            <h2 className="font-display text-h1 font-light">
              <span className="gold-text">{d.home.ctaTitle}</span>
            </h2>
          </Reveal>
          <p className="mx-auto mt-8 max-w-xl text-lead text-ivory-muted">{d.home.ctaSub}</p>
          <div className="mt-12 flex justify-center">
            <ButtonLink href={l("/booking")} size="lg" arrow>{d.home.ctaPrimary}</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
