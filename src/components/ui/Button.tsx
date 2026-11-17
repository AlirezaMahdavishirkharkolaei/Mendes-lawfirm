import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

interface BaseProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const base =
  "inline-flex items-center justify-center gap-2 font-body text-ui font-medium " +
  "transition-colors duration-[175ms] ease-editorial " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  // Thin outlined rectangle, accent border + text, solid accent fill on hover.
  primary:
    "rounded-button border border-accent text-accent px-6 py-3 " +
    "hover:bg-accent hover:text-surface hover:border-accent-hover",
  // Text-based, underline interaction, no border/background at all.
  secondary:
    "text-ink underline underline-offset-4 decoration-border " +
    "hover:decoration-accent hover:text-accent px-0 py-0",
};

/**
 * Mendes button primitive. Renders a <button> by default, or an <a>
 * when given an `href` — same visual language either way. No pill
 * shapes; primary uses the approved ~3px outlined rectangle, secondary
 * is text + underline.
 */
export function Button({
  variant = "primary",
  children,
  className = "",
  href,
  ...props
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`.trim();

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
