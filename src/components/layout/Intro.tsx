"use client";

import { useEffect, useRef, useState } from "react";

const KEY = "mendes_intro";
const DURATION = 3400; // ms until the curtains finish opening

/**
 * Opening sequence shown once per browser session: a gold glow, the
 * crest resolving out of blur with a shimmer, the seal ring drawing
 * itself, the name letter by letter, then two curtains parting to reveal
 * the page. Click / Esc skips it; reduced-motion users never see it.
 *
 * The markup is server-rendered so it covers the first paint. The inline
 * script in the layout (introBootScript) marks <html data-intro="seen">
 * before the overlay is parsed when it has already played, so returning
 * visitors never get a flash.
 */
export function Intro({ tagline }: { tagline: string }) {
  const [gone, setGone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.intro === "seen") return; // hidden by CSS already
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* storage blocked — intro will simply replay next time */
    }
    const finish = () => {
      html.dataset.intro = "seen";
      setGone(true);
    };
    const t = window.setTimeout(finish, DURATION);
    const skip = () => {
      window.clearTimeout(t);
      ref.current?.classList.add("intro-skip");
      window.setTimeout(finish, 750);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && skip();
    const el = ref.current;
    el?.addEventListener("click", skip);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      el?.removeEventListener("click", skip);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (gone) return null;
  const letters = "MENDES".split("");

  return (
    <div ref={ref} className="intro" aria-hidden role="presentation">
      <div className="intro-curtain intro-curtain-top" />
      <div className="intro-curtain intro-curtain-bottom" />
      <div className="intro-stage">
        <div className="intro-glow" />
        <span className="intro-line intro-line-start" />
        <span className="intro-line intro-line-end" />
        <div className="intro-crest-wrap">
          <svg className="intro-ring" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="intro-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f6e7c1" />
                <stop offset="50%" stopColor="#c9a96a" />
                <stop offset="100%" stopColor="#8a6d3b" />
              </linearGradient>
            </defs>
            <circle className="intro-ring-outer" cx="100" cy="100" r="97" fill="none" stroke="url(#intro-gold)" strokeWidth="0.7" pathLength="1" />
            <circle className="intro-ring-inner" cx="100" cy="100" r="90" fill="none" stroke="url(#intro-gold)" strokeWidth="0.4" strokeDasharray="0.6 3.2" />
          </svg>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="intro-crest" src="/brand/mendes-crest.webp" alt="" width={540} height={660} fetchPriority="high" />
          <span className="intro-sheen" />
        </div>
        <p className="intro-name" dir="ltr">
          {letters.map((c, i) => (
            <span key={i} style={{ animationDelay: `${1250 + i * 85}ms` }}>{c}</span>
          ))}
        </p>
        <p className="intro-tagline">{tagline}</p>
      </div>
    </div>
  );
}

/** Runs before first paint: decides whether the intro should play. */
export const introBootScript = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem("${KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.intro="seen"}else{d.dataset.intro="playing"}}catch(e){document.documentElement.dataset.intro="seen"}})();`;
