import { ButtonLink } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { Seal } from "@/components/ui/misc";
import { SplitWords } from "@/components/ui/SplitWords";
import { HeroParallax } from "./HeroParallax";
import { AskButton } from "./AskButton";

export function Hero({ eyebrow, headline, sub, primary, secondary, scroll }: { eyebrow: string; headline: string; sub: string; primary: { href: string; label: string }; secondary: string; scroll: string }) {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-28 pb-20">
      <HeroParallax>
        <div className="aurora absolute -inset-[20%] -z-10" aria-hidden />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(201,169,106,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(201,169,106,0.06)_1px,transparent_1px)] bg-[size:110px_110px] [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]" />
        <div data-depth="0.6" className="absolute -end-40 top-24 -z-10 hidden h-[560px] w-[560px] md:block lg:-end-20 xl:end-[1%]">
          <Seal className="absolute inset-0 h-full w-full opacity-40" bare />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mendes-crest.webp" alt="" aria-hidden className="crest-float absolute inset-0 m-auto h-[64%] opacity-80 drop-shadow-[0_0_40px_rgba(201,169,106,0.25)]" />
        </div>
      </HeroParallax>

      <div className="mx-auto w-full max-w-[var(--mendes-width-structural)] px-5 sm:px-8 lg:px-14">
        <p className="label fade-in flex items-center gap-3">
          <span aria-hidden className="draw-line inline-block h-px w-14 bg-gold" />
          {eyebrow}
        </p>
        <SplitWords text={headline} className="mt-8 max-w-4xl font-display text-display font-light tracking-[-0.02em] text-ivory" />
        <p className="fade-in mt-10 max-w-2xl text-lead text-ivory-muted [animation-delay:700ms]">{sub}</p>
        <div className="fade-in mt-12 flex flex-wrap items-center gap-5 [animation-delay:900ms]">
          <Magnetic>
            <ButtonLink href={primary.href} size="lg" arrow>
              {primary.label}
            </ButtonLink>
          </Magnetic>
          <AskButton label={secondary} />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-8 flex justify-center" aria-hidden>
        <div className="flex flex-col items-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ivory-muted">
          {scroll}
          <span className="relative h-14 w-px overflow-hidden bg-line">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_ease-in-out_infinite] bg-gold" />
          </span>
        </div>
      </div>
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
