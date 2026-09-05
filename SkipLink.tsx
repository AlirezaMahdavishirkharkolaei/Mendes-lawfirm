interface SkipLinkProps {
  /** id of the main content landmark to jump to, without the "#". */
  targetId: string;
}

/**
 * Skip-to-content link. Visually hidden until it receives keyboard
 * focus (first Tab stop on the page), per WCAG bypass-blocks guidance.
 * Must be the first focusable element in the document.
 */
export function SkipLink({ targetId }: SkipLinkProps) {
  return (
    <a href={`#${targetId}`} className="sr-only-until-focus">
      Skip to main content
    </a>
  );
}
