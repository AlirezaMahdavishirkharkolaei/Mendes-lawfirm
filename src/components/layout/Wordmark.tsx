import Link from "next/link";

export function Wordmark({ locale, compact = false }: { locale: string; compact?: boolean }) {
  return (
    <Link href={`/${locale}`} className="group flex items-center gap-3" aria-label="Mendes — home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/mendes-crest-sm.webp" alt="" aria-hidden width={36} height={44} className="h-11 w-9 object-contain drop-shadow-[0_0_10px_rgba(201,169,106,0.25)] transition-transform duration-700 ease-editorial group-hover:scale-110" />
      {!compact && (
        <span className="flex flex-col leading-none" dir="ltr">
          <span className="font-display text-[1.45rem] font-normal uppercase tracking-[0.34em] text-ivory">Mendes</span>
          <span className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.36em] text-ivory-muted">Law · Consultancy</span>
        </span>
      )}
    </Link>
  );
}
