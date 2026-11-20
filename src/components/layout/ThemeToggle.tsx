"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY as KEY } from "@/lib/boot-scripts";

type Theme = "dark" | "light";


function read(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function apply(next: Theme) {
  const html = document.documentElement;
  if (next === "light") html.dataset.theme = "light";
  else delete html.dataset.theme;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* private mode: the choice lasts for this page only */
  }
  listeners.forEach((l) => l());
}

function switchTo(next: Theme, from: HTMLElement) {
  const html = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!reduced && typeof doc.startViewTransition === "function") {
    // Grow the new theme as a circle from the switch itself.
    const r = from.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    html.style.setProperty("--theme-x", `${x}px`);
    html.style.setProperty("--theme-y", `${y}px`);
    html.style.setProperty("--theme-r", `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
    doc.startViewTransition(() => apply(next));
    return;
  }
  if (!reduced) {
    html.classList.add("theme-fade");
    window.setTimeout(() => html.classList.remove("theme-fade"), 500);
  }
  apply(next);
}

export function ThemeToggle({ labels, className = "" }: { labels: { light: string; dark: string }; className?: string }) {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);
  const next: Theme = theme === "light" ? "dark" : "light";
  const label = next === "light" ? labels.light : labels.dark;
  return (
    <button
      type="button"
      onClick={(e) => switchTo(next, e.currentTarget)}
      aria-label={label}
      title={label}
      className={`group relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-line text-ivory-muted transition-colors duration-300 hover:border-gold hover:text-gold-light ${className}`}
    >
      {/* Sun: shown in dark mode (switches to light) */}
      <svg aria-hidden viewBox="0 0 24 24" className={`absolute h-[18px] w-[18px] transition-all duration-500 ease-editorial ${theme === "dark" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-50 opacity-0"}`} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
      </svg>
      {/* Crescent: shown in light mode (switches to dark) */}
      <svg aria-hidden viewBox="0 0 24 24" className={`absolute h-[17px] w-[17px] transition-all duration-500 ease-editorial ${theme === "light" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"}`} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
        <path d="M20.2 14.6A8.5 8.5 0 0 1 9.4 3.8a8.5 8.5 0 1 0 10.8 10.8Z" />
      </svg>
    </button>
  );
}
