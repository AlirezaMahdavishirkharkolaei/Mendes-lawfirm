interface TagProps {
  children: string;
  className?: string;
}

/**
 * Bracketed mono tag, e.g. [Corporate & M&A]. Deliberately not a
 * filled pill badge — the brackets carry the "tag" meaning, keeping
 * the citation-mono language consistent instead of introducing a new
 * shape/color pattern.
 */
export function Tag({ children, className = "" }: TagProps) {
  return (
    <span
      className={`font-mono text-ui-sm tracking-mono text-ink-muted ${className}`.trim()}
    >
      [{children}]
    </span>
  );
}
