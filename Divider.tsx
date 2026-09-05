interface DividerProps {
  /** Citation-style index, e.g. "01". Only pass this when the content is genuinely enumerable. */
  index?: string;
  label?: string;
  className?: string;
}

/**
 * Hairline divider. The § index + label pairing is a structural device
 * for genuinely enumerable content (Practice Areas, Insights) — pass
 * `index`/`label` only where that's true; a plain divider with neither
 * is just a hairline rule.
 */
export function Divider({ index, label, className = "" }: DividerProps) {
  const hasIndex = index !== undefined || label !== undefined;

  return (
    <div className={`flex items-center gap-4 ${className}`.trim()}>
      {hasIndex && (
        <span className="font-mono text-ui-sm tracking-mono uppercase text-ink-muted whitespace-nowrap">
          {index !== undefined ? `§ ${index}` : null}
          {index !== undefined && label ? " — " : null}
          {label}
        </span>
      )}
      <hr className="flex-1 border-t border-border" />
    </div>
  );
}
