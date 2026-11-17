"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Moves [data-depth] layers with the pointer and scroll — subtle depth. */
export function HeroParallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let px = 0, py = 0, sy = 0, raf = 0;
    const apply = () => {
      raf = 0;
      root.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => {
        const d = Number(el.dataset.depth) || 0.3;
        el.style.transform = `translate3d(${px * d * 30}px, ${py * d * 30 + sy * d * 0.25}px, 0)`;
      });
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };
    const onMove = (e: PointerEvent) => { px = e.clientX / window.innerWidth - 0.5; py = e.clientY / window.innerHeight - 0.5; queue(); };
    const onScroll = () => { sy = window.scrollY; queue(); };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="pointer-events-none absolute inset-0 -z-10">{children}</div>;
}
