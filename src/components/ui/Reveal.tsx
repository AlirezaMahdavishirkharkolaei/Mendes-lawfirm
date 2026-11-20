"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Scroll-reveal wrapper. Content is fully visible without JavaScript; the
 * hidden pre-state is only applied after mount, when the user hasn't
 * asked for reduced motion. `effect` picks the entrance style.
 */
export function Reveal({
  children,
  index = 0,
  className = "",
  as: Tag = "div",
  effect = "fade",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  as?: ElementType;
  effect?: "fade" | "clip" | "scale";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
      // Already on screen at mount: still animate, but quickly.
      el.style.transitionDelay = `${index * 90}ms`;
    }
    el.classList.add("reveal");
    el.dataset.effect = effect;
    el.dataset.visible = "false";
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          el.style.transitionDelay = `${index * 90}ms`;
          requestAnimationFrame(() => (el.dataset.visible = "true"));
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    // Chrome counts the element's own clip-path when computing intersection, so a
    // fully clipped element would never be "seen": watch its parent instead.
    io.observe(effect === "clip" && el.parentElement ? el.parentElement : el);
    return () => io.disconnect();
  }, [index, effect]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
