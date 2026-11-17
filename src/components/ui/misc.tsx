import type { ReactNode } from "react";

export function Container({ children, className = "", narrow = false }: { children: ReactNode; className?: string; narrow?: boolean }) {
  return <div className={`mx-auto w-full px-5 sm:px-8 lg:px-14 ${narrow ? "max-w-[var(--mendes-width-reading)]" : "max-w-[var(--mendes-width-structural)]"} ${className}`}>{children}</div>;
}

export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`label flex items-center gap-3 ${className}`}>
      <span aria-hidden className="inline-block h-px w-8 bg-gold" />
      {children}
    </p>
  );
}

export function SectionHeading({ label, title, sub, className = "", align = "start" }: { label?: string; title: string; sub?: string; className?: string; align?: "start" | "center" }) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center items-center" : ""} flex max-w-3xl flex-col gap-5 ${className}`}>
      {label && <Label className={align === "center" ? "justify-center" : ""}>{label}</Label>}
      <h2 className="font-display text-h2 font-light text-ivory">{title}</h2>
      {sub && <p className="text-lead text-ivory-muted">{sub}</p>}
    </div>
  );
}

export function Badge({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "muted" | "success" | "danger" | "warning" }) {
  const tones = {
    gold: "border-gold/40 text-gold-light bg-gold/10",
    muted: "border-line text-ivory-muted bg-night-3",
    success: "border-success/40 text-success bg-success/10",
    danger: "border-danger/40 text-danger bg-danger/10",
    warning: "border-warning/40 text-warning bg-warning/10",
  };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] ${tones[tone]}`}>{children}</span>;
}

export function Notice({ children, tone = "gold", className = "" }: { children: ReactNode; tone?: "gold" | "danger" | "success"; className?: string }) {
  const tones = {
    gold: "border-gold/30 bg-gold/[0.06] text-gold-light",
    danger: "border-danger/40 bg-danger/10 text-danger",
    success: "border-success/40 bg-success/10 text-success",
  };
  return <div role={tone === "danger" ? "alert" : "status"} className={`rounded-[3px] border px-4 py-3 text-ui leading-relaxed ${tones[tone]} ${className}`}>{children}</div>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[4px] border border-line bg-night-2/80 backdrop-blur-sm ${className}`}>{children}</div>;
}

export function Seal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden direction="ltr" style={{ direction: "ltr" }}>
      <defs>
        <path id="seal-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        <linearGradient id="seal-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8d5a8" />
          <stop offset="55%" stopColor="#c9a96a" />
          <stop offset="100%" stopColor="#8a6d3b" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="url(#seal-gold)" strokeWidth="0.6" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="url(#seal-gold)" strokeWidth="0.6" strokeDasharray="1 5" />
      <g className="orbit">
        <text fill="#c9a96a" fontSize="10.5" letterSpacing="5.4" fontFamily="IBM Plex Mono, monospace">
          <textPath href="#seal-circle">MENDES · LAW · CONSULTANCY · NORTH CYPRUS · </textPath>
        </text>
      </g>
      <text x="100" y="118" textAnchor="middle" fill="url(#seal-gold)" fontSize="58" fontFamily="Cormorant Garamond Variable, Georgia, serif" fontStyle="italic">§</text>
    </svg>
  );
}
