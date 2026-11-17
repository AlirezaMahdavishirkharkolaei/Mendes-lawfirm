import type { ReactNode } from "react";
import { Container, Seal } from "@/components/ui/misc";

export function AuthShell({ title, lead, children, footer }: { title: string; lead?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden pb-24 pt-36">
      <div className="aurora absolute -inset-[20%] -z-10 opacity-70" aria-hidden />
      <Container className="grid items-center gap-16 lg:grid-cols-2">
        <div className="hidden lg:block">
          <Seal className="h-[420px] w-[420px] opacity-80" />
        </div>
        <div className="w-full max-w-lg rounded-[6px] border border-line bg-night-2/80 p-8 backdrop-blur-xl md:p-12">
          <h1 className="font-display text-h2 font-light">{title}</h1>
          {lead && <p className="mt-4 text-ivory-muted">{lead}</p>}
          <div className="mt-10">{children}</div>
          {footer && <div className="mt-10 border-t border-line pt-6 text-ui text-ivory-muted">{footer}</div>}
        </div>
      </Container>
    </section>
  );
}
