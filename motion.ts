/**
 * Motion constants for Mendes, mirroring the values defined in
 * src/styles/tokens.css. These are the JS-side counterparts needed for
 * things CSS alone can't express — e.g. computing a per-item stagger
 * delay in a list. The canonical values live in tokens.css; keep these
 * in sync with it if either changes.
 */
export const motion = {
  durationRevealMs: 450,
  durationHoverMs: 175,
  staggerStepMs: 70,
  revealDistancePx: 12,
  easeEditorial: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

/**
 * Computes the transition-delay (ms) for the nth item in a staggered
 * reveal sequence.
 */
export function staggerDelay(index: number): number {
  return index * motion.staggerStepMs;
}

/**
 * True if the user has requested reduced motion. Safe to call during
 * render on the client only (guards for the absence of `window` so it
 * doesn't throw during SSR).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
