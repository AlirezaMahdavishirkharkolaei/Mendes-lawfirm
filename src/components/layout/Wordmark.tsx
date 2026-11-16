import Link from "next/link";
import { href, type Locale } from "@/i18n/config";

interface WordmarkProps {
  locale: Locale;
  className?: string;
  /** Render on a dark surface (e.g. the footer) instead of the default light surface. */
  onDark?: boolean;
}

/**
 * Text-based wordmark. A final logo can replace this component's
 * internals later without changing how Header/Footer consume it.
 */
export function Wordmark({ locale, className = "", onDark = false }: WordmarkProps) {
  return (
    <Link
      href={href(locale)}
      aria-label="Mendes — home"
      dir="ltr"
      // The wordmark keeps the Latin display face on Persian pages too.
      style={{ fontFamily: '"Fraunces Variable", ui-serif, Georgia, serif' }}
      className={`font-display text-h3 tracking-display ${onDark ? "text-ink-dark" : "text-ink"} ${className}`.trim()}
    >
      Mendes
    </Link>
  );
}
