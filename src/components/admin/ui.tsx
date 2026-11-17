import type { ReactNode } from "react";

export function AdminPage({ title, lead, actions, children }: { title: string; lead?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="fade-in">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <h1 className="font-display text-h2 font-light">{title}</h1>
          {lead && <p className="mt-2 max-w-2xl text-ui text-ivory-muted">{lead}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-start gap-3">{actions}</div>}
      </div>
      <div className="mt-10 space-y-10">{children}</div>
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[4px] border border-line bg-night-2/70 p-6 md:p-8 ${className}`}>
      {title && <h2 className="label mb-6">{title}</h2>}
      {children}
    </section>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: string }) {
  return (
    <div className="overflow-x-auto rounded-[4px] border border-line">
      <table className="w-full min-w-[640px] text-left text-ui">
        <thead className="bg-night-3/70">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-mono text-[0.62rem] font-normal uppercase tracking-[0.14em] text-ivory-muted">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {empty && <p className="px-4 py-8 text-center text-ivory-muted">{empty}</p>}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-[4px] border border-line bg-night-2/70 p-6">
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ivory-muted">{label}</p>
      <p className="mt-3 font-display text-5xl font-light text-gold-light [font-variant-numeric:lining-nums]">{value}</p>
      {hint && <p className="mt-2 text-ui-sm text-ivory-muted">{hint}</p>}
    </div>
  );
}

export const td = "px-4 py-3 align-top";
export const small = "rounded-[2px] border border-line px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.12em] text-ivory hover:border-gold hover:text-gold-light";
