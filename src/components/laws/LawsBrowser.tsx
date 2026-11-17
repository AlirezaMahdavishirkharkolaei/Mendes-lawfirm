"use client";

import { useMemo, useState } from "react";
import { LawCard } from "@/components/sections/cards";

export interface LawItem {
  slug: string;
  href: string;
  reference: string;
  title: string;
  summary?: string;
  category: string;
  categoryLabel: string;
}

export function LawsBrowser({ laws, placeholder, allLabel }: { laws: LawItem[]; placeholder: string; allLabel: string }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const categories = useMemo(() => Array.from(new Map(laws.map((l) => [l.category, l.categoryLabel])).entries()), [laws]);
  const shown = laws.filter((l) => (!cat || l.category === cat) && (!q || `${l.title} ${l.reference} ${l.summary ?? ""}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {[[null, allLabel] as const, ...categories].map(([key, label]) => (
            <button key={key ?? "all"} type="button" onClick={() => setCat(key)} className={`rounded-full border px-4 py-2 text-ui-sm transition-all duration-300 ${cat === key ? "border-gold bg-gold/15 text-gold-light" : "border-line text-ivory-muted hover:border-gold/50 hover:text-ivory"}`}>
              {label}
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:w-80">
          <span className="sr-only">{placeholder}</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="w-full rounded-full border border-line bg-night-3/60 py-3 pe-5 ps-11 text-ui text-ivory placeholder:text-ivory-muted/60 focus:border-gold focus:outline-none" />
          <svg className="absolute start-4 top-1/2 -translate-y-1/2 text-gold" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
        </label>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((law, i) => (
          <div key={law.slug} className="fade-in h-full" style={{ animationDelay: `${Math.min(i, 9) * 40}ms` }}>
            <LawCard index={i} href={law.href} reference={law.reference} title={law.title} summary={law.summary} category={law.categoryLabel} />
          </div>
        ))}
      </div>
    </div>
  );
}
