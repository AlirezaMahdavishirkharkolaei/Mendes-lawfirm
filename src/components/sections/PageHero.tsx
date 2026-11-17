import type { ReactNode } from "react";
import { SplitWords } from "@/components/ui/SplitWords";
import { Container } from "@/components/ui/misc";

export function PageHero({ label, title, lead, children }: { label?: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden pb-16 pt-40 md:pb-24 md:pt-48">
      <div className="aurora absolute -inset-[30%] -z-10 opacity-70" aria-hidden />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(201,169,106,0.05)_1px,transparent_1px)] bg-[size:110px_100%] [mask-image:linear-gradient(to_bottom,#000,transparent)]" />
      <Container>
        {label && (
          <p className="label fade-in flex items-center gap-3">
            <span aria-hidden className="draw-line inline-block h-px w-12 bg-gold" />
            {label}
          </p>
        )}
        <SplitWords text={title} className="mt-6 max-w-4xl font-display text-h1 font-light" />
        {lead && <p className="fade-in mt-8 max-w-2xl text-lead text-ivory-muted [animation-delay:500ms]">{lead}</p>}
        {children && <div className="fade-in mt-10 [animation-delay:650ms]">{children}</div>}
      </Container>
    </section>
  );
}
