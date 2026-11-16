"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion, staggerDelay } from "@/lib/motion";

export interface RevealProps {
  children: ReactNode;
  /** Position in a staggered group (0-based). Adds staggerStepMs * index of delay. */
  index?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}

/**
 * Wraps content in the default Mendes scroll-reveal animation.
 *
 * Progressive enhancement contract: content renders fully visible by
 * default — no `.reveal` class, no `data-visible` attribute — so it is
 * completely usable with JavaScript disabled or before hydration. Only
 * inside the effect, and only when JS is available and the user hasn't
 * requested reduced motion, does this component opt the element into
 * the hidden-then-reveal sequence.
 *
 * This is done via direct DOM manipulation (classList/setAttribute)
 * rather than React state: the element must render in a genuinely
 * separate "hidden" paint before the "visible" one for the CSS
 * transition in globals.css to have something to animate from, and
 * driving that through state would mean a synchronous setState call in
 * the effect body — the two states would risk collapsing into a single
 * render instead of two, causing the reveal to be skipped outright.
 */
export function Reveal({
  children,
  index = 0,
  className = "",
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (typeof IntersectionObserver === "undefined") return;

    const el = ref.current;
    if (!el) return;

    el.classList.add("reveal");
    el.setAttribute("data-visible", "false");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const delay = staggerDelay(index);
            window.setTimeout(() => {
              el.setAttribute("data-visible", "true");
            }, delay);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  const Component = as;

  return (
    <Component
      // @ts-expect-error -- ref type varies with the polymorphic `as` element
      ref={ref}
      className={className}
    >
      {children}
    </Component>
  );
}
