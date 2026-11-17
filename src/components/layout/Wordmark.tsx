import Link from "next/link";

interface WordmarkProps {
  className?: string;
  /** Render on a dark surface (e.g. the footer) instead of the default light surface. */
  onDark?: boolean;
}

/**
 * Text-based wordmark. Deliberately simple — no logotype or mark yet.
 * A final logo can replace this component's internals later without
 * changing how Header/Footer consume it.
 */
export function Wordmark({ className = "", onDark = false }: WordmarkProps) {
  return (
    <Link
      href="/"
      aria-label="Mendes — home"
      className={`font-display text-h3 tracking-display ${
        onDark ? "text-ink-dark" : "text-ink"
      } ${className}`.trim()}
    >
      Mendes
    </Link>
  );
}
