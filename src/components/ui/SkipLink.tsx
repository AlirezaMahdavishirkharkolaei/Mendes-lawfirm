interface SkipLinkProps {
  /** id of the main content landmark to jump to, without the "#". */
  targetId: string;
  label: string;
}

/**
 * Skip-to-content link. Visually hidden until it receives keyboard
 * focus (first Tab stop on the page), per WCAG bypass-blocks guidance.
 */
export function SkipLink({ targetId, label }: SkipLinkProps) {
  return (
    <a href={`#${targetId}`} className="sr-only-until-focus">
      {label}
    </a>
  );
}
