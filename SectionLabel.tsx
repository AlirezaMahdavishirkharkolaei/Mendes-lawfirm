import type { ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "h2" | "h3";
}

/**
 * Standalone mono eyebrow/kicker label — e.g. sitting above a display
 * headline. Distinct from Divider's § index pairing: this is a
 * free-standing label, not attached to a hairline rule.
 */
export function SectionLabel({
  children,
  className = "",
  as = "p",
}: SectionLabelProps) {
  const Component = as;
  return (
    <Component
      className={`font-mono text-ui-sm tracking-mono uppercase text-ink-muted ${className}`.trim()}
    >
      {children}
    </Component>
  );
}
