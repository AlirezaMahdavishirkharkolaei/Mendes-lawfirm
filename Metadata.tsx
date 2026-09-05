interface MetadataProps {
  /** Ordered parts, e.g. ["2026.01.12", "6 min read", "Corporate & M&A"] */
  parts: string[];
  className?: string;
}

/**
 * Docket/citation-style metadata row — e.g. an Insight article's date,
 * read time, and practice area, rendered as
 * "2026.01.12 — 6 min read — Corporate & M&A".
 */
export function Metadata({ parts, className = "" }: MetadataProps) {
  return (
    <p
      className={`font-mono text-ui-sm tracking-mono uppercase text-ink-muted ${className}`.trim()}
    >
      {parts.join(" — ")}
    </p>
  );
}
