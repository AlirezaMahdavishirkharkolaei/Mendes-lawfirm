import Link from "next/link";
import { Spotlight } from "@/components/ui/Spotlight";
import { Badge } from "@/components/ui/misc";

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((part) => part && !part.endsWith(".")) // skip titles like "Av." / "Dr."
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function TeamCard({ name, position, specialties, href, photoUrl, lead }: { name: string; position: string; specialties: string[]; href: string; photoUrl?: string | null; lead?: boolean }) {
  return (
    <Spotlight className="group h-full rounded-[4px] border border-line bg-night-2/70 p-8 transition-colors duration-500 hover:border-gold/50">
      <Link href={href} className="flex h-full flex-col">
        <div className="relative mb-8 aspect-[4/5] overflow-hidden rounded-[3px] bg-gradient-to-br from-night-3 to-night">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-full w-full object-cover grayscale transition-all duration-1000 ease-editorial group-hover:scale-105 group-hover:grayscale-0" />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <span className="font-display text-8xl font-light italic text-gold/70 transition-transform duration-1000 ease-editorial group-hover:scale-110" dir="ltr">{initials(name)}</span>
            </div>
          )}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
          {lead && <span className="absolute start-4 top-4"><Badge>AI referral lead</Badge></span>}
        </div>
        <h3 className="font-display text-h3 font-light text-ivory transition-colors group-hover:text-gold-light">{name}</h3>
        <p className="mt-2 text-ui leading-relaxed text-ivory-muted">{position}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          {specialties.slice(0, 4).map((s) => (
            <span key={s} className="rounded-full border border-line px-2.5 py-1 text-[0.68rem] text-ivory-muted">{s}</span>
          ))}
        </div>
      </Link>
    </Spotlight>
  );
}

export function LawCard({ href, reference, title, summary, category, index }: { href: string; reference: string; title: string; summary?: string; category: string; index: number }) {
  return (
    <Spotlight className="group h-full rounded-[4px] border border-line bg-night-2/60 transition-all duration-500 hover:-translate-y-1 hover:border-gold/50">
      <Link href={href} className="flex h-full flex-col p-7">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-gold" dir="ltr">{reference}</span>
          <span className="font-mono text-[0.65rem] text-ivory-muted/60" dir="ltr">{String(index + 1).padStart(2, "0")}</span>
        </div>
        <h3 className="mt-6 font-display text-2xl font-light leading-snug text-ivory group-hover:text-gold-light">{title}</h3>
        {summary && <p className="mt-3 line-clamp-3 text-ui leading-relaxed text-ivory-muted">{summary}</p>}
        <span className="mt-auto pt-6 text-[0.68rem] uppercase tracking-[0.16em] text-ivory-muted">{category}</span>
      </Link>
    </Spotlight>
  );
}

export function ArticleCard({ href, title, excerpt, author, date, minutes, minutesLabel, student }: { href: string; title: string; excerpt: string; author: string; date: string; minutes: number; minutesLabel: string; student?: string }) {
  return (
    <article className="group relative flex h-full flex-col border-t border-line pt-8">
      <span aria-hidden className="absolute -top-px start-0 h-px w-0 bg-gold transition-all duration-700 ease-editorial group-hover:w-full" />
      <div className="flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ivory-muted">
        <span>{date}</span>
        <span aria-hidden>·</span>
        <span>{minutes} {minutesLabel}</span>
        {student && <Badge tone="muted">{student}</Badge>}
      </div>
      <h3 className="mt-5 font-display text-[1.75rem] font-light leading-tight text-ivory transition-colors group-hover:text-gold-light">
        <Link href={href} className="after:absolute after:inset-0">{title}</Link>
      </h3>
      <p className="mt-4 line-clamp-3 text-ui leading-relaxed text-ivory-muted">{excerpt}</p>
      <p className="mt-auto pt-6 text-ui-sm text-ivory/80">{author}</p>
    </article>
  );
}
