"use client";

import type { ElementType, PointerEvent, ReactNode } from "react";

/** Card with a soft gold light that follows the pointer. */
export function Spotlight({ children, className = "", as: Tag = "div" }: { children: ReactNode; className?: string; as?: ElementType }) {
  function move(e: PointerEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }
  return (
    <Tag onPointerMove={move} className={`spotlight ${className}`}>
      {children}
    </Tag>
  );
}
