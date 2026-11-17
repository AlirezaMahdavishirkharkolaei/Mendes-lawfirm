import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "gold" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-3 font-body font-medium uppercase tracking-[0.16em] " +
  "transition-all duration-300 ease-editorial disabled:opacity-40 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  gold:
    "btn-sheen bg-gradient-to-br from-gold-light via-gold to-gold-deep text-night border border-gold " +
    "shadow-[0_10px_40px_-12px_rgba(201,169,106,0.55)] hover:shadow-[0_18px_50px_-10px_rgba(201,169,106,0.7)] hover:-translate-y-0.5",
  outline: "border border-line-strong text-ivory hover:border-gold hover:text-gold-light hover:bg-gold/5",
  ghost: "text-ivory-muted hover:text-gold-light px-0",
  danger: "border border-danger/60 text-danger hover:bg-danger/10",
};

const sizes: Record<Size, string> = {
  sm: "text-[0.6875rem] px-4 py-2.5 rounded-[2px]",
  md: "text-[0.75rem] px-6 py-3.5 rounded-[2px]",
  lg: "text-[0.8125rem] px-8 py-4.5 rounded-[2px]",
};

interface Common {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  arrow?: boolean;
}

function Arrow() {
  return (
    <svg aria-hidden width="18" height="10" viewBox="0 0 18 10" className="transition-transform duration-500 ease-editorial group-hover/btn:translate-x-1 rtl:-scale-x-100 rtl:group-hover/btn:-translate-x-1">
      <path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function Button({ variant = "gold", size = "md", className = "", children, arrow, ...props }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}

export function ButtonLink({ variant = "gold", size = "md", className = "", children, arrow, href, ...props }: Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (/^(https?:|mailto:|tel:)/.test(href)) {
    return (
      <a href={href} className={cls} {...props}>
        {children}
        {arrow && <Arrow />}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...props}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}
