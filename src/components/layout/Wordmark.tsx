import Link from "next/link";

export function Wordmark({ locale, compact = false }: { locale: string; compact?: boolean }) {
  return (
    <Link href={`/${locale}`} className="group flex items-center gap-3" aria-label="Mendes — home">
      <span aria-hidden className="relative grid h-10 w-10 place-items-center rounded-full border border-gold/50 transition-all duration-700 ease-editorial group-hover:rotate-[360deg] group-hover:border-gold">
        <span className="font-display text-2xl italic leading-none text-gold">§</span>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none" dir="ltr">
          <span className="font-display text-[1.45rem] font-normal uppercase tracking-[0.34em] text-ivory">Mendes</span>
          <span className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.36em] text-ivory-muted">Law · Consultancy</span>
        </span>
      )}
    </Link>
  );
}
